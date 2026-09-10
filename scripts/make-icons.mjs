import { mkdirSync } from "node:fs";
import sharp from "sharp";

const source = "public/icon.svg";
const outputs = [
  { file: "public/icon-192.png", size: 192, pad: 0 },
  { file: "public/icon-512.png", size: 512, pad: 0 },
  { file: "public/apple-touch-icon.png", size: 180, pad: 0 },
  // マスカブルは端が切り取られるため、内側に余白を作る
  { file: "public/icon-maskable-512.png", size: 512, pad: 64 },
];

mkdirSync("public", { recursive: true });

for (const { file, size, pad } of outputs) {
  const inner = size - pad * 2;
  await sharp(source)
    .resize(inner, inner)
    .extend({
      top: pad, bottom: pad, left: pad, right: pad,
      background: "#1d6f6a",
    })
    .png()
    .toFile(file);
  console.log(`${file} を書き出しました（${size}x${size}）`);
}
