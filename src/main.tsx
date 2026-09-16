import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import archiveData from "../app/data/archive.generated.json";
import { TwitterMedia, type Archive } from "./TwitterMedia";
import "./styles.css";
import "./audio.css";
import "./twitter-media.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TwitterMedia data={archiveData as Archive} />
  </StrictMode>,
);
