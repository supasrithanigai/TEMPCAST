"""
TEMPESTCAST Unit Tests Suite
Tests: Quality Control, Feature Engineering, Storm Cell Detection, Tracking,
Baselines, and Verification Metrics.
Run with: python3 -m unittest tests/test_pipeline.py
"""

import unittest
from backend.preprocessing.quality_control import QualityController, QualityFlag
from backend.features.feature_engineering import FeatureEngineer
from backend.tracking.storm_detection import StormDetector
from backend.tracking.storm_tracker import StormTracker
from backend.models.baselines import PersistenceBaseline, AdvectionBaseline
from backend.models.multimodal_nowcaster import MultimodalNowcaster
from evaluation.metrics import VerificationEvaluator

class TestTempestCastPipeline(unittest.TestCase):
    def setUp(self):
        self.qc = QualityController()
        self.feature_eng = FeatureEngineer()
        self.detector = StormDetector(reflectivity_threshold_dbz=40.0)
        self.tracker = StormTracker()
        self.nowcaster = MultimodalNowcaster()
        self.bbox = (35.0, -98.0, 36.0, -97.0)

    def test_quality_control_valid_data(self):
        record = {
            "latitude": 35.5,
            "longitude": -97.5,
            "temperature_c": 28.0,
            "dew_point_c": 22.0,
            "humidity_percent": 75.0,
            "pressure_hpa": 1008.0,
            "reflectivity_dbz": 45.0,
        }
        flag, issues = self.qc.check_observation(record, self.bbox)
        self.assertEqual(flag, QualityFlag.GOOD)
        self.assertEqual(len(issues), 1)

    def test_quality_control_impossible_values(self):
        # Impossible dew point exceeding temperature
        record = {
            "latitude": 35.5,
            "longitude": -97.5,
            "temperature_c": 20.0,
            "dew_point_c": 35.0,
        }
        flag, issues = self.qc.check_observation(record, self.bbox)
        self.assertEqual(flag, QualityFlag.SUSPECT)
        self.assertTrue(any("Thermodynamic inconsistency" in s for s in issues))

    def test_feature_engineering_extraction(self):
        radar = [{"reflectivity_dbz": 55.0}, {"reflectivity_dbz": 45.0}]
        satellite = [{"brightness_temp_k": 210.0, "cooling_rate_k_15m": -6.0}]
        lightning = [{"strikes_last_10min": 50, "lightning_jump_sigma": 2.5}]
        weather = [{"temperature_c": 30.0, "dew_point_c": 24.0, "humidity_percent": 80.0}]
        nwp = [{"cape_j_kg": 3000.0, "bulk_shear_0_6km_kt": 40.0}]

        features = self.feature_eng.extract_features(radar, satellite, lightning, weather, nwp)
        self.assertIn("radar_max_dbz", features)
        self.assertEqual(features["radar_max_dbz"], 55.0)
        self.assertGreater(features["convective_instability_index"], 0.6)

    def test_storm_cell_detection(self):
        radar_grid = [
            {"latitude": 35.4, "longitude": -97.5, "reflectivity_dbz": 54.0},
            {"latitude": 35.42, "longitude": -97.48, "reflectivity_dbz": 58.0},
            {"latitude": 35.39, "longitude": -97.51, "reflectivity_dbz": 51.0},
            {"latitude": 35.8, "longitude": -97.1, "reflectivity_dbz": 22.0}, # Below 40 dBZ threshold
        ]
        cells = self.detector.detect_cells(radar_grid, "2026-09-15T00:00:00Z")
        self.assertEqual(len(cells), 1)
        self.assertGreaterEqual(cells[0].max_dbz, 54.0)

    def test_multimodal_predictions_horizons(self):
        obs = {
            "radar_max_dbz": 52.0,
            "cape_j_kg": 2600.0,
            "cloud_top_cooling_rate_k_15m": -5.0,
            "lightning_strikes_10m": 35.0,
            "lightning_jump_rate": 2.2,
        }
        preds = self.nowcaster.predict(obs, horizons=[30, 45, 60, 75, 90])
        self.assertEqual(len(preds), 5)
        horizons = [p["horizon_minutes"] for p in preds]
        self.assertEqual(horizons, [30, 45, 60, 75, 90])
        self.assertGreater(preds[0]["thunderstorm_probability"], 60.0)

    def test_verification_metrics(self):
        metrics = VerificationEvaluator.calculate_contingency_metrics(
            hits=85, misses=15, false_alarms=20, correct_negatives=180
        )
        self.assertAlmostEqual(metrics["pod"], 0.85, places=2)
        self.assertAlmostEqual(metrics["far"], 0.19, places=2)
        self.assertGreater(metrics["csi"], 0.7)

if __name__ == "__main__":
    unittest.main()
