---
description: 붙여 넣은 공지 페이지를 index.html로 저장하며 다크 모드(시스템 설정 + 토글 저장)를 넣는지 본다
tags: [dark-mode]
runs: 3
max_turns: 40
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill, Agent, TodoWrite, Write, Edit]
---

도서관 공지 예시 페이지인데 다크 모드 좀 넣어 줘. 아래 코드를 index.html로 저장해서 작업해 줘.
휴대폰 시스템 설정이 다크면 처음부터 어둡게 나오고, 버튼으로도 바꿀 수 있으면 좋겠어. 바꾼 건 새로고침해도 유지돼야 해.

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>도서관 공지 (예시)</title>
  <style>
    body { margin: 0; font-family: sans-serif; background: #ffffff; color: #222222; }
    header { background: #f4f1ea; border-bottom: 1px solid #dddddd; padding: 16px; }
    h1 { margin: 0; font-size: 1.4rem; color: #3a5a40; }
    main { max-width: 640px; margin: 0 auto; padding: 16px; }
    .card { background: #fafafa; border: 1px solid #e0e0e0; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; }
    .date { color: #777777; font-size: 0.9rem; }
    a { color: #1a5fb4; }
  </style>
</head>
<body>
  <header><h1>도서관 공지 (예시)</h1></header>
  <main>
    <div class="card">
      <p class="date">2026-10-05</p>
      <p>10월 9일 한글날은 휴관합니다.</p>
    </div>
    <div class="card">
      <p class="date">2026-10-01</p>
      <p>가을 독서 모임 신청을 <a href="#">여기</a>에서 받습니다.</p>
    </div>
  </main>
</body>
</html>
```
