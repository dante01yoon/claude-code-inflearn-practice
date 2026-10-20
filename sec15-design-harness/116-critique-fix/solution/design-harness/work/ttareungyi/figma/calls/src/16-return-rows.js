// map/return 행: "빈 거치대 {n}"이 이름을 두 줄로 밀어내므로 '/ 거치대 n'을 숨긴다(반납 모드). 높이 확인.
const f = SC.children.find((n) => n.name === "map/return");
const sh = f.children.find((n) => n.name === "BottomSheet");
const info = {};
layer(sh, "station-rows").children.forEach((row, i) => {
  layer(row, "rack-count").visible = false;
  info["row" + i] = { name: layer(row, "station-name").height, row: row.height, count: layer(row, "bike-count").width };
});
return info;
