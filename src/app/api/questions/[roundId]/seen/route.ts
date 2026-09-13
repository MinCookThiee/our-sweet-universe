import { NextResponse } from "next/server";
import { markLittleQuestionSeen } from "@/lib/little-questions";

export const dynamic = "force-dynamic";

export async function POST(_request: Request, { params }: { params: Promise<{ roundId: string }> }) {
  const { roundId } = await params;
  const seen = await markLittleQuestionSeen(roundId);
  return NextResponse.json({ seen }, { status: seen ? 200 : 404 });
}
