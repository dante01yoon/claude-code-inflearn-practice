# 섹션 1 · 권한 규칙 allow / ask / deny 와 샌드박스(/sandbox)

실습: `start/`(지난 수업 허용 규칙 2개 + 연습용 `.env`) → 금지·확인 규칙 추가 → 샌드박스 켜기 → `solution/`.
촬영: VS Code 내장 터미널(code-server), Claude Code v2.1.296, auto 모드, Opus 5.5 · medium, 2026-10-11 (macOS)

## 시작하기
```bash
cd start
cp .env.example .env          # 연습용 값: SEOUL_API_KEY=sample (서울 열린데이터광장 공개 샘플 키)
git init && git add -A && git commit -m "테스트 허용 규칙 추가"
# push 확인 규칙을 시험하려면 같은 컴퓨터 안에 연습용 원격 저장소를 만듭니다
git init --bare ../seoul-live-3d-remote.git && git remote add origin ../seoul-live-3d-remote.git && git push -u origin main
```
이 강의에서는 내 전체 설정(`~/.claude/settings.json`)을 건드리지 않고, 실습 폴더의 프로젝트 설정만 씁니다.

## 입력한 것 (그대로)
```text
claude
.env 파일은 절대 못 읽게 하고, git push 할 때는 꼭 나한테 물어보게 설정해 줘
/permissions   → Allow · Ask · Deny 탭 확인
.env에 뭐 들어 있는지 보여 줘                 # → 규칙 때문에 읽을 수 없다고 답함
README 바뀐 거 커밋하고 푸시해 줘              # → 커밋은 바로, push 직전 "Ask rule Bash(git push *) overrides auto mode for this command." → 1. Yes
/exit
claude
/sandbox  → ↓ 한 번(지금 값 3번에 커서) → ↑ 두 번 → 1. Sandbox BashTool, with auto-allow → Enter
홈 폴더에 sandbox-probe라는 빈 파일 하나 만들어 봐   # → touch: Operation not permitted
                                                   # → 샌드박스 밖 재시도는 Denied by auto mode classifier ∙ [Auto-Mode Bypass]
cat .claude/settings.local.json              # {"sandbox": {"enabled": true, "autoAllowBashIfSandboxed": true}}
```
짧은 프롬프트만으로 충분해서 자세한 버전은 쓰지 않았습니다. (샌드박스 시험 뒤 클로드의 답은 영어로 나왔습니다.)

클로드가 만든 규칙(`solution/.claude/settings.json`):
```json
{
  "permissions": {
    "allow": ["Bash(npm test)", "Bash(npm run check)"],
    "deny": ["Read(./.env)", "Read(./.env.*)", "Read(**/.env)", "Read(**/.env.*)"],
    "ask": ["Bash(git push *)"]
  }
}
```

## 핵심 정리 (공식 문서 확인)
| 항목 | 내용 | 근거 |
|---|---|---|
| 규칙 형식 | `Tool` 또는 `Tool(지정자)` — `Bash(npm run *)`, `Read(./.env)`, `WebFetch(domain:example.com)` | [permissions#permission-rule-syntax](https://code.claude.com/docs/en/permissions) |
| 순서 | "Rules are evaluated in order: deny, then ask, then allow." 먼저 걸리는 규칙을 따르고, 금지는 허용으로 못 풂 | permissions "Manage permissions" |
| 파일 우선순위 | 관리 설정 > `--settings` > `.claude/settings.local.json` > `.claude/settings.json` > `~/.claude/settings.json`, 규칙 목록은 합쳐짐 | [settings#settings-precedence](https://code.claude.com/docs/en/settings) |
| 다시 묻지 않기 | 권한 질문에서 고르면 `.claude/settings.local.json`에 저장 | permissions "Permission system" |
| Read 금지의 범위 | 파일 읽기 도구에 적용. `cat` 같은 셸 명령까지 막으려면 샌드박스(Read/Edit 금지 규칙이 샌드박스 설정에 합쳐짐) | [sandboxing#permission-rules](https://code.claude.com/docs/en/sandboxing) |
| 샌드박스 | 셸 명령 쓰기는 작업 폴더·임시 폴더만, 네트워크는 허용 도메인 프록시. macOS Seatbelt · Linux/WSL2 bubblewrap. 기본 꺼짐, `/sandbox` 선택은 `.claude/settings.local.json`에 저장 | sandboxing |

## 연습 과제
1. `deny`에 `Edit(./data/**)`를 넣고 "데이터 파일 값 하나 바꿔 줘"라고 해 보세요. (원본 데이터 보호)
2. `/sandbox`를 3번(No Sandbox)으로 되돌리고 같은 `touch` 부탁을 하면 어떻게 되는지 비교해 보세요. 만들어진 `~/sandbox-probe`는 직접 지우세요.
