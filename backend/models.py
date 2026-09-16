"""
TEMPESTCAST Data Models
Pydantic schemas for FastAPI endpoints, request validations, and responses.
"""

from typing import List, Optional, Literal
from pydantic import BaseModel, Field
from datetime import datetime

RiskLevel = Literal['LOW', 'MEDIUM', 'HIGH']
SeverityLevel = Literal['Minor', 'Moderate', 'Severe', 'Extreme']
AlertType = Literal[
    'Thunderstorm Risk',
    'Lightning Risk',
    'Heavy Rain Risk',
    'Severe Storm Risk'
]

class LocationSchema(BaseModel):
    id: str
    name: str
    code: str
    region: str
    latitude: float
    longitude: float
    vulnerability_level: RiskLevel
    elevation_m: float
    population_density: str

class WeatherSchema(BaseModel):
    id: str
    location_id: str
    location_name: str
    temperature_c: float
    humidity_percent: float
    wind_speed_kmh: float
    wind_direction: str
    wind_direction_deg: float
    pressure_hpa: float
    rainfall_mm: float
    dew_point_c: float
    cape_j_kg: float
    radar_reflectivity_dbz: float
    timestamp: datetime

class PredictionHorizonSchema(BaseModel):
    horizon_minutes: Literal[30, 60, 90]
    thunderstorm_probability: float = Field(..., ge=0, le=100)
    lightning_probability: float = Field(..., ge=0, le=100)
    confidence: float = Field(..., ge=0, le=100)
    severity: SeverityLevel
    risk_level: RiskLevel
    estimated_peak_dbz: float
    expected_strikes_per_min: float

class StormTrackPointSchema(BaseModel):
    latitude: float
    longitude: float
    timestamp: str
    type: Literal['past', 'current', 'predicted']
    intensity_dbz: float
    time_label: str

class StormSchema(BaseModel):
    id: str
    storm_id: str
    name: str
    current_location: dict
    direction: str
    direction_deg: float
    speed_kmh: float
    intensity: str
    intensity_dbz: float
    risk_level: RiskLevel
    last_updated: str
    trajectory: List[StormTrackPointSchema]
    lightning_strike_count_last_10m: int
    top_height_km: float

class AlertSchema(BaseModel):
    id: str
    alert_id: str
    location: str
    location_id: str
    alert_type: AlertType
    risk_level: RiskLevel
    probability: float
    issued_at: str
    valid_until: str
    status: Literal['ACTIVE', 'WATCH', 'WARNING', 'EXPIRED']
    headline: str
    description: str
    instructions: str

class PredictRequest(BaseModel):
    location_id: str
    custom_radar_reflectivity_dbz: Optional[float] = Field(None, ge=0, le=80)
    custom_cape_j_kg: Optional[float] = Field(None, ge=0, le=6000)
    custom_humidity: Optional[float] = Field(None, ge=0, le=100)
    custom_wind_shear: Optional[float] = Field(None, ge=0, le=80)
    include_raw_tensors: bool = False

class PredictResponse(BaseModel):
    location_id: str
    is_demo_data: bool = True
    model_architecture: str = "CNN + ConvLSTM (Spatio-Temporal Nowcasting Prototype)"
    status_notice: str = "Prototype Prediction: Demo Values. Connect real PyTorch/TensorFlow checkpoint for operational inference."
    timestamp: datetime
    predictions: List[PredictionHorizonSchema]
