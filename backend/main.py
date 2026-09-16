"""
TEMPESTCAST FastAPI Backend Service
AI-Powered Thunderstorm & Lightning Nowcasting

Endpoints:
- GET /locations
- GET /weather?location_id=...
- GET /predictions?location_id=...
- GET /storms
- GET /alerts
- POST /predict (Receives atmospheric parameters and executes CNN + ConvLSTM rollout)
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from typing import List, Optional
import os

from models import (
    LocationSchema,
    WeatherSchema,
    PredictionHorizonSchema,
    StormSchema,
    AlertSchema,
    PredictRequest,
    PredictResponse,
)
from ml_pipeline import nowcasting_engine

app = FastAPI(
    title="TEMPESTCAST AI Nowcasting API",
    description="Disaster Management AI/ML Nowcasting backend for short-term (30–90m) thunderstorm and lightning risk prediction.",
    version="1.0.0-prototype"
)

# Enable CORS for React frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Demo in-memory mock datasets (used when Supabase is not connected)
DEMO_LOCATIONS = [
    {
        "id": "loc-01",
        "name": "North Central Basin (Radar Sector A-1)",
        "code": "NCB-01",
        "region": "Valley Convective Corridor",
        "latitude": 35.4676,
        "longitude": -97.5164,
        "vulnerability_level": "HIGH",
        "elevation_m": 365,
        "population_density": "High (Metro)"
    },
    {
        "id": "loc-02",
        "name": "Eastern Foothills & Agricultural District",
        "code": "EFA-02",
        "region": "Sub-Basin Agricultural Zone",
        "latitude": 35.6528,
        "longitude": -97.1089,
        "vulnerability_level": "MEDIUM",
        "elevation_m": 412,
        "population_density": "Moderate (Rural / Farming)"
    },
    {
        "id": "loc-03",
        "name": "Southwest Industrial Park & Transport Hub",
        "code": "SWI-03",
        "region": "Interstate Junction Zone",
        "latitude": 35.3289,
        "longitude": -97.6892,
        "vulnerability_level": "HIGH",
        "elevation_m": 380,
        "population_density": "High (Logistics & Power)"
    },
    {
        "id": "loc-04",
        "name": "Highland Ridge Meteorological Observatory",
        "code": "HRM-04",
        "region": "Upper Crest Sector",
        "latitude": 35.7891,
        "longitude": -97.8214,
        "vulnerability_level": "LOW",
        "elevation_m": 540,
        "population_density": "Low (Research & Forestry)"
    },
    {
        "id": "loc-05",
        "name": "Southern Lake & Dam Hydrological Basin",
        "code": "SLH-05",
        "region": "Hydraulic Flash Flood Zone",
        "latitude": 35.1950,
        "longitude": -97.3520,
        "vulnerability_level": "HIGH",
        "elevation_m": 310,
        "population_density": "Medium (Reservoir Communities)"
    }
]

@app.get("/")
def read_root():
    return {
        "project": "TEMPESTCAST",
        "purpose": "AI-Powered Thunderstorm & Lightning Nowcasting",
        "status": "Operational Prototype",
        "disclaimer": "Student prototype demonstration. Uses simulated/demo atmospheric feeds.",
        "model_architecture": "CNN (Spatial Feature Extraction) + ConvLSTM (Temporal Dynamics)",
        "endpoints": [
            "/locations",
            "/weather",
            "/predictions",
            "/storms",
            "/alerts",
            "/predict"
        ]
    }

@app.get("/locations", response_model=List[LocationSchema])
def get_locations():
    """Returns list of monitored radar/weather sectors and geographic zones."""
    return DEMO_LOCATIONS

@app.get("/weather", response_model=WeatherSchema)
def get_weather(location_id: Optional[str] = Query("loc-01")):
    """Returns latest surface observations, CAPE, and radar reflectivity for a location."""
    # Simulated weather generator tailored to chosen sector
    loc = next((l for l in DEMO_LOCATIONS if l["id"] == location_id), DEMO_LOCATIONS[0])
    
    # Differentiate values based on location for realistic variety
    if location_id == "loc-03":
        temp, hum, wind, cape, dbz = 27.6, 82.0, 42.1, 3200.0, 59.8
    elif location_id == "loc-04":
        temp, hum, wind, cape, dbz = 23.5, 64.0, 18.2, 850.0, 18.0
    elif location_id == "loc-02":
        temp, hum, wind, cape, dbz = 29.1, 71.0, 24.0, 1950.0, 38.5
    else:
        temp, hum, wind, cape, dbz = 28.4, 78.0, 36.5, 2850.0, 54.2

    return {
        "id": f"w-{loc['id']}",
        "location_id": loc["id"],
        "location_name": loc["name"],
        "temperature_c": temp,
        "humidity_percent": hum,
        "wind_speed_kmh": wind,
        "wind_direction": "SSW",
        "wind_direction_deg": 205.0,
        "pressure_hpa": 1004.2,
        "rainfall_mm": 14.8,
        "dew_point_c": 23.2,
        "cape_j_kg": cape,
        "radar_reflectivity_dbz": dbz,
        "timestamp": datetime.now()
    }

@app.get("/predictions", response_model=List[PredictionHorizonSchema])
def get_predictions(location_id: Optional[str] = Query("loc-01")):
    """
    Returns 30, 60, and 90 minute AI Nowcast predictions for thunderstorm and lightning risks.
    """
    # Use the ML pipeline rollout engine
    weather_info = get_weather(location_id)
    processed = nowcasting_engine.preprocess_atmospheric_inputs({
        "custom_radar_reflectivity_dbz": weather_info["radar_reflectivity_dbz"],
        "custom_cape_j_kg": weather_info["cape_j_kg"],
        "custom_humidity": weather_info["humidity_percent"]
    })
    return nowcasting_engine.run_convlstm_rollout(processed)

@app.get("/storms", response_model=List[StormSchema])
def get_storms():
    """
    Returns currently tracked convective cells, radar reflectivity, and forecasted trajectories.
    """
    return [
        {
            "id": "storm-cell-01",
            "storm_id": "STM-2026-08A",
            "name": "Convective Cell Alpha",
            "current_location": {
                "lat": 35.412,
                "lng": -97.585,
                "area_name": "Metro Southwest Corridor"
            },
            "direction": "NNE",
            "direction_deg": 25.0,
            "speed_kmh": 42.0,
            "intensity": "Severe",
            "intensity_dbz": 58.0,
            "risk_level": "HIGH",
            "last_updated": "2 min ago",
            "lightning_strike_count_last_10m": 142,
            "top_height_km": 14.2,
            "trajectory": [
                {"latitude": 35.250, "longitude": -97.710, "timestamp": "T - 40 min", "type": "past", "intensity_dbz": 44, "time_label": "-40m (Past)"},
                {"latitude": 35.330, "longitude": -97.640, "timestamp": "T - 20 min", "type": "past", "intensity_dbz": 51, "time_label": "-20m (Past)"},
                {"latitude": 35.412, "longitude": -97.585, "timestamp": "Now", "type": "current", "intensity_dbz": 58, "time_label": "0m (Current)"},
                {"latitude": 35.495, "longitude": -97.525, "timestamp": "T + 30 min", "type": "predicted", "intensity_dbz": 56, "time_label": "+30m (ConvLSTM)"},
                {"latitude": 35.580, "longitude": -97.465, "timestamp": "T + 60 min", "type": "predicted", "intensity_dbz": 50, "time_label": "+60m (ConvLSTM)"},
                {"latitude": 35.660, "longitude": -97.405, "timestamp": "T + 90 min", "type": "predicted", "intensity_dbz": 42, "time_label": "+90m (ConvLSTM)"}
            ]
        },
        {
            "id": "storm-cell-02",
            "storm_id": "STM-2026-09B",
            "name": "Squall Line Beta",
            "current_location": {
                "lat": 35.210,
                "lng": -97.420,
                "area_name": "Southern Reservoir Valley"
            },
            "direction": "NE",
            "direction_deg": 45.0,
            "speed_kmh": 38.0,
            "intensity": "Moderate",
            "intensity_dbz": 49.0,
            "risk_level": "HIGH",
            "last_updated": "4 min ago",
            "lightning_strike_count_last_10m": 78,
            "top_height_km": 11.8,
            "trajectory": [
                {"latitude": 35.120, "longitude": -97.530, "timestamp": "T - 30 min", "type": "past", "intensity_dbz": 40, "time_label": "-30m (Past)"},
                {"latitude": 35.210, "longitude": -97.420, "timestamp": "Now", "type": "current", "intensity_dbz": 49, "time_label": "0m (Current)"},
                {"latitude": 35.295, "longitude": -97.315, "timestamp": "T + 30 min", "type": "predicted", "intensity_dbz": 53, "time_label": "+30m (ConvLSTM)"},
                {"latitude": 35.385, "longitude": -97.210, "timestamp": "T + 60 min", "type": "predicted", "intensity_dbz": 51, "time_label": "+60m (ConvLSTM)"},
                {"latitude": 35.470, "longitude": -97.105, "timestamp": "T + 90 min", "type": "predicted", "intensity_dbz": 45, "time_label": "+90m (ConvLSTM)"}
            ]
        }
    ]

@app.get("/alerts", response_model=List[AlertSchema])
def get_alerts():
    """
    Returns disaster management targeted alerts and early warning bulletins.
    """
    return [
        {
            "id": "alt-001",
            "alert_id": "ALT-TC-2026-081",
            "location": "North Central Basin & Metro Core",
            "location_id": "loc-01",
            "alert_type": "Thunderstorm Risk",
            "risk_level": "HIGH",
            "probability": 88.0,
            "issued_at": "10 min ago (Prototype)",
            "valid_until": "Next 60 Minutes",
            "status": "ACTIVE",
            "headline": "High Thunderstorm Risk (Nowcast +30m)",
            "description": "Storm activity is expected to increase in this area within the next 30–60 minutes with rapid convective cell growth.",
            "instructions": "Disaster management personnel advise outdoor operations pause and monitor local drainage basins."
        },
        {
            "id": "alt-002",
            "alert_id": "ALT-TC-2026-082",
            "location": "Southwest Industrial Park & Transport Hub",
            "location_id": "loc-03",
            "alert_type": "Lightning Risk",
            "risk_level": "HIGH",
            "probability": 91.0,
            "issued_at": "6 min ago (Prototype)",
            "valid_until": "Next 45 Minutes",
            "status": "ACTIVE",
            "headline": "Intense Cloud-to-Ground Lightning Hotspot",
            "description": "ConvLSTM spatio-temporal projection detects concentrated electrostatic discharge cluster moving towards logistics terminals.",
            "instructions": "Activate grounding protocols at fuel depots and halt crane/aerial ramp operations."
        }
    ]

@app.get("/api/sources")
def get_sources_status():
    """
    Returns real-time status of meteorological sensor streams.
    """
    return {
        "status": "OPERATIONAL",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "sources": [
            {"id": "radar", "name": "Doppler Weather Radar (DWR)", "status": "ACTIVE", "frequency": "5 min", "latency_sec": 42},
            {"id": "satellite", "name": "INSAT-3D Thermal IR / WV", "status": "ACTIVE", "frequency": "15 min", "latency_sec": 180},
            {"id": "lightning", "name": "Lightning Location Network (LLN)", "status": "ACTIVE", "frequency": "1 min", "latency_sec": 12},
            {"id": "weather", "name": "Surface AWS Mesonet", "status": "ACTIVE", "frequency": "5 min", "latency_sec": 30},
            {"id": "nwp", "name": "WRF-ARW 3km Meso-Scale Model", "status": "ACTIVE", "frequency": "3 hr", "latency_sec": 480},
        ]
    }

@app.get("/api/vulnerability")
def get_vulnerability_ranking():
    """
    Returns ranked critical assets exposed to predicted convective storm tracks.
    Impact Risk = Meteorological Risk * Asset Exposure Weight
    """
    from backend.vulnerability.vulnerability_engine import VulnerabilityEngine
    engine = VulnerabilityEngine()
    return engine.assess_impact(storm_centroid_lat=35.412, storm_centroid_lng=-97.585, meteorological_risk_pct=88.0)

@app.get("/api/evaluation")
def get_evaluation_metrics():
    """
    Returns verification benchmarks (CSI, POD, FAR, Brier) comparing AI vs Advection vs Persistence.
    """
    from evaluation.metrics import VerificationEvaluator
    evaluator = VerificationEvaluator()
    return evaluator.get_comparison_summary()

@app.get("/api/predictions/{prediction_id}/explanation")
def get_prediction_explanation(prediction_id: str, horizon: int = 30):
    """
    Returns SHAP-style attribution explaining why high/moderate risk was predicted.
    """
    from backend.explainability.shap_explainer import ShapExplainer
    explainer = ShapExplainer()
    features = {
        "radar_max_dbz": 56.4,
        "cape_j_kg": 2950.0,
        "cloud_top_cooling_rate_k_15m": -6.8,
        "lightning_strikes_10m": 48.0,
        "lightning_jump_rate": 2.6,
        "dew_point_depression_c": 2.8,
        "bulk_shear_kt": 42.0,
    }
    return explainer.explain_prediction(prediction_id, horizon, features, final_probability=88.0)

@app.post("/predict", response_model=PredictResponse)
def run_predict(req: PredictRequest):
    """
    Simulates or executes CNN + ConvLSTM inference for custom radar, CAPE, and humidity inputs.
    """
    processed = nowcasting_engine.preprocess_atmospheric_inputs({
        "custom_radar_reflectivity_dbz": req.custom_radar_reflectivity_dbz or 52.0,
        "custom_cape_j_kg": req.custom_cape_j_kg or 2600.0,
        "custom_humidity": req.custom_humidity or 80.0,
        "custom_wind_shear": req.custom_wind_shear or 38.0
    })
    
    predictions = nowcasting_engine.run_convlstm_rollout(processed)

    return {
        "location_id": req.location_id,
        "is_demo_data": True,
        "model_architecture": "CNN + ConvLSTM (Spatial Feature Extraction + Spatio-Temporal Nowcasting)",
        "status_notice": "Prototype Prediction: Demo Values. Connect real PyTorch/TensorFlow checkpoint for operational inference.",
        "timestamp": datetime.now(),
        "predictions": predictions
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
