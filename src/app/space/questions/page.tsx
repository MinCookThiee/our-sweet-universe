import { LittleQuestionCard } from "@/components/little-question-card";
import { LittleQuestionHistory } from "@/components/little-question-history";
import { getCompletedLittleQuestions, getLittleQuestionView } from "@/lib/little-questions";

export const dynamic = "force-dynamic";

export default async function QuestionsPage() {
  const question = await getLittleQuestionView();
  const history = await getCompletedLittleQuestions(
    question.phase === "revealed" ? question.question?.id : undefined,
  );
  return <><LittleQuestionCard question={question} /><LittleQuestionHistory questions={history} /></>;
}
