# 섹션 1 · 컨텍스트 관리 (/context, /compact·/autocompact, /clear, /rewind, /btw)

실습: `start/`(지난 수업 결과) → 책상 보기 · 곁가지 질문 · 되돌리기 · 정리. 결과 폴더는 시작과 같습니다(되돌리기로 `stations.html`을 지웠기 때문). 녹화 중간에 만들어졌던 `stations.html`은 `solution/rewound-stations.html`에 참고로 남겼습니다.
촬영: VS Code 내장 터미널(code-server), Claude Code v2.1.296, auto 모드, Opus 5.5 · medium(전체 1m 토큰), 2026-10-11

## 입력한 것 (그대로)
```text
claude
/context                                         # 29k / 1m — 대화 전부터: 도구 설명 22.2k, CLAUDE.md(Memory files) 1.6k
index.html 전체 구조를 자세히 설명해 줘
/context                                         # 49.3k — 메시지 칸 19.7k
/btw 1호선 공식 색 코드가 뭐였지?                   # 따로 뜬 창에 #0052A4 → Esc로 닫기 (대화 기록에 안 남음)
역 이름이랑 하루 평균 승차 인원만 크게 보여 주는 stations.html 페이지 하나 새로 만들어 줘
                                                 # 파일을 쓰는 순간 "Loaded .claude/rules/html.md"
/rewind  → ↑ 로 방금 부탁 선택("stations.html +60") → Enter → 1. Restore code and conversation
                                                 # 탐색기에서 stations.html이 사라짐. 입력창으로 돌아온 부탁은 지움
/compact 지금까지 정한 것만 남겨 줘
/context                                         # 41.4k — 메시지 칸 12.4k
/clear
/context                                         # 29.1k — 메시지 칸 130
```
`/context` 결과가 길어서 위쪽 표는 Shift+PageUp으로 올려 보았습니다. Esc 두 번(빈 입력창)으로도 되돌리기 메뉴가 열리지만, 녹화에서는 `/rewind`를 썼습니다. 짧은 프롬프트만으로 충분해서 자세한 버전은 쓰지 않았습니다.

## 📏 단계마다 책상이 얼마나 찼나 (같은 녹화의 /context 숫자)
| 단계 | 전체 | 메시지 칸 |
|---|---|---|
| 시작 | 29k | 10 |
| index.html 읽고 설명 | 49.3k | 19.7k |
| /compact 후 | 41.4k | 12.4k |
| /clear 후 | 29.1k | 130 |

## 핵심 정리 (공식 문서 확인)
| 명령 | 내용 | 근거 |
|---|---|---|
| `/context` | 사용량을 색 격자로 보여 주고, 불러온 CLAUDE.md·규칙은 Memory files | [commands](https://code.claude.com/docs/en/commands) |
| `/compact [지시]` | 대화를 요약해 자리를 만듦. 요약 자체가 큰 요청이고 `/clear`는 비용이 없음 | [costs](https://code.claude.com/docs/en/costs) |
| 자동 컴팩트 | 한도에 가까워지면 자동. `/autocompact [auto\|<토큰 수>]`로 기준을 정함(켜고 끄는 스위치가 아님) | commands, [model-config](https://code.claude.com/docs/en/model-config) |
| 컴팩트 후 남는 것 | 루트 CLAUDE.md·조건 없는 규칙·자동 메모리는 디스크에서 다시 읽음, 대화로만 한 지시는 요약에서 빠질 수 있음 | [context-window](https://code.claude.com/docs/en/context-window) |
| `/clear` | 빈 컨텍스트로 새 대화. 이전 대화는 `/resume`으로 | commands |
| `/rewind` (Esc Esc) | Restore code and conversation / conversation / code / Summarize… 파일 편집 도구로 바꾼 것만 되돌림 — "Checkpointing does not track files modified by Bash commands", Git을 대신하지 않음 | [checkpointing](https://code.claude.com/docs/en/checkpointing) |
| `/btw` | "The question and answer never enter the conversation history." 도구는 못 씀 | [interactive-mode](https://code.claude.com/docs/en/interactive-mode) |

촬영 메모: 처음 시험에서는 클로드가 파일을 셸 명령(python)으로 고쳐서 되돌리기 메뉴에 "No code changes"로 나왔습니다. 문서의 제한 그대로이므로, 녹화에서는 새 파일을 만드는 부탁(Write 도구)으로 되돌리기를 보였습니다.

## 연습 과제
1. 긴 파일을 읽힌 뒤 `/compact`와 `/clear`를 각각 해 보고 `/context` 숫자를 표로 적어 보세요.
2. 클로드가 셸 명령으로 파일을 바꾸게 한 뒤 `/rewind`를 열어 "No code changes"로 나오는지 보고, 그럴 때 `git checkout -- <파일>`로 되돌려 보세요.
