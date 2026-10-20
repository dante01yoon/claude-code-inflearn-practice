# 디자인 하네스 설계 (HARNESS-DESIGN.md)

> 이 파일은 하네스 자체의 설계 문서입니다. 화면 디자인 규칙 파일인 DESIGN.md(구글 Labs 형식)와 헷갈리지 않게 이름을 HARNESS-DESIGN.md로 바꿨습니다.

디자이너가 Claude Code와 함께 **PRD → 리서치 → 정보 구조 → 와이어프레임 → 디자인 시스템 → Figma 화면 → 검증 → 리뷰·핸드오프**까지 가는 작업 틀. 구현은 이 폴더(`design-harness/`).

## 한 줄 원칙
1. **폴더가 상태다.** `work/<프로젝트>/`의 파일만 보고 `npm run check`가 단계를 판정한다.
2. **기계가 잴 수 있는 건 기계가 잰다.** 색·글자·간격·대비·터치 영역·이름·상태 누락은 Figma 노드 JSON 린트로. 사람은 위계·톤·인상만 본다.
3. **금지는 문서가 아니라 훅으로.** 승인 전 Figma 쓰기, 다른 파일·팀 쓰기는 PreToolUse 훅이 막는다.
4. **만든 에이전트와 검사하는 에이전트를 나눈다.** 비평가는 새 맥락에서 점수를 "제안"만 하고, 확정 점수와 승인은 사람이 한다.

## 단계·게이트

