/**
 * Generates raster share assets from SVG sources (run: node scripts/generate-brand-share-assets.mjs).
 * Requires: npm install sharp (devDependency).
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const shareDir = join(root, "public/brand/share");
const logoSvg = join(root, "public/brand/your-dentist/logo-mark.svg");

async function fromSvgFile(svgPath, width, height, outPath) {
  const svg = readFileSync(svgPath);
  await sharp(svg, { density: 300 })
    .resize(width, height, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(outPath);
  console.log("wrote", outPath);
}

async function logoOnWhite(size, outPath, padding = 0.12) {
  const inner = Math.round(size * (1 - padding * 2));
  const logo = await sharp(readFileSync(logoSvg), { density: 300 })
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const pad = Math.round(size * padding);
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([{ input: logo, left: pad, top: pad }])
    .png({ compressionLevel: 9 })
    .toFile(outPath);
  console.log("wrote", outPath);
}

async function main() {
  await fromSvgFile(join(shareDir, "og-share.svg"), 1200, 630, join(shareDir, "og-1200x630.png"));
  await fromSvgFile(join(shareDir, "og-share.svg"), 1200, 630, join(shareDir, "twitter-1200x630.png"));
  await fromSvgFile(join(shareDir, "apple-touch.svg"), 180, 180, join(shareDir, "apple-touch-180.png"));
  await logoOnWhite(32, join(shareDir, "icon-32.png"), 0.08);
  await logoOnWhite(16, join(shareDir, "icon-16.png"), 0.06);
  await logoOnWhite(512, join(shareDir, "icon-512.png"), 0.1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
