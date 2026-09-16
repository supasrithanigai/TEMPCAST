"""
TEMPESTCAST Ingestion Package
Provides standardized modular adapters for Radar, Satellite, Lightning, Surface AWS, and NWP feeds.
"""

from .radar import RadarAdapter
from .satellite import SatelliteAdapter
from .lightning import LightningAdapter
from .weather import WeatherAdapter
from .nwp import NWPAdapter
from .dataset_loader import MultimodalDatasetLoader

__all__ = [
    "RadarAdapter",
    "SatelliteAdapter",
    "LightningAdapter",
    "WeatherAdapter",
    "NWPAdapter",
    "MultimodalDatasetLoader",
]
