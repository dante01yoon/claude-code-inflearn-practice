// 서울시 주요 121장소 영역(shapefile을 묶은 zip) 어댑터. 브라우저(subway.html)와 Node(server.mjs, 테스트)가 함께 쓴다.
// 원본 zip은 고치지 않고, 읽을 때 풀어서 장소마다 { code, category, name, polygons }로 바꾼다.
// 좌표계는 WGS84 경위도다(.prj). polygons는 deck.gl PolygonLayer 모양: [[바깥 고리, 구멍 고리…], …], 점은 [경도, 위도].

export const CITYDATA_AREAS_ZIP = "data/raw/citydata/서울시 주요 121장소 영역.zip";

// ---- zip ----
// 압축 안 함(0)과 deflate(8)만 다룬다. 풀기는 브라우저와 Node 22 이상에 있는 DecompressionStream으로 한다.

async function inflateRaw(bytes) {
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

// zip 바이트 → Map(파일 이름 → 바이트). 폴더 항목은 뺀다.
export async function unzip(buffer) {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  // 중앙 디렉터리 끝(EOCD)은 맨 끝에서 주석 길이만큼 앞에 있다.
  let eocd = bytes.length - 22;
  while (eocd >= 0 && view.getUint32(eocd, true) !== 0x06054b50) eocd--;
  if (eocd < 0) throw new Error("zip 파일이 아닙니다");
  const entries = view.getUint16(eocd + 10, true);
  let p = view.getUint32(eocd + 16, true);
  const files = new Map();
  for (let i = 0; i < entries; i++) {
    if (view.getUint32(p, true) !== 0x02014b50) throw new Error("zip 중앙 디렉터리가 깨졌습니다");
    const method = view.getUint16(p + 10, true);
    const size = view.getUint32(p + 20, true);
    const nameLen = view.getUint16(p + 28, true);
    const extraLen = view.getUint16(p + 30, true);
    const commentLen = view.getUint16(p + 32, true);
    const local = view.getUint32(p + 42, true);
    const name = new TextDecoder().decode(bytes.subarray(p + 46, p + 46 + nameLen));
    p += 46 + nameLen + extraLen + commentLen;
    if (name.endsWith("/")) continue;
    const start = local + 30 + view.getUint16(local + 26, true) + view.getUint16(local + 28, true);
    const data = bytes.subarray(start, start + size);
    if (method === 0) files.set(name, data);
    else if (method === 8) files.set(name, await inflateRaw(data));
    else throw new Error(`${name}: 지원하지 않는 압축 방식 ${method}`);
  }
  return files;
}

// ---- shapefile ----

// 고리의 부호 있는 넓이(경위도 평면). shapefile은 바깥 고리를 시계 방향(음수), 구멍을 반시계 방향(양수)으로 적는다.
const signedArea = (ring) => {
  let s = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) s += (ring[j][0] - ring[i][0]) * (ring[j][1] + ring[i][1]);
  return -s / 2;
};

// .shp → 레코드마다 polygons. Polygon(5)과 PolygonZ(15)·PolygonM(25)를 읽는다(Z·M 값은 쓰지 않는다).
export function parseShp(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const out = [];
  for (let p = 100; p + 8 <= bytes.length;) {
    const length = view.getInt32(p + 4) * 2; // 16비트 워드 수, 빅엔디언
    const c = p + 8;
    const type = view.getInt32(c, true);
    if (type === 0) {
      out.push([]); // 빈 도형
    } else if (type === 5 || type === 15 || type === 25) {
      const numParts = view.getInt32(c + 36, true);
      const numPoints = view.getInt32(c + 40, true);
      const parts = Array.from({ length: numParts }, (_, i) => view.getInt32(c + 44 + i * 4, true));
      const pts = c + 44 + numParts * 4;
      const point = (k) => [view.getFloat64(pts + k * 16, true), view.getFloat64(pts + k * 16 + 8, true)];
      const rings = parts.map((s, i) => Array.from({ length: (parts[i + 1] ?? numPoints) - s }, (_, k) => point(s + k)));
      // 바깥 고리마다 도형 하나를 시작하고, 구멍은 바로 앞의 바깥 고리에 붙인다.
      const polygons = [];
      for (const ring of rings) {
        if (signedArea(ring) < 0 || !polygons.length) polygons.push([ring]);
        else polygons.at(-1).push(ring);
      }
      out.push(polygons);
    } else {
      throw new Error(`.shp ${out.length + 1}번째 레코드: 다각형이 아닌 도형 ${type}`);
    }
    p = c + length;
  }
  return out;
}

// .dbf → 필드 이름을 키로 하는 객체 배열. 문자열은 앞뒤 공백을 뗀다. 인코딩은 .cpg(UTF-8)를 따른다.
export function parseDbf(bytes, encoding = "utf-8") {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const decoder = new TextDecoder(encoding);
  const count = view.getUint32(4, true);
  const headerLen = view.getUint16(8, true);
  const recordLen = view.getUint16(10, true);
  const fields = [];
  for (let p = 32, offset = 1; bytes[p] !== 0x0d; p += 32) {
    const name = new TextDecoder().decode(bytes.subarray(p, p + 11)).replace(/\0.*$/s, "");
    const len = bytes[p + 16];
    fields.push({ name, offset, len });
    offset += len;
  }
  const out = [];
  for (let i = 0; i < count; i++) {
    const r = headerLen + i * recordLen;
    if (bytes[r] === 0x2a) continue; // 지운 레코드
    out.push(Object.fromEntries(fields.map((f) => [f.name, decoder.decode(bytes.subarray(r + f.offset, r + f.offset + f.len)).trim()])));
  }
  return out;
}

// zip 바이트 → [{ code: "POI001", category, name, polygons }]. .shp와 .dbf는 같은 순서의 레코드다.
export async function parseAreasZip(buffer) {
  const files = await unzip(buffer);
  const find = (ext) => [...files].find(([name]) => name.toLowerCase().endsWith(ext))?.[1];
  const shp = find(".shp"), dbf = find(".dbf"), cpg = find(".cpg");
  if (!shp || !dbf) throw new Error("zip 안에 .shp·.dbf가 없습니다");
  const encoding = cpg ? new TextDecoder().decode(cpg).trim() : "utf-8";
  const shapes = parseShp(shp);
  const records = parseDbf(dbf, encoding);
  if (shapes.length !== records.length) throw new Error(`.shp ${shapes.length}개, .dbf ${records.length}개로 레코드 수가 다릅니다`);
  return records.map((r, i) => ({ code: r.AREA_CD, category: r.CATEGORY, name: r.AREA_NM, polygons: shapes[i] }));
}

// URL에서 zip을 받아 장소 배열로 돌려준다(브라우저용).
export async function fetchAreas(url = CITYDATA_AREAS_ZIP) {
  const res = await fetch(encodeURI(url));
  if (!res.ok) throw new Error(`${url}: ${res.status} ${res.statusText}`);
  return parseAreasZip(await res.arrayBuffer());
}
