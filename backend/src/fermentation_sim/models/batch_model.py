from dataclasses import dataclass

import numpy as np

from .base import BaseFermentationModel
from .c_binding import (
    FermentationCLib,
    KineticParams,
    OperatingConditions,
)
from ..utils.validation import SimulationRequest


@dataclass
class BatchSimulationResult:
    time: np.ndarray
    state: np.ndarray  # shape (n_points, 5) : X, S, P, DO, T


class BatchFermentationModel(BaseFermentationModel):
    """Batch fermentation model using C-core integrator."""

    def __init__(self, c_lib: FermentationCLib | None = None) -> None:
        self.c_lib = c_lib or FermentationCLib()
        self._max_dt = 0.01  # tighter internal step to avoid stiffness blow-ups

    def _build_param_maps(self, request: SimulationRequest) -> tuple[dict, dict]:
        params = {
            "mu_max": request.mu_max,
            "Ks": request.Ks,
            "Yxs": request.Yxs,
            "Ypx": request.Ypx,
            "kd": request.kd,
            "Kio": request.Kio,
            "Kla": request.Kla,
            "C_star": request.C_star,
            "O2_maintenance": request.O2_maintenance,
            "delta_H": request.delta_H,
            "Cp": request.Cp,
            "U": request.U,
            "A": request.A,
            "rho": request.rho,
        }
        ops = {
            "volume": request.volume,
            "feed_rate": request.feed_rate,
            "feed_substrate_conc": request.feed_substrate_conc,
            "aeration_rate": request.aeration_rate,
            "agitation_speed": request.agitation_speed,
            "cooling_temp": request.cooling_temp,
            "coolant_flow": request.coolant_flow,
        }
        return params, ops

    def _derivatives(self, state: np.ndarray, params: dict, ops: dict) -> np.ndarray:
        X, S, P, DO, T = state

        # Keep state in physical bounds to avoid runaway stiffness
        X = max(X, 0.0)
        S = max(S, 0.0)
        P = max(P, 0.0)
        DO_safe = max(DO, 1e-8)
        S_safe = max(S, 1e-8)

        mu_monod = params["mu_max"] * S_safe / (params["Ks"] + S_safe)
        o2_factor = DO_safe / (params["Kio"] + DO_safe)
        mu = mu_monod * o2_factor

        rX = (mu - params["kd"]) * X
        rS = -(1.0 / params["Yxs"]) * mu * X
        rP = params["Ypx"] * mu * X

        # Oxygen transfer with saturation clamp
        kla_factor = (
            1.0
            + 0.3 * (ops["aeration_rate"] - 1.0)
            + 0.001 * (ops["agitation_speed"] - 300.0)
        )
        kla_factor = max(kla_factor, 0.1)
        kla_effective = max(params["Kla"] * kla_factor, 0.0)
        OTR = kla_effective * max(params["C_star"] - DO, 0.0)
        OUR = params["O2_maintenance"] * X
        dDOdt = OTR - OUR

        # Simple heat balance
        Q_gen = params["delta_H"] * mu * X * ops["volume"]
        Q_loss = params["U"] * params["A"] * (T - ops["cooling_temp"])
        dTdt = (Q_gen - Q_loss) / (params["rho"] * ops["volume"] * params["Cp"])

        return np.array([rX, rS, rP, dDOdt, dTdt], dtype="float64")

    def _integrate_fallback(
        self, t: np.ndarray, y0: np.ndarray, params: dict, ops: dict
    ) -> np.ndarray:
        """Numerically integrate with internal sub-steps and clamping."""
        n_points = t.size
        state_dim = y0.size
        y = np.zeros((n_points, state_dim), dtype="float64")
        y[0] = y0
        current = y0.copy()

        for i in range(1, n_points):
            segment_dt = t[i] - t[i - 1]
            steps = max(1, int(np.ceil(segment_dt / self._max_dt)))
            dt = segment_dt / steps

            for _ in range(steps):
                k1 = self._derivatives(current, params, ops)
                k2 = self._derivatives(current + 0.5 * dt * k1, params, ops)
                k3 = self._derivatives(current + 0.5 * dt * k2, params, ops)
                k4 = self._derivatives(current + dt * k3, params, ops)
                current = current + dt * (k1 + 2 * k2 + 2 * k3 + k4) / 6.0

                # Clamp to physical/finite ranges
                current = np.where(np.isfinite(current), current, 0.0)
                current[:4] = np.maximum(current[:4], 0.0)
                current[3] = min(current[3], params["C_star"] * 1.5)

            y[i] = current

        return y

    def simulate(self, request: SimulationRequest) -> BatchSimulationResult:
        t = np.linspace(request.t_start, request.t_end, request.n_points)
        y0 = np.array(
            [request.X0, request.S0, request.P0, request.DO0, request.T0],
            dtype="float64",
        )

        kinetic = KineticParams(
            mu_max=request.mu_max,
            Ks=request.Ks,
            Yxs=request.Yxs,
            Ypx=request.Ypx,
            kd=request.kd,
            Kio=request.Kio,
            Kla=request.Kla,
            C_star=request.C_star,
            O2_maintenance=request.O2_maintenance,
            delta_H=request.delta_H,
            Cp=request.Cp,
            U=request.U,
            A=request.A,
            rho=request.rho,
        )

        ops = OperatingConditions(
            volume=request.volume,
            feed_rate=request.feed_rate,
            feed_substrate_conc=request.feed_substrate_conc,
            aeration_rate=request.aeration_rate,
            agitation_speed=request.agitation_speed,
            cooling_temp=request.cooling_temp,
            coolant_flow=request.coolant_flow,
        )

        status, y_out = self.c_lib.integrate(t, y0, kinetic, ops)
        if status != 0 or not np.isfinite(y_out).all():
            params_map, ops_map = self._build_param_maps(request)
            y_out = self._integrate_fallback(t, y0, params_map, ops_map)

        return BatchSimulationResult(time=t, state=y_out)