| # | 단계 | 산출물 | 담당 | 기계 게이트 (`npm run check`) | 사람 |
|---|---|---|---|---|---|
| 1 | prd | PRD.md | 사람+메인 | 섹션 5개(목표·사용자·기능·데이터 출처·범위 밖), 기능 ID F1…, 데이터 라이선스 | |
| 2 | research | references.json, research.md, references/*.png | researcher | 쓸 수 있는 레퍼런스 ≥3 (캡처 파일 있음, observed/take 작성, 보안 확인 화면 제외) | |
| 3 | ia | ia.json (화면·흐름·필수 상태) | ia-architect | 모든 기능에 화면, 흐름은 있는 화면·상태만 | |
| 4 | wireframe | wireframes.json → SVG | ia-architect | 화면마다 영역, 우선순위 중복 없음, 내용 있음 | **승인** |
| 5 | system | tokens.json(DTCG), components.json, copy.json | system-designer | 별칭 해석·순환 없음, 대비쌍 통과, 컴포넌트는 있는 토큰만, 누를 것은 44px 이상 | **승인** |
| 6 | figma | Figma 파일 + figma/nodes.json | figma-operator | figma.json 파일 키와 일치, 마지막 쓰기 뒤에 내보냄 | |
| 7 | verify | 린트 결과, review.json | figma-operator 수정 + design-critic | 노드 린트 오류 0 | **체크리스트 채점·승인** |
| 8 | handoff | HANDOFF.md | 스크립트 | 노드보다 최신 | |

판정 값: PASS / FAIL / TODO(아직 안 함) / WAIT(사람 승인 대기) / SKIP(Figma 파일 키 없음).
TODO는 실패가 아니라서 Stop 훅이 작업 초반에 막지 않는다.

## 기계 검사 vs 사람 검사

| 기계 (`npm run lint:figma`) | 규칙 id | 수준 |
|---|---|---|
| 토큰 밖 색 / 변수 아닌 색 / 없는 변수 | color-off-token / unbound-color / unknown-variable | 오류 / 경고 / 오류 |
| 타입 스케일 밖 크기·굵기, 다른 서체 | font-size-off-scale, font-weight-off-scale, font-family | 오류 |
| 간격(auto layout 간격·패딩), 모서리 | spacing-off-scale, radius-off-scale | 오류 |
| 명도 대비 4.5:1(큰 글자 3:1), 배경은 가장 가까운 조상 채움 | contrast | 오류 |
| 누를 수 있는 컴포넌트 44×44 미만 | touch-target | 오류 |
| `Frame 12` 같은 기본 레이어 이름 | layer-name | 경고 |
| 좌우 여백 16px, 4px 격자 | grid-margin, grid-base | 경고 |
| `<화면>/<상태>` 프레임 이름, 뷰포트 크기 | frame-name, frame-size | 오류 |
| 필수 상태(default·empty·error·loading) 누락 | missing-state | 오류 |
| 같은 컴포넌트가 화면마다 높이·색 다름(변형 제외) | consistency | 경고 |
| 금지 카피, 버튼 글자 수 | copy-banned, copy-button-length | 오류 / 경고 |

사람 (`review.json`, 0~2점 × 12항목): 위계, 주요 행동, 상태 안내(N1·N9), 사용자 말(N2), 일관성(N4), 되돌리기(N3), 기준 시각·출처, 누를 수 있어 보임, 군더더기(N8), 카피 톤, 기본값 같은 인상, 서비스 성격. N=닐슨 휴리스틱 번호. "기준 시각·출처"와 "누를 수 있어 보임"은 전후 비교 실험에서 두 조건이 모두 놓쳐서 추가했다.

## 구성
- `.claude/agents/`: researcher, ia-architect, system-designer, figma-operator(Figma 도구를 부르는 유일한 에이전트), design-critic(새 맥락 비평, 수정 안 함)
- `.claude/skills/`: design-flow(진입점), collect-references, build-in-figma, verify-design, handoff
- `.claude/settings.json` 훅
  - PreToolUse `figma-guard`: system 승인 전 쓰기 금지, figma.json의 fileKey가 아닌 파일·planKey가 아닌 팀 금지, `// harness:read-only` 표시가 있고 쓰기 호출이 없는 코드만 읽기로 통과. 허용된 쓰기는 시각을 figma.json에 기록
  - PostToolUse `after-figma-write`: 쓰기 뒤 "노드 다시 내보내고 린트" 안내를 맥락에 주입
  - Stop `check --hook`: FAIL이 있으면 한 번 막고 이유를 돌려줌(`stop_hook_active`면 통과시켜 무한 반복 방지)
- `scripts/`: check(게이트), lint-figma(노드 린트), figma/export-nodes.js(use_figma에 붙여 넣는 읽기 전용 내보내기, 반환 한도 20KB 때문에 18KB씩 나눠 받고 merge-nodes로 합침), capture-refs(공개 페이지 캡처, 보안 확인 화면 판별), wireframe(SVG), review(체크리스트), approve(사람 승인 기록), handoff, compare-runs(전후 비교 지표)
- 실패 기록: 게이트·린트 실패마다 `work/<프로젝트>/failures.jsonl`에 한 줄. 같은 실패가 반복되면 규칙 파일(copy.json 금지어, 토큰, 컴포넌트)을 고친다.
- Figma 없이 시험: `tests/fixtures/good-nodes.json`(통과 예시), `bad-nodes.json`(일부러 틀린 예시). `npm test` 11개.
- 전후 비교 결과와 실험이 드러낸 하네스 문제: 실습 저장소 `117-ab-compare` 폴더의 `experiment/RESULTS.md`.

## Figma 계정·파일 규칙
- figma.json에 사람이 `fileKey`, `planKey`, `account`를 적는다. 하네스는 그 파일·팀에만 쓴다.
- 수업 촬영은 강사 개인 계정의 수업용 새 파일에서만 했다. 회사 계정·다른 팀은 사용하지 않는다.
- Starter 요금제는 Figma MCP 읽기 도구 호출이 월 20회다(Figma 개발자 문서 "Rate limits & access"). 실험 중 이 한도에 걸렸다. 하네스는 호출을 묶고 스크린샷을 최소화하지만, 반복 수정까지 하려면 Professional 이상(하루 200회)이 필요하다.
- figma-operator는 첫 호출에서 기준 서체가 파일에서 쓸 수 있는지 확인한다(실험에서 Pretendard가 없어 39건 오류).

## 전후 비교 실험 설계 (`experiment/`)
- 같은 PRD(따릉이 대여소 현황, 서울시 공공데이터 OA-15493), 같은 모델(opus), 같은 문장 "화면은 3~4개 정도면 돼".
- A: 빈 폴더(PRD.md + data만)에서 평소 말투 요청. B: 하네스 폴더에서 `/design-flow`. 각자 다른 Figma 파일.
- 둘 다 `claude -p --output-format stream-json`으로 실행해 입력·출력 로그를 그대로 보관(영상 재촬영용).
- B의 사람 승인은 실험 운영자가 대신 기록하고 approvals.json에 그렇게 남긴다(강사 승인 아님).
- 측정: 같은 읽기 전용 스크립트로 두 파일의 모든 최상위 프레임을 내보내 `compare-runs`로 비교. 토큰이 없는 A에 토큰 위반을 물을 수 없으므로 **서로 다른 값의 개수**(색·글자 크기·간격·모서리), 대비 미달, 터치 영역, 기본 레이어 이름, 화면 간 높이 불일치, 빠진 상태, 시간·토큰·비용, 비평 에이전트 제안 점수, 사람 점수(사람 몫)를 잰다. 하네스가 불리해도 그대로 적는다.

## 남들은 / 우리는 (영상 설명용)
| 남들은 | 우리는 |
|---|---|
| 단계 게이트로 Figma까지, 모든 단계 사용자 승인 | 8단계, 사람 승인은 3곳. 나머지는 스크립트가 판정 |
| 레퍼런스는 계정 필요한 서비스 | 공개 페이지 캡처, 보안 확인 화면은 스스로 걸러 냄 |
| "변수에 묶였는지 확인하라"는 안내 문구 | 노드를 내보내 실제로 검사, 오류 0이 끝 조건 |
| 디자인 린트는 상위 요금제 기능 | 같은 종류의 검사를 노드 JSON으로, 상태 누락·터치 영역·카피·일관성까지 |
| 리뷰어가 점수까지 매김 | 비평 에이전트는 제안만, 점수·승인은 사람 |
| 금지 규칙을 문서에 씀 | 훅이 막음(승인 전 쓰기, 다른 파일·팀) |

