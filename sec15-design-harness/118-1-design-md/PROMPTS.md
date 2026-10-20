# 📏 DESIGN.md와 디자인 하네스 — 디자인을 안 했다면 이걸 써야 할까 · 실제로 쓴 프롬프트

수업 영상에서 그대로 입력한 원문입니다. 순서대로 입력했어요.

## 1
```text
tokens.json이랑 components, copy로 DESIGN.md를 만들어 주는 npm run design-md를 추가해줘. 공식 design.md lint를 통과해야 하고, export한 dtcg 값이 tokens.json과 같은지 확인하는 테스트도 넣어줘
```

## 2
```text
handoff 단계 check에도 DESIGN.md 검사를 넣어줘
```

## 3
```text
웹 화면 HTML을 tokens.json과 대조하는 검사도 만들어줘. 토큰 밖 색, 스케일 밖 글자 크기, 44px 미만 버튼, 금지 문구
```

## 4
```text
DESIGN.md 보고 따릉이 대여소 목록 웹 화면을 index.html 하나로 만들어줘
```

## 5
```text
DESIGN.md 보고 따릉이 대여소 목록 웹 화면을 index.html 하나로 만들어줘
```

## 직접 실행한 명령
```bash
npx --yes @google/design.md@0.4.0 --help | head -20
npm run design-md
npm run check
npm run lint:web -- ../web-a/index.html ../web-b/index.html
(cd .. && python3 -m http.server 19495 > /dev/null 2>&1 &)
npm run lint:web -- 'http://127.0.0.1:19495/web-a/index.html?state=loading' 'http://127.0.0.1:19495/web-a/index.html?state=empty' 'http://127.0.0.1:19495/web-a/index.html?state=error'
```
