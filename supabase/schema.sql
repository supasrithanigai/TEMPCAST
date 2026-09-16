-- ==============================================================================
-- TEMPESTCAST PostgreSQL / Supabase Database Schema
-- AI-Powered Thunderstorm & Lightning Nowcasting System
-- Problem Statement: 26072 | Disaster Management
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. LOCATIONS TABLE
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    region VARCHAR(100),
    latitude NUMERIC(9, 6) NOT NULL,
    longitude NUMERIC(9, 6) NOT NULL,
    vulnerability_level VARCHAR(20) CHECK (vulnerability_level IN ('LOW', 'MEDIUM', 'HIGH')),
    elevation_m NUMERIC(7, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. WEATHER OBSERVATIONS TABLE
CREATE TABLE IF NOT EXISTS weather_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    location_name VARCHAR(255) NOT NULL,
    temperature NUMERIC(5, 2) NOT NULL, -- Celsius
    humidity NUMERIC(5, 2) NOT NULL,    -- Percentage
    wind_speed NUMERIC(5, 2) NOT NULL,  -- km/h
    wind_direction VARCHAR(10),         -- Compass heading (e.g., SSW)
    wind_direction_deg NUMERIC(5, 2),   -- 0-360 degrees
    pressure NUMERIC(6, 2) NOT NULL,    -- hPa
    rainfall NUMERIC(6, 2) DEFAULT 0,   -- mm
    dew_point NUMERIC(5, 2),            -- Celsius
    cape_j_kg NUMERIC(6, 1),            -- Convective Available Potential Energy (J/kg)
    radar_reflectivity NUMERIC(5, 2),   -- dBZ
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 3. AI NOWCASTING PREDICTIONS TABLE (CNN + ConvLSTM Output)
CREATE TABLE IF NOT EXISTS predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    prediction_time TIMESTAMPTZ DEFAULT NOW(),
    horizon_minutes INT CHECK (horizon_minutes IN (30, 60, 90)),
    thunderstorm_probability NUMERIC(5, 2) CHECK (thunderstorm_probability BETWEEN 0 AND 100),
    lightning_probability NUMERIC(5, 2) CHECK (lightning_probability BETWEEN 0 AND 100),
    confidence NUMERIC(5, 2) CHECK (confidence BETWEEN 0 AND 100),
    severity VARCHAR(30) CHECK (severity IN ('Minor', 'Moderate', 'Severe', 'Extreme')),
    risk_level VARCHAR(20) CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
    estimated_peak_dbz NUMERIC(5, 2),
    expected_strikes_per_min NUMERIC(5, 2),
    model_version VARCHAR(50) DEFAULT 'CNN-ConvLSTM-v0.1-prototype',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ACTIVE STORM TRACKING & TRAJECTORY TABLE
CREATE TABLE IF NOT EXISTS storm_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    storm_id VARCHAR(50) NOT NULL,
    name VARCHAR(100),
    latitude NUMERIC(9, 6) NOT NULL,
    longitude NUMERIC(9, 6) NOT NULL,
    direction VARCHAR(10),
    direction_deg NUMERIC(5, 2),
    speed NUMERIC(5, 2),              -- km/h
    intensity VARCHAR(50),            -- Developing, Moderate, Severe, Supercell
    intensity_dbz NUMERIC(5, 2),      -- Peak radar reflectivity in core
    risk_level VARCHAR(20) CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
    top_height_km NUMERIC(4, 2),
    lightning_rate NUMERIC(6, 2),
    track_point_type VARCHAR(20) CHECK (track_point_type IN ('past', 'current', 'predicted')),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TARGETED DISASTER MANAGEMENT ALERTS TABLE
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_id VARCHAR(50) UNIQUE NOT NULL,
    location VARCHAR(255) NOT NULL,
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    alert_type VARCHAR(50) CHECK (alert_type IN (
        'Thunderstorm Risk',
        'Lightning Risk',
        'Heavy Rain Risk',
        'Severe Storm Risk'
    )),
    risk_level VARCHAR(20) CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
    probability NUMERIC(5, 2) CHECK (probability BETWEEN 0 AND 100),
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'WATCH', 'WARNING', 'EXPIRED')),
    headline VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    instructions TEXT
);

-- Indexes for rapid spatio-temporal lookup by nowcasting queries
CREATE INDEX IF NOT EXISTS idx_weather_location_time ON weather_data (location_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_predictions_lookup ON predictions (location_id, prediction_time DESC, horizon_minutes);
CREATE INDEX IF NOT EXISTS idx_storm_tracking ON storm_tracking (storm_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_active ON alerts (status, risk_level, valid_until);
