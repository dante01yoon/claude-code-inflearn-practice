# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## data 폴더 규칙
- 이 폴더의 데이터 파일은 서울 열린데이터광장 API에서 받은 원본이다. 내용을 고치거나 다시 포맷하거나 덮어쓰지 않는다. 값 하나, 들여쓰기, 키 순서도 그대로 둔다.
- 데이터를 가공해야 하면 원본은 두고 `index.html`이나 `scripts/`의 코드에서 읽을 때 처리한다.
- 새 달의 데이터는 기존 파일을 바꾸지 말고 새 파일(예: `subway-hourly-202608.json`)로 추가한다. 받은 주소와 출처는 루트 `README.md`에 적는다.
