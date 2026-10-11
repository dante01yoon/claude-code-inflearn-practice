# 섹션 3 · 24강 훅: 수정 후 자동 포맷, 위험 명령 차단, 🆕 PreModelSwitch

훅 = 자동문 센서. 정해진 순간(이벤트)에 내 스크립트가 **클로드의 판단과 상관없이** 실행됩니다. 끝 코드 `0` 통과, `2` 차단(메시지가 클로드에게 전달), 그 밖은 오류로 기록만. `PostToolUse`는 이미 실행된 뒤라 막을 수 없고, 막으려면 `PreToolUse`.

## 이번 수업에서 입력한 것 (그대로)

```text
claude
파일 고칠 때마다 prettier로 자동 정리하는 훅 만들어 줘
hello.js에 들여쓰기 엉망인 함수 하나 써 줘. 훅이 정리하는지 보려고
위험한 명령은 막는 훅도 만들어 줘. rm -rf랑 .env 읽기
rm -rf data/seoul 실행해 봐. 훅이 막는지 보려고
모델 바꿀 때 예상 비용 보여 주고 한 번 더 물어보는 훅도 만들어 줘
/model sonnet          # Switch model? → Esc
/hooks
/exit
cat hello.js
cat .claude/settings.json
```

- 포맷: `PostToolUse` + `Write|Edit` → `npx --yes prettier --write`. 엉망으로 쓴 hello.js가 저장 직후 정리됨
- 차단: `PreToolUse` + `Bash|Read|Grep` → `.claude/hooks/block-dangerous.sh` — `차단됨: rm -rf 는 이 프로젝트에서 금지되어 있습니다.` data/seoul 그대로. **단순 문자열 검사라 작정한 우회는 못 막음** → 정말 막을 것은 권한 deny와 함께
- 🆕 `PreModelSwitch`(v2.1.251) → `.claude/hooks/confirm-model-switch.sh`: 전환 비용(클로드 코드가 계산해 넘겨주는 값)과 단가를 보여 주고 `ask`. 녹화: 약 189k 토큰 다시 보내기, 약 $0.76 → Esc → `Kept model as Opus 5.5`. **스크립트의 모델 단가는 클로드가 적은 값이라 공식 가격표로 확인 필요**
- 녹화 중 클로드가 시험용 가짜 `.env`를 만들었다가 훅 때문에 못 지움 → 직접 지움 (`! rm .env`)
- 필요한 도구: `jq`, Node.js(`npx`)

## 정리
- 대표 이벤트: SessionStart · UserPromptSubmit · PreToolUse → PostToolUse · Notification(🆕 `agent_needs_input`: agent view의 백그라운드 세션이 입력을 기다릴 때) · 🆕 PreModelSwitch / PostModelSwitch
- `/hooks` = 보기 전용 메뉴, 출처([Project] 등) 표시
- 경로는 `"$CLAUDE_PROJECT_DIR"/.claude/hooks/…`
- 훅은 내 권한으로 실행 → 처음 여는 폴더는 믿기 전엔 훅 안 돎. 이 강의의 훅은 모두 **프로젝트 설정**(`.claude/settings.json`)
- [Hooks guide](https://code.claude.com/docs/en/hooks-guide) · [Hooks reference](https://code.claude.com/docs/en/hooks) · [PreModelSwitch](https://code.claude.com/docs/en/hooks#premodelswitch)

## 연습 과제
Notification 훅으로 클로드가 기다릴 때 알림 (macOS: `osascript -e 'display notification "…" with title "Claude Code"'`, 백그라운드 세션까지: matcher `agent_needs_input`)
