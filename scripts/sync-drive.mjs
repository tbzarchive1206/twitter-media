import { writeNormalized, ROOT_FOLDER_ID } from "./archive-tools.mjs";

const apiKey = process.env.GOOGLE_DRIVE_API_KEY;
if (!apiKey) throw new Error("Missing GOOGLE_DRIVE_API_KEY.");

async function listFolder(folderId) {
  const files = [];
  let pageToken = "";
  do {
    const params = new URLSearchParams({
      key: apiKey,
      q: `'${folderId}' in parents and trashed = false`,
      fields: "nextPageToken,files(id,name,mimeType,size,createdTime,modifiedTime)",
      pageSize: "1000",
      orderBy: "name",
    });
    if (pageToken) params.set("pageToken", pageToken);
    const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`);
    if (!response.ok) throw new Error(`Drive API ${response.status}: ${await response.text()}`);
    const data = await response.json();
    files.push(...data.files);
    pageToken = data.nextPageToken || "";
  } while (pageToken);
  return files;
}

const root = { id: ROOT_FOLDER_ID, title: "TWITTER MEDIA", path: [] };
let frontier = [root];
const nodes = [];
while (frontier.length) {
  const next = [];
  for (let index = 0; index < frontier.length; index += 8) {
    const batch = frontier.slice(index, index + 8);
    const results = await Promise.all(batch.map(async (folder) => ({ folder, files: await listFolder(folder.id) })));
    for (const { folder, files } of results) {
      for (const file of files) {
        const isFolder = file.mimeType === "application/vnd.google-apps.folder";
        const node = {
          id: file.id,
          name: file.name,
          mimeType: file.mimeType,
          type: isFolder ? "folder" : "file",
          size: file.size || null,
          createdTime: file.createdTime || null,
          modifiedTime: file.modifiedTime || null,
          path: [...folder.path, folder.title],
        };
        nodes.push(node);
        if (isFolder) next.push({ id: file.id, title: file.name, path: node.path });
      }
    }
  }
  frontier = next;
}

await writeNormalized({ generatedAt: new Date().toISOString(), nodes }, new URL("../app/data/archive.generated.json", import.meta.url));
console.log(`Synced ${nodes.length} Drive items.`);
