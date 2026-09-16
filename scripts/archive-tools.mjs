import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT_FOLDER_ID = "1Wc7JGA7jKKOTY6ZH5xoQJVRArr2mNo_6";

const memberRules = [
  ["Group photo", /group photo/iu],
  ["Sangyeon", /(상연|sangyeon)/iu],
  ["Jacob", /(제이콥|jacob)/iu],
  ["Younghoon", /(영훈|younghoon)/iu],
  ["Hyunjae", /(현재|hyunjae)/iu],
  ["Juyeon", /(주연|juyeon)/iu],
  ["Kevin", /(케빈|kevin)/iu],
  ["Q", /(창민|큐|changmin|\bq\b)/iu],
  ["Sunwoo", /(선우|sunwoo)/iu],
  ["Eric", /(에릭|eric)/iu],
  ["Hwall", /(활|hwall)/iu],
  ["Haknyeon", /(학년|haknyeon)/iu],
  ["New", /(찬희|뉴|chanhee|\bnew\b)/iu],
];

function dateCode(value, fallback = "") {
  const match = String(value).match(/(?<!\d)(\d{6})(?!\d)/);
  if (match) return Number(`20${match[1]}`);
  const time = Date.parse(fallback);
  if (!Number.isNaN(time)) {
    const d = new Date(time);
    return Number(`${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`);
  }
  return 0;
}

function compactMedia(node) {
  const kind = node.mimeType.startsWith("image/") ? "image" : node.mimeType.startsWith("audio/") ? "audio" : node.mimeType.startsWith("video/") ? "video" : "other";
  const date = dateCode(node.name, node.modifiedTime);
  const searchable = [node.name, ...node.path].join(" ");
  return { id: node.id, kind, mimeType: node.mimeType, name: node.name, date, year: Number(String(date).slice(0, 4)), account: node.path[1] || "Unsorted", members: memberRules.filter(([, rule]) => rule.test(searchable)).map(([name]) => name) };
}

export function normalizeArchive(raw) {
  const media = raw.nodes.filter((node) => node.type === "file").map(compactMedia).filter((item) => item.kind !== "other").sort((a, b) => b.date - a.date || a.name.localeCompare(b.name));
  const accounts = [...new Set(media.map((item) => item.account))].sort((a, b) => a.localeCompare(b));
  return {
    generatedAt: raw.generatedAt,
    sourceFolderId: ROOT_FOLDER_ID,
    accounts,
    media,
  };
}

export async function writeNormalized(raw, outputFile) {
  const target = outputFile instanceof URL ? fileURLToPath(outputFile) : outputFile;
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, `${JSON.stringify(normalizeArchive(raw))}\n`, "utf8");
}
