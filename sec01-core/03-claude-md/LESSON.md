# 섹션 1 · CLAUDE.md 잘 쓰기 (폴더별 · .claude/rules · AGENTS.md)

실습: `start/` → `/init` → 프로젝트 규칙 · 폴더별 규칙 · HTML 전용 규칙 → 요약 카드 → `solution/`. 📏 `measure/`: CLAUDE.md 있을 때 vs 없을 때.
촬영: VS Code 내장 터미널(code-server), Claude Code v2.1.296, auto 모드, Opus 5.5 · medium, 2026-10-11

## 시작하기
```bash
cd start
cp .env.example .env
git init && git add -A && git commit -m "권한 규칙: .env 읽기 금지, push는 확인"
claude
```

## 입력한 것 (그대로)
```text
/init
CLAUDE.md에 규칙 몇 개 넣어 줘. 대답은 한국어로, 노선 색은 서울 지하철 공식 색으로, 숫자는 천 단위 쉼표
data 폴더는 원본 데이터라 고치면 안 된다는 규칙을 그 폴더 CLAUDE.md로 따로 만들어 줘
HTML 파일 고칠 때만 적용되는 규칙을 .claude/rules에 만들어 줘. 버튼엔 aria-label 달고, 폭 375px에서도 안 깨지게
/exit
claude
/context                                    # Memory files 1.6k 토큰 — 대화 전부터 CLAUDE.md가 읽혀 있음
역마다 오늘의 요약 카드를 추가해 줘
```
짧은 프롬프트만으로 충분해서 자세한 버전은 쓰지 않았습니다.

화면에서 본 것
- `/init`: 파일·README·코드를 읽고 테스트까지 돌려 본 뒤 29줄 CLAUDE.md 작성(요약은 영어로 나옴) → "대답은 한국어로" 규칙을 넣은 뒤부터 한국어로 답함.
- `data/CLAUDE.md`: "CLAUDE.md는 안내일 뿐 수정을 막지는 못한다, 확실히 막으려면 deny 규칙(`Edit(./data/**)`)을 쓰라"는 설명을 클로드가 덧붙임.
- `.claude/rules/html.md`: 맨 위에 `paths: "**/*.html"` → HTML 파일을 다룰 때만 읽힘(다음 수업에서 `Loaded .claude/rules/html.md` 줄로 확인).
- 요약 카드: 숫자는 규칙대로 `toLocaleString("ko-KR")` 천 단위 쉼표. **노선 공식 색 규칙은 지키지 않음**(1호선 글자가 회색) — 아래 측정과 같은 결과.

결과 보기: `cd solution && python3 -m http.server 8000` → http://127.0.0.1:8000

## 핵심 정리 (공식 문서 확인)
| 항목 | 내용 | 근거 |
|---|---|---|
| 위치 | 관리 정책 · `~/.claude/CLAUDE.md`(나만·모든 프로젝트) · `./CLAUDE.md` 또는 `./.claude/CLAUDE.md`(팀) · `./CLAUDE.local.md`(나만·이 프로젝트, .gitignore에 직접 추가) | [memory#choose-where-to-put-claude-md-files](https://code.claude.com/docs/en/memory) |
| 하위 폴더 | 시작 때 읽지 않고, 그 폴더 파일을 읽거나 고칠 때 읽힘 | memory "How CLAUDE.md files load" |
| `.claude/rules/` | `.md`를 주제별로. `paths:`가 있으면 맞는 파일을 다룰 때만 | memory "Organize rules with .claude/rules/" |
| 무엇을 적나 | 기준: "이 줄을 지우면 클로드가 실수할까?" 짐작 못 하는 명령·다른 스타일·테스트 방법·주의점. 200줄 아래, 구체적으로 | memory "Write effective instructions", [best-practices](https://code.claude.com/docs/en/best-practices) |
| AGENTS.md | v2.1.277+: CLAUDE.md가 없으면 AGENTS.md를 읽음. 둘 다 있으면 기본 CLAUDE.md만 → `/config` Project instructions 또는 CLAUDE.md에 `@AGENTS.md` | memory "AGENTS.md" |
| `/init` | CLAUDE.md 초안 생성, 이미 있으면 개선 제안 | memory |

## 📏 직접 재 보기 — `measure/measure_claudemd.py`
같은 시작 폴더에서 규칙 파일 3개(`measure/rules/`)가 있을 때 / 없을 때, "역마다 오늘의 요약 카드를 추가해 줘" × 3번씩 (`claude -p --permission-mode auto`).

| 점검 (3번 중 지킨 횟수) | 없음 | 있음 |
|---|---|---|
| 대답이 한국어 | 0 | 3 |
| 숫자 서식 ko-KR | 0 | 3 |
| 1호선 공식 색 #0052A4 | 0 | 1 |
| 새 버튼 aria-label (원래 있던 버튼 제외) | 3 | 3 |
| 원본 데이터 그대로 | 3 | 3 |
| 평균 점수 (5점) | 2.0 | 4.3 |

해석: 규칙이 없으면 세 번 모두 영어로 답했고 한국어 숫자 서식도 쓰지 않음. 하지만 노선 색 규칙은 있어도 1/3 — CLAUDE.md는 지시일 뿐이라 꼭 지켜야 할 것은 테스트·권한 규칙처럼 확인 장치로 보완. 원본: `measure/results.json`.
(첫 채점은 원래 있던 재생 버튼까지 세어 aria-label이 0/3으로 나왔고, 새로 생긴 버튼만 세도록 고쳐 `--rescore`로 다시 채점했습니다.)

## 연습 과제
1. CLAUDE.md에 "노선 색은 CSS 변수 --line-1로 정의해서 쓴다"처럼 더 구체적으로 고쳐 쓰고, 측정을 다시 돌려 노선 색 점수가 오르는지 보세요.
2. 다른 도구용 `AGENTS.md`를 만들고 CLAUDE.md 맨 위에 `@AGENTS.md` 한 줄을 넣어 둘 다 읽히게 해 보세요.
