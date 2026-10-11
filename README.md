# 클로드 코드 실전 — 강의 실습 파일

인프런 강의 「클로드 코드 실전 — 설치부터 하네스까지」에서 **실제로 촬영할 때 입력한 프롬프트와 클로드 코드가 만든 파일**을 모아 둔 저장소입니다.
클로드 코드의 결과는 같은 프롬프트라도 매번 조금씩 다릅니다. 내 결과가 영상과 다르면 이 저장소의 파일에서 이어서 진행하세요.

- 촬영 환경: VS Code 내장 터미널(code-server), Claude Code v2.1.296, 2026-10
- 수업마다 `LESSON.md`(입력한 명령·프롬프트 원문, 공식 문서 링크), `start/`(시작 상태), `solution/`(녹화 끝 상태)이 있습니다.
- 프롬프트는 짧은 평소 말투로 먼저 시도하고, 결과가 빗나가면 그때 자세한 프롬프트로 다시 씁니다. 두 버전을 모두 남겨 둡니다.
- 인증키가 들어 있는 `.env`는 올리지 않습니다. `.env.example`을 `.env`로 복사해 내 키를 넣어 쓰세요.

## 섹션 0. 시작하기

| 폴더 | 내용 | 수업 |
|---|---|---|
| [sec00-start/01-preview](sec00-start/01-preview/) | 강의에서 만드는 결과물과 강의 지도, 어디서부터 들으면 되는지 | 결과물 미리 보기와 강의 지도 |
| [sec00-start/02-materials](sec00-start/02-materials/) | 이 저장소 받기(`git clone`·ZIP)·폴더 구조, `git pull`로 최신 자료 받기, 버전 기준과 클로드 코드 업데이트 | 실습 자료·정답 저장소, 버전 기준과 업데이트 |
| [sec00-start/03-plans-usage](sec00-start/03-plans-usage/) | Pro·Max 요금제, `/usage`·`/context`, 세 가지 부탁의 토큰을 재는 `usage_check.py` | 요금제·사용량 감 잡기 |

## 섹션 0-1. 처음이라면: 클로드 코드 기초 (무료 1시간 강의를 본 분은 건너뛰어도 됩니다)

| 폴더 | 내용 | 수업 |
|---|---|---|
| [sec00-1-basics/04-what-is-claude-code](sec00-1-basics/04-what-is-claude-code/) | 도구를 끈 클로드(`--tools ""`) vs 평소 클로드로 같은 가계부 합계 부탁, 모델·도구·하네스 | 클로드 코드란 |
| [sec00-1-basics/05-terminal-basics](sec00-1-basics/05-terminal-basics/) | `pwd`·`ls`·`cd`·`mkdir`·`cat`·Tab·↑·`clear`, macOS·Windows 명령 비교표 | 터미널이 처음인 분을 위한 10분 |
| [sec00-1-basics/06-install-login](sec00-1-basics/06-install-login/) | 설치 명령(macOS·Linux·Windows), `command not found` 해결, `claude doctor`, 로그인 | 설치와 로그인 |
| [sec00-1-basics/07-vscode](sec00-1-basics/07-vscode/) | VS Code 내장 터미널에서 `claude` 실행, `/desktop` | VS Code와 내장 터미널 |
| [sec00-1-basics/08-first-run-tour](sec00-1-basics/08-first-run-tour/) | 폴더 믿기, 입력창·모드 표시, `?`·`Shift+Tab`·`/`·`!`·`@` | 첫 실행과 화면 둘러보기 |
| [sec00-1-basics/09-first-request](sec00-1-basics/09-first-request/) | 카페 메뉴 페이지: 짧은 프롬프트 → 자세한 프롬프트, 브라우저로 결과 확인 | 첫 부탁 해 보기 |
| [sec00-1-basics/10-sessions](sec00-1-basics/10-sessions/) | `--continue`, `--resume`, `/rename`, 새로운 세션과의 차이 | 세션 이어 가기 |
| [sec00-1-basics/11-permissions](sec00-1-basics/11-permissions/) | Manual 모드 권한 질문 허락·거절, Esc로 멈추고 다시 지시 | 권한 질문에 답하는 법 |
| [sec00-1-basics/12-mission-0](sec00-1-basics/12-mission-0/) | 미션 0: 폴더를 만들고 첫 웹 페이지 만들기 + 정답 | 미션 0 |

## 섹션 1. 핵심 기능 다지기

| 폴더 | 내용 | 수업 |
|---|---|---|
| [sec01-core/01-model-effort](sec01-core/01-model-effort/) | `/model` 별칭, `opusplan`, `/effort`, `ultrathink`, `/fast` 실습. 모델·생각 깊이·비용을 보여 주는 상태 줄 설정, 생각 깊이 4단계 비교 스크립트(`effort_check.py`) | 모델·생각 깊이 고르기 |
| [sec01-core/02-opus-vs-opusplan-vs-sonnet](sec01-core/02-opus-vs-opusplan-vs-sonnet/) | 같은 가계부 페이지를 Opus만·opusplan·Sonnet만으로 만들고 시간·토큰·비용을 재는 `measure.py`, 결과 페이지 9개와 `results.json` | 📏 Opus만 vs opusplan vs Sonnet만 |
