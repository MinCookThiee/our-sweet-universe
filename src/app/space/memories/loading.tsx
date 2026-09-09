export default function MemoriesLoading() {
  return <section className="memory-loading" aria-live="polite" aria-label="Loading memories">
    <span className="sr-only">Loading memories</span>
    <div className="loading-heading"><span /><span /></div>
    <div className="loading-memory-card" />
    <div className="loading-memory-card" />
    <div className="loading-memory-card" />
  </section>;
}
