# 섹션 0-1 · 4강 클로드 코드란 — 채팅 AI와 무엇이 다른가

## 이번 수업에서 입력한 것 (그대로)

```text
ls
cat expenses.csv
claude -p --tools "" "expenses.csv 파일을 읽고 분류별 합계를 summary.md 파일로 만들어 줘"   # 도구를 모두 끈 상태
ls
claude
expenses.csv 파일을 읽고 분류별 합계를 summary.md 파일로 만들어 줘                          # 도구가 있는 평소 상태
!cat summary.md
/exit
```

`--tools ""`는 클로드가 쓸 수 있는 기본 도구를 모두 끄는 옵션입니다([cli-reference](https://code.claude.com/docs/en/cli-reference)). 같은 모델, 같은 부탁이라도 도구가 없으면 글로만 답하고, 도구가 있으면 파일을 직접 읽고 만듭니다.

## 핵심 정리 (공식 문서 확인)

| 항목 | 내용 | 근거 |
|---|---|---|
| 에이전트 루프 | 맥락 모으기 → 행동하기 → 결과 확인하기를 일이 끝날 때까지 반복 | [how-claude-code-works#the-agentic-loop](https://code.claude.com/docs/en/how-claude-code-works) |
| 모델과 도구 | 생각은 모델, 행동은 도구. "도구가 없으면 Claude는 글로만 답할 수 있다" | 같은 문서 #tools |
| 하네스 | 모델 바깥에서 도구를 주고 모델이 보는 맥락을 관리하는 층 = agentic harness. 클로드 코드가 이 층 | 같은 문서 #the-agentic-loop |
| 기본 도구 다섯 갈래 | 파일, 검색, 실행, 웹, 코드 인텔리전스 | 같은 문서 #tools |

비유: 채팅 AI = 말로만 답하는 상담원, 에이전트 = 직접 손을 움직이는 동료. 모델(머리) · 도구(손) · 하네스(몸).

## 녹화에서 나온 결과

| | 걸린 시간 | 만든 파일 | 결과 |
|---|---|---|---|
| 도구 끔 (`--tools ""`) | 약 10초 | 없음 | 파일을 찾을 수 없고 폴더가 비어 있다는 틀린 답 + 내용을 붙여 넣어 달라는 안내 |
| 도구 있음 (평소) | 11초 (화면 표시) | `summary.md` | `ls && cat`(맥락) → `awk` 계산(행동) → `summary.md` 작성 → 합계를 다시 맞춰 봄(확인). 총계 101,300원 |

결과 파일: `solution/summary.md`. 도구를 끈 쪽의 답은 실행할 때마다 다를 수 있습니다(녹화 전 시험에서는 "도구가 연결되어 있지 않다"고 솔직하게 답한 적도 있음).
