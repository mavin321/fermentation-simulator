from dataclasses import dataclass

import numpy as np

from .base import BaseFermentationModel
from ..utils.validation import SimulationRequest


@dataclass
class FedBatchSimulationResult:
    time: np.ndarray
    state: np.ndarray
    volume: np.ndarray


class FedBatchFermentationModel(BaseFermentationModel):
    """
    Stub for fed-batch model.

    You can extend this to call a different C kernel or implement volume dynamics
    (dV/dt = F_in, etc.) on the Python side.
    """

    def simulate(self, request: SimulationRequest) -> FedBatchSimulationResult:
        t = np.linspace(request.t_start, request.t_end, request.n_points)

        # Placeholder: copy batch behavior and add constant volume
        from .batch_model import BatchFermentationModel

        batch_model = BatchFermentationModel()
        batch_result = batch_model.simulate(request)
        volume = np.full_like(batch_result.time, request.volume)

        return FedBatchSimulationResult(
            time=batch_result.time, state=batch_result.state, volume=volume
        )
