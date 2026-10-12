# 섹션 5 · 44강 Supabase MCP로 테이블 설계·마이그레이션

## 개념
- Supabase MCP를 꽂으면 도구 11개(list_tables, list_migrations, apply_migration, execute_sql, get_advisors, search_docs …).
- 로컬 CLI 스택은 `http://127.0.0.1:<API 포트>/mcp`를 계정·토큰 없이 제공(공식 문서: 로컬은 localhost:54321/mcp, 이 저장소는 54421). 실제 서비스 DB에는 붙이지 말 것.
- 마이그레이션 = DB 변경 기록(SQL 파일, 시각 순서). MCP로 적용한 것과 같은 SQL을 저장소 파일로 남겨야 다른 컴퓨터에서도 같은 DB.

## 입력한 것 (그대로)
```bash
claude mcp add --scope project --transport http supabase http://127.0.0.1:54421/mcp
cat .mcp.json
claude    # "New MCP server found" → 기본 선택이 'Continue without'이므로 위로 올려 'Use this MCP server'
/mcp      # supabase ✔ 11 tools
```
```text
supabase mcp로 장소, 붐빔 기록, 즐겨찾기 테이블 설계해서 마이그레이션까지 만들어 줘
커밋해 줘
```
→ MCP 호출: list_tables → list_migrations → apply_migration → get_advisors(보안·성능) → execute_sql(RLS 시험, 롤백) → 같은 SQL을 `supabase/migrations/20261012052819_create_places_crowd_favorites.sql`로. 커밋 `6afb9c5`.
- places(code PK) · crowd_snapshots(place_code, observed_at, 혼잡도, 인구 범위, unique(place_code, observed_at)) · favorites((user_id, place_code), user_id 기본값 auth.uid())
- RLS: places·snapshots 누구나 읽기·쓰기는 서버만 / favorites 본인 줄만

## 근거
- [Supabase MCP server](https://supabase.com/docs/guides/getting-started/mcp)

---
앱 저장소: [https://github.com/dante01yoon/seoul-live-3d](https://github.com/dante01yoon/seoul-live-3d) (섹션 5 = 브랜치 `sec05-crowd`, main 병합 `9e43764`). `solution/`에는 이 수업에서 바뀌거나 생긴 파일만 있습니다.
