# 섹션 9 · 69강 Agent Teams(실험 기능) — 전처리·시각화·검증을 팀으로, 언제 쓰고 언제 피하나

> 실험 기능 · 2026-10 기준 (Claude Code 2.1.296)

## 오늘 할 것
클로드 여러 명이 팀장·팀원으로 나뉘어 공유 작업 목록과 쪽지로 함께 일하는 Agent Teams로, 6월 13일 하루 따릉이 이동을 지도에서 재생하는 화면을 만듭니다.

## 개념
- 팀 = 팀장(메인 세션) + 팀원(각자 따로 도는 클로드) + 공유 작업 목록 + 팀원끼리 직접 쪽지.
- 서브에이전트: 결과만 메인에 보고, 서로 대화 없음, 토큰 적음. 팀: 서로 확인·반박, 토큰은 팀원 수만큼.
- 켜기: 환경 변수 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`(셸 export 또는 settings.json `env`). 대화형에서만(`-p`는 팀을 만들지 않음).
- 보기: 기본 in-process(입력창 아래 패널, ↑↓ 고르기·Enter 보기·Ctrl+T 작업 목록) / split panes(tmux·iTerm2 필요, **VS Code 내장 터미널 미지원**).
- 한계: `/resume`로 팀원 안 돌아옴, 한 세션 한 팀, 팀원이 팀을 만들 수 없음.
- 잘 맞는 일: 조사·검토, 서로 다른 모듈, 경쟁 가설. 피할 일: 순서대로 하는 일, 같은 파일, 작은 일.

## 실습 (입력한 것 그대로)
```bash
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
claude --permission-mode auto
```
```text
에이전트 팀 만들어서 따릉이 하루 이동을 지도에서 재생하는 화면 만들어 줘. 전처리, 시각화, 검증 세 명으로. 팀원은 Sonnet으로
```
→ 팀원 preprocess(`bike-trips.mjs`)·viz(`bike.html`, deck.gl TripsLayer)·verify(`tests/bike-trips.test.mjs`). 검증 담당이 파이썬으로 원본을 따로 계산해 대조, 전처리 담당의 숫자 하나(쉼표 든 행 수)를 바로잡고, 화면(1280px·375px)을 점검해 고칠 점 3개를 시각화 담당에게 넘김. 테스트 83개 통과. 녹화 1회, 약 25분(시각화 담당 약 15분, 그동안 다른 팀원 대기).

```text
원본 CSV에는 생년·성별 같은 열이 있으니 저장소에는 넣지 말자. git에서 빼고 커밋해 줘
```
→ `.gitignore`에 `data/bike/bike-rentals-*.csv`, CSV 없을 때 실데이터 테스트 건너뛰기(d02f9fd(영상 속 e78af86)). 클로드가 "이전 커밋 이력에 CSV가 남아 있다"고 알려 줌 → 공개 저장소에 올리기 전 이력에서 뺐습니다.

비용(대화 기록 토큰 × API 정가 환산, CSV 정리 부분 포함): 팀장 Opus 5.5 $1.46 + 팀원 Sonnet 5.5 3명 $1.02 = $2.48.

## 근거
- 공식 문서 [Orchestrate teams of Claude Code sessions](https://code.claude.com/docs/en/agent-teams) (2026-10-12 확인)
- 공식 문서 [Pricing](https://platform.claude.com/docs/en/about-claude/pricing) (2026-10-12)


## 앱 저장소
[dante01yoon/seoul-live-3d](https://github.com/dante01yoon/seoul-live-3d) 브랜치 `sec09-bike` → main 로컬 머지 `e586b13`. 공개 전에 하루 치 원본 CSV(생년·성별 열 포함)를 `git filter-branch`로 sec09-bike 이력에서 지워서, 원본 CSV가 든 커밋은 해시가 바뀌었습니다(괄호 안이 영상에 보이는 해시).
