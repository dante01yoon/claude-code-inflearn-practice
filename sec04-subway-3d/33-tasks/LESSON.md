# 섹션 4 · 33강 작업 쪼개기와 진행 관리 — 작업 목록 파일 · 작업 체크리스트

ROADMAP의 큰 단계를 "끝났는지 한 문장으로 확인되는" 조각으로 쪼개고, 진행 상황을 두 곳에서 관리합니다.

## 개념
- 좋은 조각: 끝났는지 한 문장으로 확인 가능 (나쁜 예 "데이터 정리하기" / 좋은 예 "원본 CSV 행 수가 621·784인지 확인")
- 큰 계획 = 작업 목록 파일(`ROADMAP.md`, 커밋으로 남음), 지금 하는 일 = 클로드의 작업 체크리스트(`Ctrl+T`)

## 공식 문서로 확인 (2026-10 기준)
- `Ctrl+T`: Claude의 작업 체크리스트 펼치기/접기 (한 번에 5개까지 표시)
- 작업 도구가 기본으로 켜진 모델은 Claude 3.x, Opus 4~4.7, Sonnet 4~4.6, Haiku 4.5. 그 밖의 모델은 목록이 비어 있음 → `CLAUDE_CODE_ENABLE_TODO_TOOLS=1 claude` (그 세션에만 적용, 설정 파일 변경 없음)
- `/tasks`는 백그라운드 셸·서브에이전트 보기(체크리스트 아님)
- 출처: https://code.claude.com/docs/en/interactive-mode#task-list , https://code.claude.com/docs/en/tools-reference

## 입력한 것 (그대로)
```bash
CLAUDE_CODE_ENABLE_TODO_TOOLS=1 claude
```
```text
ROADMAP 0단계랑 1단계를 작은 작업으로 쪼개서 목록 만들고 하나씩 해 줘
```
→ 7개 조각(0-1 행 수·인코딩 확인, 0-2 README 데이터 절, 0-3 커밋, 1-1 시간 창 프리셋, 1-2 `quietestInWindow`+테스트, 1-3 `peakRatio`+테스트, 1-4 `quietestHours` 대체). 약 2분 16초. 테스트 13개 통과, `data/` 변경 없음.
```text
다 끝났으면 ROADMAP 체크박스 고치고 커밋해 줘
```
→ 체크박스는 이미 표시됨, `ROADMAP.md`+`docs/PRD.md` 함께 커밋(링크 깨짐 방지). push 안 함.
```bash
git log --oneline -5
npm test 2>&1 | tail -8
```

## 결과 (seoul-live-3d `sec04-subway` 브랜치)
- `b8cea32` 9월 원본 CSV(승하차·역사마스터) 추가와 README 출처 정리
- `e07eedd` 시간 창 안의 가장 한가한 때 계산(quietestInWindow, peakRatio) 추가
- `5795583` 지하철 레이어 PRD와 로드맵 추가, 0·1단계 완료 표시
