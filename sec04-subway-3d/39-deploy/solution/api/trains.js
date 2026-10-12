// Vercel 함수: /api/trains. 로컬에서는 server.mjs가 같은 일을 한다.
// 인증키는 Vercel 환경 변수 SEOUL_REALTIME_KEY에서 읽는다. 없으면 공개 sample 키(노선마다 5대).

import { CACHE_MS, createTrainsSource } from "../realtime-trains.mjs";

const { trains } = createTrainsSource(process.env.SEOUL_REALTIME_KEY);

export async function GET() {
  return Response.json(await trains(), {
    headers: {
      "Cache-Control": "no-store",
      // 함수 인스턴스가 여러 개여도 API 호출이 늘지 않게 Vercel CDN에서 같은 간격으로 캐시한다.
      "Vercel-CDN-Cache-Control": `max-age=${CACHE_MS / 1000}`,
    },
  });
}
