import Link from "next/link";
import { listMemoryCards } from "@/lib/memories";
import { MemoryCover } from "./memory-cover";

function monthLabel(date: string) {
  return new Intl.DateTimeFormat("en", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));
}

export async function MemoryList({
  page,
  story = false,
}: {
  page: number;
  story?: boolean;
}) {
  const rows = await listMemoryCards(page, story);
  const base = story ? "/space/story" : "/space/memories";
  const visibleRows = rows.slice(0, 20);
  const eagerCoverIds = new Set(visibleRows.slice(0, 2).map((memory) => memory.id));
  const monthGroups = visibleRows.reduce<Map<string, typeof visibleRows>>((groups, memory) => {
    const month = monthLabel(memory.happenedOn);
    groups.set(month, [...(groups.get(month) ?? []), memory]);
    return groups;
  }, new Map());
  return (
    <>
      {rows.length ? (
        story ? <div className="private-timeline">
          {visibleRows.map((memory) => <Link className="private-memory" key={memory.id} href={`/space/memories/${memory.id}`}>
            <div className="memory-meta"><time dateTime={memory.happenedOn}>{memory.happenedOn}</time><span>♡ Milestone</span></div>
            <h2>{memory.title}</h2><p>{memory.body}</p>{memory.location && <small>{memory.location}</small>}<span className="memory-open">Open memory →</span>
          </Link>)}
        </div> : <div className="memory-month-list">
          {[...monthGroups].map(([month, memories]) => <section className="memory-month" key={month} aria-labelledby={`month-${month}`}>
            <h2 id={`month-${month}`}>{month}</h2>
            <div className="memory-card-stack">
              {memories.map((memory) => <Link className={memory.photoIds.length ? "memory-card memory-card-photo" : "memory-card"} key={memory.id} href={`/space/memories/${memory.id}`}>
                {memory.photoIds.length ? <MemoryCover assetIds={memory.photoIds} eager={eagerCoverIds.has(memory.id)} /> : <span className="memory-card-note" aria-hidden="true">♡</span>}
                <span className="memory-card-content">
                  <span className="memory-card-meta"><time dateTime={memory.happenedOn}>{memory.happenedOn}</time>{memory.isMilestone && <b>♡ Milestone</b>}</span>
                  <strong>{memory.title}</strong>
                  <span className="memory-card-body">{memory.body}</span>
                  {memory.location && <small>⌖ {memory.location}</small>}
                  <span className="memory-card-open">Open memory <span aria-hidden="true">→</span></span>
                </span>
              </Link>)}
            </div>
          </section>)}
        </div>
      ) : (
        <div className="private-empty">
          <span aria-hidden="true">♡</span>
          <h2>{page > 1 ? "You’re all caught up." : story ? "Every story starts somewhere." : "Our first memory starts here."}</h2>
          <p>{story ? "Mark a memory as a milestone to add it to Our Story." : "A tiny moment, a lovely day—keep the part you don’t want to forget."}</p>
          <Link className="button" href="/space/memories/new">Keep a memory</Link>
        </div>
      )}
      <nav className="pagination" aria-label="Memory pages">
        {page > 1 && <Link className="quiet-link" href={`${base}?page=${page - 1}`}>← Newer</Link>}
        {rows.length > 20 && <Link className="quiet-link" href={`${base}?page=${page + 1}`}>Older →</Link>}
      </nav>
    </>
  );
}
