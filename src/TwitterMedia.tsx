import { useEffect, useMemo, useRef, useState } from "react";

type Media = { id: string; kind: "image" | "audio" | "video"; mimeType: string; name: string; date: number; year: number; account: string; members: string[] };
export type Archive = { generatedAt: string; sourceFolderId: string; accounts: string[]; media: Media[] };

const members = [{ id: "Group photo", label: "Group photo" }, { id: "Sangyeon", label: "Sangyeon" }, { id: "Jacob", label: "Jacob" }, { id: "Younghoon", label: "Younghoon" }, { id: "Hyunjae", label: "Hyunjae" }, { id: "Juyeon", label: "Juyeon" }, { id: "Kevin", label: "Kevin" }, { id: "Q", label: "Q" }, { id: "Sunwoo", label: "Sunwoo" }, { id: "Eric", label: "Eric" }, { id: "Hwall", label: "Hwall (2017 - 2019)" }, { id: "Haknyeon", label: "Haknyeon (2017 - 2025)" }, { id: "New", label: "New (2017 - 2026)" }];
const pageSize = 30;
const thumbnail = (id: string) => `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w1200`;
const fileUrl = (id: string) => `https://drive.google.com/file/d/${encodeURIComponent(id)}/view`;
const downloadUrl = (id: string) => `https://drive.google.com/uc?export=download&id=${encodeURIComponent(id)}`;
const previewUrl = (id: string) => `https://drive.google.com/file/d/${encodeURIComponent(id)}/preview`;
const dateLabel = (date: number) => String(date).slice(2);
const memberMatches = (members: string[], selected: string) => members.some((member) => member === selected || member.replace(/\s*\(.*/, "") === selected);

function Tile({ item, onOpen }: { item: Media; onOpen: (item: Media) => void }) {
  return <article className="media-card">
    {item.kind === "video" ? <iframe className="media-preview media-video" src={previewUrl(item.id)} title={`Video from ${dateLabel(item.date)}`} allow="autoplay; fullscreen" loading="lazy" /> : <button className="media-preview" onClick={() => onOpen(item)} aria-label={`View ${dateLabel(item.date)} on this page`}>
      {item.kind === "image" ? <img src={thumbnail(item.id)} alt="" loading="lazy" /> : <span>{item.kind.toUpperCase()}<br />OPEN ON GOOGLE DRIVE</span>}
    </button>}
    <div className="media-info"><div className="media-name">{dateLabel(item.date)}</div><div className="media-actions">{item.kind === "image" ? <button onClick={() => onOpen(item)}>VIEW ↗</button> : <a href={fileUrl(item.id)} target="_blank" rel="noreferrer">VIEW ↗</a>}<a href={downloadUrl(item.id)} target="_blank" rel="noreferrer">DOWNLOAD</a></div></div>
  </article>;
}

export function TwitterMedia({ data }: { data: Archive }) {
  const [query, setQuery] = useState("");
  const [account, setAccount] = useState("all");
  const [year, setYear] = useState("all");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [openMedia, setOpenMedia] = useState<Media | null>(null);
  const touchStartX = useRef<number | null>(null);
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [shown, setShown] = useState(pageSize);
  const years = useMemo(() => [...new Set(data.media.map((item) => item.year).filter(Boolean))].sort((a, b) => b - a), [data]);
  const results = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();
    return data.media.filter((item) => account === "all" || item.account === account)
      .filter((item) => year === "all" || item.year === Number(year))
      .filter((item) => selectedMembers.every((selected) => memberMatches(item.members, selected)))
      .filter((item) => !search || [item.name, item.account, ...item.members, String(item.date)].join(" ").toLocaleLowerCase().includes(search))
      .sort((a, b) => sort === "newest" ? b.date - a.date : a.date - b.date);
  }, [account, data, query, selectedMembers, sort, year]);
  const update = (fn: () => void) => { fn(); setShown(pageSize); };
  const sourceUrl = `https://drive.google.com/drive/folders/${encodeURIComponent(data.sourceFolderId)}`;
  const toggleMember = (id: string) => update(() => setSelectedMembers((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  const openItem = (item: Media) => setOpenMedia(item);
  const openIndex = openMedia ? results.findIndex((item) => item.id === openMedia.id) : -1;
  const moveImage = (direction: -1 | 1) => {
    if (!results.length || openIndex < 0) return;
    setOpenMedia(results[(openIndex + direction + results.length) % results.length]);
  };
  useEffect(() => { document.body.classList.toggle("modal-open", Boolean(openMedia)); return () => document.body.classList.remove("modal-open"); }, [openMedia]);
  useEffect(() => {
    if (!openMedia) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") moveImage(-1);
      if (event.key === "ArrowRight") moveImage(1);
      if (event.key === "Escape") setOpenMedia(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openMedia, openIndex, results]);
  return <main id="top">
    <header className="masthead">
      <div className="utility"><a className="brand" href="https://tbzarchive.com">THE BOYZ / FAN ARCHIVE</a><nav><span>TWITTER MEDIA</span><span>/</span><a href="https://x.com/tbzarchive1206_" target="_blank" rel="noreferrer">TWITTER ↗</a></nav></div>
      <h1><span className="solid">TWITTER MEDIA</span><span className="outline">ARCHIVE</span></h1>
      <div className="stats"><p><strong>{data.media.length.toLocaleString("en-US")}</strong> MEDIA FILES</p><i /><p><strong>{data.accounts.length}</strong> ACCOUNTS</p><i /><p>UPDATED <strong>{new Date(data.generatedAt).toLocaleDateString("en-GB")}</strong></p></div>
    </header>
    <section className="controls" aria-label="Twitter media filters">
      <label className="search"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => update(() => setQuery(event.target.value))} type="search" placeholder="SEARCH DATE, MEMBER OR ACCOUNT..." /></label>
      <div className="filter-row">
        <label>ACCOUNT<select value={account} onChange={(event) => update(() => setAccount(event.target.value))}><option value="all">ALL ACCOUNTS</option>{data.accounts.map((name) => <option key={name}>{name}</option>)}</select></label>
        <label>YEAR<select value={year} onChange={(event) => update(() => setYear(event.target.value))}><option value="all">ALL YEARS</option>{years.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label>SORT<select value={sort} onChange={(event) => update(() => setSort(event.target.value as "newest" | "oldest"))}><option value="newest">NEWEST FIRST</option><option value="oldest">OLDEST FIRST</option></select></label>
      </div>
      <div className="member-tabs" aria-label="Filter by one or more members"><button className={selectedMembers.length === 0 ? "selected" : ""} onClick={() => update(() => setSelectedMembers([]))}>ALL</button>{members.map(({ id, label }) => <button className={selectedMembers.includes(id) ? "selected" : ""} onClick={() => toggleMember(id)} key={id} aria-pressed={selectedMembers.includes(id)}>{label}</button>)}</div>
    </section>
    <section className="archive-section"><div className="results-head"><p>{results.length.toLocaleString("en-US")} RESULTS · {sort === "newest" ? "NEWEST FIRST" : "OLDEST FIRST"}</p><a href={sourceUrl} target="_blank" rel="noreferrer">OPEN SOURCE FOLDER ↗</a></div>
      {results.length ? <div className="media-grid">{results.slice(0, shown).map((item) => <Tile key={item.id} item={item} onOpen={openItem} />)}</div> : <div className="empty"><strong>NO RESULTS</strong>TRY CHANGING THE SEARCH OR FILTERS.</div>}
      {shown < results.length && <button className="load-more" onClick={() => setShown((value) => value + pageSize)}>LOAD MORE MEDIA ↓</button>}
    </section>
    <footer><a href="https://tbzarchive.com/">← MAIN ARCHIVE</a><a href="#top">BACK TO TOP ↑</a></footer>
    {openMedia && <div className="image-dialog" role="dialog" aria-modal="true" aria-label={`Image from ${dateLabel(openMedia.date)}`} onClick={() => setOpenMedia(null)}><div className="image-dialog-shell" onClick={(event) => event.stopPropagation()} onTouchStart={(event) => { touchStartX.current = event.touches[0]?.clientX ?? null; }} onTouchEnd={(event) => { const start = touchStartX.current; const end = event.changedTouches[0]?.clientX; touchStartX.current = null; if (start !== null && end !== undefined && Math.abs(start - end) > 45) moveImage(start > end ? 1 : -1); }}><header><span>{dateLabel(openMedia.date)} · {openIndex + 1} / {results.length}</span><div><a href={downloadUrl(openMedia.id)} target="_blank" rel="noreferrer">DOWNLOAD</a><button onClick={() => setOpenMedia(null)} aria-label="Close image preview">×</button></div></header><button className="image-nav previous" onClick={() => moveImage(-1)} aria-label="Previous image">←</button><img src={thumbnail(openMedia.id).replace("w1200", "w2400")} alt="" /><button className="image-nav next" onClick={() => moveImage(1)} aria-label="Next image">→</button></div></div>}
  </main>;
}
