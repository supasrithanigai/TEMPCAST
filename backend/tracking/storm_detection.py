"""
TEMPESTCAST Storm Cell Detection Engine
Thresholds radar reflectivity grids, performs connected-component labeling,
and isolates convective storm centroids, areas, and intensity peaks.
"""

from typing import List, Dict, Any, Tuple
import math

class DetectedStormCell:
    def __init__(
        self,
        cell_id: str,
        centroid_lat: float,
        centroid_lng: float,
        area_km2: float,
        max_dbz: float,
        mean_dbz: float,
        bbox: Tuple[float, float, float, float]
    ):
        self.cell_id = cell_id
        self.centroid_lat = centroid_lat
        self.centroid_lng = centroid_lng
        self.area_km2 = area_km2
        self.max_dbz = max_dbz
        self.mean_dbz = mean_dbz
        self.bbox = bbox

    def to_dict(self) -> Dict[str, Any]:
        return {
            "cell_id": self.cell_id,
            "centroid_lat": round(self.centroid_lat, 4),
            "centroid_lng": round(self.centroid_lng, 4),
            "area_km2": round(self.area_km2, 1),
            "max_dbz": round(self.max_dbz, 1),
            "mean_dbz": round(self.mean_dbz, 1),
            "bbox": self.bbox,
        }

class StormDetector:
    def __init__(self, reflectivity_threshold_dbz: float = 40.0, min_area_km2: float = 25.0):
        self.threshold_dbz = reflectivity_threshold_dbz
        self.min_area = min_area_km2

    def detect_cells(
        self,
        radar_grid: List[Dict[str, Any]],
        timestamp: str
    ) -> List[DetectedStormCell]:
        """
        Segments radar observations into isolated convective cells.
        Clusters contiguous convective points exceeding the reflectivity threshold.
        """
        convective_points = [
            pt for pt in radar_grid
            if pt.get("reflectivity_dbz", 0.0) >= self.threshold_dbz
        ]

        if not convective_points:
            return []

        # Spatial clustering (simple Euclidean distance clustering representing connected components)
        clusters: List[List[Dict[str, Any]]] = []
        visited = set()

        for i, pt in enumerate(convective_points):
            if i in visited:
                continue
            cluster = [pt]
            visited.add(i)

            for j, other in enumerate(convective_points):
                if j in visited:
                    continue
                d_lat = pt["latitude"] - other["latitude"]
                d_lng = pt["longitude"] - other["longitude"]
                dist_approx_km = math.sqrt(d_lat**2 + d_lng**2) * 111.0

                if dist_approx_km < 35.0: # 35km spatial adjacency threshold
                    cluster.append(other)
                    visited.add(j)

            clusters.append(cluster)

        detected_cells: List[DetectedStormCell] = []
        for idx, cluster in enumerate(clusters):
            # Compute centroid & metrics
            sum_lat = sum(p["latitude"] for p in cluster)
            sum_lng = sum(p["longitude"] for p in cluster)
            centroid_lat = sum_lat / len(cluster)
            centroid_lng = sum_lng / len(cluster)

            dbz_values = [p.get("reflectivity_dbz", 40.0) for p in cluster]
            max_dbz = max(dbz_values)
            mean_dbz = sum(dbz_values) / len(dbz_values)

            # Bounding box
            lats = [p["latitude"] for p in cluster]
            lngs = [p["longitude"] for p in cluster]
            bbox = (min(lats) - 0.05, min(lngs) - 0.05, max(lats) + 0.05, max(lngs) + 0.05)

            # Area approximation (km2)
            span_lat_km = (max(lats) - min(lats) + 0.05) * 111.0
            span_lng_km = (max(lngs) - min(lngs) + 0.05) * 95.0
            approx_area = max(self.min_area, span_lat_km * span_lng_km * 0.785)

            cell = DetectedStormCell(
                cell_id=f"CELL-{idx + 1:02d}",
                centroid_lat=centroid_lat,
                centroid_lng=centroid_lng,
                area_km2=approx_area,
                max_dbz=max_dbz,
                mean_dbz=mean_dbz,
                bbox=bbox
            )
            detected_cells.append(cell)

        return detected_cells
