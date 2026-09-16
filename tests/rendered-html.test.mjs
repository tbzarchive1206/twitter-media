import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";
import { normalizeArchive, ROOT_FOLDER_ID } from "../scripts/archive-tools.mjs";

test("builds a self-contained GitHub Pages site", async () => {
  const html = await readFile(new URL("../dist/index.html", import.meta.url), "utf8");
  const assets = await readdir(new URL("../dist/assets/", import.meta.url));
  const script = await readFile(new URL(`../dist/assets/${assets.find((name) => name.endsWith(".js"))}`, import.meta.url), "utf8");
  assert.match(html, /TWITTER MEDIA/);
  assert.match(html, /\.\/assets\//);
  assert.match(script, /ALL ACCOUNTS/);
  assert.match(script, /Group photo/);
  assert.match(script, /Hwall \(2017 - 2019\)/);
});

test("normalizes files from accounts and extracts dates and Korean member names", () => {
  const archive = normalizeArchive({ generatedAt: "2026-01-01T00:00:00.000Z", nodes: [
    { id: "a", type: "file", name: "240615 현재 Group photo.jpg", mimeType: "image/jpeg", path: ["TWITTER MEDIA", "@IST_THEBOYZ", "2024"] },
    { id: "b", type: "file", name: "230101 Chanhee and Haknyeon with Hwall.mp4", mimeType: "video/mp4", path: ["TWITTER MEDIA", "@THEBOYZJAPAN", "2023"] },
  ] });
  assert.equal(ROOT_FOLDER_ID, "1Wc7JGA7jKKOTY6ZH5xoQJVRArr2mNo_6");
  assert.deepEqual(archive.accounts, ["@IST_THEBOYZ", "@THEBOYZJAPAN"]);
  assert.deepEqual(archive.media[0].members, ["Group photo", "Hyunjae"]);
  assert.deepEqual(archive.media[1].members, ["Hwall", "Haknyeon", "New"]);
  assert.equal(archive.media[0].date, 20240615);
});
