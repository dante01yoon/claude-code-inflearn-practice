# 섹션 3 · 19강 내 세팅 설계 — 매번 반복해서 하는 말과 일 찾기

섹션 3에서는 새 프로젝트마다 복사해 쓰는 **나만의 클로드 코드 세팅**(CLAUDE.md · 스킬 · 서브에이전트 · 훅 · Mods · 권한)을 만듭니다.
첫 수업은 재료 찾기: 지금까지 클로드에게 실제로 한 말에서 반복되는 말과 일을 찾고, 어디에 둘지 설계도(SETTING-PLAN.md)를 만듭니다.

비유: 내 작업대 꾸미기 — 스킬 = 레시피 카드, 서브에이전트 = 심부름 팀원, 훅 = 자동문 센서, Mods = 화면 위젯.

## 시작 폴더
`start/` — `prompts/지금까지-쓴-프롬프트.md`(섹션 0~2 실제 촬영 프롬프트 원문), README.md

## 이번 수업에서 입력한 것 (그대로)

```bash
ls prompts
claude
```

```text
prompts 폴더 보고 내가 자주 하는 말이랑 일 찾아 줘
그걸 CLAUDE.md, 스킬, 서브에이전트, 훅, 권한 중 어디에 둘지 SETTING-PLAN.md 표로 정리해 줘
```

결과: `solution/SETTING-PLAN.md` — 자주 하는 말 16가지를 둘 곳·파일 위치·넣을 내용으로 정리 (예: "index.html 한 파일로 만들어 줘" 15회 → CLAUDE.md, 스크린샷 확인 → 서브에이전트, .env 읽기 금지 → 권한 deny).

> 클로드는 공통 규칙을 `~/.claude/CLAUDE.md`(사용자 설정)에 두자고 했지만, 이 강의의 세팅은 **복사해 쓰는 템플릿**이라 모두 프로젝트 폴더 안(`CLAUDE.md`, `.claude/`)에 둡니다. 사용자·프로젝트 설정 차이는 26강.

## 어디에 둘까 (공식 문서)

| 신호 | 둘 곳 |
|---|---|
| 같은 규칙·명령을 두 번 틀림 | CLAUDE.md |
| 같은 프롬프트로 일을 시작함 / 같은 절차를 세 번째 붙여 넣음 | 스킬 |
| 곁가지 작업이 대화를 가득 채움 | 서브에이전트 |
| 묻지 않고 매번 일어나야 함 | 훅 |
| 다른 저장소에도 같은 세팅 | 템플릿 · 플러그인 |

| 넣는 곳 | 컨텍스트에 올라가는 때 |
|---|---|
| CLAUDE.md | 대화 시작 — 전체 내용, 요청마다 |
| 스킬 | 시작엔 설명 한 줄, 쓸 때 본문 |
| MCP | 시작엔 도구 이름, 쓸 때 설명서 |
| 서브에이전트 | 부를 때 — 자기 컨텍스트 |
| 훅 | 클로드 밖에서 실행 — 0 (돌려주는 글이 없으면) |

- [Extend Claude Code — Build your setup over time](https://code.claude.com/docs/en/features-overview#build-your-setup-over-time)
- [Context cost by feature](https://code.claude.com/docs/en/features-overview#context-cost-by-feature)

## 연습 과제
최근에 클로드에게 한 부탁을 10개쯤 모아 같은 방식으로 정리해 보기 (대화 기록은 `~/.claude/history.jsonl`에도 있음).
