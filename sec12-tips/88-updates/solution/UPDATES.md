# Claude Code 변경 사항 정리 (2.1.297 → 2.1.302)

- 출처: https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md (2026-10-17에 읽음)
- 변경 기록에 2.1.297·2.1.298 항목은 없다. 실제로 다룬 범위는 **2.1.299 ~ 2.1.302**.
- 이 컴퓨터에 깔린 버전: `claude --version` → 2.1.299 (2.1.300 이후 항목은 업데이트해야 적용된다)
- 고른 기준: 이 프로젝트에서 쓰는 기능(훅, 스킬, MCP, 계획 모드, 압축, `/usage`, OpenTelemetry, 플러그인)에 닿는 것만. Windows·VS Code·Cowork·Claude Tag·클라우드 세션 전용 항목, 모드(mod) 훅 API 항목, 이 프로젝트가 안 쓰는 훅(`SessionEnd`, prompt/agent 훅, `WorktreeCreate`)은 뺐다.

## 훅 (`.claude/settings.json`, `.claude/hooks/trace.py`·`check.py`)

| 버전 | 바뀐 것 | 이 프로젝트에 미치는 영향 |
|---|---|---|
| 2.1.299 | `UserPromptSubmit` 훅이 스킬·커스텀 슬래시 명령을 펼치기 **전에** 돈다 | `trace.py`가 `/tdd ...`를 부를 때 기록하는 `prompt`가 펼친 스킬 본문이 아니라 사용자가 친 원문이 된다. `trace.log` 읽는 방식이 달라질 수 있다 |
| 2.1.299 | 계획 모드에서 `PreToolUse` 훅이 허용(allow)한 쓰기가 실행되던 버그 수정 | `PreToolUse`의 `trace.py`는 결정을 돌려주지 않으므로 직접 영향은 없다. 나중에 허용 훅을 넣어도 계획 모드는 쓰기를 막는다 |
| 2.1.300 | `PreToolUse`·`PermissionRequest` 훅의 `updatedInput`을 도구 입력처럼 검사(모르는 키는 버리고, 도구가 거부하면 호출도 거부) | 지금 훅은 `updatedInput`을 쓰지 않는다(`check.py`는 exit 2 + stderr). 앞으로 입력을 고치는 훅을 만들 때 해당 |
| 2.1.299 | 플러그인 훅이 답을 넘기지 못하면 막을 수 있던 동작을 통과시키지 않고 **거부** | 키트 플러그인(superpowers)의 훅이 오류 나면 그 도구 호출이 막힌다. `bench/kit-ab.mjs` 결과에서 실패 턴이 늘면 이것부터 의심 |

## 스킬 (`.claude/skills/tdd`)

| 버전 | 바뀐 것 | 이 프로젝트에 미치는 영향 |
|---|---|---|
| 2.1.299 | `/reload-skills`가 스킬 목록 전체를 다시 보낸다고 안내 — 압축 뒤 스킬을 되살리는 방법 | 긴 세션에서 압축 뒤 `tdd` 스킬이 안 잡히면 `/reload-skills` |
| 2.1.301 | `/rewind` 뒤 스킬이 모델에게 더 이상 안 보이던 버그 수정 | `/rewind` 후 `tdd`가 안 불리던 현상이 있었다면 이 버전에서 해결 |
| 2.1.301 | 인자 이름이 아주 많거나 긴 스킬·명령이 몇 초씩 멈추던 문제 수정(이름 64개·각 64자까지만 채움) | `tdd`는 인자 자리표시자가 없어 영향 없음 |

## MCP (`.mcp.json`의 `seoul-data`, `mcp-server/`)

