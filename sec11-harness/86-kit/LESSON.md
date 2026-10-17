# 섹션 11 · 86강 공개 하네스 키트 써 보기 — 공식 플러그인 · mod 조합, 📏 직접 재 보기

## 이번 수업에서 할 것
- 하네스 키트 = 플러그인(스킬·훅·서브에이전트·MCP 서버 묶음) + mod(화면·동작을 바꾸는 플러그인).
- 공식 마켓플레이스 `claude-plugins-official`의 **superpowers**(커뮤니티 작성자 obra, 브레인스토밍·계획·TDD·체계적 디버깅 스킬)와 클로드 코드 내장 mod **You should know**를 사용자 범위로 넣고, 무엇이 늘었는지 `/context`로 본다.
- 📏 같은 부탁(80강 `SPEC.md` 2단계 구현)을 키트 없음/있음으로 조건마다 2회씩 실행해 시간·비용 추정·턴·출력 토큰·테스트·바뀐 줄을 비교한다.

촬영: VS Code 내장 터미널(code-server), Claude Code v2.1.296, Opus 5.5, 2026-10-17. 앱 브랜치 `sec11-spec`(85강에서 이어짐).

## 공식 문서로 확인한 것
| 내용 | 근거 |
|---|---|
| `/plugin`으로 마켓플레이스를 둘러보기. 플러그인은 커뮤니티·Anthropic이 제공하는 스킬·훅·서브에이전트·MCP 서버를 설치 가능한 단일 단위로 묶음 | [모범 사례 · 플러그인 설치](https://code.claude.com/docs/ko/best-practices#install-plugins) |
| mod는 Claude Code의 모양과 동작을 바꾸는 플러그인(JS/TS 이벤트 핸들러). 내장 mod `cc-plugin-you-should-know` = 보조 에이전트가 놓쳤을 수 있는 내용을 프롬프트 위에 알림, 켜기 전까지 꺼짐. `claude -p`에서는 훅은 돌지만 그리는 내용은 표시 안 됨 | [Mods 개요](https://code.claude.com/docs/ko/plugins/mods/overview) |
| mod·플러그인은 사용자 권한으로 실행되는 코드 → 신뢰할 수 있는 작성자·마켓플레이스만 | 같은 페이지 · mod를 신뢰할지 결정하기 |

## 입력한 것 (그대로)
```text
claude plugin marketplace list
claude plugin install superpowers@claude-plugins-official
claude plugin enable cc-plugin-you-should-know@builtin
claude plugin list
claude
/context
/exit
node bench/kit-ab.mjs        ← 두 번째 녹화(첫 녹화의 실행분은 측정 스크립트를 고치기 전 버전이라 쓰지 않음)
```

## 📏 재는 방법 (`bench/kit-ab.mjs`)
- 지금 커밋을 `git clone`으로 깨끗한 복사본 4개(`/tmp/kit-ab/{nokit,kit}-{1,2}`)로, 4개 동시 실행.
- 부탁: `SPEC.md 2단계를 구현해 줘. 질문하지 말고 스펙대로 진행하고, 끝나면 npm test로 확인해 줘`
- `claude -p … --output-format stream-json --verbose --permission-mode auto --settings <조건>`. 다른 건 `--settings` 하나: 키트 없음 = `{"enabledPlugins":{"superpowers@claude-plugins-official":false}}`, 키트 있음 = `{}`. (mod는 두 쪽 모두 켜져 있음 — `-p`에서는 그리지 않음)
- 잰 것: 걸린 시간, `total_cost_usd`(구독자에게는 참고값), `num_turns`, 출력 토큰, 그 복사본의 `npm test`, 출발 커밋 대비 바뀐 줄(`git add -A` 뒤 `git diff --cached --shortstat`), Skill 도구로 쓴 스킬.

## 화면에서 본 것 (2026-10-17)
- 설치 뒤 `/context`: 스킬 46개 · 6.9k 토큰(키트 없을 때 32개), 부탁 전 메시지 1.3k 토큰(superpowers의 SessionStart 훅이 사용 안내를 넣음).

| 조건 | 회 | 분 | 비용 추정($) | 턴 | 출력 토큰 | 테스트 | 바뀐 줄 |
|---|---|---|---|---|---|---|---|
| 키트 없음 | 1 | 1.6 | 0.45 | 11 | 7,021 | 145/149 · 실패 0 | 79+ 3- |
| 키트 있음 | 1 | 4.6 | 0.78 | 26 | 11,454 | 146/150 · 실패 0 | 91+ 3- |
| 키트 없음 | 2 | 1.9 | 0.66 | 13 | 7,805 | 145/149 · 실패 0 | 78+ 2- |
| 키트 있음 | 2 | 2.8 | 0.86 | 32 | 12,179 | 145/149 · 실패 0 | 88+ 2- |
| **평균 없음** | | 1.75 | 0.56 | 12 | 7,413 | | |
| **평균 있음** | | 3.7 | 0.82 | 29 | 11,817 | | |

- 네 번 모두 Skill 도구 호출은 없음(`-p` + 「질문하지 말고」).
- 브라우저(공덕): 키트 없음 #1, 키트 있음 #1 모두 「노선별 승하차 · 하루 평균」 칸이 스펙 예시와 같음(6호선 승차 18,443명 47% · 하차 17,909명 46% …). 차이는 키트 없음 쪽에 「노선」 열 머리글이 있는 정도.
- 해석: **스펙이 자세하고 작은 부탁에서는 결과는 같고 시간 약 2배, 비용 약 1.5배.** 조건마다 2회뿐이라 작은 차이는 우연일 수 있음. 모호하고 큰 일에서는 다를 수 있으니 내 일로 다시 재 볼 것.

## 파일
- `solution/bench/kit-ab.mjs` — 비교 스크립트
- `solution/bench/results/kit-ab.json` — 이번 측정 결과(4회 + 평균)

## 연습 과제
1. `ROUNDS`를 5로 늘리고 같은 비교를 다시 해 보세요. 평균 차이가 유지되나요?
2. 부탁을 「환승역 화면을 더 보기 좋게 해 줘」처럼 모호하게 바꿔서 키트 있음/없음을 비교해 보세요(`-p`에서는 질문을 못 하니 결과물을 브라우저로 비교).
