"""
Multimodal Dataset Loader
Aggregates and aligns Radar, Satellite, Lightning, AWS Weather, and NWP feeds.
Enforces modality-availability tracking so prediction proceeds gracefully even if a sensor is offline.
"""

from typing import Dict, Any, Tuple, Optional
from datetime import datetime
from .radar import RadarAdapter
from .satellite import SatelliteAdapter
from .lightning import LightningAdapter
from .weather import WeatherAdapter
from .nwp import NWPAdapter

class MultimodalDatasetLoader:
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        cfg = config or {}
        self.radar = RadarAdapter(cfg.get("radar", {}))
        self.satellite = SatelliteAdapter(cfg.get("satellite", {}))
        self.lightning = LightningAdapter(cfg.get("lightning", {}))
        self.weather = WeatherAdapter(cfg.get("weather", {}))
        self.nwp = NWPAdapter(cfg.get("nwp", {}))

    def get_multimodal_snapshot(
        self,
        timestamp: datetime,
        bbox: Tuple[float, float, float, float]
    ) -> Dict[str, Any]:
        """
        Gathers observations from all enabled sources, recording availability flags.
        Does not crash if an individual sensor feed fails.
        """
        start_time = timestamp
        end_time = timestamp

        availability = {
            "radar": False,
            "satellite": False,
            "lightning": False,
            "weather": False,
            "nwp": False,
        }

        radar_data = []
        try:
            if self.radar.enabled:
                radar_data = self.radar.load_data(start_time, end_time, bbox)
                if self.radar.validate(radar_data):
                    radar_data = self.radar.standardize(radar_data)
                    availability["radar"] = len(radar_data) > 0
        except Exception as e:
            print(f"Warning: Radar ingestion failed: {e}")

        satellite_data = []
        try:
            if self.satellite.enabled:
                satellite_data = self.satellite.load_data(start_time, end_time, bbox)
                if self.satellite.validate(satellite_data):
                    satellite_data = self.satellite.standardize(satellite_data)
                    availability["satellite"] = len(satellite_data) > 0
        except Exception as e:
            print(f"Warning: Satellite ingestion failed: {e}")

        lightning_data = []
        try:
            if self.lightning.enabled:
                lightning_data = self.lightning.load_data(start_time, end_time, bbox)
                if self.lightning.validate(lightning_data):
                    lightning_data = self.lightning.standardize(lightning_data)
                    availability["lightning"] = len(lightning_data) > 0
        except Exception as e:
            print(f"Warning: Lightning ingestion failed: {e}")

        weather_data = []
        try:
            if self.weather.enabled:
                weather_data = self.weather.load_data(start_time, end_time, bbox)
                if self.weather.validate(weather_data):
                    weather_data = self.weather.standardize(weather_data)
                    availability["weather"] = len(weather_data) > 0
        except Exception as e:
            print(f"Warning: Weather ingestion failed: {e}")

        nwp_data = []
        try:
            if self.nwp.enabled:
                nwp_data = self.nwp.load_data(start_time, end_time, bbox)
                if self.nwp.validate(nwp_data):
                    nwp_data = self.nwp.standardize(nwp_data)
                    availability["nwp"] = len(nwp_data) > 0
        except Exception as e:
            print(f"Warning: NWP ingestion failed: {e}")

        available_count = sum(1 for v in availability.values() if v)
        modality_status = "FULL_MULTIMODAL" if available_count == 5 else f"PARTIAL_{available_count}_OF_5"

        return {
            "timestamp": timestamp.isoformat(),
            "bbox": bbox,
            "modality_availability": availability,
            "modality_status": modality_status,
            "radar": radar_data,
            "satellite": satellite_data,
            "lightning": lightning_data,
            "weather": weather_data,
            "nwp": nwp_data,
        }
