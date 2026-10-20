// 지도 화면 5개: map/default, map/return, map/loading, map/empty, map/error
const C = DATA.copy;
const SHEET_Y = 604; // 844 - 바텀시트 peek 240
const chrome = (f, mode) => {
  place(f, inst("SearchBar"), 16, 16);
  place(f, inst("ModeToggle", "mode", mode), 16, 72);
  place(f, inst("MapAttribution"), 16, 572);
};
const peek = (f, mode) => {
  const sh = place(f, inst("BottomSheet", "sheet", "peek"), 0, SHEET_Y);
  const rows = layer(sh, "station-rows").children;
  rows.forEach((row, i) => rowOverride(row, DATA.list[i], mode));
  return sh;
};
// 데이터 없는 상태(로딩·빈): 핀 없이, 시트의 제목·행을 숨기고 그 자리에 안내를 얹는다.
const emptySheet = (f) => {
  const sh = place(f, inst("BottomSheet", "sheet", "peek"), 0, SHEET_Y);
  layer(sh, "SheetHeader").visible = false;
  layer(sh, "station-rows").visible = false;
  return sh;
};

for (const [name, mode] of [["map/default", "rent"], ["map/return", "return"]]) {
  const f = openScreen(name);
  mapLayer(f, { pins: mode });
  chrome(f, mode);
  peek(f, mode);
  done(f);
}
{
  const f = openScreen("map/loading");
  mapLayer(f, {});
  chrome(f, "rent");
  emptySheet(f);
  place(f, inst("StateMessage", "state", "loading"), 16, 652);
  place(f, inst("SkeletonRow"), 0, 732);
  place(f, inst("SkeletonRow"), 0, 788);
  done(f);
}
{
  const f = openScreen("map/empty");
  mapLayer(f, {});
  chrome(f, "rent");
  emptySheet(f);
  place(f, inst("StateMessage", "state", "empty"), 16, 652);
  done(f);
}
{
  const f = openScreen("map/error");
  mapLayer(f, { pins: "rent" });
  chrome(f, "rent");
  peek(f, "rent");
  place(f, inst("ErrorBanner"), 16, 128);
  done(f);
}
return OUT;
