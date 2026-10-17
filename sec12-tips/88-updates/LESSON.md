# 섹션 12 · 88강 최신 기능 업데이트 노트 — 내 프로젝트에 닿는 변화만 골라 보기

## 이번 수업에서 할 것
- 클로드 코드 업데이트가 들어오는 길(자동 업데이트·채널)을 공식 문서로 확인한다.
- 변경 기록(CHANGELOG.md)에서 **이 프로젝트가 쓰는 기능에 닿는 것만** 클로드에게 골라 `UPDATES.md` 표로 정리하게 하고, 중요한 줄은 원문과 맞춰 본다.
- 섹션 12는 업데이트 섹션이다. 새 버전이 나오면 이 수업에 바뀐 점을 더해 간다.

촬영: VS Code 내장 터미널(code-server), Claude Code v2.1.299, 오토 모드, Opus 5.5, 2026-10-17. 앱 브랜치 `sec12-tips`(`sec11-all` 위).

## 공식 문서로 확인한 것
| 내용 | 근거 |
|---|---|
| 기본 설치는 시작할 때와 실행 중에 주기적으로 업데이트를 확인하고, 뒤에서 내려받아 **다음 시작 때 적용** | [고급 설정 · 자동 업데이트](https://code.claude.com/docs/ko/setup) |
| 채널 `latest`(바로) · `stable`(보통 약 1주 지난 버전, 큰 문제가 있던 릴리스는 건너뜀). `/config`의 자동 업데이트 채널 또는 `settings.json`의 `autoUpdatesChannel` | 같은 페이지 · 릴리스 채널 구성 |
| 버전마다 바뀐 점은 저장소의 CHANGELOG.md에 쌓이고 맨 위가 최신 | [anthropics/claude-code CHANGELOG.md](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md) |

## 입력한 것 (그대로)
```text
claude --version
claude
클로드 코드 변경 기록(https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md)에서 2.1.297부터 최신 버전까지 바뀐 것 중에, 이 프로젝트에서 쓰는 기능(훅, 스킬, MCP, 계획 모드, 압축, /usage, OpenTelemetry, 플러그인)에 영향 있는 것만 골라 UPDATES.md에 표로 정리해 줘
/exit
head -30 UPDATES.md
```

## 화면에서 본 것
| 시점 | 본 것 |
|---|---|
| `claude --version` | 2.1.299 |
| 시작 | 클로드가 변경 기록을 받아 와서 2.1.297·2.1.298 항목이 없다고 먼저 알림 → 실제 범위 2.1.299~2.1.302 |
| 확인 | 훅 파일(`trace.py`·`check.py`), 스킬(`tdd`), `.mcp.json`, OTel 대시보드를 읽어 실제 사용 방식과 대조 |
| 결과 | 약 2분 뒤 `UPDATES.md`(79줄, 기능별 표 8개). 맨 위에 출처 · 읽은 날짜 · 실제 범위 · 이 컴퓨터 버전 · 고른 기준 |

## 원문과 맞춰 본 항목 (변경 기록 원문에 같은 내용 있음)
- `UserPromptSubmit` 훅이 스킬·커스텀 명령을 펼치기 **전에** 실행 (2.1.299) → 78강 `trace.py`의 기록이 내가 친 원문이 됨
- `PreToolUse`·`PermissionRequest` 훅의 `updatedInput`을 도구 입력처럼 검사 (2.1.300)
- 유휴 압축: 20만 토큰 넘는 대화를 약 54분 두면 1시간 프롬프트 캐시가 끝나기 전에 미리 압축, 끄려면 `idleCompaction: false`
- MCP 도구 스키마 오류 시 그 도구만 파라미터 없이 처리

## 결과물
- 앱 저장소 `sec12-tips`의 `UPDATES.md` → 공개 저장소 `sec12-tips/88-updates/solution/UPDATES.md`
