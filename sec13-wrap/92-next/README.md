# 섹션 13 · 92강 다음 단계 — 업데이트 따라가기 · 강의 자료 · 전체 지도

## 이번 수업에서 할 것
- 매주 바뀌는 클로드 코드를 따라가는 법: 공식 문서 「새로운 기능」(주간 요약) · 변경 기록 · `claude --version` · `/release-notes`.
- 강의 자료가 있는 저장소 네 곳과 플러그인 마켓플레이스 추가 방법.
- 강의 전체 지도(섹션 0~13)와 섹션 1의 고삐 그림 완성본으로 마무리.

촬영: VS Code 내장 터미널(code-server), Claude Code v2.1.296, 2026-10-17(같은 날 최신 2.1.302).

## 업데이트 따라가기 (공식 문서)
| 어디 | 무엇 | 링크 |
|---|---|---|
| 새로운 기능 | 주마다 작업 방식을 바꿀 만한 기능을 실행 가능한 코드·짧은 데모와 함께. 주차마다 버전 범위(예: 37주차 v2.1.263–v2.1.269, `claude plugin eval`) | [code.claude.com/docs/ko/whats-new](https://code.claude.com/docs/ko/whats-new) |
| 변경 기록 | 모든 수정. 문서 주소가 GitHub `anthropics/claude-code`의 `CHANGELOG.md`로 이어짐(맨 위 2.1.302) | [code.claude.com/docs/ko/changelog](https://code.claude.com/docs/ko/changelog) |
| 터미널 | `claude --version`(2.1.296), 클로드 안 `/release-notes` → 버전 목록(422개), 고르면 그 버전 노트 | — |

습관 네 가지: 주 1회 새로운 기능 훑기 · 내 버전 노트 확인 · 새 기능은 따로 써 보고 넣기 전후 재 보기(86·87강) · 실험/미리 보기 표시는 바뀔 수 있음.

## 강의 자료 (github.com/dante01yoon)
| 저장소 | 내용 |
|---|---|
| [claude-code-inflearn-practice](https://github.com/dante01yoon/claude-code-inflearn-practice) | 섹션별 폴더, 수업마다 프롬프트 원문 · 공식 문서 링크 · 결과 파일 |
| [seoul-live-3d](https://github.com/dante01yoon/seoul-live-3d) | 예제 앱, 섹션별 브랜치 |
| [claude-code-starter-setting](https://github.com/dante01yoon/claude-code-starter-setting) | 새 프로젝트 세팅 템플릿 + `WORKFLOW.md` 체크리스트(91강) |
| [claude-code-practice-marketplace](https://github.com/dante01yoon/claude-code-practice-marketplace) | 플러그인 web-kit · starter-setting(섹션 7) |

## 입력한 것 (그대로)
```text
claude --version
claude
/release-notes          ← Esc
/exit
claude plugin marketplace add dante01yoon/claude-code-practice-marketplace
claude plugin marketplace list
```
마켓플레이스는 녹화 HOME에만 추가(단테 설정 변경 없음). 목록: anthropic-plugin-directory(내장) · claude-plugins-official · claude-code-practice-marketplace.

## 화면 구성
도식(오늘 할 것 · 습관 네 가지 · 저장소 네 곳 · 섹션 0~13 지도 · 고삐 그림 완성본: 컨텍스트=CLAUDE.md·경로 규칙·스펙 / 권한=권한 규칙·모드·훅 / 검증=테스트·검사 훅·CI·리뷰 / 도구=MCP·플러그인·병렬·자동화) + 공식 문서 녹화 2(새로운 기능, 변경 기록) + GitHub 녹화 2(실습 저장소, 마켓플레이스) + 터미널 녹화 1(`s13_l92`). 강의 홍보·가격 언급 없음.

## 연습 과제
1. `/release-notes`에서 내 버전 다음 버전을 골라, 이 강의와 달라진 점이 있는지 찾아보세요.
2. 새로운 기능 페이지에서 기능 하나를 골라 녹화 HOME처럼 따로 써 본 뒤, 87강 방식으로 넣기 전후를 재 보세요.
