"use client";

import { useEffect } from "react";

export function QuestionViewMarker({ roundId }: { roundId: string }) {
  useEffect(() => {
    void fetch(`/api/questions/${roundId}/seen`, { method: "POST", keepalive: true })
      .then(() => window.dispatchEvent(new Event("question-attention-changed")))
      .catch(() => undefined);
  }, [roundId]);
  return null;
}
