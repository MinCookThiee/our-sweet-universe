export default function MemoryDetailLoading() {
  return <section className="memory-detail-loading" aria-label="Loading memory" aria-live="polite">
    <span className="sr-only">Loading memory</span>
    <div className="memory-detail-loading-back" />
    <div className="memory-detail-loading-paper">
      <span /><b /><i /><em />
      <div><span /><span /></div>
    </div>
  </section>;
}
