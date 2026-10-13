# 섹션 11 · 78강 클로드 코드 내부 한 바퀴 — 프롬프트 조립, 도구 호출, 권한 확인, 압축

## 이번 수업에서 할 것
- 섹션 1의 고삐 그림(책·방패·체크·렌치 = 컨텍스트·권한·검증·도구)으로 돌아가 섹션 11의 지도를 본다.
- 부탁 하나가 처리되는 한 바퀴를 네 단계로 나눠 본다: ① 프롬프트 조립 ② 도구 호출 ③ 권한 확인 ④ 압축.
- 서울 라이브 3D 폴더에 **관찰용 훅**(`.claude/hooks/trace.py`)을 달고, 실제 부탁 세 개와 `/context`·`/compact`로 네 단계를 기록으로 확인한다.

촬영: VS Code 내장 터미널(code-server), Claude Code v2.1.296, 오토 모드(기본), Opus 5.5 · medium, 2026-10-13. 앱: [dante01yoon/seoul-live-3d](https://github.com/dante01yoon/seoul-live-3d) 브랜치 `sec11-harness`(main `cc3d56f` 위).

## 한 바퀴 (공식 문서로 확인한 것만)
| 단계 | 무슨 일이 일어나나 | 근거 |
|---|---|---|
| 하네스 | 에이전트 루프 = 추론하는 모델 + 작용하는 도구. 클로드 코드는 모델 주변의 계층으로 도구를 제공하고 모델이 보는 컨텍스트를 관리한다 = 에이전트 하네스 | [작동 방식](https://code.claude.com/docs/ko/how-claude-code-works) |
| ① 프롬프트 조립 | 모델은 요청 사이에 아무것도 기억하지 않으므로 메시지마다 전체를 다시 보낸다. 순서: 시스템 프롬프트(핵심 지침·도구 정의) → 프로젝트 컨텍스트(CLAUDE.md·자동 메모리·경로 없는 규칙) → 대화(메시지·답·도구 결과) → 새 메시지. 안 바뀌는 앞부분은 캐시. 스킬은 시작할 때 한 줄 설명만, 본문은 쓸 때 | [프롬프트 캐싱](https://code.claude.com/docs/ko/prompt-caching), [컨텍스트 창 살펴보기](https://code.claude.com/docs/ko/context-window) |
| ② 도구 호출 | 모델은 도구를 요청하고 클로드 코드가 실행, 결과는 다시 루프로. 기본 도구 다섯 갈래: 파일 작업·검색·실행·웹·코드 인텔리전스 | [작동 방식](https://code.claude.com/docs/ko/how-claude-code-works) |
| ③ 권한 확인 | PreToolUse 훅이 권한 프롬프트 전에 실행(종료 코드 2면 규칙보다 먼저 막음) → 규칙은 deny → ask → allow, 첫 일치가 결정, 훅이 allow를 돌려줘도 deny·ask는 그대로 → 규칙에 안 걸리면 모드: 오토는 읽기·작업 폴더 안 편집 통과, 나머지는 분류기(두 번째 모델) / 기본(수동)은 편집·명령 전에 물음. 권한 규칙은 모델이 아니라 클로드 코드가 적용 | [권한 구성](https://code.claude.com/docs/ko/permissions), [권한 모드](https://code.claude.com/docs/ko/permission-modes) |
| ④ 압축 | 한계에 가까워지면 오래된 도구 출력부터 지우고, 필요하면 대화를 요약. 1M 창 모델(Opus 5.5 등)은 기본 약 967K에서 자동 압축. 압축 뒤 시스템 프롬프트·루트 CLAUDE.md·자동 메모리는 디스크에서 다시, 최근 파일 최대 5개 다시 읽기, 쓴 스킬 본문 다시(스킬당 5,000토큰). 초반의 자세한 지시는 빠질 수 있으니 지킬 규칙은 CLAUDE.md에 | [작동 방식 · 컨텍스트가 채워질 때](https://code.claude.com/docs/ko/how-claude-code-works), [컨텍스트 창 · 압축 뒤 남는 것](https://code.claude.com/docs/ko/context-window), [모델 구성 · 자동 압축 기준](https://code.claude.com/docs/ko/model-config) |
| 보는 창 | 훅 이벤트: SessionStart·InstructionsLoaded(조립) · UserPromptSubmit(요청) · PreToolUse(도구 호출) · PermissionRequest(나에게 물을 때만)·PermissionDenied(오토 모드 거절) · PostToolUse(결과) · Stop(답 끝) · PreCompact·PostCompact(압축). 더 자세히는 `claude --debug`(로그 `~/.claude/debug/`)·`Ctrl+O` 대화 기록 보기 | [훅 참조](https://code.claude.com/docs/ko/hooks), [CLI 참조](https://code.claude.com/docs/ko/cli-reference) |

추측하지 않은 것: 분류기 프롬프트, 압축 요약문의 내용, 서버 쪽 처리 순서 같은 공개되지 않은 내부 구현은 다루지 않았습니다.

## 시작하기
```bash
git clone https://github.com/dante01yoon/seoul-live-3d.git && cd seoul-live-3d
git switch -c sec11-harness
# 관찰용 훅: 이 저장소의 sec11-harness/78-internals/solution/.claude/ 를 프로젝트 .claude/ 에 복사
claude
```
훅 파일은 출력이 없어서 클로드의 컨텍스트에 들어가지 않습니다. 기록은 `.claude/trace.log`(`.gitignore`에 추가)에 쌓입니다.

## 입력한 것 (그대로)
```text
claude
/context
광화문 혼잡도 색이 어디서 정해지는지 찾아 줘
테스트 돌려 줘
지금 브랜치 푸시해 줘        ← 확인 창에서 Esc(거절)
/context
/compact
/context
/exit
cat .claude/trace.log
```
짧은 프롬프트로 원하는 장면이 다 나와서 자세한 버전은 쓰지 않았습니다.

## 화면에서 본 것 (녹화 1회, 2026-10-13 07:17~07:21 EDT)
| 시점 | `/context` 합계 | 시스템 프롬프트 | 도구 | CLAUDE.md(2개) | 스킬 설명(32개) | 메시지 |
|---|---|---|---|---|---|---|
| 부탁 전 | 25k / 1m | 2.6k | 7.3k | 9k | 6.1k | 10 |
| 부탁 3개 뒤 | 44.4k | 2.6k | 7.4k | 9k | 6.1k | 19.4k |
| `/compact` 뒤 | 32.2k | 2.6k | 7.3k | 9k | 6.1k | 7.2k |

- 첫 부탁: `grep`·`sed`로 `subway.html`을 읽고 답(`CONGEST` 배열이 단계 ↔ `--congest-1~4` CSS 변수, 실제 색 표). 읽기 명령이라 오토 모드가 묻지 않음.
- 둘째: `npm test`(이 프로젝트 `.claude/settings.json`의 allow 규칙) → 137개 중 133개 통과, 4개는 원본 따릉이 CSV가 없어 건너뜀.
- 셋째: 상태 확인 뒤 `git push -u origin sec11-harness` → 확인 창 **"Ask rule Bash(git push \*) overrides auto mode for this command."** = 규칙이 모드보다 먼저. Esc로 거절 → 실행 안 됨(브랜치는 푸시되지 않음).
- `/compact` 약 19초, 훅 표시 `PreCompact … completed successfully`, `PostCompact …`.
- `.claude/trace.log`(예: [solution/trace-example.log](solution/trace-example.log)): 조립(SessionStart, CLAUDE.md 2개) → 부탁마다 요청 → 도구 호출/결과 짝 → 답 끝. 푸시만 도구 호출 바로 뒤 `PermissionRequest`가 찍히고 결과 줄이 없음. 오토 모드·allow 규칙이 통과시킨 호출에는 `PermissionRequest`가 없음. 끝에 `PreCompact` → `SessionStart compact` → `PostCompact` → 다음 요청 때 `InstructionsLoaded … (compact)` 2줄(CLAUDE.md 다시 실림).

## 파일
- `solution/.claude/hooks/trace.py` — 관찰용 훅(이벤트 → 단계 이름, 한 줄 기록, 출력 없음)
- `solution/.claude/settings.json` — 원래 권한 규칙(allow `npm test`·`npm run check`, ask `git push *`, deny `.env` 읽기) + 이벤트 11개 훅 연결
- `solution/trace-example.log` — 녹화 때 생긴 기록 그대로

## 연습 과제
1. 같은 폴더에서 `subway.html`을 **Read 도구로** 읽게 해 보세요(예: "subway.html 첫 30줄 읽어 줘"). `trace.log`에 `InstructionsLoaded … .claude/rules/html.md (path_glob_match)`가 생기는지 보세요(경로 규칙은 파일을 읽을 때 실림 — 79강 주제).
2. 오토 모드를 끄고(`Shift+Tab`으로 기본 모드) 같은 첫 부탁을 해 보고, `PermissionRequest` 줄이 몇 개 생기는지 비교해 보세요.
