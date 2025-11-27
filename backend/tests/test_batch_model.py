import numpy as np

from fermentation_sim.models.batch_model import BatchFermentationModel
from fermentation_sim.utils.validation import SimulationRequest


def test_batch_model_runs_and_has_reasonable_shapes():
    model = BatchFermentationModel()
    req = SimulationRequest()
    result = model.simulate(req)

    assert result.time.shape[0] == req.n_points
    assert result.state.shape == (req.n_points, 5)

    # basic monotonic sanity: biomass should not go negative
    assert np.all(result.state[:, 0] >= 0)
