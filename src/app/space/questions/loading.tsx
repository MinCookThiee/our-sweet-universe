export default function QuestionsLoading() {
  return <section className="question-loading" aria-label="Loading One Little Question" aria-busy="true">
    <span className="question-loading-icon" />
    <span className="question-loading-line question-loading-overline" />
    <span className="question-loading-line question-loading-title" />
    <span className="question-loading-line question-loading-title short" />
    <span className="question-loading-prompt" />
    <span className="question-loading-input" />
    <span className="question-loading-button" />
  </section>;
}
