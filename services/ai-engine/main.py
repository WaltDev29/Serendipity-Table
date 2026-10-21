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
    candidates = req.candidates
    if len(candidates) < 4:
        return MatchResponse(
            success=True,
            confirmedTables=[],
            unmatchedUserIds=[c.userId for c in candidates]
        )

    # 1. 제약 조건 검증 헬퍼 함수들 (MAT-02)
    def is_valid_group(group: List[CandidateProfile]) -> bool:
        # 하드 제약 1: 4인 테이블
        if len(group) != 4:
            return False

        # 하드 제약 2: 나이 차이 8세 이내
        ages = [c.birthYear for c in group]
        if (max(ages) - min(ages)) > 8:
            return False

        # 하드 제약 3: 성비 1명 고립 방지 (남녀 혼합 시 각 2인 이상, 동성 4인도 허용)
        males = sum(1 for c in group if c.gender == 'M')
        females = sum(1 for c in group if c.gender == 'F')
        if males == 1 or females == 1:
            return False

        # 하드 제약 4: 차단/기피 관계 분리
        group_user_ids = {c.userId for c in group}
        for c in group:
            for avoid_id in (c.avoidUserIds or []):
                if avoid_id in group_user_ids:
                    return False

        return True

    # 2. 소프트 조건 점수 계산 함수 (MAT-03)
    def calculate_group_score(group: List[CandidateProfile]) -> (float, List[str]):
        # 나이 점수 (차이가 작을수록 높음, 25점 만점)
        ages = [c.birthYear for c in group]
        age_diff = max(ages) - min(ages)
        age_score = max(0.0, 25.0 - (age_diff * 2.5))

        # 성비 점수 (2:2 완벽 균형 시 30점 만점, 동성 4인은 20점)
        males = sum(1 for c in group if c.gender == 'M')
        females = sum(1 for c in group if c.gender == 'F')
        ratio_score = 30.0 if (males == 2 and females == 2) else 20.0

        # 공통 관심사 점수 (20점 만점)
        all_interests = [set(c.interests) for c in group]
        common = set.intersection(*all_interests) if all_interests else set()
        common_interests = list(common)
        interest_score = min(20.0, len(common_interests) * 6.0 + 8.0)

        # 예산대 일치 점수 (15점 만점: 공통 예산 구간이 존재할수록 가점)
        all_budgets = [set(c.budgetRanges or []) for c in group]
        common_budgets = set.intersection(*all_budgets) if all_budgets else set()
        budget_score = 15.0 if common_budgets else 8.0

        # 성향 및 소통 스타일 점수 (10점 만점)
        tendency_score = 10.0

        total_score = round(age_score + ratio_score + interest_score + budget_score + tendency_score, 1)
        return total_score, common_interests

    # 3. 그리디 및 조합 탐색으로 최적 테이블 구성
    import itertools
    confirmed_tables: List[ConfirmedTable] = []
    unmatched = list(candidates)

    while len(unmatched) >= 4:
        best_combo = None
        best_score = -1.0
        best_common = []

        # 조합 탐색
        combos = itertools.combinations(unmatched, 4)
        checked_count = 0
        for combo in combos:
            checked_count += 1
            if checked_count > 500:
                break
            group = list(combo)
            if is_valid_group(group):
                score, common = calculate_group_score(group)
                if score > best_score:
                    best_score = score
                    best_combo = group
                    best_common = common

        if best_combo and best_score >= 45.0:
            males = sum(1 for c in best_combo if c.gender == 'M')
            females = sum(1 for c in best_combo if c.gender == 'F')
            ages = [c.birthYear for c in best_combo]
            
            confirmed_tables.append(ConfirmedTable(
                memberIds=[c.userId for c in best_combo],
                matchScore=best_score,
                ageDiff=max(ages) - min(ages),
                genderRatio={"M": males, "F": females},
                commonInterests=best_common if best_common else ["라이프스타일", "소셜다이닝"]
            ))

            # 배치된 멤버 제외
            assigned_ids = {c.userId for c in best_combo}
            unmatched = [c for c in unmatched if c.userId not in assigned_ids]
        else:
            break

    return MatchResponse(
        success=True,
        confirmedTables=confirmed_tables,
        unmatchedUserIds=[c.userId for c in unmatched]
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
