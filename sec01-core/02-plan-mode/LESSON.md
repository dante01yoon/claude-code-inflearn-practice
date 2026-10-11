# 섹션 1 · 계획 모드와 공식 워크플로 (살펴보기 → 계획 → 구현 → 커밋)

실습: `start/`(역별 시간대 그래프) → 계획 모드로 3D 기둥 + 시간 슬라이더 → `solution/`. 📏 `measure/`: 계획 모드를 쓸 때 vs 안 쓸 때.
촬영: VS Code 내장 터미널(code-server), Claude Code v2.1.296, Opus 5.5 · medium, 2026-10-11

## 시작하기
```bash
cd start
git init && git add -A && git commit -m "역별 시간대 승하차 그래프"
claude
```

## 입력한 것 (그대로)
```text
Shift+Tab (3번)           # auto → manual → accept edits → plan, 아래 표시가 "plan mode on"
이 프로젝트 구조랑 데이터 모양 먼저 살펴봐 줘
역마다 3D 기둥을 세우고, 시간 슬라이더로 시간대를 바꾸면 높이가 바뀌게 해 줘
  → 질문 2개(기둥 높이 / 기존 화면)에 추천안으로 답 → Submit answers
  → "Would you like to proceed?" 1. Yes, and use auto mode
커밋해 줘
```
짧은 프롬프트만으로 원하는 결과가 나와서, 자세한 버전은 쓰지 않았습니다(빠진 결정은 클로드가 계획 중에 질문으로 물어봄).

화면에서 본 것: 살펴보기 단계에서는 "읽기만 했고 고친 파일은 없다"고 먼저 밝힘. 계획서에 라이브러리(three.js), 화면 구성, 슬라이더 동작, 확인 방법까지 적힘. 구현 뒤 스크린샷으로 확인하며 원근 문제를 스스로 고침. 커밋은 `feat/3d-pillars` 새 브랜치에.
결과 보기: `cd solution && python3 -m http.server 8000` → http://127.0.0.1:8000 (슬라이더 · ▶ 재생 · 드래그 회전)

## 핵심 정리 (공식 문서 확인)
| 항목 | 내용 | 근거 |
|---|---|---|
| 계획 모드 | 파일을 읽고 살펴보는 명령을 실행하고 계획을 쓰지만, 소스는 고치지 않음 | [permission-modes#analyze-before-you-edit-with-plan-mode](https://code.claude.com/docs/en/permission-modes) |
| 들어가기 | Shift+Tab · 부탁 앞에 `/plan` · `claude --permission-mode plan` | 같은 문서 |
| 공식 순서 | Explore → Plan(Ctrl+G로 계획서 편집) → Implement → Commit | [best-practices#explore-first-then-plan-then-code](https://code.claude.com/docs/en/best-practices) |
| 승인 선택지 | Yes, and use auto mode / Yes, manually approve edits / Tell Claude what to change | [permission-modes#review-and-approve-a-plan](https://code.claude.com/docs/en/permission-modes) |
| 계획서 파일 | 기본 `~/.claude/plans`, `plansDirectory`로 변경 가능 | [settings-reference#plansdirectory](https://code.claude.com/docs/en/settings-reference) |
| 언제 생략? | "If you could describe the diff in one sentence, skip the plan." 작은 일은 바로 | best-practices |

## 📏 직접 재 보기 — `measure/measure_plan.py`
같은 시작 폴더 · 같은 부탁(`measure/prompt.txt`)을 두 방법으로 3번씩(두 방법 동시 실행):
- 바로: `claude -p <부탁> --permission-mode auto --safe-mode --output-format json`
- 계획: `claude -p <부탁> --permission-mode plan …` → `claude -p "계획대로 만들어 줘" --resume <세션> --permission-mode auto …`
- 점검(`measure/check_page.cjs`, puppeteer): ① 콘솔 오류 없음 ② 슬라이더 있음 ③ 08시→18시로 바꾸면 3D 화면이 달라짐(Pillow로 화면 차이) ④ 기존 그래프·표 유지

| 방법 | 평균 시간 | 평균 비용(추정) | 평균 출력 토큰 | 점검 |
|---|---|---|---|---|
| 바로 구현 | 119초 (86 · 163 · 108) | $0.434 | 8,792 | 4/4 × 3 |
| 계획 → 구현 | 184초 (204 · 191 · 156, 계획 단계 평균 48초) | $0.767 | 15,750 | 4/4 × 3 |

해석: 파일 하나에 기능 하나인 이 작업에서는 결과 품질이 같고, 계획을 거치면 시간 약 1.5배·비용 약 1.8배. 공식 문서의 "계획 모드는 시간이 더 든다"와 같은 결과. 여러 파일을 고치는 큰일에서는 직접 다시 재 보세요.
비용은 Claude Code가 공식 단가로 계산한 추정치이며 구독 요금제 실제 청구액이 아닙니다. 결과 원본: `measure/results.json`.
다시 재 보기: `cd measure && npm i puppeteer && pip install pillow && python3 measure_plan.py --start ../start --reps 3`

## 연습 과제
1. 계획이 나왔을 때 3번(Tell Claude what to change)을 골라 "기둥 위에 그 시간대 숫자도 띄워 줘"라고 계획을 고쳐 보세요.
2. 한 문장으로 설명할 수 있는 일(예: "제목 글자를 조금 키워 줘")은 계획 모드 없이 바로 시켜 보세요.
