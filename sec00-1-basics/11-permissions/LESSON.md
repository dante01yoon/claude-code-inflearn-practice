# 섹션 0-1 · 11강 권한 질문에 답하는 법 — 허락·거절, Esc로 멈추기

## 이번 수업에서 입력한 것 (그대로)

```text
claude --permission-mode manual            # 매번 물어보는 Manual 모드로 시작
memo.txt 파일을 만들고 '첫 메모'라고 적어 줘     → 권한 질문 → 1. Yes
memo.txt를 지워 줘                            → 권한 질문 → Esc (거절)
지우지 말고 이름을 old-memo.txt로 바꿔 줘        → 권한 질문 → 1. Yes
1부터 30까지 숫자마다 재미있는 사실을 하나씩 붙여서 facts.md로 만들어 줘
Esc                                        # 하던 일 멈추기
그만하고 1부터 5까지만 만들어 줘                 → 권한 질문 → 1. Yes
Shift+Tab                                  # auto 모드로 돌아가기
/exit
```

## 핵심 정리 (공식 문서 확인)

| 항목 | 내용 | 근거 |
|---|---|---|
| Manual (`default`) | 읽기만 바로 하고, 파일 수정·명령 실행 전에 물어봄 | [permission-modes](https://code.claude.com/docs/en/permission-modes) |
| auto | 별도 분류 모델이 행동을 검토해 위험한 것만 막고 나머지는 진행. v2.1.283부터 터미널의 기본 시작 모드 | 같은 문서 |
| accept edits / plan | 파일 수정·기본 파일 명령은 바로 / 계획만 세우고 수정 안 함 | 같은 문서 |
| 권한 질문에서 Esc | 거절(**No**와 같음) | [interactive-mode](https://code.claude.com/docs/en/interactive-mode) |
| 일하는 중 Esc | 지금 응답·도구 실행을 멈춤. 한 일은 남고 다음 지시를 기다림 | 같은 문서 |
| 빈 입력창에서 Esc 두 번 | 되돌리기(rewind) 메뉴 | 같은 문서 |
