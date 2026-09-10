import { Heart } from "lucide-react";
import type { CompletedLittleQuestion } from "@/lib/little-questions";

function displayDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

export function LittleQuestionHistory({ questions }: { questions: CompletedLittleQuestion[] }) {
  if (!questions.length) return null;
  return (
    <section className="little-question-history" aria-labelledby="little-answer-history-title">
      <div className="little-question-history-heading">
        <Heart aria-hidden="true" />
        <div>
          <p className="eyebrow">KEPT TOGETHER</p>
          <h2 id="little-answer-history-title">Our little answers.</h2>
          <p>Small thoughts you have already shared with each other.</p>
        </div>
      </div>
      <div className="little-question-history-list">
        {questions.map((question) => (
          <article className="little-question-history-item" key={question.id}>
            <p className="little-question-history-date">{displayDate(question.questionDay)}</p>
            <h3>{question.prompt}</h3>
            <div className="little-question-history-answers">
              <div><small>Your answer</small><p>{question.ownAnswer}</p></div>
              <div><small>Your person’s answer</small><p>{question.partnerAnswer}</p></div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
