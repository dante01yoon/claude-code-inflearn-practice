---
name: dark-mode
description: 이미 있는 웹 페이지(기본 index.html)에 다크 모드를 넣는다. 색을 CSS 변수로 바꾸고, 시스템 설정(prefers-color-scheme)을 따르며, 토글 버튼으로 바꾼 선택을 localStorage에 저장한다. 사용자가 페이지에 다크 모드·야간 모드·어두운 테마를 넣어 달라고 할 때 쓴다.
argument-hint: "[파일 경로 (기본 index.html)]"
---

# /dark-mode — 웹 페이지에 다크 모드 넣기

대상 파일:

$ARGUMENTS

(위가 비어 있으면 대화에서 말한 파일, 그것도 없으면 현재 폴더의 `index.html`을 쓴다.)

## 1. 대상 파일 읽기

- 대상 파일을 먼저 끝까지 읽는다. 파일이 없고 사용자가 페이지 코드를 대화에 붙여 넣었으면 그 코드를 대상 파일로 저장한 뒤 시작한다. 둘 다 없으면 어떤 파일에 넣을지 묻고 멈춘다. 새 페이지를 만들어 달라는 요청이면 `starter-setting:web-page` 스킬을 쓴다.
- 이미 다크 모드 코드(`prefers-color-scheme`, `data-theme` 등)가 있으면 새로 덧붙이지 말고 그 방식을 고쳐 아래 기준에 맞춘다.
- 페이지에 쓰인 색(배경, 글자, 테두리, 카드·버튼 배경, 그림자)을 모두 찾아 목록으로 정리한다.

## 2. 색을 CSS 변수로 바꾸기

- `:root`에 라이트 색 변수(`--bg`, `--text`, `--surface`, `--border`, `--accent` 등 페이지에 필요한 만큼)를 정의하고, 1단계에서 찾은 색을 모두 변수로 바꾼다. 인라인 `style`의 색도 바꾼다.
- 다크 색은 두 곳에 같은 값으로 정의한다.
  - `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { … } }` — 사용자가 고르지 않았으면 시스템 설정을 따른다.
  - `:root[data-theme="dark"] { … }` — 사용자가 다크를 골랐을 때.
- 다크 배경은 순수한 검정(`#000`) 대신 짙은 회색(예: `#121212`~`#1e1e1e`)을 쓰고, 글자와 배경의 대비는 4.5:1 이상으로 맞춘다.
- `:root`에 `color-scheme: light dark;`를 넣어 스크롤바·입력창도 따라 바뀌게 한다.

## 3. 토글 버튼

- 머리글 등 눈에 띄는 곳에 버튼을 하나 둔다. 아이콘(🌙/☀️ 등)만 있으면 `aria-label`을 달고, 지금 상태를 `aria-pressed`로 알린다.
- 누르면 `<html>`의 `data-theme`을 `dark` ↔ `light`로 바꾸고 `localStorage`(키: `theme`)에 저장한다.
- 페이지가 그려지기 전에 저장된 값을 적용하는 짧은 스크립트를 `<head>` 안, CSS보다 앞에 둔다. 그래야 새로고침할 때 밝은 화면이 번쩍이지 않는다. `localStorage` 접근은 `try/catch`로 감싼다.

```html
<script>
  try {
    const t = localStorage.getItem("theme");
    if (t === "dark" || t === "light") document.documentElement.dataset.theme = t;
  } catch (e) {}
</script>
```

- 색이 바뀔 때 `transition`을 쓰려면 `prefers-reduced-motion: reduce`에서는 끈다.

## 4. 확인

`starter-setting:screen-checker` 서브에이전트에게 다음을 맡긴다. 쓸 수 없으면 Playwright MCP로 직접 한다.

- 데스크톱 너비와 375px 너비에서 라이트·다크 두 상태 스크린샷을 찍는다 (`colorScheme: "dark"`로 열기 + 토글 눌러 보기).
- 토글을 누른 뒤 새로고침해도 고른 테마가 남는지 본다.
- 다크에서 안 보이는 글자, 바뀌지 않은 흰 배경, 원래 기능이 깨진 곳만 요약해 돌려 달라고 한다.

문제가 나오면 고치고 한 번 더 확인한다.

## 5. 보고

한국어로 짧게 알려 준다.

- 바꾼 색 변수 목록 (라이트 → 다크 값)
- 토글 위치와 저장 방식
- 확인에서 발견하고 고친 문제, 남은 문제 (확인하지 못했으면 그 이유)
