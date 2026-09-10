"use client";
/* eslint-disable @next/next/no-img-element -- private media is served through the session-protected app endpoint. */

import { useEffect, useRef, useState } from "react";

export function MemoryCover({ assetId, eager = false }: { assetId: string; eager?: boolean }) {
  const image = useRef<HTMLImageElement>(null);
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");

  useEffect(() => {
    const current = image.current;
    if (!current?.complete) return;
    setState(current.naturalWidth > 0 ? "ready" : "failed");
  }, []);

  return <span className={`memory-cover memory-cover-${state}`}>
    <span className="memory-cover-shimmer" aria-hidden="true" />
    <span className="memory-card-note" aria-hidden="true">♡</span>
    <img ref={image} className="memory-card-image" src={`/api/media/${assetId}`} alt="" loading={eager ? "eager" : "lazy"} fetchPriority={eager ? "high" : "auto"} decoding="async" onLoad={() => setState("ready")} onError={() => setState("failed")} />
  </span>;
}
