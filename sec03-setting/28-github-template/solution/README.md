# Claude Code 스타터 세팅

새 프로젝트를 시작할 때 복사해 쓰는 클로드 코드 설정 템플릿입니다.
규칙(CLAUDE.md), MCP 서버, 훅, 서브에이전트, 스킬이 들어 있습니다.

## 쓰는 법

### 1. 새 프로젝트로 복사

```bash
cp -R claude-code-starter-setting 새-프로젝트-이름
cd 새-프로젝트-이름
git init            # 필요하면
```

이미 있는 프로젝트에 넣으려면 숨김 파일까지 복사합니다.

```bash
cp -R claude-code-starter-setting/. 기존-프로젝트/
```

> 기존 프로젝트에 `CLAUDE.md`, `.gitignore`, `.claude/settings.json`이 이미 있으면 덮어쓰이니, 먼저 내용을 합쳐 주세요.

### 2. 필요한 도구

| 도구            | 쓰는 곳                     | 설치 (macOS)        |
| --------------- | --------------------------- | ------------------- |
| `jq`            | 훅, 상태줄                  | `brew install jq`   |
| Node.js (`npx`) | Playwright MCP, Prettier 훅 | `brew install node` |
| Python 3        | `/seoul-data` 스킬          | 대부분 기본 설치    |

훅 스크립트에 실행 권한이 없다면 `chmod +x .claude/hooks/*.sh`를 한 번 실행합니다.

### 3. 클로드 코드 실행

```bash
claude
```

처음 열면 `.mcp.json`의 MCP 서버(context7, playwright)를 쓸지 묻습니다. 승인하면 그 선택은 `.claude/settings.local.json`에 저장됩니다(개인 설정이라 git에 올라가지 않습니다).

### 4. 프로젝트에 맞게 고치기

- `CLAUDE.md`: 프로젝트 규칙을 더하거나, 맞지 않는 줄을 지웁니다.
- 안 쓰는 스킬 폴더(예: `.claude/skills/seoul-data`)는 지워도 됩니다.

## 들어 있는 것

```
CLAUDE.md                     # 항상 지킬 규칙 (한국어 답변, index.html 한 파일, 모바일 대응, data/ 원본 보호 등)
.mcp.json                     # MCP 서버: context7(라이브러리 문서), playwright(브라우저 확인)
.gitignore                    # 개인 설정, .env, Playwright 결과물 등 제외
.claude/
  settings.json               # 훅 + 상태줄
  hooks/
    block-dangerous.sh        # rm -rf 실행, .env 읽기를 막음 (.env.example은 허용)
    confirm-model-switch.sh   # 모델을 바꾸기 전에 예상 비용을 보여 주고 확인
  agents/
    reviewer.md               # 읽기 전용 코드 리뷰 에이전트 (sonnet)
  skills/
    web-page/                 # /web-page — 요구사항 목록으로 index.html 만들고 화면 확인
    seoul-data/               # /seoul-data — 서울 열린데이터광장 API 데이터 받기
    project-counts/           # 프롬프트 위에 스킬·에이전트·훅 개수 표시 (mod)
```

### 훅 (`.claude/settings.json`)

| 언제                   | 하는 일                                                |
| ---------------------- | ------------------------------------------------------ |
| Bash·Read·Grep 실행 전 | `block-dangerous.sh`로 위험한 명령·비밀 파일 접근 차단 |
| 모델 변경 전           | `confirm-model-switch.sh`로 비용 안내 후 확인          |
| 파일 쓰기·수정 후      | Prettier로 자동 포맷                                   |

상태줄에는 `모델 | 폴더 | Context: n%`가 표시됩니다.

### 스킬 사용 예

```
/web-page
- 이름: 동네 빵집
- 내용: 메뉴와 가격, 영업시간
- 동작: 장바구니에 담으면 합계 표시
- 모바일: 한 줄에 메뉴 하나
```

```
/seoul-data 지하철 시간대별 승하차 202607 --station 서울역
```

`/seoul-data`는 인증키가 없으면 샘플 키(5건)로 받습니다. 전부 받으려면 data.seoul.go.kr에서 인증키를 발급받아 프로젝트 `.env`에 `SEOUL_API_KEY=발급받은키`를 넣습니다.

리뷰가 필요하면 "reviewer 에이전트로 리뷰해 줘"라고 말하면 됩니다.

## 참고

- `/web-page`는 확인 단계에서 `screen-checker` 에이전트를 찾고, 없으면 Playwright MCP로 직접 확인합니다.
- 개인용 설정은 `.claude/settings.local.json`, 개인용 규칙은 `CLAUDE.local.md`에 두세요. 둘 다 git에서 제외됩니다.
