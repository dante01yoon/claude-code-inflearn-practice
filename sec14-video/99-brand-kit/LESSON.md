# 99강 · 브랜드 키트를 스킬로

## 실제로 쓴 프롬프트
① 브랜드 키트 만들기 (cat-video, 실제 실행 2분 33초)
```
이 프로젝트의 영상 코드(src/scenes, src/gallery)와 public/mooncat 에셋을 보고, 앞으로 같은 톤으로 영상을 만들 수 있게 브랜드 키트 스킬을 .claude/skills/mooncat-brand/SKILL.md로 만들어줘. 색, 글꼴, 글자 크기, 주인공 규칙, 화면 배치, 움직임 규칙, 하지 말 것을 넣어.
```
결과: [`../95-remotion/solution/cat-video/.claude/skills/mooncat-brand/SKILL.md`](../95-remotion/solution/cat-video/.claude/skills/mooncat-brand/SKILL.md) — 실제 코드의 색 코드·글꼴(Jua)·글자 크기·주인공 크기와 위치·움직임·금지 사항.

② 새 세션에서 쓰기 (3분 9초 → `out/menu.mp4`, 코드 `src/MenuVideo.tsx`)
```
mooncat-brand 스킬대로 「오늘의 메뉴」 10초 가로 영상을 만들어서 out/menu.mp4로 렌더해줘.
```

📏 주제 3개(오늘의 메뉴 · 새 손님 등장 · 이벤트 공지) × 스킬 있음/없음, 묶음을 가리고 "한 채널 시리즈처럼 보이나" 채점: 없음 4/10 → 브랜드 키트 9/10. 대신 같은 틀을 반복해 "첫 1초 무자막 · 끝 3~4초 정지"라는 약점도 같이 반복 → 브랜드 키트에 첫 프레임 규칙(98강)도 넣기.
