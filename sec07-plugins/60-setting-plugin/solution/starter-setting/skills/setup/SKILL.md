---
name: setup
description: starter-setting 플러그인이 대신할 수 없는 프로젝트 파일(CLAUDE.md 규칙, .gitignore, 상태줄, data/ 쓰기 금지 권한)을 지금 프로젝트에 넣는다. 사용자가 스타터 세팅을 프로젝트에 적용하거나 초기화해 달라고 할 때 쓴다.
disable-model-invocation: true
---

# /starter-setting:setup — 프로젝트 파일 넣기

스킬·에이전트·훅·MCP는 플러그인이 이미 켜 두었다. 플러그인으로는 줄 수 없는 아래 셋만 지금 프로젝트(현재 폴더)에 넣는다.
템플릿은 `${CLAUDE_PLUGIN_ROOT}/templates/` 에 있다.

| 템플릿                | 넣을 곳                 | 내용                                     |
| --------------------- | ----------------------- | ---------------------------------------- |
| `CLAUDE.md`           | `CLAUDE.md`             | 한국어 답변, index.html 한 파일, 모바일 대응, data/ 원본 보호 등 규칙 |
| `gitignore`           | `.gitignore`            | 개인 설정, .env, Playwright 결과물 제외  |
| `settings.json`       | `.claude/settings.json` | 상태줄(`모델 \| 폴더 \| Context: n%`), `Edit(/data/**)` 금지 |

## 순서

1. 세 템플릿과, 넣을 곳에 이미 있는 파일을 읽는다.
2. 넣을 곳에 파일이 **없으면** 템플릿을 그대로 만든다.
3. 이미 **있으면** 덮어쓰지 않고 합친다.
   - `CLAUDE.md`: 없는 섹션·줄만 뒤에 더한다. 기존 규칙과 부딪히면 더하지 말고 사용자에게 묻는다.
   - `.gitignore`: 없는 줄만 뒤에 더한다.
   - `.claude/settings.json`: JSON으로 합친다. `statusLine`이 이미 있으면 바꿀지 묻는다. `permissions.deny`에는 없는 항목만 더한다. 다른 키는 건드리지 않는다.
4. 바꾼 파일과 더한 줄을 짧게 보고한다.

## 알릴 것

- 필요한 도구: `jq`(훅·상태줄), Node.js `npx`(Playwright MCP·Prettier 훅), Python 3(`/starter-setting:seoul-data`).
- 개인용 설정은 `.claude/settings.local.json`, 개인 규칙은 `CLAUDE.local.md`에 두면 git에서 빠진다.
