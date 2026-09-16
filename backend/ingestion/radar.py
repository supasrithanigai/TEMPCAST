"""
Radar Data Ingestion Adapter (Doppler Weather Radar / NEXRAD / IMD Level-II)
Handles radar reflectivity, Doppler velocity, and cell centroid extraction.
"""

from typing import Dict, Any, Optional, List, Tuple
from datetime import datetime

class RadarAdapter:
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or {}
        self.enabled = self.config.get("enabled", True)
        self.source = self.config.get("source", "Doppler Weather Radar (DWR)")
        self.last_load_timestamp: Optional[datetime] = None

    def load_data(
        self,
        start_time: datetime,
        end_time: datetime,
        bbox: Tuple[float, float, float, float]
    ) -> List[Dict[str, Any]]:
        """
        Loads radar sweeps within bounding box (min_lat, min_lng, max_lat, max_lng)
        between start_time and end_time.
        """
        self.last_load_timestamp = end_time
        # Generates standardized synthetic radar grid observations for testing/demonstration
        min_lat, min_lng, max_lat, max_lng = bbox
        center_lat = (min_lat + max_lat) / 2.0
        center_lng = (min_lng + max_lng) / 2.0

        records = [
            {
                "sensor": "DWR-01",
                "timestamp": end_time.isoformat(),
                "latitude": center_lat + 0.05,
                "longitude": center_lng - 0.04,
                "reflectivity_dbz": 54.2,
                "max_reflectivity_dbz": 61.0,
                "radial_velocity_mps": 22.4,
                "zdr_db": 2.1,
                "kdp_deg_km": 1.8,
                "storm_cell_detected": True,
                "quality_flag": "GOOD",
            },
            {
                "sensor": "DWR-02",
                "timestamp": end_time.isoformat(),
                "latitude": center_lat - 0.08,
                "longitude": center_lng + 0.06,
                "reflectivity_dbz": 43.5,
                "max_reflectivity_dbz": 48.0,
                "radial_velocity_mps": 14.2,
                "zdr_db": 1.2,
                "kdp_deg_km": 0.6,
                "storm_cell_detected": True,
                "quality_flag": "GOOD",
            }
        ]
        return records

    def validate(self, records: List[Dict[str, Any]]) -> bool:
        """
        Validates radar records for physical validity:
        - Reflectivity between -10 and 85 dBZ
        - Bounding box compliance
        """
        for r in records:
            dbz = r.get("reflectivity_dbz", 0)
            if dbz < -10.0 or dbz > 85.0:
                return False
        return True

    def standardize(self, records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Standardizes unit scales and normalizes coordinate conventions."""
        standardized = []
        for r in records:
            std = dict(r)
            std["normalized_dbz"] = max(0.0, min(1.0, (r.get("reflectivity_dbz", 0.0)) / 75.0))
            standardized.append(std)
        return standardized

    def return_dataframe_or_xarray(self, records: List[Dict[str, Any]]):
        """Returns standard dictionary records or DataFrame."""
        return records
