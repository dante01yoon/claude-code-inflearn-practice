# 📏 DESIGN.md와 디자인 하네스 — 디자인을 안 했다면 이걸 써야 할까

**DESIGN.md**: AI가 화면을 만들기 전에 읽는 디자인 설명서. Google Labs 초안 스펙([google-labs-code/design.md](https://github.com/google-labs-code/design.md), Apache-2.0, 촬영일 2026-10-20 기준 ★약 2.8만, 버전 alpha). 위에는 YAML 값(colors · typography · rounded · spacing · components), 아래에는 정해진 순서의 글(개요 → 색 → 글자 → 레이아웃 → 높이·그림자 → 모양 → 컴포넌트 → Do's and Don'ts). CLI `@google/design.md@0.4.0`: `lint` · `diff` · `export` · `spec`.

**하네스와 관계**: DESIGN.md = 설명서(처음부터 맞게 만들 확률 ↑, lint는 파일 자체를 검사) / 하네스 = 검사기(만든 화면이 틀리면 못 넘어감). 앞뒤 관계. 원천은 `tokens.json` 하나, DESIGN.md는 생성물(손으로 고치지 않기).

녹화에서 만든 것(이 폴더 `solution/design-harness`):
- `npm run design-md` (6분 3초): tokens · components · copy → `work/<p>/DESIGN.md` → 공식 lint(오류 0 · 경고 2: 공식 속성에 없는 키로만 쓰는 색 2개 — 고치면 system 승인이 풀려 그대로 둠). 테스트: lint 오류 0, `export --format dtcg` 값 = tokens.json, 빠지는 토큰 없음. (클로드 메모: npm 정보의 라이선스 표시는 비어 있거나 다르게 보이지만 패키지 안 LICENSE는 Apache-2.0)
- handoff 단계 게이트(54초): DESIGN.md 없음 = TODO, 원본으로 다시 만든 내용과 다름 = FAIL(손으로 고친 경우 포함), lint 오류 = FAIL.
- `npm run lint:web` (3분 20초): 크롬으로 그린 화면의 계산된 스타일로 토큰 밖 색 · 스케일 밖 글자 크기 · 44px 미만 버튼 · 금지 문구 검사.

**웹 화면 A/B** (같은 프롬프트, 피그마 사용 안 함): A = DESIGN.md + PRD + 데이터(2분 34초, 목록 + 상세 · 상태 화면까지), B = A + "웹 검사 오류 0까지" 규칙(1분 21초, 목록만). 같은 `lint:web`으로 A 0건 · B 0건, A의 로딩 · 빈 · 오류 화면도 0건 → **이번 실험(화면 1장 · 1회)에서는 하네스 검사를 더해도 위반 수 차이가 없었음.** 규칙 밖 차이: 1대 남은 곳 숫자 색(A 호박색 · B 초록).

**결정 흐름**: 디자인 시스템이 있다 → 원천 유지 · DESIGN.md는 생성만 / 없다 + 코딩 에이전트로 UI → DESIGN.md / 화면 3개 이상 · 여럿이 만든다 → 토큰 + 검사 하네스.
**주의**: 유명 서비스 DESIGN.md 모음의 MIT는 문서 글에 대한 것. 브랜드 고유 색 · 서체 · 외관 · 상표는 따로 권리가 있습니다 — 구조만 참고하고 값은 내 서비스의 것으로.

프롬프트 원문(복사용): [PROMPTS.md](PROMPTS.md)