| 버전 | 바뀐 것 | 이 프로젝트에 미치는 영향 |
|---|---|---|
| 2.1.300 | 압축 **뒤에** 연결이 끝난 MCP 서버의 도구·설명을 다음 도구 호출 전까지 모델이 모르던 버그 수정 | `seoul-data`(stdio, `node mcp-server/src/index.ts`)처럼 시작이 느린 서버가 압축 직후 안 보이던 경우 해결 |
| 2.1.300 | API가 MCP 도구의 입력 스키마를 거부하면 매 턴 400 오류가 나던 것을, 그 도구만 파라미터 없이 보내도록 바꿈 | `mcp-server`에서 스키마를 잘못 짜도 대화 전체가 멈추지는 않는다. 대신 그 도구 인자가 사라지니 스키마 오류를 놓치지 않게 주의 |
| 2.1.302 | 프로토콜 2026-07-28을 고르고 `resultType`·`ttlMs`·`cacheScope`를 빠뜨린 서버의 도구가 안 보이거나 호출이 모두 실패하던 문제 수정 | `@modelcontextprotocol/sdk ^1.32.1`이 새 프로토콜을 고르면 해당. 2.1.299에서 `seoul-data` 도구가 비어 보이면 업데이트 |
| 2.1.299 | MCP 허용 규칙이 이름 붙인 서버에만 닿음(`mcp__a`가 `a__b`를 허용하지 않음), 에이전트 `tools:`도 같음 | 서버 이름 `seoul-data`에 `__`가 없고 지금 MCP 허용 규칙도 없어 영향 없음. 규칙을 추가하면 `mcp__seoul-data__*`처럼 쓴다 |
| 2.1.299 | `enabledMcpjsonServers`·`disabledMcpjsonServers`가 배열이 아닌 문자열 하나면 설정 파일 전체가 무시되던 버그 수정 | `settings.local.json`은 배열(`["seoul-data"]`)이라 영향 없음. 지금 `seoul-data`는 로컬에서 꺼져 있다 |

## 계획 모드

| 버전 | 바뀐 것 | 이 프로젝트에 미치는 영향 |
|---|---|---|
| 2.1.299 | 권한 우회(bypass)를 쓸 수 있어서 계획 모드가 대부분의 편집·명령을 묻지 않을 때 한 번 안내 | 계획 모드 강의 시연 중 이 안내가 뜰 수 있다 |
| 2.1.299 | `PreToolUse` 훅이 허용한 쓰기를 계획 모드가 실행하던 버그 수정 | 위 훅 표 참고 |
| 2.1.301 | 헤더 줄만 있는 마크다운 표가 터미널보다 넓으면 아무것도 안 그리던 문제 수정(계획 승인 카드 포함) | 계획에 넓은 표를 넣었을 때 빈 칸으로 보이던 현상 해결 |

## 압축 (`PreCompact`·`PostCompact` 훅)

| 버전 | 바뀐 것 | 이 프로젝트에 미치는 영향 |
|---|---|---|
| 2.1.299 | **유휴 압축** 추가: 20만 토큰 넘는 대화를 약 54분 놔두면 1시간 프롬프트 캐시가 끝나기 전에 압축 | 자리를 비운 사이 압축이 일어나 `trace.py`의 `PreCompact`/`PostCompact` 기록이 생길 수 있다(`trigger` 값 확인 필요). 강의 중 긴 세션을 두고 나갔다 오면 대화가 이미 요약돼 있을 수 있음 |
| 2.1.299 | `CLAUDE_CODE_IDLE_COMPACT_MIN_TOKENS`로 20만 기준 변경, settings.json의 `"idleCompaction": false`로 끔 | 압축 시연을 직접 통제하고 싶으면 `.claude/settings.json`에 `"idleCompaction": false` |
| 2.1.302 | `/config`에 `Idle compaction` 항목 추가, 유휴 압축 뒤 안내에 끄는 방법 표시 | 설정 파일을 안 고치고 `/config`에서 끌 수 있다 |
| 2.1.302 | 압축 중에 턴을 멈추면 "Prompt is too long" 오류가 나던 문제 수정 | `/compact` 시연 중 Esc로 멈췄을 때의 오류 해결 |
| 2.1.302 | 세션 중간에 추가된 도구를 ToolSearch나 압축 뒤 다시 불러올 때 프롬프트 캐시를 놓치던 문제 수정 | 압축 뒤 `cache_read_tokens`가 줄던 현상이 있었다면 해결 — `otel-view` 수치에 드러남 |
| 2.1.301 | 이어 연 세션의 압축 줄이 불러오지 않은 기록에 ctrl+o를 안내하던 것을, 이전 메시지가 저장된 곳을 알려 주도록 바꿈 | `--resume` 시연 시 화면 문구가 달라짐 |

## `/usage`

