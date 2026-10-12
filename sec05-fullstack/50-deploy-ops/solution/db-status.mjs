// DB(Supabase)가 꺼졌거나 닿지 않는 경우를 알아보고, 화면에 보일 안내 문구를 만든다.
// 서버(citydata-store.mjs → server.mjs, api/crowd-history.js)와 브라우저(subway.html, admin.html)가 함께 쓴다.
// DB 컨테이너만 꺼지면 PostgREST는 503(PGRST000–003)을, Auth는 500을 돌려준다. 게이트웨이(Kong)까지 꺼지면 fetch가 실패한다.

export const DB_DOWN_MESSAGE = "지금 DB에 연결할 수 없습니다. 잠시 뒤 다시 시도해 주세요.";

// DB 환경 변수가 아예 없는 배포(예: Supabase를 아직 붙이지 않은 Vercel 미리보기)에서 쓰는 안내.
// 서버는 503 { error, disabled: true }로 답하고, 화면은 다시 시도 없이 이 문구만 보여 준다.
export const LOGIN_OFF_MESSAGE = "이 배포에는 아직 DB가 연결되지 않아 로그인·즐겨찾기·알림이 꺼져 있습니다.";
export const HISTORY_OFF_MESSAGE = "이 배포에는 아직 DB가 연결되지 않아 붐빔 기록을 볼 수 없습니다.";

// 서버 쪽에서 "DB가 응답하지 않음"을 다른 오류와 구분하려고 던진다. server.mjs는 이걸 503 안내로 바꾼다.
export class DbUnavailableError extends Error {
  name = "DbUnavailableError";
}

// supabase-js 오류(PostgrestError, AuthError), fetch 실패, DbUnavailableError를 모두 받는다. status는 응답 상태(있으면).
export function isDbUnavailable(error, status) {
  if (!error) return false;
  if (error instanceof DbUnavailableError || error.name === "DbUnavailableError") return true;
  if (error.name === "AuthRetryableFetchError") return true; // supabase-js Auth가 서버에 닿지 못했을 때
  if (/^PGRST00\d$/.test(error.code ?? "")) return true; // PostgREST가 DB에 연결하지 못함
  const code = Number(status ?? error.status);
  if (code === 0 || code >= 500) return true;
  return /Failed to fetch|fetch failed|NetworkError|Load failed/i.test(error.message ?? "");
}

// "즐겨찾기를 불러오지 못했습니다" 같은 앞말에 DB가 꺼졌을 때는 안내를, 아니면 원래 오류를 붙인다.
export function dbErrorText(what, error, status) {
  return isDbUnavailable(error, status) ? `${what}. ${DB_DOWN_MESSAGE}` : `${what}: ${error?.message ?? error}`;
}
