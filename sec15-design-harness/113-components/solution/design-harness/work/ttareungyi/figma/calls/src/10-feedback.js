// 섹션 4: ErrorBanner, StateMessage, Button, SourceNote. 앞의 둘이 Button을 쓰므로 Button을 먼저 만든다.
const s = openSection("Section/Feedback and actions", "Components · 상태 안내와 버튼", "ErrorBanner · StateMessage · Button · SourceNote");
const C = DATA.copy;
const N = DATA.notes;
const B = {
  ErrorBanner: spec(s, "ErrorBanner", N.ErrorBanner),
  StateMessage: spec(s, "StateMessage", "빈 상태·불러오기 실패·불러오는 중 안내. 다음 행동 하나(다시 시도)만."),
  Button: spec(s, "Button", N.Button),
  SourceNote: spec(s, "SourceNote", "데이터 출처표시(공공누리 제1유형). caption text-muted"),
};

// Button
const makeButton = (kind) => {
  const c = comp("kind=" + kind, { dir: "h", px: "space/5", align: "CENTER", cross: "CENTER", fill: kind === "primary" ? "color/action" : null });
  size(c, null, "size/touch");
  c.minWidth = VAL["size/touch"]; bind(c, "minWidth", "size/touch");
  radius(c, "radius/md");
  c.appendChild(text("label", kind === "primary" ? C.retry : C.nearbyTitle, { weight: "bold", color: kind === "primary" ? "color/on-action" : "color/action" }));
  return c;
};
const btnSet = variantSet(B.Button, "Button", [makeButton("primary"), makeButton("text")], "primary=초록 바탕(화면당 하나), text=초록 글자");
const primary = () => btnSet.children.find((n) => n.name === "kind=primary").createInstance();

// ErrorBanner
const eb = comp("ErrorBanner", { dir: "h", gap: "space/2", px: "space/3", py: "space/3", cross: "CENTER", fill: "color/stock-zero-soft", clip: true });
B.ErrorBanner.appendChild(eb);
radius(eb, "radius/md");
size(eb, 358);
const msg = box("message", { gap: "space/1" });
eb.appendChild(msg); msg.layoutSizingHorizontal = "FILL";
add(msg, text("banner-title", C.error, { size: "font-size/label", weight: "bold" }), "fill");
add(msg, text("banner-hint", C.errorHint, { size: "font-size/label" }), "fill");
eb.appendChild(primary());
{ const band = figma.createRectangle(); band.name = "accent-band"; eb.appendChild(band);
  band.layoutPositioning = "ABSOLUTE"; band.x = 0; band.y = 0; band.resize(4, eb.height); fill(band, "color/stock-zero");
  band.constraints = { horizontal: "MIN", vertical: "STRETCH" }; }

// StateMessage
const SM = { empty: [C.empty, C.emptyHint, true], error: [C.error, C.emptyHint, true], loading: [C.loading, null, false] };
const makeState = (state) => {
  const [title, body, withButton] = SM[state];
  const c = comp("state=" + state, { gap: "space/2", px: "space/4", py: "space/6", cross: "CENTER", fill: "color/surface" });
  size(c, 358);
  c.appendChild(text("message-title", title, { weight: "medium" }));
  if (body) c.appendChild(text("message-body", body, { size: "font-size/label", color: "color/text-muted" }));
  if (withButton) c.appendChild(primary());
  return c;
};
variantSet(B.StateMessage, "StateMessage", ["empty", "error", "loading"].map(makeState), "loading은 SkeletonRow와 함께 쓴다");

// SourceNote
const sn = comp("SourceNote", { px: "space/4", py: "space/3", fill: "color/surface" });
B.SourceNote.appendChild(sn);
size(sn, 390);
add(sn, text("source", C.source, { size: "font-size/caption", color: "color/text-muted" }), "fill");

OUT.made.push("ErrorBanner", "StateMessage(state=empty|error|loading)", "Button(kind=primary|text)", "SourceNote");
bindFontVars(s, OUT);
placeSections();
OUT.section = { id: s.id, w: s.width, h: s.height };
return OUT;
