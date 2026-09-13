import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { requireCouple } from "@/lib/authorization";
import { getDb } from "@/lib/db";
import { littleQuestionViews } from "@/lib/db/schema";
import { getLittleQuestionView } from "@/lib/little-questions";

export const dynamic = "force-dynamic";

export async function GET() {
  const [actor, question] = await Promise.all([requireCouple(), getLittleQuestionView()]);
  if (!question.question || question.phase === "waiting" || question.phase === "revealed" || question.phase === "rested") {
    return NextResponse.json({ attention: null });
  }

  if (question.phase === "rest_requested" && !question.restRequestedByMe) {
    return NextResponse.json({ attention: "rest-request" });
  }

  const [view] = await getDb()
    .select({ roundId: littleQuestionViews.roundId })
    .from(littleQuestionViews)
    .where(and(eq(littleQuestionViews.roundId, question.question.id), eq(littleQuestionViews.userId, actor.userId)))
    .limit(1);

  if (!view) return NextResponse.json({ attention: "new" });
  if (question.nearDecisionTime) return NextResponse.json({ attention: "gentle-reminder" });
  if (question.phase === "decision" && !question.ownAnswer) return NextResponse.json({ attention: "decision" });
  return NextResponse.json({ attention: null });
}
