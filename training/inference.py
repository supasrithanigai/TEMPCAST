"""
TEMPESTCAST Inference Engine
Loads model checkpoint and executes batch or point nowcasting predictions.
"""

from backend.models.multimodal_nowcaster import MultimodalNowcaster
from backend.features.feature_engineering import FeatureEngineer
from typing import Dict, Any

class NowcastInference:
    def __init__(self, checkpoint_dir: str = "models/best_model"):
        self.engine = MultimodalNowcaster(weights_path=checkpoint_dir)
        self.feature_engineer = FeatureEngineer()

    def run_point_nowcast(self, observation: Dict[str, Any]):
        predictions = self.engine.predict(observation, horizons=[30, 45, 60, 75, 90])
        return predictions

if __name__ == "__main__":
    inf = NowcastInference()
    test_obs = {
        "radar_max_dbz": 54.0,
        "cape_j_kg": 2800.0,
        "cloud_top_cooling_rate_k_15m": -6.5,
        "lightning_strikes_10m": 42.0,
        "lightning_jump_rate": 2.4,
    }
    preds = inf.run_point_nowcast(test_obs)
    print("Inference results:")
    for p in preds:
        print(f"Horizon +{p['horizon_minutes']}m: P(Storm)={p['thunderstorm_probability']}% | P(Ltg)={p['lightning_probability']}% | Severity={p['severity']}")
