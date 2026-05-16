# Drone Diagnostics & Edge Intelligence System
This is my submission for the Drone Diagnostics & Edge Intelligence System task. I tried to build a solution that is simple, effective, and works well for field technicians.

> **Note on AI Usage:** I want to be fully transparent that I used AI coding assistants heavily to help me write the Python logic, set up the Next.js environment, and design the user interface. I guided the architecture, the logic rules, and the design constraints, while the AI helped me implement the code much faster.

## 1. Architecture Choice
**My Approach:** A simple Python script + a separated React Frontend.

I chose this because the task asked for something that works in offline or low-connectivity environments. 
- **Backend (Python):** I wrote a script (`pipeline.py`) that generates the synthetic data and runs the diagnostic logic. It evaluates the drone and exports everything into a simple `drone_data.json` file.
- **Frontend (Next.js/React):** The UI just reads this local JSON file. 

I didn't use microservices or complex databases because out in the field, technicians might not have good internet. By keeping it simple (just reading a local file), the app works instantly without waiting for a cloud server.

## 2. AI Strategy & Failure Reasoning
**My Approach:** Rule-Based "Heuristic" System.

The prompt mentioned adding ML/AI "reasonably". Since drones and edge devices don't have the battery or compute power to run heavy Deep Learning models, I decided to build a rule-based expert system instead of a neural network. 

**How it works:**
The system uses physical correlations. For example:
- If vibration is high *only* when the drone is carrying a heavy payload, it's just flagged as "Minor Wear and Tear".
- But if vibration is high *and* the motor temperature goes crazy at the same time, it throws a "Motor/Rotor Degradation" error.

**How I Calculate the Confidence Score:**
The task asked for a "Confidence Score". Instead of just putting a random number or building a complex machine learning model that would kill the drone's battery, I decided to calculate it using simple math based on how bad the failure is (Threshold Deviation).

Here is the logic I used:
- If the fail limit for temperature is `80°C` and the drone hits `81°C`, it's barely failing. So the code gives a lower confidence (like `80%`) because it might just be a temporary spike or sensor noise.
- But if the drone hits `120°C`, that's a massive failure. The code catches this huge deviation and outputs a `99.9%` confidence score because the motor is definitely burning.

I think this is a very cool and practical "heuristic" way to build an AI-like feature. It gives field technicians a reliable score without needing any heavy processing power on the edge device.

## 3. Real-World Limitations
If this was a real product in the field, here is what would break my system:
1. **Broken Sensors:** If a temperature sensor just dies and sends `0°C`, my code might not catch it as a "fail" because it's only looking for *high* temperatures (like `> 80°C`).
2. **Missing Data:** If the drone skips the autonomous flight test, the script might fail to compute a reliable health score because it currently expects all three flight modes to be completed.
3. **Different Drone Models:** I hardcoded the limits (like max temp 80°C). If we use a massive industrial drone, its normal temperature might be 85°C, and my system would wrongly flag it as broken.

## 4. How I Generated the Data (Realism)
To make the synthetic data realistic, I made some physical assumptions:
- **Payload Physics:** When the drone is loaded, I added math to make the motor temperature and vibration increase.
- **Battery Drain:** Carrying a payload drains the battery much faster.
- **Noise:** I used Gaussian (Normal) distributions to simulate random sensor noise so the data isn't perfectly smooth.
- **GPS Errors:** I used a Lognormal distribution because GPS is usually fine, but when it loses signal, the error spikes really high.
