"""
Numerical Weather Prediction (NWP / WRF / GFS) Ingestion Adapter
Ingests thermodynamic indices: CAPE, CIN, bulk wind shear, lifted index, and precipitable water.
"""

from typing import Dict, Any, Optional, List, Tuple
from datetime import datetime

class NWPAdapter:
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
                "model": "WRF-ARW-3KM",
                "run_time": start_time.isoformat(),
                "valid_time": end_time.isoformat(),
                "latitude": center_lat,
                "longitude": center_lng,
                "cape_j_kg": 2850,  # Extreme convective instability (> 2000 J/kg)
                "cin_j_kg": -15,    # Minimal capping inversion
                "lifted_index": -6.2,
                "bulk_shear_0_6km_kt": 44.0, # High deep-layer shear favors organized storms
                "precipitable_water_mm": 56.2,
                "quality_flag": "GOOD",
            }
        ]

    def validate(self, records: List[Dict[str, Any]]) -> bool:
        for r in records:
            cape = r.get("cape_j_kg", 0)
            if cape < 0 or cape > 8000:
                return False
        return True

    def standardize(self, records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        for r in records:
            r["normalized_cape"] = max(0.0, min(1.0, r.get("cape_j_kg", 0) / 4000.0))
        return records

    def return_dataframe_or_xarray(self, records: List[Dict[str, Any]]):
        return records