| 버전 | 바뀐 것 | 이 프로젝트에 미치는 영향 |
|---|---|---|
| 2.1.299 | `/usage`에 최대 effort, 워크플로, 항상 실리는 컨텍스트, 큰 도구 결과에 대한 경고 추가 | 항상 실리는 컨텍스트(루트 `CLAUDE.md`, 스킬 목록 등)가 크면 경고가 뜬다. `.claude/rules`·폴더별 `CLAUDE.md`로 나눈 효과를 `/usage`로 확인하기 좋다 |
| 2.1.299 | `/usage`·한도 근접 경고·상태 줄이 100% 넘게 표시되던 문제 수정 | 표시 오류 수정 |

## OpenTelemetry (`tools/otel-view.mjs`)

| 버전 | 바뀐 것 | 이 프로젝트에 미치는 영향 |
|---|---|---|
| 2.1.300 | `api_request` 이벤트에 `cache_creation_5m_tokens`·`cache_creation_1h_tokens` 추가(캐시 쓰기를 수명별로 나눔) | `otel-view`의 `EVENT_FIELDS`는 `cache_creation_tokens`만 읽는다. 기존 필드는 그대로라 깨지지 않고, 수명별로 보려면 두 필드를 추가하면 된다 |
| 2.1.300 | 트레이스 스팬에 GenAI 시맨틱 속성(`gen_ai.provider.name`, `gen_ai.conversation.id`, `gen_ai.tool.name`, `error.type`) 추가 | `otel-view`는 허용 목록 `KEEP_ATTRS`(`model`, `type`, `session.id`)만 남기므로 새 속성은 자동으로 버려진다. 계정 정보 정책 유지에 추가 작업 불필요 |
| 2.1.301 | `tool_decision` 이벤트에 `classifier_verdict`·`permission_mode`, (`OTEL_LOG_TOOL_DETAILS=1`일 때) `classifier_category` 추가 | `otel-view`는 `api_request`만 처리해 영향 없음. auto 모드 판정을 보려면 새로 받아야 함 |
| 2.1.302 | 대부분의 auto 모드 차단에서 `classifier_category`가 빠지던 문제, 속성 수 제한이 낮을 때 새 속성이 `tool_use_id` 등을 밀어내던 문제 수정 | 위와 같음 |

## 플러그인 (`bench/kit-ab.mjs`의 `superpowers@claude-plugins-official`)

| 버전 | 바뀐 것 | 이 프로젝트에 미치는 영향 |
|---|---|---|
| 2.1.302 | `claude -p`·Agent SDK에서 fork 서브에이전트(`subagent_type: "fork"`)가 기본으로 켜짐(`CLAUDE_CODE_FORK_SUBAGENT=0`로 끔) | `kit-ab.mjs`는 `claude -p`로 돌리므로 두 조건 모두 fork를 쓸 수 있게 된다. 2.1.302 전후 결과(시간·비용·턴)는 직접 비교하지 말 것 |
| 2.1.302 | 플러그인이 많을 때 시작 시간 개선(명령·에이전트 파일 로딩의 파일 시스템 호출 감소) | "키트 있음" 조건의 시작 시간이 줄어 두 조건의 시간 차이가 버전에 따라 달라질 수 있다 |
| 2.1.302 | `claude -p`에서 권한 모드를 안 주면 서드파티 제공자 등에서 `default`로 시작, `--permission-mode auto`는 그대로 | `kit-ab.mjs`는 `--permission-mode auto`를 명시해 영향 없음 |
| 2.1.302 | `claude plugin` 등 하위 명령이 설정 쓰기를 끝내기 전에 종료돼 변경이 사라지거나 `.tmp`가 남던 문제 수정 | 플러그인 설치·끄기를 명령으로 할 때 설정이 안 바뀌던 현상 해결 |
| 2.1.302 | git이 reftable 형식일 때 마켓플레이스가 새로 고칠 때마다 다시 클론하고 git 플러그인 버전이 "unknown"으로 보이던 문제 수정 | reftable을 쓰는 git이면 해당 |
| 2.1.299 | `/reload-plugins`가 다른 터미널에서 방금 설치한 플러그인을 못 불러오던 문제 수정 | 다른 터미널에서 superpowers를 설치·갱신했을 때 해당 |
