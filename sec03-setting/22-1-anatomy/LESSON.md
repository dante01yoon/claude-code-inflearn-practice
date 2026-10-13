# 섹션 3 · 22-1강 남이 만든 스킬 가져다 쓰기 — /anatomy로 움직이는 3D 해부도

앞 수업(20~22강)에서는 스킬을 직접 만들었습니다. 이번에는 **다른 사람이 만들어 공개한 스킬**을 점검하고, 내 프로젝트에 설치하고, 슬래시 명령으로 불러 씁니다. 예제는 [anatomy](https://github.com/wheresryan22/anatomy) — 설명하고 싶은 것을 실제 기계처럼 생긴 입체 그림(아이소메트릭 SVG + WebGL + 3D 회전)으로 만들어 주는 스킬입니다.

- 스킬: github.com/wheresryan22/anatomy · 작성자 Ryan(@wheresryan22) · **MIT 라이선스** · 설치한 커밋 `be2fa9b`(Changelog: release 1.1.0, 2026-10-12 녹화 직전 확인)
- 필요한 것: Node.js 20.10 이상(설치 도구 `skills` 1.7.2는 Node 22.20 이상), Chrome 또는 Chromium(그림 확인용 헤드리스 실행)
- 데이터: 서울 라이브 3D 저장소의 `data/raw/서울시 지하철 호선별 역별 시간대별 승하차 인원 정보.csv`(서울 열린데이터광장, 2026년 9월, 공공누리 제1유형)

## 개념: 남의 레시피 카드를 내 카드 상자에
| 어디에 | 폴더 | 누가 쓰나 |
|---|---|---|
| 이 프로젝트에만 | `<프로젝트>/.claude/skills/<이름>/` | 이 폴더에서 연 클로드(커밋하면 팀도) |
| 어느 폴더에서나 | `~/.claude/skills/<이름>/` | 나 |

흐름: GitHub 저장소 → `npx skills add` → `.claude/skills/anatomy/`(SKILL.md · scripts · kit · examples) → 클로드가 SKILL.md 맨 위 설명을 보고 고르거나, `/anatomy`로 직접 부름.

**스킬은 내 클로드와 같은 권한으로 돕니다.** 스킬 안의 스크립트가 파일을 읽고 명령을 실행할 수 있으니, 설치 전에 다섯 가지를 봅니다.

| 체크 | anatomy에서 확인한 것 |
|---|---|
| 출처 | 공식 저장소 wheresryan22/anatomy, 작성자 Ryan |
| 라이선스 | MIT (LICENSE, SKILL.md 프론트매터) |
| 스크립트 | `kit/`(그림 빌드, 의존성 없음) · `scripts/capture.mjs`·`drive.mjs`·`lines.mjs`(헤드리스 크롬을 127.0.0.1 디버깅 포트로만) |
| 밖으로 보내는 것 | `scripts/publish.mjs`(커뮤니티 갤러리에 PR — 그림 소스·미리보기·처음 요청 문장·시간·토큰 수). **사용자가 요청할 때만**, 이번 수업에서는 쓰지 않음 |
| 크기·시간 | Figure(부품 40~80, 30~90분) · Hero(80~150, 2~4시간) · Epic(6시간+, 묻고 나서만) |

## 실습 1 — 설치 전에 클로드에게 점검 맡기기 (입력한 것 그대로)
```text
claude
이 스킬 설치하려고 하는데 먼저 봐 줘. github.com/wheresryan22/anatomy
뭘 하는 스킬인지, 밖으로 보내는 게 있는지, 라이선스는 뭔지
```
- 52초. 저장소를 임시 폴더에 받아 SKILL.md·publish 문서·스크립트를 읽고 정리: 평소에는 밖으로 보내는 것 없음, 갤러리 게시 기능 하나만 외부 전송, MIT.
- 권한 막기 예(클로드가 권한 것): 프로젝트 `.claude/settings.json`
  ```json
  { "permissions": { "deny": ["Bash(node *publish.mjs*)"] } }
  ```
  녹화 환경에는 미리 게시 금지 규칙을 넣어 두었습니다.

## 실습 2 — 설치
```text
/exit
npx skills add wheresryan22/anatomy -a claude-code
```
- `Ok to proceed? (y)` → Enter (npx가 `skills` 1.7.2를 받음)
- `Installation scope` → **Project** (내 홈 전체에 넣으려면 명령에 `-g`)
- `Proceed with installation?` → Yes → `✓ anatomy (copied) → ./.claude/skills/anatomy`, 프로젝트에 `skills-lock.json`이 생김
- 마지막 줄 "Review skills before use; they run with full agent permissions." — 방금 한 점검이 이것
- 설치 도구 `skills`는 익명 사용 통계를 보냅니다. 끄려면 `DISABLE_TELEMETRY=1`(또는 `DO_NOT_TRACK=1`) — 녹화 환경은 꺼 둠
- git으로도 같은 결과: `git clone https://github.com/wheresryan22/anatomy.git .claude/skills/anatomy`

```text
ls .claude/skills/anatomy
```

## 실습 3 — 짧은 프롬프트 (그림 1, Figure)
```text
claude
/anatomy 강남역 시간대별 승하차를 기계로 보여 줘
```
- 클로드가 먼저 크기를 정함: "Figure 크기(메커니즘 하나, 부품 40–80개, SVG)… 30–90분쯤"
- **10분 15초**, `figures/gangnam-gauge/`(build.mjs → gangnam-gauge.html, -light.html). 승차·하차 막대 24개씩 + 캐리지의 다이얼 게이지 2개. 가로로 움직이면 시간대가 바뀜.
- 값: 9월 CSV 강남(2호선) 행의 한 달 합계 ÷ 30일. 09시 하차 10,639 · 18시 승차 10,434 · 14시 승차 3,798 / 하차 3,424 (CSV로 직접 검산, 일치)
- 확인: 선 끝 검사 0, 콘솔 오류 없음, 390px 폭 (회전체가 없어 `--audit`은 안 돌림)

## 실습 4 — 빗나가면 자세히 (그림 2, Hero)
짧은 프롬프트에는 "돌려 보기·분해·빛" 이야기가 없어서 가장 작은 크기로 만들었습니다. 원하는 게 있으면 자세히 씁니다.
```text
claude -c
프롬프트를 더 자세히 쓸게. 이번엔 Hero 크기로 새 그림을 하나 더 만들어 줘(지금 그림은 그대로 두고).
- 강남역 개찰구를 진짜 기계처럼: 개찰구 여러 대 + 승차·하차 사람 수를 세는 숫자 드럼 계수기
- 시간대를 바꾸면 계수기가 그 시간 실제 승하차 수까지 돌아가게
- 마우스로 끌면 3D로 돌려 보고, 누르면 부품이 분해되게
- 붐비는 시간엔 개찰구 사이로 WebGL 빛이 흐르게
- 숫자는 9월 CSV 실제 값만
```
- 크기: "Hero 상한 … 부품 110~150개, 예상 3~4시간" → 실제 **1시간 0분 39초**, `figures/gangnam-gates/`(부품 96개로 첫 빌드)
- 그림: 회전대 위 개찰구 5대(왼쪽 둘 승차·오른쪽 둘 하차 통로) + 5자리 드럼 계수기 2대(리셋 → 기계식 자리올림으로 셈). 끌면 회전, 누르거나 「분해」면 덮개가 뜨고 드럼 묶음이 빠져나옴. 통로 바닥 WebGL 빛(승차 파랑·하차 주황, 그 시간 인원에 비례), 날개문은 빛이 지날 때 열림.
- 값 예: 08시 승차 2,103 / 하차 10,486 · 09시 1,740 / 10,639 · 10시 1,826 / 4,982 · 18시 10,434 / 5,583 (모두 CSV ÷ 30 반올림, 검산 일치)
- 검사: 회전 감사(turn audit) 통과, 선 끝 0(24개 각도·분해·라이트), 깊이 순서 불일치 0, WebGL 없이도 기계 동작, 1440px 9.7ms/프레임
- 클로드가 밝힌 남은 것: 휴대폰 프로파일(390px, CPU 4배 느림) 41ms/프레임(반 프레임 그리기 장치를 넣은 뒤 다시 안 잼), 회전 pop 검사 코어 740 → 4개(눈에 띄는 튐 없음), WebGL 없을 때 빛 대체 SVG 없음

| | 시간 | 모델 호출 | 출력 토큰 | 캐시 읽기 |
|---|---:|---:|---:|---:|
| 점검(실습 1) | 52초 | 17 | 약 1.1만 | 약 59만 |
| 그림 1 Figure | 10분 15초 | 35 | 약 5.2만 | 약 361만 |
| 그림 2 Hero | 1시간 0분 39초 | 97 | 약 11.1만 | 약 3,065만 |

(Claude Code v2.1.296, Opus 5.5, effort medium, 녹화 세션 로그에서 메시지별로 셈. 요금제 사용량도 그만큼 듭니다.)

## 결과 보기
```text
npm start        # 서울 라이브 3D 서버
# http://127.0.0.1:8000/figures/gangnam-gates/gangnam-gates.html
# http://127.0.0.1:8000/figures/gangnam-gauge/gangnam-gauge.html
```
조작: 끌어서 돌리기 · 누르면 분해 · ← → 또는 아래 슬라이더로 시간대.

## 남의 스킬 체크리스트
1. 출처 — 공식 저장소·작성자 확인(복사본·포크 주의)
2. 라이선스 — 써도 되는 조건
3. 스크립트 — 무엇을 실행하나
4. 밖으로 보내는 것 — 주소·업로드·게시, 막을 거면 deny 규칙
5. 크기·시간 — 오래 걸리면 사용량도 많이
→ 설치 전 "먼저 봐 줘"로 클로드에게 맡기면 빠름

## 연습 과제
- 같은 스킬로 다른 역(예: 홍대입구)을 Figure 크기로 만들고 숫자를 CSV로 검산해 보기
- 프로젝트 `.claude/settings.json`에 갤러리 게시 deny 규칙을 넣고 `/permissions`에서 확인

## 다음
이 그림을 서울 라이브 3D 화면에 넣는 것은 뒤의 프로젝트 섹션에서 이어 갑니다.
