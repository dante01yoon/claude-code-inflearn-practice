# 섹션 0-1 · 6강 설치와 로그인 — 자주 막히는 문제까지

## 이번 수업에서 입력한 것 (그대로, macOS)

```text
curl -fsSL https://claude.ai/install.sh | bash
claude --version                                   # → command not found: claude (PATH에 아직 없음)
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
claude --version                                   # → 버전 번호가 나오면 설치 성공
claude doctor                                      # 설치 상태 점검
claude                                             # 첫 실행 → 화면 테마 → 로그인 방법 고르기
```

녹화는 기존 설치를 건드리지 않도록 빈 홈 폴더(새 컴퓨터와 같은 상태)에서 했고, 로그인은 계정 정보가 나와서 녹화하지 않았습니다.

## 설치 명령 (공식 문서)

| 환경 | 명령 |
|---|---|
| macOS · Linux · WSL | `curl -fsSL https://claude.ai/install.sh \| bash` |
| Windows PowerShell | `irm https://claude.ai/install.ps1 \| iex` |
| Windows CMD | `curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd` |
| Homebrew | `brew install --cask claude-code` (자동 업데이트 안 됨) |
| WinGet | `winget install Anthropic.ClaudeCode` (자동 업데이트 안 됨) |

- Windows: [Git for Windows](https://git-scm.com/downloads/win)는 선택. 있으면 Git Bash, 없으면 PowerShell로 명령을 실행합니다. 관리자 권한은 필요 없습니다.
- 근거: [setup](https://code.claude.com/docs/en/setup), [terminal-guide](https://code.claude.com/docs/en/terminal-guide)

## 자주 막히는 문제

| 보이는 글자 | 원인 · 해결 |
|---|---|
| `command not found: claude` (macOS·Linux) | 설치 폴더가 PATH에 없음 → zsh: `echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc` 후 `source ~/.zshrc`, bash(Linux): `~/.bashrc` |
| `'claude' is not recognized` (Windows) | PowerShell에서 `$currentPath = [Environment]::GetEnvironmentVariable('PATH', 'User')` → `[Environment]::SetEnvironmentVariable('PATH', "$currentPath;$env:USERPROFILE\.local\bin", 'User')` 후 PowerShell 새로 열기 |
| `'irm' is not recognized` | CMD에서 PowerShell 명령을 입력함 → PowerShell을 열거나 CMD용 명령 사용 |
| `The token '&&' is not a valid statement separator` | PowerShell에서 CMD 명령을 입력함 |
| `syntax error near unexpected token '<'` | 설치 주소가 웹 페이지를 돌려줌 → 다시 시도, 계속되면 Homebrew로 |

근거: [troubleshoot-install](https://code.claude.com/docs/en/troubleshoot-install)

## 로그인
`claude`를 처음 실행하면 화면 테마 → 로그인 방법(구독 계정 / Console API / 다른 플랫폼)을 고르고, 브라우저에서 로그인한 뒤 돌아오면 끝납니다. 무료 플랜에는 클로드 코드가 없습니다. 근거: [setup#authenticate](https://code.claude.com/docs/en/setup#authenticate)
