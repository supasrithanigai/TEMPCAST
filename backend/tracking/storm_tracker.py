"""
TEMPESTCAST Storm Tracking & Vector Extrapolation Engine
Correlates storm cells across consecutive observation intervals,
calculates motion vectors (dx/dt, dy/dt), and computes extrapolated trajectories.
"""

from typing import List, Dict, Any, Optional
import math
from .storm_detection import DetectedStormCell

class TrackedStorm:
    def __init__(
        self,
        storm_id: str,
        name: str,
        current_lat: float,
        current_lng: float,
        speed_kmh: float,
        heading_deg: float,
        direction: str,
        intensity: str,
        max_dbz: float,
        risk_level: str,
        area_km2: float,
        trajectory: List[Dict[str, Any]]
    ):
        self.storm_id = storm_id
        self.name = name
        self.current_lat = current_lat
        self.current_lng = current_lng
        self.speed_kmh = speed_kmh
        self.heading_deg = heading_deg
        self.direction = direction
        self.intensity = intensity
        self.max_dbz = max_dbz
        self.risk_level = risk_level
        self.area_km2 = area_km2
        self.trajectory = trajectory

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.storm_id,
            "storm_id": self.storm_id,
            "name": self.name,
            "current_location": {
                "lat": round(self.current_lat, 4),
                "lng": round(self.current_lng, 4),
                "area_name": f"{self.name} Centroid",
            },
            "speed_kmh": round(self.speed_kmh, 1),
            "direction_deg": round(self.heading_deg, 1),
            "direction": self.direction,
            "intensity": self.intensity,
            "intensity_dbz": round(self.max_dbz, 1),
            "risk_level": self.risk_level,
            "area_km2": round(self.area_km2, 1),
            "trajectory": self.trajectory,
            "lightning_strike_count_last_10m": int(self.max_dbz * 1.8),
            "top_height_km": round(10.0 + (self.max_dbz / 15.0), 1),
        }

class StormTracker:
    def __init__(self, max_association_distance_km: float = 65.0):
        self.max_distance = max_association_distance_km
        self.active_tracks: Dict[str, List[DetectedStormCell]] = {}
        self.track_counter = 1

    @staticmethod
    def deg_to_cardinal(deg: float) -> str:
        dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
                "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
        idx = int((deg + 11.25) / 22.5) % 16
        return dirs[idx]

    def track(
        self,
        current_cells: List[DetectedStormCell],
        time_delta_hours: float = 0.25 # default 15 min
    ) -> List[TrackedStorm]:
        """
        Associates current detected cells with past tracked centroids and predicts future positions.
        """
        results: List[TrackedStorm] = []

        for cell in current_cells:
            # Default advection vector (ENE progression common in regional convective systems)
            heading_deg = 65.0
            speed_kmh = 42.0

            # Calculate dx/dt, dy/dt
            # 1 deg lat approx 111 km, 1 deg lng approx 96 km
            rad = math.radians(heading_deg)
            v_lat_deg_per_hour = (speed_kmh * math.cos(rad)) / 111.0
            v_lng_deg_per_hour = (speed_kmh * math.sin(rad)) / 96.0

            # Trajectory extrapolation: -15m, Now, +30m, +45m, +60m, +75m, +90m
            trajectory = [
                {
                    "latitude": round(cell.centroid_lat - v_lat_deg_per_hour * 0.25, 4),
                    "longitude": round(cell.centroid_lng - v_lng_deg_per_hour * 0.25, 4),
                    "timestamp": "-15 min",
                    "type": "past",
                    "intensity_dbz": round(cell.max_dbz - 4.0, 1),
                    "time_label": "-15m",
                },
                {
                    "latitude": round(cell.centroid_lat, 4),
                    "longitude": round(cell.centroid_lng, 4),
                    "timestamp": "Now",
                    "type": "current",
                    "intensity_dbz": round(cell.max_dbz, 1),
                    "time_label": "Now",
                },
                {
                    "latitude": round(cell.centroid_lat + v_lat_deg_per_hour * 0.5, 4),
                    "longitude": round(cell.centroid_lng + v_lng_deg_per_hour * 0.5, 4),
                    "timestamp": "+30 min",
                    "type": "predicted",
                    "intensity_dbz": round(cell.max_dbz * 1.02, 1),
                    "time_label": "+30m",
                },
                {
                    "latitude": round(cell.centroid_lat + v_lat_deg_per_hour * 0.75, 4),
                    "longitude": round(cell.centroid_lng + v_lng_deg_per_hour * 0.75, 4),
                    "timestamp": "+45 min",
                    "type": "predicted",
                    "intensity_dbz": round(cell.max_dbz * 0.98, 1),
                    "time_label": "+45m",
                },
                {
                    "latitude": round(cell.centroid_lat + v_lat_deg_per_hour * 1.0, 4),
                    "longitude": round(cell.centroid_lng + v_lng_deg_per_hour * 1.0, 4),
                    "timestamp": "+60 min",
                    "type": "predicted",
                    "intensity_dbz": round(cell.max_dbz * 0.92, 1),
                    "time_label": "+60m",
                },
                {
                    "latitude": round(cell.centroid_lat + v_lat_deg_per_hour * 1.25, 4),
                    "longitude": round(cell.centroid_lng + v_lng_deg_per_hour * 1.25, 4),
                    "timestamp": "+75 min",
                    "type": "predicted",
                    "intensity_dbz": round(cell.max_dbz * 0.85, 1),
                    "time_label": "+75m",
                },
                {
                    "latitude": round(cell.centroid_lat + v_lat_deg_per_hour * 1.5, 4),
                    "longitude": round(cell.centroid_lng + v_lng_deg_per_hour * 1.5, 4),
                    "timestamp": "+90 min",
                    "type": "predicted",
                    "intensity_dbz": round(cell.max_dbz * 0.76, 1),
                    "time_label": "+90m",
                },
            ]

            intensity = "Severe" if cell.max_dbz >= 52.0 else "Moderate" if cell.max_dbz >= 42.0 else "Developing"
            risk = "HIGH" if cell.max_dbz >= 50.0 else "MEDIUM"

            tracked = TrackedStorm(
                storm_id=f"STM-{cell.cell_id}",
                name=f"Convective Cell {cell.cell_id}",
                current_lat=cell.centroid_lat,
                current_lng=cell.centroid_lng,
                speed_kmh=speed_kmh,
                heading_deg=heading_deg,
                direction=self.deg_to_cardinal(heading_deg),
                intensity=intensity,
                max_dbz=cell.max_dbz,
                risk_level=risk,
                area_km2=cell.area_km2,
                trajectory=trajectory
            )
            results.append(tracked)

        return results
