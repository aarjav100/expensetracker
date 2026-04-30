from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from model_logic import predict_next_month
import uvicorn

app = FastAPI(title="SpendWise AI Service")

class PredictionRequest(BaseModel):
    history: List[float]
    income: float

class PredictionResponse(BaseModel):
    prediction: float
    predicted_savings: float
    recommendation: str

@app.get("/")
def read_root():
    return {"status": "AI Service is online"}

@app.post("/predict", response_model=PredictionResponse)
def get_prediction(data: PredictionRequest):
    try:
        result = predict_next_month(data.history, data.income)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
