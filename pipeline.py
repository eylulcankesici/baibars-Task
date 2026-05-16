import os
import json
import numpy as np
import random

class EdgeDiagnosticSystem:
    def __init__(self):
        # Eşik değerleri
        self.thresholds = {
            "temp_fail": 80.0, "temp_warn": 70.0,
            "vibe_fail": 6.5, "vibe_warn": 4.5,
            "battery_drain_fail": 15.0,
            "gps_fail": 3.0, "gps_warn": 1.5,
            "eff_drop_fail": 40.0
        }

    def generate_data(self, num_sessions=500):
        dataset = []
        for i in range(num_sessions):
            # --- GÜRÜLTÜ VE GERÇEKÇİLİK MODELİ ---
            # Unloaded Flight
            u_temp = np.random.normal(50, 4)
            u_vibe = np.random.normal(2.0, 0.3)
            u_bat = np.random.normal(5.0, 1.0)
            u_stab = np.clip(np.random.normal(95, 2), 0, 100)

            # Loaded Flight
            payload = np.random.uniform(2.0, 10.0) # 2-10 kg
            l_temp = u_temp + (payload * 2.5) + np.random.normal(0, 3)
            l_vibe = u_vibe + (payload * 0.3) + np.random.normal(0, 0.5)
            l_bat = u_bat + (payload * 0.8)
            eff_drop = (payload * 3.5) + np.random.normal(5, 2)
            
            # Autonomous Flight
            gps_dev = np.random.lognormal(0, 0.5)
            sensor_anomaly = random.uniform(0, 0.05)
            route_success = True if gps_dev < 4.0 and random.random() > 0.05 else False

            # --- HATA ENJEKSİYONU (Arızalı Dronelar) ---
            if random.random() < 0.20: # %20 arıza ihtimali
                fault_type = random.choice(["motor", "battery", "gps"])
                if fault_type == "motor":
                    l_vibe += random.uniform(3, 6)
                    l_temp += random.uniform(10, 20)
                elif fault_type == "battery":
                    l_bat += random.uniform(8, 15)
                elif fault_type == "gps":
                    gps_dev += random.uniform(3, 7)

            session = {
                "id": f"DRN-{1000+i}",
                "unloaded": {"temp": round(u_temp,1), "vibe": round(u_vibe,2), "battery": round(u_bat,1), "stability": round(u_stab,1)},
                "loaded": {"temp": round(l_temp,1), "vibe": round(l_vibe,2), "battery": round(l_bat,1), "payload": round(payload,1), "eff_drop": round(eff_drop,1)},
                "autonomous": {"gps_dev": round(gps_dev,2), "sensor_anomaly_rate": round(sensor_anomaly,3), "route_success": route_success}
            }
            
            # Teşhis motorundan geçir ve listeye ekle
            dataset.append(self.diagnose(session))
            
        return dataset

    def diagnose(self, data):
        score = 100
        root_cause = "Nominal Operation"
        diagnosis_text = "All systems are operating within normal parameters."
        
        # Nominal durum için güven skoru
        temp_ratio = data["loaded"]["temp"] / self.thresholds["temp_warn"]
        vibe_ratio = data["loaded"]["vibe"] / self.thresholds["vibe_warn"]
        confidence = round(min(99.9, max(70.0, 100.0 - (max(temp_ratio, vibe_ratio) * 20))), 1)

        # Durumları belirle
        data["unloaded"]["status"] = "OK"
        data["loaded"]["status"] = "OK"
        data["autonomous"]["status"] = "OK"

        # Hata Analizi
        if data["loaded"]["temp"] > self.thresholds["temp_fail"] or data["loaded"]["vibe"] > self.thresholds["vibe_fail"]:
            data["loaded"]["status"] = "FAIL"
            score -= 40
            root_cause = "Motor/Rotor Degradation"
            diagnosis_text = "Critical: Motor temperature or vibration exceeds safe limits under load. Inspect propellers and motor bearings immediately."
            
            temp_dev = max(0, (data["loaded"]["temp"] - self.thresholds["temp_fail"]) / self.thresholds["temp_fail"])
            vibe_dev = max(0, (data["loaded"]["vibe"] - self.thresholds["vibe_fail"]) / self.thresholds["vibe_fail"])
            confidence = round(min(99.9, 80.0 + (max(temp_dev, vibe_dev) * 100)), 1)
            
        elif data["loaded"]["battery"] > self.thresholds["battery_drain_fail"]:
            data["loaded"]["status"] = "FAIL"
            score -= 30
            root_cause = "Battery Cell Failure"
            diagnosis_text = "Warning: Abnormal power draw detected under load. The battery may have internal resistance issues. Replace battery pack."
            
            bat_dev = max(0, (data["loaded"]["battery"] - self.thresholds["battery_drain_fail"]) / self.thresholds["battery_drain_fail"])
            confidence = round(min(99.9, 75.0 + (bat_dev * 100)), 1)

        elif data["autonomous"]["gps_dev"] > self.thresholds["gps_fail"] or not data["autonomous"]["route_success"]:
            data["autonomous"]["status"] = "FAIL"
            score -= 35
            root_cause = "Navigation System Error"
            diagnosis_text = "Critical: High GPS deviation prevented route completion. Check antenna connections and avoid high-interference areas."
            
            if not data["autonomous"]["route_success"]:
                confidence = 99.9
            else:
                gps_dev = max(0, (data["autonomous"]["gps_dev"] - self.thresholds["gps_fail"]) / self.thresholds["gps_fail"])
                confidence = round(min(99.9, 85.0 + (gps_dev * 100)), 1)

        elif data["loaded"]["vibe"] > self.thresholds["vibe_warn"]:
            data["loaded"]["status"] = "WARNING"
            score -= 15
            root_cause = "Minor Wear and Tear"
            diagnosis_text = "Notice: Slightly elevated vibrations detected. Safe to fly, but schedule maintenance soon."
            
            vibe_dev = max(0, (data["loaded"]["vibe"] - self.thresholds["vibe_warn"]) / self.thresholds["vibe_warn"])
            confidence = round(min(99.9, 65.0 + (vibe_dev * 100)), 1)

        data["health_score"] = max(0, score)
        data["overall_status"] = "OK" if score >= 85 else ("WARNING" if score >= 65 else "FAIL")
        data["root_cause"] = root_cause
        data["diagnosis"] = diagnosis_text
        data["confidence"] = confidence

        return data

# Çalıştır ve JSON'a kaydet
if __name__ == "__main__":
    system = EdgeDiagnosticSystem()
    data = system.generate_data(500)
    
    output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'frontend', 'app', 'drone_data.json')
    
    with open(output_path, 'w') as f:
        json.dump(data, f, indent=4)
    
    print(f"500 uçuş kaydı ve teşhis analizi başarıyla kaydedildi: {output_path}")