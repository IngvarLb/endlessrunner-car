// Generates the PWA/app icons (走 hanko seal, Neo-Ukiyo brand) by rendering an
// HTML template in headless Chrome (no extra image dependency needed).
// Run: node scripts/generate-icons.mjs
import puppeteer from "puppeteer-core";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const VERMILLION = "#e23b2e";
const CREAM = "#f4ede0";

function tileHtml({ size, maskable }) {
  // maskable: keep the mark within the inner ~80% safe zone, full-bleed bg.
  // any: a tad larger with a hanko inset frame.
  const kanji = maskable ? 0.46 : 0.56;
  const frame = maskable ? "" : `
    .frame{position:absolute;inset:9.5%;border:${Math.round(size*0.022)}px solid ${CREAM};
      border-radius:${Math.round(size*0.06)}px;opacity:.92;}`;
  return `<!doctype html><html><head><meta charset="utf-8">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@900&display=swap" rel="stylesheet">
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    html,body{width:${size}px;height:${size}px;overflow:hidden;}
    .tile{width:${size}px;height:${size}px;position:relative;display:flex;
      align-items:center;justify-content:center;
      background:
        radial-gradient(120% 120% at 50% 32%, #ef5346 0%, ${VERMILLION} 46%, #c92f24 100%);}
    /* faint print grain */
    .tile::before{content:"";position:absolute;inset:0;opacity:.5;
      background:repeating-linear-gradient(180deg, rgba(0,0,0,.05) 0 ${Math.max(1,Math.round(size/256))}px, transparent ${Math.max(1,Math.round(size/256))}px ${Math.max(2,Math.round(size/128))}px);}
    ${frame}
    .k{font-family:'Noto Sans JP',sans-serif;font-weight:900;color:${CREAM};
      font-size:${Math.round(size*kanji*1.5)}px;line-height:1;
      text-shadow:0 ${Math.round(size*0.012)}px ${Math.round(size*0.03)}px rgba(120,20,10,.45);
      transform:translateY(${Math.round(size*0.005)}px);}
  </style></head>
  <body><div class="tile">${maskable?"":'<div class="frame"></div>'}<div class="k">走</div></div></body></html>`;
}

const targets = [
  { file: "icon-192.png", size: 192, maskable: false },
  { file: "icon-512.png", size: 512, maskable: false },
  { file: "icon-maskable-192.png", size: 192, maskable: true },
  { file: "icon-maskable-512.png", size: 512, maskable: true },
  { file: "apple-touch-icon.png", size: 180, maskable: false },
];

const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox", "--hide-scrollbars", "--force-color-profile=srgb"] });
for (const t of targets) {
  const p = await browser.newPage();
  await p.setViewport({ width: t.size, height: t.size, deviceScaleFactor: 1 });
  await p.setContent(tileHtml(t), { waitUntil: "networkidle0" });
  await p.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 250));
  await p.screenshot({ path: `public/icons/${t.file}`, clip: { x: 0, y: 0, width: t.size, height: t.size } });
  await p.close();
  console.log("wrote public/icons/" + t.file);
}
await browser.close();
console.log("done");
