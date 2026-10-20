// 지도 바탕 이미지(data/map-base@2x.png)를 파일에 올리고 hash를 돌려준다. DATA = { png: base64 }
// 이미지는 노드에 쓰여야 파일에 남으므로 13번 이후 화면에서 바로 쓴다.
const img = figma.createImage(figma.base64Decode(DATA.png));
const { width, height } = await img.getSizeAsync();
return { hash: img.hash, width, height };
