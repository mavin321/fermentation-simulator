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
        if status != 0:
            raise RuntimeError(f"C integrator failed with status {status}")

        return BatchSimulationResult(time=t, state=y_out)
