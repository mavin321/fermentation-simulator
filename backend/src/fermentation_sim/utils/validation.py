from pydantic import BaseModel, Field


class SimulationRequest(BaseModel):
    # Initial conditions
    X0: float = Field(..., gt=0, description="Initial biomass (g/L)")
    S0: float = Field(..., gt=0, description="Initial substrate (g/L)")
    P0: float = Field(0, ge=0, description="Initial product (g/L)")
    DO0: float = Field(0.005, gt=0, description="Initial DO (g/L)")
    T0: float = Field(30.0, gt=0, description="Initial temperature (°C)")

    # Time
    t_start: float = Field(0, ge=0)
    t_end: float = Field(24.0, gt=0)
    n_points: int = Field(241, ge=2)

    # Kinetic parameters
    mu_max: float = Field(0.4, gt=0)
    Ks: float = Field(0.1, gt=0)
    Yxs: float = Field(0.5, gt=0)
    Ypx: float = Field(0.1, ge=0)
    kd: float = Field(0.01, ge=0)
    Kio: float = Field(0.0001, gt=0)
    Kla: float = Field(200.0, gt=0)
    C_star: float = Field(0.007, gt=0)
    O2_maintenance: float = Field(0.0005, ge=0)
    delta_H: float = Field(4e5, ge=0)
    Cp: float = Field(4.18e3, gt=0)
    U: float = Field(500.0, ge=0)
    A: float = Field(2.0, ge=0)
    rho: float = Field(1000.0, gt=0)

    # Operating conditions
    volume: float = Field(5.0, gt=0)
    feed_rate: float = Field(0.0, ge=0)
    feed_substrate_conc: float = Field(500.0, ge=0)
    aeration_rate: float = Field(1.0, gt=0)
    agitation_speed: float = Field(300.0, gt=0)
    cooling_temp: float = Field(25.0, gt=0)
    coolant_flow: float = Field(1.0, ge=0)

    class Config:
        extra = "ignore"
