# 섹션 6 시작 상태

섹션 6은 섹션 5가 끝난 서울 라이브 3D에서 시작합니다.

```bash
git clone https://github.com/dante01yoon/seoul-live-3d.git
cd seoul-live-3d
git checkout -b sec06-mcp 9e43764   # 섹션 5 끝(main 병합 커밋)
npm install
```

- Node 23.6 이상(Node가 `.ts`를 빌드 없이 바로 실행). 녹화는 Node 24.
- 인증키가 없으면 서울 열린데이터광장 공개 `sample` 키를 씁니다(승하차 한 번에 5행, 도시데이터는 광화문·덕수궁만, 따릉이는 망원·합정 5곳만).
- 내 키는 셸에서 `export SEOUL_OPENAPI_KEY=...` 후 `claude`를 실행하세요. `.mcp.json`이나 저장소 파일에 키 값을 쓰지 마세요.
- 섹션 6이 끝난 상태: 브랜치 `sec06-mcp`(`0470eb4`), main 병합 `7bc358e`.
