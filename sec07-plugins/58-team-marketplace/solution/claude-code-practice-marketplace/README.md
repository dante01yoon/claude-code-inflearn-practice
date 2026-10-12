# claude-code-practice-marketplace

팀에서 함께 쓰는 Claude Code 플러그인 마켓플레이스입니다.

## 플러그인

| 이름 | 설명 |
| --- | --- |
| [web-kit](plugins/web-kit) | 요구사항 체크리스트로 `index.html` 웹 페이지를 만들고(`web-page` 스킬), Playwright로 데스크톱·모바일 화면을 확인(`screen-checker` 에이전트) |

## 설치

Claude Code에서:

```
/plugin marketplace add dante01yoon/claude-code-practice-marketplace
/plugin install web-kit@claude-code-practice-marketplace
```

## 팀 프로젝트에 자동 등록

프로젝트의 `.claude/settings.json`에 아래를 넣으면, 팀원이 그 폴더를 신뢰할 때 마켓플레이스 추가와 플러그인 설치를 안내받습니다.

```json
{
  "extraKnownMarketplaces": {
    "claude-code-practice-marketplace": {
      "source": {
        "source": "github",
        "repo": "dante01yoon/claude-code-practice-marketplace"
      }
    }
  },
  "enabledPlugins": {
    "web-kit@claude-code-practice-marketplace": true
  }
}
```

## 업데이트

```
/plugin marketplace update claude-code-practice-marketplace
```

## web-kit 요구 사항

- Node.js (`npx`로 `@playwright/mcp`를 실행)
- 인터넷 연결 (context7 MCP 사용)
