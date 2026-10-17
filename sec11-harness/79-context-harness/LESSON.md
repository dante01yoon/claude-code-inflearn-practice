# 섹션 11 · 79강 컨텍스트 하네스 — 필요한 것만 그때 싣기: 폴더별 CLAUDE.md · 조건부 규칙

## 이번 수업에서 할 것
- 지침 파일 네 종류가 **언제** 실리는지 정리한다: 루트 CLAUDE.md(늘) · 하위 폴더 CLAUDE.md(그 폴더 파일을 읽거나 고칠 때) · `.claude/rules/*.md`의 `paths` 규칙(맞는 파일을 다룰 때) · 스킬(한 줄 설명만, 본문은 부를 때).
- 서울 라이브 3D의 17KB짜리 루트 CLAUDE.md를 짧은 부탁 한 줄로 나눈다.
- 새 세션에서 `/context`로 줄어든 양을 재고, 78강 관찰용 훅의 `.claude/trace.log`에서 `InstructionsLoaded`의 `nested_traversal`·`path_glob_match`를 직접 본다.

촬영: VS Code 내장 터미널(code-server), Claude Code v2.1.296, 오토 모드(기본), Opus 5.5 · medium, 2026-10-17. 앱: [dante01yoon/seoul-live-3d](https://github.com/dante01yoon/seoul-live-3d) 브랜치 `sec11-harness`, 이 수업 커밋 `e917a66`.

## 언제 실리나 (공식 문서로 확인한 것만)
| 지침 파일 | 언제 실리나 | 근거 |
|---|---|---|
| 루트 `CLAUDE.md` (작업 폴더와 그 위) | 세션 시작할 때 늘. 파일당 200줄 이하 권장 — 길수록 컨텍스트를 더 쓰고 지시를 덜 따름. `@` 가져오기는 정리만 될 뿐 시작할 때 같이 실려서 컨텍스트를 줄이지 않음 | [메모리 · 효과적인 지침 작성](https://code.claude.com/docs/ko/memory#write-effective-instructions) |
| 하위 폴더 `CLAUDE.md` | 시작할 때가 아니라 클로드가 그 폴더의 파일을 읽거나 쓰거나 편집할 때. 파일 하나에 대한 `cat`·`head`처럼 읽기로 치는 Bash 명령도 포함 | [메모리 · CLAUDE.md 파일이 로드되는 방식](https://code.claude.com/docs/ko/memory#how-claude-md-files-load) |
| `.claude/rules/*.md` | `paths` 없으면 시작할 때 늘. `paths` 있으면 맞는 파일에 Read·Write·Edit를 쓰거나 읽기로 치는 Bash 명령으로 볼 때 | [메모리 · 경로별 규칙](https://code.claude.com/docs/ko/memory#path-specific-rules) |
| 스킬 | 시작할 때는 설명만, 본문은 부르거나 클로드가 관련 있다고 볼 때 | [스킬](https://code.claude.com/docs/ko/skills) |
| 확인 | `/context`의 Memory files(시작할 때 실린 것), 훅 `InstructionsLoaded`의 `load_reason`: `session_start`·`nested_traversal`·`path_glob_match`·`include`·`compact` | [훅 참조 · InstructionsLoaded](https://code.claude.com/docs/ko/hooks#instructionsloaded) |

## 입력한 것 (그대로)
```text
claude
/context
CLAUDE.md가 너무 길어서 무슨 일을 하든 통째로 실려. 폴더별 CLAUDE.md랑 .claude/rules 경로 규칙으로 나눠 줘. 루트에는 늘 필요한 것만 남기고.
/exit
git status --short
claude
/context
MCP 서버에 어떤 도구가 있는지 알려 줘
subway.html 버튼들이 우리 HTML 규칙을 지키는지 보고 고쳐 줘
/exit
grep InstructionsLoaded .claude/trace.log
```
짧은 프롬프트로 원하는 결과가 나와서 자세한 버전은 쓰지 않았습니다.

## 화면에서 본 것 (2026-10-17)
| 시점 | `/context` 합계 | Memory files(CLAUDE.md 2개) |
|---|---|---|
| 나누기 전 | 24.9k / 1m | 9k |
| 나눈 뒤 새 세션 | 18k / 1m | 2k |

- 나누기(약 2분 21초): 루트 CLAUDE.md 59줄 → 35줄(개요·명령·파일 지도·공통 규칙·주의만). `.claude/rules/`에 `paths` 규칙 7개 새로(index-3d · realtime-trains · citydata · supabase · subway-page · bike · daily-report, 각 규칙의 경로에 관련 테스트도 넣음), 원래 있던 `html.md`는 그대로. `mcp-server/CLAUDE.md`·`tests/CLAUDE.md` 새로, `data/CLAUDE.md`에 데이터 설명 보강. `npm test` 통과. 클로드는 "세션 중간에 만든 규칙 파일은 이번 세션에 반영되지 않는 것으로 보인다, 새 세션에서 확인하라"고 적음 → 세션을 다시 시작해 확인.
- MCP 질문: 클로드가 `cd mcp-server && … grep …`으로 `src/server.ts`를 봄 → 그때 `InstructionsLoaded CLAUDE.md (nested_traversal)`. 작업 폴더가 `mcp-server`로 바뀐 상태라 기록에는 `CLAUDE.md`로만 찍혔지만 `mcp-server/CLAUDE.md`. 도구 4개·리소스 2개를 표로 답함.
- 버튼 부탁: `sed -n …p subway.html`로 읽는 순간 `path_glob_match` 5줄(html · subway-page · bike · citydata · supabase — 모두 `paths`에 `subway.html` 포함). `html.md`의 "모든 `<button>`에 `aria-label`" 규칙대로 답 카드 「가까운 장소 · 지금 혼잡도」 버튼(`renderNearby`)에만 없던 `aria-label`을 붙임. `npm test` 실패 0.
- 관찰: `subway.html`은 기능이 많아 규칙 5개가 한꺼번에 붙는다. 이 파일을 다루지 않는 작업에는 하나도 안 실린다.



## 파일
- `solution/CLAUDE.md` — 나눈 뒤 루트(35줄)
- `solution/.claude/rules/*.md` — 경로 규칙 8개(새로 7 + 원래 html.md)
- `solution/mcp-server/CLAUDE.md`, `solution/tests/CLAUDE.md`, `solution/data/CLAUDE.md`
- `solution/trace-example.log` — 두 번째 녹화의 `InstructionsLoaded` 줄

## 연습 과제
1. `bike.html`을 읽게 하는 부탁(예: "bike.html 날짜 버튼이 어떻게 동작하는지 알려 줘")을 하고 `trace.log`에 `bike.md (path_glob_match)`가 찍히는지 보세요.
2. `subway-page.md`의 `paths`를 줄여(예: `subway.html`만) 같은 버튼 부탁을 했을 때 실리는 규칙 수가 어떻게 바뀌는지 비교해 보세요.
