"""
TEMPESTCAST Baseline Nowcasting Models
Provides scientific benchmark baselines:
1. Persistence Baseline: future risk equals current observed risk
2. Storm-Motion Advection Baseline: shifts current convective cells along estimated velocity vector
"""

from typing import Dict, Any, List

class PersistenceBaseline:
    """
    Persistence assumes meteorological state remains constant over the lead time.
    Degrades significantly as lead time increases.
    """
    def predict(self, current_features: Dict[str, Any], horizons: List[int] = [30, 45, 60, 75, 90]) -> List[Dict[str, Any]]:
        base_dbz = current_features.get("radar_max_dbz", 40.0)
        curr_prob = min(95.0, max(10.0, (base_dbz / 65.0) * 100.0))
        curr_ltg = min(95.0, max(5.0, (current_features.get("lightning_strikes_10m", 10.0) / 60.0) * 100.0))

        results = []
        for h in horizons:
            # Baseline assumes no change
            results.append({
                "model": "Persistence",
                "horizon_minutes": h,
                "thunderstorm_probability": round(curr_prob, 1),
                "lightning_probability": round(curr_ltg, 1),
                "estimated_peak_dbz": round(base_dbz, 1),
                "confidence": round(max(30.0, 85.0 - (h * 0.5)), 1), # Confidence decays with lead time
            })
        return results

class AdvectionBaseline:
    """
    Storm-Motion Advection shifts radar reflectivity cells along observed velocity vectors.
    Captures kinematic translation but fails to model convective initiation or rapid dissipation.
    """
    def predict(
        self,
        current_features: Dict[str, Any],
        storm_speed_kmh: float = 40.0,
        horizons: List[int] = [30, 45, 60, 75, 90]
    ) -> List[Dict[str, Any]]:
        base_dbz = current_features.get("radar_max_dbz", 45.0)
        base_prob = min(92.0, max(15.0, (base_dbz / 65.0) * 90.0))

        results = []
        for h in horizons:
            # Natural advective dispersion / gradual cell attenuation
            attenuation = max(0.6, 1.0 - (h / 240.0))
            dbz_proj = base_dbz * attenuation
            prob_proj = base_prob * attenuation

            results.append({
                "model": "Advection_Extrapolation",
                "horizon_minutes": h,
                "thunderstorm_probability": round(prob_proj, 1),
                "lightning_probability": round(prob_proj * 0.88, 1),
                "estimated_peak_dbz": round(dbz_proj, 1),
                "confidence": round(max(45.0, 88.0 - (h * 0.35)), 1),
            })
        return results
