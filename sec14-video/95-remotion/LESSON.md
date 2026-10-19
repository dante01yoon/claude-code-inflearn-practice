# 95강 · Remotion 설치와 공식 스킬 — 한 줄로 첫 영상

시작: 이 저장소의 [`sec14-video/start`](../start/) 안의 `mooncat-assets`·`seoul-data` 두 폴더를 작업 폴더에 두고, 그 작업 폴더에서 아래를 실행합니다.

```bash
npx create-video --yes --blank cat-video   # 처음이면 "Ok to proceed? (y)" → y
cd cat-video
npx remotion skills add                    # Remotion 공식 스킬 12개
npx skills add LottieFiles/motion-design-skill -y   # 움직임 원칙 스킬
ls .claude/skills
cp -R ../mooncat-assets public/mooncat
claude
```

## 실제로 쓴 프롬프트
```
고양이 에셋으로 10초짜리 가로 영상을 만들어줘. 에셋은 public/mooncat에 있고 주인공은 003 등불가게 검은 고양이야. 다 되면 out/first.mp4로 렌더해줘.
```
실제 실행 5분 42초 → `out/first.mp4`(1920×1080, 10초). 클로드 보고: 세 장면 + 0.5초 크로스페이드, "완성된 mp4를 처음부터 끝까지 재생해 보지는 않았다" → 크로스페이드 구간이 흐릿하게 겹침(97강 자체 검수 소재).

## 📏 스킬 유무 (같은 데이터 영상 요청 · 3번씩 · 가리고 60점)
| 조건 | 점수 | 평균 | 회당 비용(정가) |
|---|---|---|---|
| 스킬 없음 | 41 · 46 · 47 | 44.7 | $1.04 |
| 공식 스킬 + 모션 원칙 | 45 · 47 · 49 | 47.0 | $0.94 |

공식 문서: https://www.remotion.dev/docs/ai/claude-code (2026-10-18 확인)

프롬프트 원문(복사용): [PROMPTS.md](PROMPTS.md)
