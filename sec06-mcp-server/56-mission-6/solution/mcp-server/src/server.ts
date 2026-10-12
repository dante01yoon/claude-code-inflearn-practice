// 「서울 라이브 3D」 MCP 서버 본체. 9월 승하차 CSV로 역별 시간대 승하차를 알려 준다.
// 도구: get_station_hourly(역 이름, CSV) · get_station_hourly_api(역·달, CardSubwayTime API) · get_place_crowd(장소, citydata_ppltn API)
//       · get_bike_stations(따릉이 대여소, bikeList API)
// 리소스: stations://list(역 목록) · places://list(주요 121장소 목록)
// 전송은 index.ts(stdio)와 http.ts(Streamable HTTP)가 따로 붙인다.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { HOURS, count, total } from "../../stats.mjs";
import { SUBWAY_CSV, decodeCsv, mergeStations, parseCsv, toSubwayRows } from "../../subway-csv.mjs";
import { findBikeStations, findPlace, isSample, loadBikeStations, loadPlaces, monthLabel, placeCrowd, scrub, stationHourly } from "./openapi.ts";

type Row = Record<string, any>;

const ROOT = new URL("../../", import.meta.url);
export const rows: Row[] = toSubwayRows(parseCsv(decodeCsv(readFileSync(fileURLToPath(new URL(SUBWAY_CSV, ROOT))))));
const SOURCE = "서울 열린데이터광장 「서울시 지하철 호선별 역별 시간대별 승하차 인원 정보」(서울특별시, 공공누리 제1유형)";
const CITYDATA_SOURCE = "서울 열린데이터광장 「서울시 실시간 도시데이터(인구)」(서울특별시, 공공누리 제1유형)";
const BIKE_SOURCE = "서울 열린데이터광장 「서울시 공공자전거 실시간 대여정보」(서울특별시, 공공누리 제1유형)";
export const month = monthLabel(String(rows[0].USE_MM));

const fmt = (n: number) => n.toLocaleString("ko-KR");
const baseName = (name: string) => name.replace(/\(.*\)$/, "").trim();

// 역 이름으로 행 찾기. 정확히 같은 이름 → 괄호 부역명을 뺀 이름 → 끝의 "역"을 뺀 이름 순으로 맞춰 본다.
function findRows(query: string): Row[] {
  const q = query.trim().replace(/\s+/g, "");
  for (const name of new Set([q, baseName(q), q.replace(/역$/, "")])) {
    if (!name) continue;
    const exact = rows.filter((r) => r.STTN === name);
    if (exact.length) return exact;
    const byBase = rows.filter((r) => baseName(r.STTN) === name);
    if (byBase.length) return byBase;
  }
  return [];
}

// 이름이 비슷한 역(포함 관계) 최대 10개. 못 찾았을 때 안내에 쓴다.
const suggest = (query: string) => {
  const q = baseName(query.trim()).replace(/역$/, "");
  return [...new Set(rows.map((r) => r.STTN as string))].filter((n) => q && n.includes(q)).slice(0, 10);
};

const hourLabel = (h: number) => `${String(h).padStart(2, "0")}시`;

const textResult = (text: string, isError = false) => ({ isError, content: [{ type: "text" as const, text }] });

