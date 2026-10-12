// Vercel 함수: /api/citydata. 로컬에서는 server.mjs가 같은 일을 한다.
// 인증키는 Vercel 환경 변수 SEOUL_OPENAPI_KEY(일반 인증키)에서 읽는다. 없으면 공개 sample 키(광화문·덕수궁 1곳).
// 장소 코드를 읽는 영역 zip은 vercel.json의 includeFiles로 함수에 함께 올린다.

import { CITYDATA_CACHE_MS, createCitydataSource } from "../realtime-citydata.mjs";

const { citydata } = createCitydataSource(process.env.SEOUL_OPENAPI_KEY);

export async function GET() {
  return Response.json(await citydata(), {
    headers: {
      "Cache-Control": "no-store",
      // 함수 인스턴스가 여러 개여도 121곳을 다시 묻지 않게 Vercel CDN에서 같은 간격으로 캐시한다.
      "Vercel-CDN-Cache-Control": `max-age=${CITYDATA_CACHE_MS / 1000}`,
    },
  });
}
