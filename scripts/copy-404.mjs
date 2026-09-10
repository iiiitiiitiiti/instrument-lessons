import { copyFileSync, existsSync } from "node:fs";

const source = "dist/index.html";
const destination = "dist/404.html";

if (!existsSync(source)) {
  console.error(`${source} がありません。先に vite build を実行してください。`);
  process.exit(1);
}

copyFileSync(source, destination);
console.log(`${source} を ${destination} へコピーしました`);
