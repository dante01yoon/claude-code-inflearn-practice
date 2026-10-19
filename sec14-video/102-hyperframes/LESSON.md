# 102강 · HyperFrames로 같은 영상

```bash
npx hyperframes init hf-video --example blank --non-interactive   # 처음이면 y. 공식 스킬 11개가 ~/.claude/skills(사용자 폴더)에 설치됨
cd hf-video
mkdir -p assets && cp -R ../mooncat-assets assets/mooncat
claude
```

## 실제로 쓴 프롬프트 (95강과 에셋 위치 한 단어만 다름)
```
고양이 에셋으로 10초짜리 가로 영상을 만들어줘. 에셋은 assets/mooncat에 있고 주인공은 003 등불가게 검은 고양이야. 다 되면 out/first.mp4로 렌더해줘.
```
실제 실행 8분 13초(Remotion 첫 영상 5분 42초) → `out/first.mp4`. 장면 2개, `npm run check` 통과, Studio 미리보기(`npm run dev`)로 바로 고치기 가능. 결과 프로젝트 [solution/hf-video](solution/hf-video/)(에셋 제외).

📏 같은 데이터 영상 요청 3번씩(가리고 60점): Remotion + 공식 스킬 47.0 / HyperFrames + 공식 스킬 42.7 (빈 프로젝트·한 줄 요청 조건).
고르기: React·데이터·복잡한 움직임 → Remotion / HTML로 다루기·미리보기에서 바로 고치기·HTML 디자인 틀 → HyperFrames.

프롬프트 원문(복사용): [PROMPTS.md](PROMPTS.md)
