import Link from "next/link";
import { listMemories } from "@/lib/memories";
export async function MemoryList({
  page,
  story = false,
}: {
  page: number;
  story?: boolean;
}) {
  const rows = await listMemories(page, story);
  const base = story ? "/space/story" : "/space";
  return (
    <>
      {rows.length ? (
        <div className={story ? "private-timeline" : "private-memory-grid"}>
          {rows.slice(0, 20).map((memory) => (
            <Link
              className="private-memory"
              key={memory.id}
              href={`/space/memories/${memory.id}`}
            >
              <div className="memory-meta">
                <time dateTime={memory.happenedOn}>{memory.happenedOn}</time>
                {memory.isMilestone && <span>♡ Milestone</span>}
              </div>
              <h2>{memory.title}</h2>
              <p>{memory.body}</p>
              {memory.location && <small>{memory.location}</small>}
              <span className="memory-open">Open memory →</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="private-empty">
          <span aria-hidden="true">♡</span>
          <h2>
            {page > 1
              ? "You’re all caught up."
              : story
                ? "Every story starts somewhere."
                : "Our first memory starts here."}
          </h2>
          <p>
            {story
              ? "Mark a memory as a milestone to add it to Our Story."
              : "A tiny moment, a lovely day—keep the part you don’t want to forget."}
          </p>
          <Link className="button" href="/space/memories/new">
            Add a memory
          </Link>
        </div>
      )}
      <nav className="pagination" aria-label="Memory pages">
        {page > 1 && (
          <Link className="quiet-link" href={`${base}?page=${page - 1}`}>
            ← Newer
          </Link>
        )}
        {rows.length > 20 && (
          <Link className="quiet-link" href={`${base}?page=${page + 1}`}>
            Older →
          </Link>
        )}
      </nav>
    </>
  );
}
