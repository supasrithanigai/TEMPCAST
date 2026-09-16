"""
TEMPESTCAST Alert Engine
Generates prioritized civil protection warnings, lead-time notifications,
and multi-channel dispatch payloads (SMS/WhatsApp/Public Siren simulation).
"""

from typing import List, Dict, Any
from datetime import datetime, timedelta

class AlertEngine:
    def __init__(self):
        self.alert_counter = 8801

    def generate_alert(
        self,
        location_name: str,
        location_id: str,
        thunderstorm_prob: float,
        lightning_prob: float,
        lead_time_min: int,
        confidence: float,
        affected_assets: List[str],
        storm_speed_kmh: float,
        storm_direction: str
    ) -> Dict[str, Any]:
        """
        Synthesizes probabilistic risk and exposure into structured civil defense warnings.
        """
        self.alert_counter += 1
        alert_id = f"ALT-{self.alert_counter}"

        max_prob = max(thunderstorm_prob, lightning_prob)
        if max_prob >= 85.0:
            risk_level = "CRITICAL"
            headline = f"EMERGENCY RED WARNING: Severe Convective Storm & Violent Lightning Imminent"
            recommended_action = (
                f"Severe convective cell moving {storm_direction} at {storm_speed_kmh} km/h. "
                f"Seek immediate shelter in reinforced interior rooms away from windows. "
                f"Halt all outdoor activities and disconnect power grid interconnects."
            )
        elif max_prob >= 65.0:
            risk_level = "HIGH"
            headline = f"SEVERE STORM WARNING: High Probability of Cloud-to-Ground Lightning Strikes"
            recommended_action = (
                f"Rapid convective initiation detected within +{lead_time_min} min horizon. "
                f"Secure outdoor assets and prepare backup generator capacity."
            )
        elif max_prob >= 40.0:
            risk_level = "MEDIUM"
            headline = f"CONVECTIVE WATCH: Moderate Thunderstorm & Squall Development"
            recommended_action = "Monitor real-time radar trajectory updates. Review school & logistics shelter plans."
        else:
            risk_level = "LOW"
            headline = "ADVISORY: Minor Rain & Isolated Convective Showers"
            recommended_action = "Normal precautionary measures advised."

        now = datetime.utcnow()
        valid_until = now + timedelta(minutes=lead_time_min + 60)

        return {
            "id": f"alert-{self.alert_counter}",
            "alert_id": alert_id,
            "timestamp": now.isoformat() + "Z",
            "location": location_name,
            "location_id": location_id,
            "risk_level": risk_level,
            "thunderstorm_probability": thunderstorm_prob,
            "lightning_probability": lightning_prob,
            "lead_time": f"+{lead_time_min} min",
            "confidence": confidence,
            "affected_assets": affected_assets[:4],
            "headline": headline,
            "recommended_action": recommended_action,
            "status": "ACTIVE" if max_prob >= 60.0 else "WATCH",
            "issued_at": now.strftime("%Y-%m-%d %H:%M UTC"),
            "valid_until": valid_until.strftime("%Y-%m-%d %H:%M UTC"),
            "simulation_dispatch": {
                "sms_preview": f"[TEMPESTCAST ALERT] {risk_level}: Severe storm approaching {location_name} in {lead_time_min}m. Seek interior shelter.",
                "whatsapp_preview": f"🚨 *TEMPESTCAST WARNING* 🚨\nSector: {location_name}\nLead Time: +{lead_time_min} min\nRisk: {risk_level} ({max_prob:.0f}%)\nAction: {recommended_action}",
                "siren_protocol": "CODE_ORANGE_CONTINUOUS" if risk_level == "CRITICAL" else "CODE_YELLOW_INTERMITTENT"
            }
        }