function describe(matched: Row[], label = month) {
  // 노선별 행과, 같은 역명을 합친 행(환승역 합산, 양평처럼 이름만 같은 역은 따로)
  const lines = matched.map((r) => r.SBWY_ROUT_LN_NM as string);
  const merged: Row[] = mergeStations(matched);
  const stations = merged.map((r) => {
    const hourly = HOURS.map((h) => ({ hour: h, on: count(r, h, "ON"), off: count(r, h, "OFF") }));
    const peak = hourly.reduce((a, b) => (b.on + b.off > a.on + a.off ? b : a));
    return {
      station: r.STTN as string,
      lines: r.LINES as string[],
      totalOn: hourly.reduce((a, x) => a + x.on, 0),
      totalOff: hourly.reduce((a, x) => a + x.off, 0),
      peakHour: peak.hour,
      peakTotal: total(r, peak.hour),
      hourly,
    };
  });
  const text = stations.map((s) => [
    `## ${s.station} (${s.lines.join("·")}) — ${label} 한 달 합계`,
    `승차 ${fmt(s.totalOn)}명 · 하차 ${fmt(s.totalOff)}명 · 가장 붐비는 시간대 ${hourLabel(s.peakHour)}대(${fmt(s.peakTotal)}명)`,
    "",
    "| 시간대 | 승차 | 하차 | 합계 |",
    "|---|---:|---:|---:|",
    ...s.hourly.map((x) => `| ${hourLabel(x.hour)}–${hourLabel((x.hour + 1) % 24)} | ${fmt(x.on)} | ${fmt(x.off)} | ${fmt(x.on + x.off)} |`),
  ].join("\n"));
  if (stations.length === 1 && lines.length > 1) text.push(`노선 ${lines.length}개(${lines.join(", ")})를 합친 값입니다.`);
  text.push(`출처: ${SOURCE}`);
  return { text: text.join("\n\n"), stations };
}

const range = (min: number | null, max: number | null) => (min === null || max === null ? "알 수 없음" : `${fmt(min)}~${fmt(max)}명`);

