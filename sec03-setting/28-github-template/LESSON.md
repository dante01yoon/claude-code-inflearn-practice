# 섹션 3 · 28강 내 세팅을 GitHub 템플릿으로 — 클릭 한 번으로 새 프로젝트 시작

템플릿 저장소 = 쿠키 틀. 팀과 쓸 세팅만 넣고(CLAUDE.md · .claude/ · .mcp.json · .gitignore · README), 실습 파일과 개인 설정(settings.local.json)은 뺍니다.

만든 템플릿: **https://github.com/dante01yoon/claude-code-starter-setting** (Public template)

## 이번 수업에서 입력한 것 (그대로)

```text
claude          # my-setting 폴더에서
세팅만 골라서 ../claude-code-starter-setting 폴더에 새 프로젝트용 템플릿으로 만들어 줘. 실습 파일은 빼고, README에 쓰는 법 적어 줘
/exit
```

```bash
cd ../claude-code-starter-setting && ls -a && find .claude -type f | sort
git init -q -b main && git add -A && git commit -qm '나만의 클로드 코드 세팅 템플릿' && git log --oneline
gh repo create dante01yoon/claude-code-starter-setting --public --source . --push --description '클로드 코드 실전 — 새 프로젝트마다 쓰는 나만의 세팅 템플릿'
gh repo edit --template
gh repo view --json isTemplate,visibility,url     # isTemplate: true, PUBLIC
```

새 프로젝트 시작 — 내 저장소로 만들기 (GitHub 웹: **Use this template**, 또는):

```bash
gh repo create 내-프로젝트 --template dante01yoon/claude-code-starter-setting --clone
```

녹화에서는 계정에 저장소를 더 만들지 않으려고 같은 내용을 clone으로 받았습니다:

```bash
cd .. && git clone -q --depth 1 https://github.com/dante01yoon/claude-code-starter-setting seoul-live-3d && cd seoul-live-3d && rm -rf .git && ls -a
claude          # 폴더 믿기 → MCP 2개 승인 → 프롬프트 위 "스킬 2 · 에이전트 1 · 훅 3", 아래 상태 줄
/skills         # web-page, seoul-data (project)
```

## 공개 전 확인
- 비밀 키·토큰·개인 경로·이메일이 없는지 (`.env`는 .gitignore, 인증키는 각자 `.env`)
- 훅 스크립트 실행 권한(`chmod +x .claude/hooks/*.sh`), 새 폴더에서 실제로 동작하는지
- 여러 저장소·버전 관리가 필요하면 플러그인으로 묶기 (섹션 7)
- [GitHub Docs: Creating a template repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-template-repository) · [Share settings with your team](https://code.claude.com/docs/en/settings#share-settings-with-your-team)
