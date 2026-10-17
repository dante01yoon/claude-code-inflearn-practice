# 섹션 11 · 81강 검증 하네스 ① — 실패 테스트 → 통과 → 리팩터링 루프를 스킬로

## 이번 수업에서 할 것
- TDD 한 바퀴(빨강 → 초록 → 리팩터링)를 그림으로 보고, 에이전트에게 "실패를 먼저 보는 것"이 왜 중요한지 정리한다.
- 그 순서를 짧은 부탁 한 줄로 프로젝트 스킬 `.claude/skills/tdd/SKILL.md`로 만든다.
- `/tdd`로 서울 라이브 3D의 실제 버그(역 찾기에 "강남역"처럼 '역'을 붙여 치면 결과 0개)를 고치고 화면에서 확인한다.

촬영: VS Code 내장 터미널(code-server), Claude Code v2.1.296, 오토 모드(기본), Opus 5.5 · medium, 2026-10-17. 앱: [dante01yoon/seoul-live-3d](https://github.com/dante01yoon/seoul-live-3d) 브랜치 `sec11-harness`, 이 수업 커밋 `e912d73`.

## 공식 문서로 확인한 것
| 내용 | 근거 |
|---|---|
| 같은 지침·체크리스트·다단계 절차를 반복해서 붙여 넣거나 CLAUDE.md의 한 부분이 사실이 아닌 절차로 커졌을 때 스킬을 만든다. 스킬 본문은 사용할 때만 실린다 | [스킬](https://code.claude.com/docs/ko/skills) |
| 프로젝트 스킬 위치 `.claude/skills/<이름>/SKILL.md`, `/이름`으로 부르거나 클로드가 관련 있다고 볼 때 사용 | [스킬 · 스킬이 있는 위치](https://code.claude.com/docs/ko/skills#where-skills-live) |
| `description`은 클로드가 스킬을 고를 때 쓰는 설명(목록에서 1,536자로 잘림). `disable-model-invocation: true`면 클로드가 스스로 부르지 못하고 사람이 `/이름`으로만 부름(배포처럼 부작용 있는 일에) | [스킬 · frontmatter 참조](https://code.claude.com/docs/ko/skills#frontmatter-reference), [호출하는 사람 제어](https://code.claude.com/docs/ko/skills#control-who-invokes-a-skill) |

## 입력한 것 (그대로)
```text
claude
기능을 고칠 때 실패하는 테스트부터 쓰고, 통과시키고, 리팩터링하는 순서를 스킬로 만들어 줘. 이름은 tdd.
/exit
claude
/tdd 역 찾기에서 강남역처럼 '역'을 붙여 쳐도 찾게 해 줘
/exit
git status --short
```
짧은 프롬프트로 원하는 결과가 나와서 자세한 버전은 쓰지 않았습니다.

## 화면에서 본 것 (2026-10-17)
- 고치기 전(`subway.html` 역 찾기): "강남" → 강남·강남구청, "강남역" → "찾는 역이 없습니다." 역 이름 데이터에는 '역'이 없다(`station-search.mjs`는 검색어가 이름보다 길면 맞지 않음).
- 스킬 만들기(약 35초): 클로드가 기존 테스트 모양·규칙 폴더를 보고 `SKILL.md`를 씀 — 0 준비 → 1 빨강(제품 코드는 건드리지 않고 테스트만, 새 테스트를 돌려 **실패를 눈으로 확인**, 처음부터 통과하면 멈추고 알림) → 2 초록(필요한 만큼만, **테스트를 고쳐서 통과시키지 않는다**) → 3 리팩터링(작게, 바꿀 때마다 `npm test`) → 4 마무리(전체 결과, 화면 영향은 따로, 커밋은 요청할 때만). 새 스킬은 지금 세션에 안 보일 수 있으니 다시 시작하라고 안내 → 다시 시작.
- `/tdd` 실행(약 1분 8초): 테스트 6개 단정을 먼저 붙이고 돌려 `AssertionError … actual: undefined, expected: '강남'`(빨강) → `bestScore`(검색어가 '역'으로 끝나면 끝의 '역'을 뗀 검색어로도 점수를 매겨 더 잘 맞는 쪽) 추가 → 138개 중 134개 통과·실패 0·건너뜀 4(초록) → 리팩터링은 "다듬을 것 없음". 경계 사례: "서울역"은 서울역이 맨 위, "역삼"의 앞 '역'은 떼지 않음, '역' 한 글자는 '역'이 든 역을 찾음, "ㄱㄴ역" → 강남.
- 클로드는 "브라우저에서 직접 쳐 보지 않았다"고 적음 → 화면은 직접 녹화로 확인: "강남역" → 강남·강남구청.

## 파일
- `solution/.claude/skills/tdd/SKILL.md` — 녹화에서 만든 스킬 그대로
- `solution/station-search.mjs`, `solution/tests/station-search.test.mjs` — 고친 코드와 테스트

## 연습 과제
1. `/tdd 역 찾기에서 '강남 역'처럼 띄어 써도 찾게 해 줘`를 해 보고, 빨강 단계에서 실제로 실패가 먼저 나오는지 보세요(이미 공백을 무시한다면 스킬대로 "처음부터 통과" 보고가 나와야 합니다).
2. SKILL.md에 `disable-model-invocation: true`를 넣고 "테스트 먼저 써서 고쳐 줘"라고만 했을 때 스킬이 쓰이는지 비교해 보세요.
