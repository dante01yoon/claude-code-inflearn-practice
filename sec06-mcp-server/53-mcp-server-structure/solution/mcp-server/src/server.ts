// 「서울 라이브 3D」 MCP 서버 본체. 9월 승하차 CSV로 역별 시간대 승하차를 알려 준다.
// 도구: get_station_hourly(역 이름) / 리소스: stations://list(역 목록)
// 전송은 index.ts(stdio)와 http.ts(Streamable HTTP)가 따로 붙인다.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { HOURS, count, total } from "../../stats.mjs";
import { SUBWAY_CSV, decodeCsv, mergeStations, parseCsv, toSubwayRows } from "../../subway-csv.mjs";

type Row = Record<string, any>;

const ROOT = new URL("../../", import.meta.url);
export const rows: Row[] = toSubwayRows(parseCsv(decodeCsv(readFileSync(fileURLToPath(new URL(SUBWAY_CSV, ROOT))))));
const SOURCE = "서울 열린데이터광장 「서울시 지하철 호선별 역별 시간대별 승하차 인원 정보」(서울특별시, 공공누리 제1유형)";
export const month = String(rows[0].USE_MM).replace(/^(\d{4})(\d{2})$/, "$1년 $2월").replace(" 0", " ");

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

function describe(matched: Row[]) {
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
    `## ${s.station} (${s.lines.join("·")}) — ${month} 한 달 합계`,
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
