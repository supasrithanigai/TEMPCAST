# TEMPESTCAST Backend (Python + FastAPI)

AI-Powered Thunderstorm & Lightning Nowcasting System  
**Disaster Management Prototype** | Problem Statement: 26072

---

## 1. Architecture Overview
This backend provides RESTful API endpoints for the TEMPESTCAST React dashboard.  
It defines the machine learning inference pipeline combining:
1. **CNN (Convolutional Neural Network)**: Extracts 2D spatial features from multi-channel radar reflectivity ($Z$, $Z_{DR}$), geostationary satellite infrared/water vapor imagery, and lightning flash density grids.
2. **ConvLSTM (Convolutional Long Short-Term Memory)**: Takes temporal sequences of spatial feature representations ($t_{-30}$, $t_{-20}$, $t_{-10}$, $t_0$) and predicts atmospheric convective evolution into the future ($t_{+30}$, $t_{+60}$, $t_{+90}$ minutes).

---

## 2. Running Locally

### Step 1: Create Virtual Environment
```bash
python -m venv venv
source venv/bin/activate    # On Windows: venv\Scripts\activate
```

### Step 2: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 3: Run the FastAPI Server
```bash
uvicorn main:app --reload --port 8000
```
API documentation will be available interactively at:
`http://localhost:8000/docs` (Swagger UI)

---

## 3. Connecting Real TensorFlow or PyTorch Model
1. Open `ml_pipeline.py`.
2. Look for `class MLNowcastingEngine`.
3. Load your trained PyTorch checkpoint:
   ```python
   import torch
   self.model = torch.jit.load("weights/tempestcast_convlstm.pt")
   self.model.eval()
   ```
4. In `run_convlstm_rollout()`, pass the normalized tensor `[1, 4, channels, 128, 128]` into `self.model(x)` and map output probabilities.
