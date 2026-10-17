from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

app = FastAPI(title="Serendipity Table AI Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CandidateProfile(BaseModel):
    userId: str
    birthYear: int
    gender: str
    mbti: str
    interests: List[str]
    myTendencies: List[str]
    preferredTendencies: List[str]
    budgetRanges: List[str]
    avoidUserIds: Optional[List[str]] = []

class MatchRequest(BaseModel):
    slotId: int
    region: str
    candidates: List[CandidateProfile]

class ConfirmedTable(BaseModel):
    memberIds: List[str]
    matchScore: float
    ageDiff: int
    genderRatio: Dict[str, int]
    commonInterests: List[str]

class MatchResponse(BaseModel):
    success: bool
    confirmedTables: List[ConfirmedTable]
    unmatchedUserIds: List[str]

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ai-engine"}

@app.post("/api/match", response_model=MatchResponse)
def match_candidates(req: MatchRequest):
    # 기본 스켈레톤 응답 (Day 2에서 백트래킹/최적화 가중치 알고리즘으로 완성)
    return MatchResponse(
        success=True,
        confirmedTables=[],
        unmatchedUserIds=[c.userId for c in req.candidates]
    )

@app.post("/api/cs/query")
def cs_query(payload: Dict[str, Any]):
    return {
        "reply": "안녕하세요! '우연한 식탁' 고객센터 AI 챗봇입니다. 무엇을 도와드릴까요?",
        "confidence": 0.95,
        "suggestHuman": False
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
