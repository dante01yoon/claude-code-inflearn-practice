// Vercel 함수: /api/crowd-history?code=POI009. 로컬에서는 server.mjs가 같은 일을 한다.
// Supabase에 쌓인 장소별 붐빔 기록(최근 24시간)을 읽는다. Vercel 환경 변수 SUPABASE_URL·SUPABASE_PUBLISHABLE_KEY(읽기 전용 공개 키).

import { createCrowdHistory, isPlaceCode } from "../citydata-store.mjs";
import { DB_DOWN_MESSAGE, isDbUnavailable } from "../db-status.mjs";

const crowd = createCrowdHistory({ url: process.env.SUPABASE_URL, key: process.env.SUPABASE_PUBLISHABLE_KEY });

export async function GET(request) {
  const code = new URL(request.url).searchParams.get("code");
  if (!crowd.configured) return Response.json({ error: "붐빔 기록 DB가 설정되지 않았습니다" }, { status: 503 });
  if (!isPlaceCode(code)) return Response.json({ error: "장소 코드가 아닙니다" }, { status: 400 });
  try {
    return Response.json(await crowd.history(code), {
      headers: { "Cache-Control": "no-store", "Vercel-CDN-Cache-Control": "max-age=60" },
    });
  } catch (err) {
    if (!isDbUnavailable(err)) throw err;
    console.warn(`붐빔 기록 DB 연결 안 됨(error): ${err.message}`);
    return Response.json({ error: DB_DOWN_MESSAGE, retry: true }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
