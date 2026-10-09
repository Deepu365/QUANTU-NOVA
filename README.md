# QuantumFlow Backend (FastAPI + Qiskit 2.x)

QAOA-Based Irrigation and Water-Resource Allocation Optimisation Engine.

## Quickstart (Local Python Development)

1. **Create Virtual Environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the FastAPI Server**:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

4. **Interactive OpenAPI Documentation**:
   Navigate to `http://localhost:8000/docs` to inspect and test all endpoints.

## Cloud Deployment (Render / Cloud Run / Fly.io)

### Option A: Render
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Option B: Docker / Google Cloud Run
```bash
docker build -t quantumflow-backend .
docker run -p 8000:8000 quantumflow-backend
```
