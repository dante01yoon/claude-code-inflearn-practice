# 섹션 0-1 · 8강 첫 실행과 화면 둘러보기

## 이번 수업에서 입력한 것 (그대로)

```text
claude                       # 처음 여는 폴더 → "이 폴더를 믿나요?" → Yes, I trust this folder
?                            # 단축키 도움말 열기/닫기
Shift+Tab (여러 번)          # 권한 모드 바꾸기: auto → manual → accept edits → plan → auto
/he → Enter                  # / 로 명령 목록, 글자를 치면 걸러짐 → /help
!ls                          # ! = 터미널 명령을 바로 실행
@id → Tab                    # @ = 파일 가리키기 (idea.txt 자동 완성)
@idea.txt 이 파일 내용을 한 줄로 요약해 줘
/exit
```

## 화면 구성

| 자리 | 무엇 |
|---|---|
| 맨 위 | 버전, 모델(Opus 5.5), 지금 폴더 |
| 가운데 `❯` 입력창 | 부탁을 쓰는 곳. Enter로 보내고, 줄바꿈은 Shift+Enter |
| 입력창 아래 | 권한 모드(`⏵⏵ auto mode on`), 생각 깊이(`medium · /effort`) |

| 입력 | 뜻 | 근거 |
|---|---|---|
| `/` | 클로드 코드 명령·스킬 | [interactive-mode#quick-commands](https://code.claude.com/docs/en/interactive-mode) |
| `!` | 셸 모드: 명령을 바로 실행하고 결과를 대화에 남김 | 같은 문서 |
| `@` | 파일 경로 자동 완성 | 같은 문서 |
| `?` (빈 입력창) | 단축키 도움말 | 같은 문서 |
| `Shift+Tab` | 권한 모드 순환 | [permission-modes](https://code.claude.com/docs/en/permission-modes) |
| `Esc` | 하던 일 멈추기 / 창 닫기 | interactive-mode |
| `/exit` 또는 빈 입력창에서 `Ctrl+D` 두 번 | 끝내기 | [terminal-guide](https://code.claude.com/docs/en/terminal-guide) |
