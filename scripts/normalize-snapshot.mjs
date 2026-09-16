import fs from "node:fs/promises";
import { writeNormalized } from "./archive-tools.mjs";

const raw = JSON.parse(await fs.readFile(new URL("../app/data/archive.json", import.meta.url), "utf8"));
await writeNormalized(raw, new URL("../app/data/archive.generated.json", import.meta.url));
