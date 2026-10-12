# 섹션 9 · 71강 📏 직접 재 보기: 혼자 vs worktree 병렬 vs Agent Teams — 시간과 비용

## 측정 조건
- 과제(68강과 같음): `~/seoul-data/따릉이`의 6월 대여이력(700MB)에서 6월 13일(토) 하루 치를 뽑아 `data/bike`에 저장 + 대여소 정보 엑셀에서 번호별 위도·경도 JSON, 각각 커밋.
- Claude Code 2.1.296, Opus 5.5(Agent Teams 팀원도 Opus — 모델을 따로 정하지 않음), 모두 `--permission-mode auto`, 매번 새로 받은 seoul-live-3d(main 7bc358e)에서 시작.
- **방법마다 1회**(주간 사용량 한도 때문에). 몇십 초 차이는 우연일 수 있습니다.
- 시간: 프롬프트를 보낸 때부터 마지막 결과까지(녹화 시각). 비용: 대화 기록(jsonl, 하위 에이전트·팀원 포함) 토큰 × [API 정가](https://platform.claude.com/docs/en/about-claude/pricing)(2026-10-12, Opus 5.5 입력 $4·캐시 쓰기 5분 $5·1시간 $8·캐시 읽기 $0.20·출력 $20 / MTok). auto 모드 분류기 호출은 기록에 없어 빠짐. 구독 요금제에서는 청구가 아니라 사용량으로 잡힙니다.

## 프롬프트
- 혼자: `~/seoul-data/따릉이에 받아 둔 6월 따릉이 대여이력에서 6월 13일(토) 하루 치만 뽑아서 data/bike에 저장하고, 대여소 정보 엑셀에서 대여소 번호별 위도·경도를 뽑아 data/bike에 JSON으로 저장해 줘. 각각 커밋해 줘`
- worktree 병렬: 68강의 두 프롬프트(`claude -w bike-trips` / `claude -w bike-stations`), 68강 녹화를 그대로 사용.
- Agent Teams: `export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` 후 `에이전트 팀으로 해 줘. 팀원 두 명: 한 명은 …하루 치만 뽑아 data/bike에 저장, 다른 한 명은 …위도·경도를 뽑아 data/bike에 JSON으로 저장. 각각 커밋해 줘`

## 결과 (1회씩)
| 방법 | 시간 | 비용(API 정가 환산) | 메모 |
|---|---|---|---|
| 혼자 | 3분 6초 | $0.64 | 커밋 2개 |
| worktree 병렬 | 1분 28초 · 1분 14초 동시(동시 시작이면 1분 28초, 실제 녹화는 두 번째 창 여는 데 +26초) | $0.85 (0.46 + 0.39) + 합치기 세션 $0.35 | 합치기에서 README 충돌 1건 |
| Agent Teams | 3분 12초 (팀장 준비 39초 → 팀원 2분 2초 · 1분 28초 동시) | $1.09 | 팀장이 나누고 모으는 몫이 더해짐 |

참고: 69강 팀 작업(전처리·시각화·검증, 팀원 Sonnet)은 약 25분 · $2.48(팀장 Opus $1.46 + 팀원 $1.02) — 따로 계산해 대조·실수 짚기·화면 점검.

## 고르는 법
- 서로 상관없는 일 + 기다리는 시간이 아까움 → worktree 병렬(합치는 수고는 따라옴)
- 확인할 거리가 많은 큰 일 → Agent Teams(팀원 모델을 Sonnet 등으로 정하면 비용↓)
- 작고 순서가 분명한 일 → 혼자

측정 파일: `measure/cost.py`(대화 기록 → 비용), `measure/results.json`.


## 앱 저장소
[dante01yoon/seoul-live-3d](https://github.com/dante01yoon/seoul-live-3d) 브랜치 `sec09-bike` → main 로컬 머지 `e586b13`. 공개 전에 하루 치 원본 CSV(생년·성별 열 포함)를 `git filter-branch`로 sec09-bike 이력에서 지워서, 원본 CSV가 든 커밋은 해시가 바뀌었습니다(괄호 안이 영상에 보이는 해시).
