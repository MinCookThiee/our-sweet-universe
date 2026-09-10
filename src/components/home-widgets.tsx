"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Check, Heart, ImagePlus, Maximize2, MessageCircleHeart, Minimize2, Pencil, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { saveHomeWidgets } from "@/app/space/customize/actions";
import type { HomeWidgetConfig, HomeWidgetId } from "@/lib/home-widgets";

type Memory = { id: string; title: string; body: string; happenedOn: string; isMilestone: boolean } | null;

export function HomeWidgets({ config, latest, milestone, memoryCount, heartPhotoSrc }: { config: HomeWidgetConfig[]; latest: Memory; milestone: Memory; memoryCount: number; heartPhotoSrc?: string }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(config);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const favorite = milestone ?? latest;
  const active = draft.filter(({ visible }) => visible);
  const move = (index: number, direction: -1 | 1) => setDraft((items) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return items;
    const next = [...items];
    [next[index], next[target]] = [next[target]!, next[index]!];
    return next;
  });
  const toggleSize = (id: HomeWidgetId) => setDraft((items) => items.map((item) => item.id === id ? { ...item, size: item.size === "half" ? "full" : "half" } : item));
  const begin = () => { setDraft(config); setMessage(""); setEditing(true); };
  const cancel = () => { setDraft(config); setMessage(""); setEditing(false); };
  const save = () => startTransition(async () => {
    const result = await saveHomeWidgets(draft);
    setMessage(result.message);
    if (result.success) setEditing(false);
  });
  const widget = {
    photo: <a className="home-widget home-widget-photo" href={editing ? undefined : "#couple-card"}>
      <span className="home-widget-icon"><ImagePlus size={18} aria-hidden="true" /></span>
      {heartPhotoSrc ? <span className="home-photo-preview" style={{ backgroundImage: `url(${heartPhotoSrc})` }} aria-hidden="true" /> : <span className="home-photo-placeholder" aria-hidden="true">♡</span>}
      <p>OUR PHOTOS</p><small><b>{heartPhotoSrc ? "Change photos ↑" : "Add a photo ↑"}</b></small>
    </a>,
    jar: <Link className="home-widget home-widget-jar" href="/space/jar" onClick={(event) => editing && event.preventDefault()}>
      <span className="home-widget-icon"><Sparkles size={19} aria-hidden="true" /></span><p>MEMORY JAR</p><h3>A tiny note for us.</h3><span>Save a little thought to open later.</span><small><b>Open the jar →</b></small>
    </Link>,
    question: <Link className="home-widget home-widget-question" href="/space/questions" onClick={(event) => editing && event.preventDefault()}>
      <span className="home-widget-icon"><MessageCircleHeart size={19} aria-hidden="true" /></span><p>ONE LITTLE QUESTION</p><h3>A shared thought.</h3><span>Answer in private, then read each other’s words together.</span><small><b>Open it →</b></small>
    </Link>,
    memory: <Link className="home-widget home-widget-memory" href={favorite ? `/space/memories/${favorite.id}` : "/space/memories/new"} onClick={(event) => editing && event.preventDefault()}>
      <span className="home-widget-icon"><Heart size={19} aria-hidden="true" /></span><p>{favorite?.isMilestone ? "A FAVORITE MEMORY" : "OUR LATEST MEMORY"}</p><h3>{favorite ? favorite.title : "Write our first memory."}</h3><span>{favorite ? favorite.body : "A little ordinary day can be worth keeping too."}</span><small>{favorite ? favorite.happenedOn : "Start here"} <b>{memoryCount ? "Open →" : "Write →"}</b></small>
    </Link>,
  } satisfies Record<HomeWidgetId, ReactNode>;
  return <section className={`home-widgets${editing ? " home-widgets-editing" : ""}`} aria-labelledby="little-corners">
    <div className="home-widgets-heading">
      <div><p className="eyebrow">A LITTLE CORNER OF US</p><h2 id="little-corners">Our little shelf.</h2></div>
      {!editing ? <button type="button" className="home-customize-link" onClick={begin}><SlidersHorizontal size={16} aria-hidden="true" />Customize home</button> : <span className="home-editing-label"><Pencil size={14} aria-hidden="true" />Editing Home</span>}
    </div>
    {editing && <p className="home-editing-note">Try the arrangement here. Nothing changes for your person until you save.</p>}
    <div className="home-widget-grid">
      {active.map((item, index) => <div className={item.size === "full" ? "home-widget-cell home-widget-wide" : "home-widget-cell"} key={item.id}>
        {widget[item.id]}
        {editing && <div className="home-widget-edit-controls" aria-label={`Edit ${item.id} widget`}>
          <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move up"><ArrowUp size={16} /></button>
          <button type="button" onClick={() => move(index, 1)} disabled={index === active.length - 1} aria-label="Move down"><ArrowDown size={16} /></button>
          <button type="button" onClick={() => toggleSize(item.id)} aria-label={item.size === "half" ? "Make full width" : "Make half width"}>{item.size === "half" ? <Maximize2 size={16} /> : <Minimize2 size={16} />}</button>
        </div>}
      </div>)}
    </div>
    {editing && <div className="home-widget-edit-footer"><p role="status">{message || "Move, resize, then save when it feels right."}</p><div><button type="button" className="home-edit-cancel" onClick={cancel} disabled={pending}><X size={17} aria-hidden="true" />Cancel</button><button type="button" className="button" onClick={save} disabled={pending}>{pending ? "Saving…" : <><Check size={17} aria-hidden="true" />Save Home</>}</button></div></div>}
  </section>;
}
