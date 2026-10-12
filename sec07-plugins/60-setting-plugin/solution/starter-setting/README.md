# starter-setting

새 프로젝트를 시작할 때 쓰던 클로드 코드 스타터 세팅(`plugins-lab/my-setting`)을 플러그인으로 묶은 것입니다.
설치하면 스킬·에이전트·훅·MCP·프롬프트 위 개수 표시가 바로 켜지고, 플러그인이 줄 수 없는 프로젝트 파일은 `/starter-setting:setup`으로 넣습니다.

## 설치

```
/plugin install starter-setting --marketplace dante01yoon/claude-code-practice-marketplace
```

설치한 뒤 프로젝트 폴더에서 `/starter-setting:setup`을 한 번 실행합니다.

## 들어 있는 것

```
.mcp.json                     # context7(라이브러리 문서), playwright(브라우저 확인)
agents/
  reviewer.md                 # 읽기 전용 코드 리뷰 에이전트 (sonnet)
  screen-checker.md           # Playwright로 데스크톱·375px 화면 확인 (sonnet)
skills/
  web-page/                   # /starter-setting:web-page — 요구사항 목록으로 index.html 만들고 화면 확인
  seoul-data/                 # /starter-setting:seoul-data — 서울 열린데이터광장 API 데이터 받기
  setup/                      # /starter-setting:setup — CLAUDE.md, .gitignore, 상태줄·권한을 프로젝트에 넣기
hooks/
  hooks.json                  # 아래 명령 훅 + register.tsx 모듈
  register.tsx                # 프롬프트 위에 "스킬 n · 에이전트 n · 훅 n" 표시 (프로젝트 .claude 기준)
scripts/
  block-dangerous.sh          # rm -rf 실행, .env 읽기를 막음 (.env.example은 허용)
  confirm-model-switch.sh     # 모델을 바꾸기 전에 예상 비용을 보여 주고 확인
templates/                    # setup 스킬이 프로젝트에 넣는 파일
  CLAUDE.md  gitignore  settings.json
```

### 훅

| 언제                   | 하는 일                                                |
| ---------------------- | ------------------------------------------------------ |
| Bash·Read·Grep 실행 전 | `block-dangerous.sh`로 위험한 명령·비밀 파일 접근 차단 |
| 모델 변경 전           | `confirm-model-switch.sh`로 비용 안내 후 확인          |
| 파일 쓰기·수정 후      | Prettier로 자동 포맷                                   |

## 원래 세팅과 다른 점

- 스킬은 플러그인 이름이 붙습니다: `/starter-setting:web-page`, `/starter-setting:seoul-data`.
- `CLAUDE.md`, `.gitignore`, 상태줄, `Edit(/data/**)` 금지 권한은 플러그인이 직접 켤 수 없어 `/starter-setting:setup`이 프로젝트에 넣습니다.
- 개수 표시는 프로젝트 `.claude/` 폴더의 스킬·에이전트·훅만 셉니다. 플러그인이 주는 것은 세지 않습니다.

## 필요한 도구

| 도구            | 쓰는 곳                     | 설치 (macOS)        |
| --------------- | --------------------------- | ------------------- |
| `jq`            | 훅, 상태줄                  | `brew install jq`   |
| Node.js (`npx`) | Playwright MCP, Prettier 훅 | `brew install node` |
| Python 3        | `seoul-data` 스킬           | 대부분 기본 설치    |

`/starter-setting:seoul-data`는 인증키가 없으면 샘플 키(5건)로 받습니다. 전부 받으려면 data.seoul.go.kr에서 인증키를 받아 프로젝트 `.env`에 `SEOUL_API_KEY=발급받은키`를 넣습니다.
