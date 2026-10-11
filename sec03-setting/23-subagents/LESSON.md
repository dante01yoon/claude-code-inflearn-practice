# 섹션 3 · 23강 서브에이전트 만들기(/agents): 역할·도구 제한·모델, 🆕 /subtask

서브에이전트 = 심부름 팀원. 자기 컨텍스트(책상)에서 받은 지시만 들고 일하고, **결과 요약만** 메인 대화로 가져옵니다. 파일 하나(`.claude/agents/이름.md`)로 만들고 `tools`로 할 수 있는 일, `model`로 모델을 정합니다.

## 이번 수업에서 입력한 것 (그대로)

```text
claude
/agents
코드 리뷰만 하는 reviewer 서브에이전트 만들어 줘. 파일은 읽기만 하게
reviewer로 seoul-station.html 리뷰해 줘
/subtask data/seoul 서울역 데이터에서 하차가 가장 많은 시간 세 개 찾아 줘
리뷰에서 나온 것 중 가장 중요한 것 하나만 고쳐 줘
/exit
```

- `/agents` (v2.1.296): "The /agents wizard has been removed." — 클로드에게 부탁하거나 `.claude/agents/`를 직접 고치라는 안내 (마법사는 v2.1.198에서 제거)
- 첫 호출은 `Error: Agent type 'reviewer' not found` → **세션을 시작할 때 agents 폴더가 아예 없었으면 다시 시작해야 합니다**(공식 문서). 클로드는 reviewer.md 지침을 내장 `Plan` 에이전트에 넘겨 대신 리뷰
- `/subtask`: 지금까지의 대화를 이어받은 팀원이 뒤에서 일하고 결과가 이 대화로 돌아옴(11초). 그동안 메인은 툴팁 문제(351~353줄) 수정. 결과: 하차 최다 08–09시 447,225명, 18–19시 303,596명, 09–10시 300,265명 (sample 키 5개 노선)

다시 시작해서:

```text
claude
reviewer 에이전트는 sonnet 모델로 돌게 해 줘
reviewer로 seoul-station.html 다시 리뷰해 줘
/tasks                 # Review seoul-station.html · done · Sonnet 5.5
```

결과: `solution/.claude/agents/reviewer.md`

```markdown
---
name: reviewer
description: 코드 리뷰 전용 에이전트. … 파일을 수정하지 않는다.
tools: Read, Grep, Glob
model: sonnet
---
```

## 정리 (공식 문서)
- 필수 필드 `name`·`description`, `tools`(비우면 전부 상속), `model`(`sonnet`·`opus`·`haiku`·`inherit`, 비우면 메인 모델)
- 위치 우선순위: 관리 설정 > `--agents` > 프로젝트 `.claude/agents/` > `~/.claude/agents/` > 플러그인
- 내장: Explore(읽기 전용 탐색) · Plan(계획 모드 조사) · general-purpose(모든 도구)
- `/subtask` = 대화를 이어받은 서브에이전트 · `/fork` = 대화를 별도 백그라운드 세션으로 복사
- [Subagents](https://code.claude.com/docs/en/sub-agents) · [Choose the subagent scope](https://code.claude.com/docs/en/sub-agents#choose-the-subagent-scope) · [Fork the current conversation](https://code.claude.com/docs/en/sub-agents#fork-the-current-conversation)

## 연습 과제
SETTING-PLAN의 `screen-checker`(Playwright로 스크린샷 → 문제만 보고) 서브에이전트 만들기 → 다시 시작 → `/tasks`에서 확인 (풀이: 29강 미션 3)
