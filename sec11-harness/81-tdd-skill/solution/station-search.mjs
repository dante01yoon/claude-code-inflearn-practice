// 역 찾기: 이름 일부나 초성으로 역을 고른다. subway.html과 tests/station-search.test.mjs가 함께 쓴다.
// 초성은 글자마다 맞춘다. "ㄱㄴ" → 강남, "강ㄴ" → 강남(입력 중인 마지막 글자도 맞는다).

// 한글 음절의 초성 19개(유니코드 순서). 호환 자모(ㄱ U+3131…)로 적는다 — 키보드로 치면 이 글자가 들어온다.
const CHOSEONG = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";
const SYLLABLE_FIRST = 0xac00, SYLLABLE_LAST = 0xd7a3, PER_CHOSEONG = 21 * 28;

// 음절이면 그 초성, 아니면 null
export function choseong(ch) {
  const c = ch.codePointAt(0);
  if (c < SYLLABLE_FIRST || c > SYLLABLE_LAST) return null;
  return CHOSEONG[Math.floor((c - SYLLABLE_FIRST) / PER_CHOSEONG)];
}

// 검색어 글자 q가 이름 글자 n에 맞는가: 같은 글자이거나, q가 초성이고 n이 그 초성으로 시작하는 음절
const charMatches = (q, n) => q === n || (CHOSEONG.includes(q) && choseong(n) === q);

// 이름에서 검색어가 처음 맞는 위치(없으면 -1)
function looseIndexOf(name, k) {
  for (let i = 0; i + k.length <= name.length; i++) {
    let j = 0;
    while (j < k.length && charMatches(k[j], name[i + j])) j++;
    if (j === k.length) return i;
  }
  return -1;
}

// 공백을 무시하고, 괄호 부역명은 뺀 이름을 먼저 본다("잠실" → 잠실(송파구청)).
export const norm = (s) => s.replace(/\s/g, "").toLowerCase();
const baseName = (s) => s.replace(/\(.*?\)/g, "");

// 점수: 0 = 이름과 같음, 1 = 앞부분, 2 = 가운데, 3 = 부역명까지 넣어야 맞음, -1 = 안 맞음
function score(name, k) {
  const b = norm(baseName(name));
  const at = looseIndexOf(b, k);
  if (at === 0) return b.length === k.length ? 0 : 1;
  if (at > 0) return 2;
  return looseIndexOf(norm(name), k) >= 0 ? 3 : -1; // 부역명으로도 찾는다(예: DDP)
}

// 끝의 "역"을 뗀 검색어로도 맞춰 보고 더 잘 맞는 쪽을 쓴다("강남역" → 강남, "서울역"은 그대로 서울역).
function bestScore(name, k) {
  const s = score(name, k);
  if (k.length < 2 || !k.endsWith("역")) return s;
  const t = score(name, k.slice(0, -1));
  return s < 0 ? t : t < 0 ? s : Math.min(s, t);
}

// entries: { name, riders?, ... }[] → 잘 맞는 순으로 limit개.
// 점수가 같으면 승하차(riders)가 많은 역을 먼저 둔다("ㄱㄴ"은 가능·강남 둘 다 이름과 같다). 그다음은 이름순.
export function searchStations(entries, text, limit = 8) {
  const k = norm(text);
  if (!k) return [];
  return entries
    .map((e) => [bestScore(e.name, k), e])
    .filter(([s]) => s >= 0)
    .sort((a, b) => a[0] - b[0] || (b[1].riders ?? 0) - (a[1].riders ?? 0) || a[1].name.localeCompare(b[1].name, "ko"))
    .slice(0, limit)
    .map(([, e]) => e);
}
