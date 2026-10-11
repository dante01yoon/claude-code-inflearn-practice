# 섹션 0-1 · 5강 터미널이 처음인 분을 위한 10분

## 이번 수업에서 입력한 것 (그대로, macOS zsh)

```text
pwd                # 지금 있는 폴더
ls                 # 폴더 안 목록
ls photos          # 다른 폴더 안 목록
cd photos          # 폴더로 들어가기
ls
cd ..              # 한 칸 위로
mkdir my-site      # 새 폴더 만들기
ls
cd my-site
pwd
cd ..
cat notes.txt      # 파일 내용 보기
cat to<Tab>        # Tab으로 이름 자동 완성 → cat todo.md
↑ ↑ Enter          # 위 화살표로 지난 명령 다시
clear              # 화면 지우기
```

## macOS · Windows 명령 비교

| 하고 싶은 일 | macOS·Linux (zsh·bash) | Windows PowerShell | Windows CMD |
|---|---|---|---|
| 지금 위치 | `pwd` | `pwd` (또는 `Get-Location`) | `cd` |
| 목록 보기 | `ls` | `ls` (또는 `dir`) | `dir` |
| 폴더 이동 | `cd 폴더` · `cd ..` | `cd 폴더` · `cd ..` | `cd 폴더` · `cd ..` |
| 폴더 만들기 | `mkdir 이름` | `mkdir 이름` | `mkdir 이름` |
| 파일 내용 | `cat 파일` | `cat 파일` (또는 `type`) | `type 파일` |
| 화면 지우기 | `clear` | `clear` (또는 `cls`) | `cls` |

Windows 화면은 녹화하지 않았습니다. PowerShell의 `ls`·`cat`·`pwd`·`clear`는 PowerShell 기본 별칭입니다.

## 터미널 여는 법 (공식 문서 terminal-guide)
- macOS: `Cmd + Space` → `Terminal` 입력 → Enter
- Windows: `Win + X` → **Windows PowerShell**(또는 **Terminal**). 줄 앞이 `PS C:\Users\이름>`이면 PowerShell, `PS` 없이 `C:\Users\이름>`이면 CMD
- 근거: [terminal-guide](https://code.claude.com/docs/en/terminal-guide)

## 연습 과제 정답

```text
mkdir dante          # 내 이름으로
cd dante
pwd                  # …/dante 로 끝나면 성공
cd ..
ls                   # 목록에 dante 가 보임
```
