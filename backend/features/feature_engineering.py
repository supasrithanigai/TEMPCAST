"""
TEMPESTCAST Feature Engineering Engine
Extracts meteorological physics and spatio-temporal features across all modalities.
"""

from typing import Dict, Any, List
import math

class FeatureEngineer:
    FEATURE_SCHEMA = [
        "radar_max_dbz",
        "radar_mean_dbz",
        "radar_dbz_gradient",
        "satellite_ir_temp_k",
        "cloud_top_cooling_rate_k_15m",
        "convective_cloud_index",
        "lightning_strikes_10m",
        "lightning_flash_density",
        "lightning_jump_rate",
        "surface_temp_c",
        "dew_point_c",
        "dew_point_depression_c",
        "surface_humidity_pct",
        "surface_pressure_hpa",
        "surface_pressure_drop_3h",
        "wind_speed_kmh",
        "cape_j_kg",
        "bulk_shear_kt",
        "convective_instability_index",
    ]

    def extract_features(
        self,
        radar_data: List[Dict[str, Any]],
        satellite_data: List[Dict[str, Any]],
        lightning_data: List[Dict[str, Any]],
        weather_data: List[Dict[str, Any]],
        nwp_data: List[Dict[str, Any]],
    ) -> Dict[str, float]:
        """
        Derives engineered meteorological feature vector from synchronized observations.
        """
        # 1. Radar Features
        dbz_vals = [r.get("reflectivity_dbz", 0.0) for r in radar_data if "reflectivity_dbz" in r]
        max_dbz = max(dbz_vals) if dbz_vals else 25.0
        mean_dbz = sum(dbz_vals) / len(dbz_vals) if dbz_vals else 20.0
        dbz_gradient = max_dbz - mean_dbz

        # 2. Satellite Features
        sat_record = satellite_data[0] if satellite_data else {}
        ir_temp_k = float(sat_record.get("brightness_temp_k", 280.0))
        cooling_rate = float(sat_record.get("cooling_rate_k_15m", -1.5))
        convective_cloud_idx = float(sat_record.get("convective_cloud_index", max(0.0, (260.0 - ir_temp_k) / 60.0)))

        # 3. Lightning Features
        ltg_record = lightning_data[0] if lightning_data else {}
        ltg_10m = float(ltg_record.get("strikes_last_10min", 5.0))
        flash_density = float(ltg_record.get("flash_density_per_km2", 0.5))
        lightning_jump = float(ltg_record.get("lightning_jump_sigma", 0.8))

        # 4. Surface Weather Features
        w_record = weather_data[0] if weather_data else {}
        temp_c = float(w_record.get("temperature_c", 28.0))
        dew_c = float(w_record.get("dew_point_c", 22.0))
        rh_pct = float(w_record.get("humidity_percent", 70.0))
        pressure_hpa = float(w_record.get("pressure_hpa", 1010.0))
        pressure_drop_3h = float(w_record.get("pressure_tendency_hpa_3h", -1.0))
        wind_kmh = float(w_record.get("wind_speed_kmh", 20.0))
        dew_point_depression = max(0.0, temp_c - dew_c)

        # 5. NWP Stability Features
        nwp_record = nwp_data[0] if nwp_data else {}
        cape = float(nwp_record.get("cape_j_kg", 1800.0))
        shear = float(nwp_record.get("bulk_shear_0_6km_kt", 30.0))

        # 6. Convective Instability Index (combined formula)
        # Higher values indicate extreme likelihood of severe thunderstorm development
        instability_index = (
            (max_dbz / 70.0) * 0.35 +
            (cape / 3500.0) * 0.30 +
            (abs(cooling_rate) / 10.0) * 0.15 +
            (min(ltg_10m, 100.0) / 100.0) * 0.20
        )

        return {
            "radar_max_dbz": round(max_dbz, 2),
            "radar_mean_dbz": round(mean_dbz, 2),
            "radar_dbz_gradient": round(dbz_gradient, 2),
            "satellite_ir_temp_k": round(ir_temp_k, 2),
            "cloud_top_cooling_rate_k_15m": round(cooling_rate, 2),
            "convective_cloud_index": round(convective_cloud_idx, 3),
            "lightning_strikes_10m": round(ltg_10m, 1),
            "lightning_flash_density": round(flash_density, 2),
            "lightning_jump_rate": round(lightning_jump, 2),
            "surface_temp_c": round(temp_c, 1),
            "dew_point_c": round(dew_c, 1),
            "dew_point_depression_c": round(dew_point_depression, 2),
            "surface_humidity_pct": round(rh_pct, 1),
            "surface_pressure_hpa": round(pressure_hpa, 1),
            "surface_pressure_drop_3h": round(pressure_drop_3h, 2),
            "wind_speed_kmh": round(wind_kmh, 1),
            "cape_j_kg": round(cape, 1),
            "bulk_shear_kt": round(shear, 1),
            "convective_instability_index": round(min(1.0, instability_index), 3),
        }
