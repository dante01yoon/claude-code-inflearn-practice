# 섹션 7 · 59강 🆕 claude plugin eval — 플러그인을 넣기 전/후로 채점 (📏)

## 개념
- eval = 같은 시험지를 두 번: 플러그인을 넣고(WITH) 한 번, 빼고(W/OUT) 한 번. 두 점수의 차이 Δ가 플러그인이 보탠 몫. 양쪽 다 만점이면 플러그인 덕이 아님(공식 문서).
- 케이스 = `evals/<케이스>/prompt.md`(부탁 + 실행 설정: runs·max_turns·timeout_seconds·allowed_tools) + `graders/*.md`(채점 기준 하나에 파일 하나). 실행마다 새 세션을 따로 열고, 끝나면 기준마다 통과/실패 → 가중 평균.
- 채점 기준 종류(오늘 쓴 4가지): `file_exists`, `regex`(모델 호출 없음), `tool_used`(넣기/빼기 비교에서는 점수 대신 "plugin-fired indicator"), `llm`(판정 모델 기본 Haiku, 3번 투표 중 2표 이상이면 통과).
- 플러그인의 MCP 서버는 eval 안에서 가짜(mock)로 바뀌고, `evals/mocks/<서버>/`가 없으면 시작하지 않음 → 그 기능은 점수에 안 들어감. 실제 서버를 쓰려면 `--allow-real-servers`.
- 모델 호출은 내 요금제 사용량·API 비용에 들어감. Claude Code v2.1.269 이상.

## 실습 (실제 입력)
1. 마켓플레이스 저장소(`claude-code-practice-marketplace`)에서 `claude` → 짧은 프롬프트:
   ```
   web-kit 플러그인 채점 케이스 하나 만들어 줘. 카페 주문 페이지 만들기로
   ```
   결과(3분 50초): 클로드가 도우미 에이전트(claude-code-guide)를 백그라운드로 보내 케이스 형식을 확인한 뒤 `plugins/web-kit/evals/cafe-order/`에 `prompt.md` + 채점 기준 7개(skill-used·index-created·viewport-meta·local-storage·price-format·page-behavior(llm, 가중치 2)·final-report(llm)), `.gitignore`에 `plugins/*/evals/results/`. 화면 확인(Playwright)은 eval 안에서 돌지 않는다고 미리 밝힘. 짧은 프롬프트로 빗나가지 않아 자세한 프롬프트는 쓰지 않음.
2. 실행:
   ```bash
   find plugins/web-kit/evals -type f | sort
   claude plugin eval plugins/web-kit --allow-tools Write Edit --no-publish
   ```
   (`--allow-tools Write Edit`: 파일을 써야 하는 케이스, `--no-publish`: 리포트를 내 컴퓨터에만)
3. 결과 리포트 `evals/results/<시각>/report.html`을 브라우저로 열어 점수 카드, 넣은 실행의 final-report 근거, 뺀 실행의 실패 근거 확인.

## 📏 직접 잰 결과 (cafe-order, 넣고 3번 + 빼고 3번, 2026-10-12)
| | 플러그인 넣음 | 플러그인 뺌 |
|---|---|---|
| 점수 (3번 평균) | 1.00 (3/3 만점) | 0.857 (0/3 만점) |
| 실패한 기준 | 없음 | final-report (3번 모두, 판정 FAIL×3) |
| 한 번 걸린 시간 | 평균 93초 (92·85·102) | 평균 61초 (64·57·62) |
| 한 번 턴 수 | 평균 8.7 (8·7·11) | 3 |
| 한 번 비용 | 평균 $0.31 | 평균 $0.20 |

전체 7분 42초, $1.51, Δ +0.143(리포트 +14.3점). 차이를 만든 것은 체크리스트별 ✅/⚠️ 보고 형식 하나(web-page 스킬 4단계), 페이지 코드 판정(page-behavior)은 양쪽 모두 통과. 화면 확인은 mock이 없어 꺼진 상태라 이 점수에 들어 있지 않음. 근거: `aggregate-result.json`·`report.html` (로컬 `evals/results/`, git에서 제외).

## 저장소
- 케이스 파일: https://github.com/dante01yoon/claude-code-practice-marketplace/tree/main/plugins/web-kit/evals/cafe-order (커밋 70dabd7)
- 메모: 케이스의 가게 이름 「달빛 카페」는 녹화 속 클로드가 정한 예시 이름.

## 근거
- [Test plugins with evals](https://code.claude.com/docs/en/plugin-evals) · `claude plugin eval --help`

---
마켓플레이스 저장소: [dante01yoon/claude-code-practice-marketplace](https://github.com/dante01yoon/claude-code-practice-marketplace). `solution/evals/cafe-order/`는 클로드가 만든 채점 케이스, `solution/results-summary.json`은 실행 6번의 점수·시간·비용 요약(리포트 원본에서 판정 근거 글은 뺐습니다)입니다.
