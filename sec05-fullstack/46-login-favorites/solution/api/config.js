// Vercel 함수: /api/config. 로컬에서는 server.mjs가 같은 일을 한다.
// 로그인·즐겨찾기에 쓸 Supabase 주소와 publishable 키(브라우저에 공개하도록 만든 키, 권한은 RLS가 막는다)를 알려 준다.
// Vercel 환경 변수 SUPABASE_URL·SUPABASE_PUBLISHABLE_KEY. service_role 키는 절대 여기서 돌려주지 않는다.

export function GET() {
  const { SUPABASE_URL: supabaseUrl, SUPABASE_PUBLISHABLE_KEY: supabaseKey } = process.env;
  if (!supabaseUrl || !supabaseKey) return Response.json({ error: "로그인 DB가 설정되지 않았습니다" }, { status: 503 });
  return Response.json({ supabaseUrl, supabaseKey }, { headers: { "Cache-Control": "no-store" } });
}
