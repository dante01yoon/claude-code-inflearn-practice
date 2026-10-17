# 섹션 12 · 90강 자주 받는 질문 정리 — Windows · 사용량 · 오류

## 이번 수업에서 할 것
- 막혔을 때 어디부터 볼지(설치 · 오류 · 동작) 공식 문서 지도를 만든다.
- Windows 설치, 사용량, 오류 메시지 세 가지 질문을 공식 문서로 정리한다. Windows 화면은 녹화하지 않고 문서와 그림으로만 보여 준다.
- `claude doctor`와 `/doctor`로 내 환경을 점검하고, 클로드의 짧은 답을 문서와 맞춰 본다.

촬영: VS Code 내장 터미널(code-server, macOS), Claude Code v2.1.299, 오토 모드, Opus 5.5, 2026-10-17. 앱 브랜치 `sec12-tips`. `claude doctor`·`/doctor` 화면의 요금제·조직 줄은 가림.

## 공식 문서로 확인한 것
| 내용 | 근거 |
|---|---|
| Windows: 네이티브 설치 또는 WSL 안 설치. 샌드박스는 WSL 2에서만 | [고급 설정 · Windows에서 설정](https://code.claude.com/docs/ko/setup) |
| 네이티브 Windows는 관리자 권한 없이 PowerShell(`irm https://claude.ai/install.ps1 \| iex`) 또는 CMD 설치 명령. Git for Windows가 있으면 Bash 도구가 Git Bash를, 없으면 PowerShell을 씀 | 같은 페이지 |
| PowerShell에 CMD 명령을 넣으면 `&&` 오류, CMD에 PowerShell 명령을 넣으면 `irm`을 모른다는 오류. 설치 뒤 `claude`를 못 찾으면 PATH — 새 터미널에서 다시 | [설치 문제 해결](https://code.claude.com/docs/ko/troubleshoot-install) |
| 구독 플랜 사용 한도에 닿으면 한도 메시지와 재설정 시각까지 대기. **529(과부하)는 사용 한도가 아니고 할당량에도 세지 않음** | [오류 참조](https://code.claude.com/docs/ko/errors) |
| **429**는 API 키·클라우드 프로젝트의 속도 제한 — 동시에 도는 요청 줄이기 | 같은 페이지 |
| 증상별 페이지 표, 확실하지 않으면 `/doctor`, 클로드 코드가 안 켜지면 셸에서 `claude doctor` | [문제 해결](https://code.claude.com/docs/ko/troubleshooting) |

## 입력한 것 (그대로)
```text
claude doctor
claude
/doctor                       ← 마지막 질문 창은 Esc로 닫음(아무것도 바꾸지 않음)
429 오류가 뜨면 뭘 해야 해? 짧게
/exit
```

## 화면에서 본 것
| 시점 | 본 것 |
|---|---|
| `claude doctor` | 설치 방식 native · 버전 2.1.299 · 검색 도구 정상 · 자동 업데이트는 녹화 환경에서 꺼 둠 · 설치 문제 없음 |
| `/doctor` (약 3분) | 프로젝트와 관계없는 스킬 설명이 늘 실린다, CLAUDE.md에서 코드로 알 수 있는 줄은 지워도 된다(89강의 늘 실리는 컨텍스트), 기록만 하는 `trace.py` 훅은 `"async": true`로 → 마지막에 적용할지 묻는 창, Esc로 닫음 |
| 429 질문 | 클로드의 짧은 답은 429를 "사용량 한도 오류"로 설명하며 둘을 섞음 → 문서 기준(429 = API 키·클라우드 속도 제한, 구독 한도는 별도 메시지)과 다름. **오류 이름과 대응은 오류 참조 페이지로 확인** |
