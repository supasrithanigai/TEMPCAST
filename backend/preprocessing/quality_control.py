"""
TEMPESTCAST Meteorological Quality Control Engine
Performs validation, outlier detection, range bounds, coordinate validity, and quality flagging.
Quality Flags: GOOD, SUSPECT, MISSING, INVALID.
Never silently discards data; records all processing audit logs.
"""

from typing import Dict, Any, List, Tuple
from enum import Enum
import math

class QualityFlag(str, Enum):
    GOOD = "GOOD"
    SUSPECT = "SUSPECT"
    MISSING = "MISSING"
    INVALID = "INVALID"

class QualityController:
    PHYSICAL_RANGES = {
        "temperature_c": (-30.0, 58.0),
        "dew_point_c": (-40.0, 38.0),
        "humidity_percent": (0.0, 100.0),
        "pressure_hpa": (850.0, 1060.0),
        "wind_speed_kmh": (0.0, 320.0),
        "wind_direction_deg": (0.0, 360.0),
        "reflectivity_dbz": (-10.0, 80.0),
        "cape_j_kg": (0.0, 7500.0),
        "brightness_temp_k": (160.0, 330.0),
        "rainfall_rate_mmh": (0.0, 350.0),
    }

    def __init__(self):
        self.audit_log: List[str] = []

    def check_observation(
        self,
        record: Dict[str, Any],
        bbox: Tuple[float, float, float, float]
    ) -> Tuple[QualityFlag, List[str]]:
        """
        Validates an observation record:
        1. Coordinate bounds
        2. Missing values
        3. Impossible physical ranges
        4. Meteorological consistency (e.g. dew_point <= temperature)
        """
        issues = []
        lat = record.get("latitude")
        lng = record.get("longitude")

        # 1. Coordinate check
        if lat is None or lng is None:
            issues.append("Missing geographic coordinates")
            return QualityFlag.INVALID, issues

        min_lat, min_lng, max_lat, max_lng = bbox
        if not (min_lat <= lat <= max_lat and min_lng <= lng <= max_lng):
            issues.append(f"Coordinates ({lat}, {lng}) out of domain bounds {bbox}")
            return QualityFlag.SUSPECT, issues

        # 2. Physical range checks
        is_suspect = False
        for field, (f_min, f_max) in self.PHYSICAL_RANGES.items():
            if field in record:
                val = record[field]
                if val is None or (isinstance(val, float) and math.isnan(val)):
                    issues.append(f"Missing or NaN field: {field}")
                    is_suspect = True
                elif val < f_min or val > f_max:
                    issues.append(f"Out of physical range {field}={val} (allowed: [{f_min}, {f_max}])")
                    is_suspect = True

        # 3. Meteorological consistency check: dew_point cannot exceed temperature
        temp = record.get("temperature_c")
        dew = record.get("dew_point_c")
        if temp is not None and dew is not None and dew > temp + 1.0:
            issues.append(f"Thermodynamic inconsistency: dew point {dew}C > temperature {temp}C")
            is_suspect = True

        if len(issues) == 0:
            return QualityFlag.GOOD, ["All QC tests passed"]
        elif is_suspect:
            return QualityFlag.SUSPECT, issues
        return QualityFlag.INVALID, issues

    def process_batch(
        self,
        records: List[Dict[str, Any]],
        bbox: Tuple[float, float, float, float]
    ) -> List[Dict[str, Any]]:
        """
        Applies QC flags to each record without discarding any observations.
        Logs audit summary.
        """
        annotated = []
        for r in records:
            item = dict(r)
            flag, issues = self.check_observation(item, bbox)
            item["quality_flag"] = flag.value
            item["qc_notes"] = issues
            annotated.append(item)
            self.audit_log.append(f"[{flag.value}] {item.get('id', 'item')}: {', '.join(issues)}")
        return annotated
