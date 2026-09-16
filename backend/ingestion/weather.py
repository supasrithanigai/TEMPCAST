"""
Automatic Weather Station (AWS) / Surface Mesonet Adapter
Ingests surface temperature, dew point, relative humidity, pressure, wind velocity, and rainfall.
"""

from typing import Dict, Any, Optional, List, Tuple
from datetime import datetime

class WeatherAdapter:
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
                "station_id": "AWS-CH-01",
                "timestamp": end_time.isoformat(),
                "latitude": center_lat,
                "longitude": center_lng,
                "temperature_c": 31.4,
                "dew_point_c": 25.8,
                "humidity_percent": 82,
                "pressure_hpa": 1004.2,
                "wind_speed_kmh": 38.5,
                "wind_direction_deg": 215,
                "rainfall_rate_mmh": 28.4,
                "pressure_tendency_hpa_3h": -4.2,  # Rapid barometric pressure drop
                "quality_flag": "GOOD",
            }
        ]

    def validate(self, records: List[Dict[str, Any]]) -> bool:
        for r in records:
            temp = r.get("temperature_c", 20.0)
            rh = r.get("humidity_percent", 50)
            if temp < -50 or temp > 60 or rh < 0 or rh > 100:
                return False
        return True

    def standardize(self, records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        for r in records:
            temp = r.get("temperature_c", 25.0)
            dew = r.get("dew_point_c", 20.0)
            # Dew point depression: smaller depression = saturated boundary layer
            r["dew_point_depression_c"] = round(temp - dew, 2)
        return records

    def return_dataframe_or_xarray(self, records: List[Dict[str, Any]]):
        return records
