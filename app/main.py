from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import time
from app.nlp_engine import DiagnosticEngine

app = FastAPI(
    title="Dr. Panda AI Diagnostic Service",
    description="REST API for medical query classification and symptom similarity matching",
    version="1.0.0"
)

engine = DiagnosticEngine()

class QueryRequest(BaseModel):
    query: str
    top_k: Optional[int] = 3

class MatchResult(BaseModel):
    condition: str
    confidence: float
    recommendation: str

class QueryResponse(BaseModel):
    query: str
    latency_ms: float
    matches: List[MatchResult]

@app.get("/")
def read_root():
    return {"status": "online", "system": "Dr. Panda Healthcare Diagnostic API"}

@app.post("/api/v1/diagnose", response_model=QueryResponse)
def diagnose_symptoms(request: QueryRequest):
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    start_time = time.time()
    matches = engine.predict(request.query, top_k=request.top_k or 3)
    latency = (time.time() - start_time) * 1000.0
    
    return QueryResponse(
        query=request.query,
        latency_ms=round(latency, 2),
        matches=matches
    )
