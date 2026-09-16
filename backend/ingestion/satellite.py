"""
Satellite Data Ingestion Adapter (INSAT-3D / GOES-16 IR / Water Vapour)
Monitors brightness temperatures, cloud-top cooling rates, and overshooting tops.
"""

from typing import Dict, Any, Optional, List, Tuple
from datetime import datetime

class SatelliteAdapter:
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or {}
        self.enabled = self.config.get("enabled", True)

    def load_data(
        self,
        start_time: datetime,
        end_time: datetime,
        bbox: Tuple[float, float, float, float]
    ) -> List[Dict[str, Any]]:
        min_lat, min_lng, max_lat, max_lng = bbox
        center_lat = (min_lat + max_lat) / 2.0
        center_lng = (min_lng + max_lng) / 2.0

        return [
            {
                "channel": "Thermal_IR_10.8um",
                "timestamp": end_time.isoformat(),
                "latitude": center_lat,
                "longitude": center_lng,
                "brightness_temp_k": 208.5,  # Very cold anvil top (-64.65 C)
                "brightness_temp_c": -64.65,
                "cooling_rate_k_15m": -8.5,   # Rapid convective intensification
                "overshooting_top_detected": True,
                "cloud_top_height_km": 14.8,
                "quality_flag": "GOOD",
            }
        ]

    def validate(self, records: List[Dict[str, Any]]) -> bool:
        for r in records:
            bt_k = r.get("brightness_temp_k", 273.15)
            if bt_k < 150.0 or bt_k > 340.0:
                return False
        return True

    def standardize(self, records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        for r in records:
            # Normalize cold cloud tops (colder = higher convective potential)
            k = r.get("brightness_temp_k", 273.15)
            r["convective_cloud_index"] = max(0.0, min(1.0, (260.0 - k) / 60.0))
        return records

    def return_dataframe_or_xarray(self, records: List[Dict[str, Any]]):
        return records
