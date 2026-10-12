# 섹션 9 시작 상태 — 병렬 작업과 Agent Teams (서울 라이브 3D ③ 따릉이 하루)

## 앱
```bash
git clone https://github.com/dante01yoon/seoul-live-3d.git
cd seoul-live-3d
git checkout 7bc358e -b sec09-bike   # 섹션 6까지 끝난 상태(녹화 시작점). 완성본은 main 또는 브랜치 sec09-bike
npm start                             # http://127.0.0.1:8000
```

## 데이터 받기 (저장소에 넣지 않음)
서울 열린데이터광장에서 직접 받아 `~/seoul-data/따릉이/`에 둡니다.
- [서울시 공공자전거 대여이력 정보(OA-15182)](https://data.seoul.go.kr/dataList/OA-15182/F/1/datasetView.do) → `서울특별시 공공자전거 대여이력 정보_2606.csv`(716MB, CP949). 생년·성별 등 이용자 속성 열이 있으니 **저장소에 커밋하지 마세요**.
- [서울시 공공자전거 따릉이 대여소 정보(OA-13252)](https://data.seoul.go.kr/dataList/OA-13252/F/1/datasetView.do) → `공공자전거 대여소 정보(26.6월 기준).xlsx`.
- 둘 다 공공누리 1유형(출처: 서울특별시).

## 녹화 환경
Claude Code 2.1.296(2026-10-12), Opus 5.5, VS Code 내장 터미널. Agent Teams는 실험 기능(`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`).
