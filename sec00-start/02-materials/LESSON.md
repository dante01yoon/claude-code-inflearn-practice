# 섹션 0 · 2강 실습 자료·정답 저장소, 버전 기준과 업데이트

## 이번 수업에서 입력한 것 (그대로)

```text
git clone https://github.com/dante01yoon/claude-code-inflearn-practice.git
cd claude-code-inflearn-practice
ls
ls sec00-1-basics
git pull                 # 강의 자료가 바뀌었을 때 최신으로 받기
claude --version         # 내 클로드 코드 버전 확인
```

## 저장소 구조

```text
secNN-섹션이름/NN-수업이름/
  LESSON.md   입력한 명령·프롬프트 원문(짧은 버전·자세한 버전), 공식 문서 링크
  start/      수업을 시작할 때의 폴더 상태
  solution/   녹화가 끝났을 때의 폴더 상태(정답)
```

- 클로드 코드의 결과는 같은 프롬프트라도 매번 조금씩 다릅니다. 내 결과가 영상과 다르면 `solution/`에서 이어 가면 됩니다.
- git을 쓰지 않는다면 GitHub 저장소 화면의 **Code → Download ZIP**으로 받아도 됩니다.

## 버전 기준과 업데이트

| 항목 | 내용 | 근거 |
|---|---|---|
| 촬영 기준 | Claude Code v2.1.296 (2026-10) | `claude --version` |
| 자동 업데이트 | 공식 설치 프로그램(native)으로 설치하면 백그라운드에서 자동 업데이트. 다음 실행부터 적용 | [setup#auto-updates](https://code.claude.com/docs/en/setup#auto-updates) |
| 바로 업데이트 | `claude update` | [setup#update-manually](https://code.claude.com/docs/en/setup#update-manually) |
| Homebrew·WinGet 설치 | 자동 업데이트 안 됨 → `brew upgrade claude-code`, `winget upgrade Anthropic.ClaudeCode` | [setup#update-claude-code](https://code.claude.com/docs/en/setup#update-claude-code) |
| 업데이트 채널 | `latest`(기본, 바로) / `stable`(약 1주 늦게, 큰 문제 있는 버전 건너뜀) | [setup#configure-release-channel](https://code.claude.com/docs/en/setup#configure-release-channel) |

화면이 영상과 조금 달라도(메뉴 이름·문구) 흐름은 같습니다. 크게 바뀐 기능은 이 저장소와 강의 수업 노트에 업데이트 내용을 적어 둡니다.
