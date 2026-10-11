# 섹션 3 · 20강 커스텀 명령과 스킬 — 차이와 합치기

커스텀 명령(`.claude/commands/이름.md`)과 스킬(`.claude/skills/이름/SKILL.md`)은 **v2.1.3에서 하나로 합쳐졌습니다.** 둘 다 `/이름`을 만들고 둘 다 클로드가 설명을 보고 알아서 꺼낼 수 있습니다. 차이는 스킬이 **폴더**라는 것(스크립트·참고 자료를 함께 둠)과 `name`·`paths` 프론트매터. 이름이 같으면 스킬이 이깁니다.

## 시작 폴더
`start/` = 19강 끝 + 섹션 2에서 쓰던 `.mcp.json`(context7 · playwright `--headless --isolated`)

## 이번 수업에서 입력한 것 (그대로)

```bash
cat .mcp.json
claude              # 처음 열면 폴더 믿기 + MCP 서버 2개 사용 승인
```

```text
SETTING-PLAN.md 11번 /web-page를 .claude/commands에 명령으로 만들어 줘
/reload-skills
/web-page 서울 지하철 노선별 공식 색 안내
이 명령을 스킬로 옮겨 줘
/skills
```

- `/reload-skills`: 세션 중에 새로 만든 명령·스킬 폴더를 다시 읽기 (스킬 폴더 변경은 보통 자동 반영)
- `/web-page …` 결과: `index.html` — 노선 24개 색 카드(HEX·RGB, 검색, 즐겨찾기). **색 값은 클로드가 기억으로 채운 값**이라 공식 자료 대조 필요(클로드도 그렇게 보고) → 21강에서 진짜 데이터를 받는 스킬
- `/skills`: 14개 — claude.ai 동기화 스킬 13개 + `web-page`(project · 약 30 토큰)

결과 파일: `solution/.claude/skills/web-page/SKILL.md`, `solution/index.html`

## 정리 (공식 문서)

| | `.claude/commands/web-page.md` | `.claude/skills/web-page/SKILL.md` |
|---|---|---|
| 모양 | 파일 한 장 | 폴더 (보조 파일 가능) |
| 부르는 법 | `/web-page` | `/web-page` |
| 클로드가 알아서 | 가능 | 가능 |
| 이름이 같으면 | — | 스킬이 이김 |

- 누가 부를지: `disable-model-invocation: true`(나만) · `user-invocable: false`(클로드만)
- 두는 곳: 프로젝트 `.claude/skills/` · 개인 `~/.claude/skills/` · 플러그인 · 회사(관리 설정). 이름이 겹치면 회사 > 개인 > 프로젝트
- 본문의 `$ARGUMENTS` = 슬래시 뒤에 쓴 글, `$0`·`$1` = 번호로 꺼내기
- [Skills](https://code.claude.com/docs/en/skills) · [Control who invokes a skill](https://code.claude.com/docs/en/skills#control-who-invokes-a-skill) · [Where skills live](https://code.claude.com/docs/en/skills#where-skills-live)

## 연습 과제
자주 하는 부탁 하나를 `.claude/commands`에 명령으로 만들어 실행 → 스킬로 옮기기 → `/skills`에서 project 스킬·토큰 확인