// 요청마다 새 서버가 필요한 전송(상태 없는 HTTP)도 있어서 만드는 함수로 둔다. CSV는 모듈을 불러올 때 한 번만 읽는다.
export function createServer() {
  const server = new McpServer({ name: "seoul-live-3d", version: "0.1.0" });

  server.registerTool(
    "get_station_hourly",
    {
      title: "역 시간대별 승하차",
      description:
        `서울 지하철 역의 ${month} 시간대별(04시~다음 날 03시) 승차·하차 인원(한 달 합계)을 알려 준다. ` +
        "환승역은 노선을 합친 값이다. 역 이름은 \"강남\", \"강남역\", \"청량리\"처럼 부역명 괄호나 '역'을 빼도 된다. " +
        "정확한 역 이름은 stations://list 리소스에서 볼 수 있다.",
      inputSchema: { station: z.string().min(1).describe("역 이름(예: 서울역, 강남, 홍대입구)") },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ station }) => {
      const matched = findRows(station);
      if (!matched.length) {
        const near = suggest(station);
        return {
          isError: true,
          content: [{
            type: "text" as const,
            text: `"${station}" 역을 ${month} 데이터에서 찾지 못했습니다.` +
              (near.length ? ` 비슷한 이름: ${near.join(", ")}` : " stations://list 리소스에서 역 이름을 확인하세요."),
          }],
        };
      }
      const { text, stations } = describe(matched);
      return { content: [{ type: "text" as const, text }], structuredContent: { month, stations } };
    },
  );

  server.registerTool(
    "get_station_hourly_api",
    {
      title: "역 시간대별 승하차(Open API, 달 지정)",
      description:
        "서울 열린데이터광장 CardSubwayTime API로 지하철 역의 시간대별(04시~다음 날 03시) 승차·하차 인원(한 달 합계)을 받아 온다. " +
        "get_station_hourly(저장된 9월 CSV)와 달리 다른 달을 물을 수 있다. month를 비우면 지난달부터 석 달 안의 가장 최근 달. " +
        "환승역은 노선을 합친 값이고, line을 주면 그 노선만. 역 이름 규칙은 get_station_hourly와 같다." +
        (isSample ? " (지금은 sample 키라 노선 5개까지만 받는다.)" : ""),
      inputSchema: {
        station: z.string().min(1).describe("역 이름(예: 서울역, 강남, 홍대입구)"),
        month: z.string().regex(/^20\d{2}(0[1-9]|1[0-2])$/).optional().describe("사용 월 YYYYMM(예: 202608). 비우면 가장 최근 달"),
        line: z.string().optional().describe("호선명(예: 2호선, 경의선). 비우면 모든 노선"),
      },
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ station, month: m, line }) => {
      // API는 정확한 역 이름만 받으므로 CSV 역명으로 먼저 맞추고, 없으면(새 역 등) 받은 이름 그대로 묻는다.
      const q = station.trim().replace(/\s+/g, "");
      const names = [...new Set([...findRows(station).map((r) => r.STTN as string), q, q.replace(/역$/, "")])].filter(Boolean);
      let found;
      try {
        found = await stationHourly(names, m, line?.trim());
      } catch (err) {
        return textResult(`CardSubwayTime API 호출에 실패했습니다: ${scrub(err instanceof Error ? err.message : err)}`, true);
      }
      if (!found) {
        const when = m ? monthLabel(m) : "최근 석 달";
        return textResult(`"${station}"${line ? `(${line})` : ""} 역의 ${when} 데이터가 API에 없습니다. stations://list에서 역 이름을 확인하세요.`, true);
      }
      const label = monthLabel(found.month);
      const { text, stations } = describe(found.rows, label);
      const note = found.truncated ? "\n\n※ sample 키라 노선 일부만 받았습니다. SEOUL_OPENAPI_KEY를 설정하면 모든 노선을 합칩니다." : "";
      return { content: [{ type: "text" as const, text: text + note }], structuredContent: { month: label, stations } };
    },
  );

  server.registerTool(
    "get_place_crowd",
    {
      title: "장소 실시간 붐빔",
      description:
        "서울 열린데이터광장 실시간 도시데이터(citydata_ppltn)로 서울 주요 121장소의 지금 혼잡도(여유·보통·약간 붐빔·붐빔), " +
        "추정 인구 범위, 12시간 예측을 알려 준다. 5분마다 갱신된다. 장소는 이름(예: 강남역, 홍대 관광특구) 또는 코드(POI001). " +
        "장소 목록은 places://list 리소스에 있다." +
        (isSample ? " (지금은 sample 키라 어느 장소를 물어도 광화문·덕수궁만 답한다.)" : ""),
      inputSchema: { place: z.string().min(1).describe("장소 이름 또는 코드(예: 광화문·덕수궁, 강남역, POI009)") },
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ place }) => {
      const { match, candidates } = await findPlace(place);
      if (!match) {
        return textResult(
          `"${place}": 주요 121장소에서 ${candidates.length ? `하나로 정하지 못했습니다. 후보: ${candidates.map((p) => p.name).join(", ")}` : "찾지 못했습니다. places://list 리소스에서 장소 이름을 확인하세요."}`,
          true,
        );
      }
      let data;
      try {
        data = await placeCrowd(match.code);
      } catch (err) {
        return textResult(`citydata_ppltn API 호출에 실패했습니다: ${scrub(err instanceof Error ? err.message : err)}`, true);
      }
      const text = [
        `## ${data.name} (${data.code}) — ${data.now.time} 기준`,
        `혼잡도 **${data.now.level}** · 추정 인구 ${range(data.now.min, data.now.max)}`,
        data.message,
      ];
      if (data.forecast.length) {
        text.push(
          ["| 예측 시각 | 혼잡도 | 추정 인구 |", "|---|---|---:|",
            ...data.forecast.map((f: Row) => `| ${f.time} | ${f.level} | ${range(f.min, f.max)} |`)].join("\n"),
        );
      }
      // sample 키는 묻는 장소와 상관없이 광화문·덕수궁을 돌려준다.
      if (data.code !== match.code) {
        text.push(`※ sample 키라 요청한 ${match.name}(${match.code}) 대신 ${data.name}의 값입니다. SEOUL_OPENAPI_KEY를 설정하면 요청한 장소를 받습니다.`);
      }
      text.push(`출처: ${CITYDATA_SOURCE}`);
      return { content: [{ type: "text" as const, text: text.join("\n\n") }], structuredContent: { requested: match, ...data } };
    },
  );

  server.registerTool(
    "get_bike_stations",
    {
      title: "따릉이 대여소 현황",
      description:
        "서울 열린데이터광장 bikeList API로 따릉이(서울 공공자전거) 대여소의 지금 주차된 자전거 수·거치대 수·거치율을 알려 준다. " +
        "대여소는 이름 일부(예: 망원역, 합정역 7번출구, 여의도), 대여소 번호(예: 102), ID(예: ST-4)로 찾는다. " +
        "여러 곳이 걸리면 자전거가 많은 순으로 limit곳까지. 1분 캐시." +
        (isSample ? " (지금은 sample 키라 망원역·합정역 근처 5곳만 받는다.)" : ""),
      inputSchema: {
        query: z.string().min(1).describe("대여소 이름 일부·번호·ID(예: 망원역, 102, ST-4)"),
        limit: z.number().int().min(1).max(50).optional().describe("최대 몇 곳(기본 10)"),
      },
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ query, limit = 10 }) => {
      let all;
      try {
        all = await loadBikeStations();
      } catch (err) {
        return textResult(`bikeList API 호출에 실패했습니다: ${scrub(err instanceof Error ? err.message : err)}`, true);
      }
      const found = findBikeStations(all, query);
      if (!found.length) {
        return textResult(
          `"${query}" 따릉이 대여소를 찾지 못했습니다(전체 ${fmt(all.length)}곳).` +
            (isSample ? " sample 키라 망원역·합정역 근처 5곳만 받습니다. SEOUL_OPENAPI_KEY를 설정하면 전체에서 찾습니다." : ""),
          true,
        );
      }
      const shown = [...found].sort((a, b) => b.bikes - a.bikes).slice(0, limit);
      const bikes = found.reduce((a, s) => a + s.bikes, 0);
      const text = [
        `## 따릉이 대여소 "${query}" — ${fmt(found.length)}곳, 자전거 ${fmt(bikes)}대`,
        ["| 대여소 | 자전거 | 거치대 | 거치율 |", "|---|---:|---:|---:|",
          ...shown.map((s) => `| ${s.name} (${s.id}) | ${fmt(s.bikes)}대 | ${fmt(s.racks)} | ${fmt(s.shared)}% |`)].join("\n"),
      ];
      if (found.length > shown.length) text.push(`자전거가 많은 순으로 ${shown.length}곳만 보였습니다. limit을 늘리거나 이름을 더 자세히 적으세요.`);
      text.push("거치율은 자전거 수 ÷ 거치대 수라 100%를 넘을 수 있습니다(거치대 밖에 세워 둔 자전거 포함).");
      if (isSample) text.push("※ sample 키라 망원역·합정역 근처 5곳만 받았습니다. SEOUL_OPENAPI_KEY를 설정하면 서울 전체 대여소에서 찾습니다.");
      text.push(`출처: ${BIKE_SOURCE}`);
      return {
        content: [{ type: "text" as const, text: text.join("\n\n") }],
        structuredContent: { query, matched: found.length, totalBikes: bikes, stations: shown },
      };
    },
  );

  server.registerResource(
    "places",
    "places://list",
    {
      title: "주요 121장소 목록",
      description: "실시간 도시데이터(get_place_crowd)로 물을 수 있는 서울 주요 121장소의 코드·분류·이름",
      mimeType: "application/json",
    },
    async (uri) => {
      const places = await loadPlaces();
      const body = { source: CITYDATA_SOURCE, count: places.length, places };
      return { contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(body, null, 2) }] };
    },
  );

  server.registerResource(
    "stations",
    "stations://list",
    {
      title: "역 목록",
      description: `${month} 승하차 데이터에 있는 역 이름과 노선 목록(역명 가나다순)`,
      mimeType: "application/json",
    },
    async (uri) => {
      const byName = new Map<string, string[]>();
      for (const r of rows) byName.set(r.STTN, [...(byName.get(r.STTN) ?? []), r.SBWY_ROUT_LN_NM]);
      const stations = [...byName].sort(([a], [b]) => a.localeCompare(b, "ko-KR")).map(([name, lines]) => ({ name, lines }));
      const body = { month, source: SOURCE, count: stations.length, stations };
      return { contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(body, null, 2) }] };
    },
  );

  return server;
}
