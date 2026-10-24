import { execFileSync } from "node:child_process";
import { mkdir, readdir, stat, writeFile, copyFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const SOURCE_IMAGES = path.join(ROOT, "assets/source/photos");
const SOURCE_VIDEO = path.join(ROOT, "assets/source/video");
const OUT_IMG = path.join(ROOT, "assets/img");
const OUT_VIDEO = path.join(ROOT, "assets/video");
const OUT_OG = path.join(ROOT, "assets/og");
const OUT_FAVICON = path.join(ROOT, "assets/favicon");
const TMP = path.join(ROOT, "scripts/.tmp");

const WIDTHS = [480, 800, 1200, 1600, 2000];
const IMAGE_MAP = {
  "about.jpg": "surferka-na-plazy",
  "pexels-jess-vide-4600770.jpg": "grupa-na-fali",
  "pexels-jess-vide-5007332.jpg": "paddling",
  "pexels-pok-rie-33563-37307227.jpg": "lekcja-przy-brzegu",
  "pexels-sergio-hurtado-265552058-15875332.jpg": "surfer-w-barrelu",
};

const VIDEO_SOURCE = path.join(SOURCE_VIDEO, "13019460_3840_2160_25fps.mp4");
const VIDEO_START = 1.0;
const VIDEO_DURATION = 8;
const POSTER_TIME = 6.4;

function run(bin, args) {
  execFileSync(bin, args, { stdio: "inherit" });
}

async function ensureDirs() {
  await Promise.all(
    [OUT_IMG, OUT_VIDEO, OUT_OG, OUT_FAVICON, TMP].map((dir) =>
      mkdir(dir, { recursive: true }),
    ),
  );
}

async function fileSize(file) {
  const s = await stat(file);
  return s.size;
}

function mb(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

async function optimizeImage(sourceFile, baseName) {
  const image = sharp(sourceFile, { failOn: "error" }).rotate();
  const meta = await image.metadata();
  const widths = WIDTHS.filter((w) => w <= meta.width);
  if (!widths.length) widths.push(meta.width);

  for (const width of widths) {
    const resized = sharp(sourceFile, { failOn: "error" })
      .rotate()
      .resize({ width, withoutEnlargement: true });

    await Promise.all([
      resized
        .clone()
        .avif({ quality: 62, effort: 5 })
        .toFile(path.join(OUT_IMG, `${baseName}-${width}.avif`)),
      resized
        .clone()
        .webp({ quality: 78, effort: 5 })
        .toFile(path.join(OUT_IMG, `${baseName}-${width}.webp`)),
      resized
        .clone()
        .jpeg({ quality: 80, mozjpeg: true })
        .toFile(path.join(OUT_IMG, `${baseName}-${width}.jpg`)),
    ]);
  }

  return { baseName, width: meta.width, height: meta.height, widths };
}

async function buildVideo() {
  const base = [
    "-ss",
    String(VIDEO_START),
    "-t",
    String(VIDEO_DURATION),
    "-i",
    VIDEO_SOURCE,
    "-an",
    "-sn",
    "-dn",
    "-map_metadata",
    "-1",
  ];

  const mp4 = (height, crf) => [
    ...base,
    "-vf",
    `scale=-2:${height}:flags=lanczos`,
    "-c:v",
    "libx264",
    "-preset",
    "slow",
    "-crf",
    crf,
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    "-r",
    "24",
    path.join(OUT_VIDEO, `hero-${height}.mp4`),
  ];

  const webm = (height, crf) => [
    ...base,
    "-vf",
    `scale=-2:${height}:flags=lanczos`,
    "-c:v",
    "libvpx-vp9",
    "-crf",
    crf,
    "-b:v",
    "0",
    "-row-mt",
    "1",
    "-cpu-used",
    "2",
    "-deadline",
    "good",
    "-pix_fmt",
    "yuv420p",
    "-r",
    "24",
    path.join(OUT_VIDEO, `hero-${height}.webm`),
  ];

  run("ffmpeg", ["-y", ...mp4(1080, 30)]);
  run("ffmpeg", ["-y", ...mp4(720, 29)]);
  run("ffmpeg", ["-y", ...webm(1080, 42)]);
  run("ffmpeg", ["-y", ...webm(720, 39)]);

  const posterSrc = path.join(TMP, "poster-master.jpg");
  run("ffmpeg", [
    "-y",
    "-ss",
    String(POSTER_TIME),
    "-i",
    VIDEO_SOURCE,
    "-frames:v",
    "1",
    "-q:v",
    "2",
    "-update",
    "1",
    posterSrc,
  ]);

  const posterWidths = [480, 800, 1200, 1600, 2000];
  for (const width of posterWidths) {
    const resized = sharp(posterSrc).resize({ width, withoutEnlargement: true });
    await Promise.all([
      resized.clone().avif({ quality: 62, effort: 5 }).toFile(path.join(OUT_IMG, `hero-poster-${width}.avif`)),
      resized.clone().webp({ quality: 76, effort: 5 }).toFile(path.join(OUT_IMG, `hero-poster-${width}.webp`)),
      resized.clone().jpeg({ quality: 80, mozjpeg: true }).toFile(path.join(OUT_IMG, `hero-poster-${width}.jpg`)),
    ]);
  }

  return posterSrc;
}

async function buildOg(posterSrc) {
  await sharp(posterSrc)
    .resize(1200, 630, { fit: "cover", position: "attention" })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(OUT_OG, "og-barrel.jpg"));
}

async function buildFavicons() {
  const svg = path.join(ROOT, "assets/brand/favicon.svg");
  const ico = path.join(ROOT, "assets/brand/favicon.ico");
  const appleSource = path.join(ROOT, "assets/brand/apple-touch-icon.png");

  await copyFile(svg, path.join(OUT_FAVICON, "favicon.svg"));
  await copyFile(ico, path.join(OUT_FAVICON, "favicon.ico"));
  await copyFile(appleSource, path.join(OUT_FAVICON, "apple-touch-icon.png"));

  for (const size of [32, 192, 512]) {
    await sharp(svg, { density: 512 })
      .resize(size, size)
      .png({ compressionLevel: 9 })
      .toFile(path.join(OUT_FAVICON, `favicon-${size}.png`));
  }
}

async function writeManifest() {
  const manifest = {
    name: "Barrel — szkoła surfingu",
    short_name: "Barrel",
    description: "Projekt koncepcyjny szkoły surfingu w Wydmowie.",
    start_url: "/",
    display: "standalone",
    background_color: "#F7F5EF",
    theme_color: "#12294F",
    icons: [
      { src: "/assets/favicon/favicon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/assets/favicon/favicon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
  await writeFile(
    path.join(ROOT, "site.webmanifest"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
}

async function main() {
  console.log("Barrel media build\n");
  await ensureDirs();

  const files = (await readdir(SOURCE_IMAGES)).filter((f) =>
    /\.(jpe?g|png|webp)$/i.test(f),
  );
  const results = [];
  for (const file of files) {
    const baseName = IMAGE_MAP[file] ?? path.parse(file).name;
    console.log(`→ images: ${file} as ${baseName}`);
    results.push(await optimizeImage(path.join(SOURCE_IMAGES, file), baseName));
  }

  console.log("\n→ video: 8 s, 1080p/720p, MP4 + WebM");
  const posterSrc = await buildVideo();
  console.log("→ og image 1200x630");
  await buildOg(posterSrc);
  console.log("→ favicons + manifest");
  await buildFavicons();
  await writeManifest();

  console.log("\nGenerated assets:");
  for (const dir of [OUT_IMG, OUT_VIDEO, OUT_OG]) {
    const outFiles = await readdir(dir);
    let total = 0;
    for (const f of outFiles) total += await fileSize(path.join(dir, f));
    console.log(`  ${path.relative(ROOT, dir)}: ${outFiles.length} plików, ${mb(total)}`);
  }
  for (const f of await readdir(OUT_VIDEO)) {
    console.log(`    ${f}: ${mb(await fileSize(path.join(OUT_VIDEO, f)))}`);
  }
  console.log("\nDone.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
