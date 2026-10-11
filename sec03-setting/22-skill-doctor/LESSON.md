# 섹션 3 · 22강 🆕 /skill-doctor — 스킬별 컨텍스트 비용과 사용 빈도 보고 정리

스킬은 설명 한 줄만으로도 **매 요청마다** 컨텍스트를 씁니다. 스킬 목록 한도는 컨텍스트 창의 1%, 설명 하나는 1,536자까지이고, 넘치면 덜 쓴 스킬부터 설명이 빠집니다.
`/skill-doctor`(v2.1.252 이상, 사용 기록 기능 필요)로 비용과 사용 횟수를 보고, `/skills`에서 안 쓰는 스킬을 끕니다.

## 이번 수업에서 입력한 것 (그대로)

```text
claude
/skill-doctor          # /plugin 화면의 Stats 탭이 열림
Esc
/context               # Skills 줄 확인 (정리 전)
/skills
t                      # 토큰 많은 순 정렬
Space ×3               # docs → name-only → user-only → off
↓ Space ×3             # pptx
↓↓ Space ×3            # xlsx
↓↓ Space ×3            # docx
Esc                    # 저장: Updated 4 skill overrides
/context               # Skills 줄 확인 (정리 후)
/exit
cat .claude/settings.local.json
```

`/skill-doctor` 열: `context`(매 턴 차지하는 토큰) · `7d tokens`(최근 7일 이 스킬 몫 토큰) · `uses` · `last used`. 동기화 스킬 13개는 모두 0× never, `seoul-data`(< 20 토큰, 2×) · `web-page`(약 50 토큰, 4×).

## 📏 직접 재 본 결과 (2026-10-11, Claude Code v2.1.296, Opus 5.5 · 1M)

| | 스킬 수 | /context Skills 토큰 |
|---|---:|---:|
| 정리 전 | 33 | 6,000 |
| 정리 후 (docs·pptx·xlsx·docx 끔) | 29 | 4,700 |
| 차이 | −4 | −1,300 (매 요청마다) |

33개에는 클로드 코드 기본 스킬 18개가 포함. 숫자는 설치된 스킬·계정에 따라 다릅니다.

저장 위치 (나만 쓰는 로컬 설정, git에 안 올림):

```json
"skillOverrides": {
  "anthropic-skills:docs": "off",
  "anthropic-skills:pptx": "off",
  "anthropic-skills:xlsx": "off",
  "anthropic-skills:docx": "off"
}
```

| 값 | 클로드에게 | / 메뉴 |
|---|---|---|
| `on` (기본) | 이름+설명 | 보임 |
| `name-only` | 이름만 | 보임 |
| `user-invocable-only` | 안 보임 | 보임 |
| `off` | 안 보임 | 안 보임 |

- 직접 만든 스킬은 프론트매터 `disable-model-invocation: true`로도 목록에서 뺄 수 있음 · 플러그인 스킬은 `/plugin` · 기본 스킬 전체는 `disableBundledSkills`
- 동기화 스킬은 지워도 다시 내려받으니 **끄기**
- [Find unused skills](https://code.claude.com/docs/en/skills#find-unused-skills) · [skillOverrides](https://code.claude.com/docs/en/skills#override-skill-visibility-from-settings)

## 연습 과제
`/skill-doctor`에서 never인 스킬 하나를 `name-only`로 바꾸고 `/context` Skills 줄 변화 확인
