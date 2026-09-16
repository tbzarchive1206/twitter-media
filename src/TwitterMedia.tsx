import { useMemo, useState } from "react";

type Media = { id: string; kind: "image" | "audio" | "video"; mimeType: string; name: string; date: number; year: number; account: string; members: string[] };
export type Archive = { generatedAt: string; sourceFolderId: string; accounts: string[]; media: Media[] };

const members = ["Group photo", "Sangyeon (상연)", "Jacob (제이콥)", "Younghoon (영훈)", "Hyunjae (현재)", "Juyeon (주연)", "Kevin (케빈)", "Q (큐, 창민)", "Sunwoo (선우)", "Eric (에릭)", "Hwall (2017 - 2019) (활)", "Haknyeon (2017 - 2025) (학년)", "New (2017 - 2026) (뉴, 찬희)"];
const memberId = (value: string) => value.replace(/\s*\(.*/, "");
const pageSize = 30;
const thumbnail = (id: string) => `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w1200`;
const fileUrl = (id: string) => `https://drive.google.com/file/d/${encodeURIComponent(id)}/view`;
const dateLabel = (date: number) => String(date).slice(2);

function Tile({ item }: { item: Media }) {
  return <figure className="media-tile">
    <a href={fileUrl(item.id)} target="_blank" rel="noreferrer" aria-label={`Open ${dateLabel(item.date)} in Google Drive`}>
      {item.kind === "image" ? <img src={thumbnail(item.id)} alt="" loading="lazy" /> : <div className="media-placeholder">{item.kind.toUpperCase()}</div>}
    </a>
    <figcaption><span>{dateLabel(item.date)}</span><a href={fileUrl(item.id)} target="_blank" rel="noreferrer">VIEW ↗</a></figcaption>
  </figure>;
}

export function TwitterMedia({ data }: { data: Archive }) {
  const [query, setQuery] = useState("");
  const [account, setAccount] = useState("all");
  const [year, setYear] = useState("all");
  const [member, setMember] = useState("all");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [shown, setShown] = useState(pageSize);
  const years = useMemo(() => [...new Set(data.media.map((item) => item.year).filter(Boolean))].sort((a, b) => b - a), [data]);
  const results = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();
    return data.media.filter((item) => account === "all" || item.account === account)
      .filter((item) => year === "all" || item.year === Number(year))
      .filter((item) => member === "all" || item.members.includes(member))
      .filter((item) => !search || [item.name, item.account, ...item.members, String(item.date)].join(" ").toLocaleLowerCase().includes(search))
      .sort((a, b) => sort === "newest" ? b.date - a.date : a.date - b.date);
  }, [account, data, member, query, sort, year]);
  const update = (fn: () => void) => { fn(); setShown(pageSize); };
  const sourceUrl = `https://drive.google.com/drive/folders/${encodeURIComponent(data.sourceFolderId)}`;
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
      <div className="member-tabs"><button className={member === "all" ? "selected" : ""} onClick={() => update(() => setMember("all"))}>ALL</button>{members.map((name) => { const id = memberId(name); return <button className={member === id ? "selected" : ""} onClick={() => update(() => setMember(id))} key={id}>{name}</button>; })}</div>
    </section>
    <section className="archive-section"><div className="results-head"><p>{results.length.toLocaleString("en-US")} RESULTS · {sort === "newest" ? "NEWEST FIRST" : "OLDEST FIRST"}</p><a href={sourceUrl} target="_blank" rel="noreferrer">OPEN SOURCE FOLDER ↗</a></div>
      {results.length ? <div className="media-grid">{results.slice(0, shown).map((item) => <Tile key={item.id} item={item} />)}</div> : <div className="empty"><strong>NO RESULTS</strong>TRY CHANGING THE SEARCH OR FILTERS.</div>}
      {shown < results.length && <button className="load-more" onClick={() => setShown((value) => value + pageSize)}>LOAD MORE MEDIA ↓</button>}
    </section>
    <footer><a href="https://tbzarchive.com/">← MAIN ARCHIVE</a><a href="#top">BACK TO TOP ↑</a></footer>
  </main>;
}
