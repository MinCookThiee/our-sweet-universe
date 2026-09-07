"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import {
  ArrowRight,
  Heart,
  Sparkles,
  Mail,
  Camera,
  X,
  MapPin,
  ImagePlus,
  BookOpen,
} from "lucide-react";
import { demoMemories, demoNotes } from "@/lib/demo";
import { anniversaryStats } from "@/lib/dates";
const format = (date: string) =>
  new Date(`${date}T12:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
function Heading({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description: string;
}) {
  return (
    <div className="page-heading">
      <p className="eyebrow">{label}</p>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}
function MemoryCards({ swipe = false }: { swipe?: boolean }) {
  const [selected, setSelected] = useState<
    (typeof demoMemories)[number] | null
  >(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (selected) dialog.current?.showModal();
    else dialog.current?.close();
  }, [selected]);
  return (
    <>
      <div className={swipe ? "memory-grid swipe-memories" : "memory-grid"}>
        {demoMemories.map((memory, i) => (
          <button
            onClick={() => setSelected(memory)}
            className="memory-card"
            key={memory.id}
          >
            <div className={`memory-cover cover-${i}`}>
              <span className="chapter">0{i + 1}</span>
              <span className="cover-label">{memory.category}</span>
              <BookOpen size={28} />
            </div>
            <div className="memory-info">
              <small>{format(memory.date)}</small>
              <h3>{memory.title}</h3>
              <span>
                <MapPin size={13} />
                {memory.location}
              </span>
            </div>
          </button>
        ))}
      </div>
      <dialog
        ref={dialog}
        className="detail"
        aria-label={selected?.title ?? "Memory"}
        onClose={() => setSelected(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setSelected(null);
        }}
      >
        {selected && (
          <div>
            <button
              autoFocus
              className="close"
              aria-label="Close memory"
              onClick={() => setSelected(null)}
            >
              <X />
            </button>
            <p className="eyebrow">A SAMPLE MEMORY</p>
            <h2>{selected.title}</h2>
            <small>
              {format(selected.date)} · {selected.location}
            </small>
            <p className="memory-body">{selected.body}</p>
            <button
              className="button detail-done"
              onClick={() => setSelected(null)}
            >
              Back to memories <Heart size={17} />
            </button>
          </div>
        )}
      </dialog>
    </>
  );
}
export function Preview({
  section,
  today,
}: {
  section: string;
  today: string;
}) {
  const stats = anniversaryStats("2025-09-14", today);
  const [noteIndex, setNoteIndex] = useState(-1);
  const [openLetter, setOpenLetter] = useState(false);
  if (section === "home")
    return (
      <>
        <Heading
          label="A LITTLE PLACE, ALL OURS"
          title="Hello, my favorite person."
          description="Let's keep a little piece of today."
        />
        <section className="home-hero">
          <div>
            <p className="eyebrow">YOU, ME & EVERYTHING IN BETWEEN</p>
            <h2>
              Ordinary days.
              <br />
              <em>Extraordinary us.</em>
            </h2>
            <p>
              Every laugh, every late-night conversation,
              <br />
              every little moment that became a memory.
            </p>
            <Link href="/demo/memories" className="button light">
              Revisit our memories <ArrowRight size={17} />
            </Link>
          </div>
          <div className="hero-stat">
            <Heart size={29} strokeWidth={1} />
            <strong>{stats.daysTogether.toLocaleString()}</strong>
            <span>DAYS OF US</span>
            <small>Since 14 September 2025 · sample</small>
          </div>
        </section>
        <div className="home-secondary">
          <Link className="countdown-card" href="/demo/anniversary">
            <span className="eyebrow">OUR NEXT CHAPTER</span>
            <div>
              <strong>
                {stats.daysUntil}
                <small> days</small>
              </strong>
              <Heart size={25} />
            </div>
            <p>
              Until our anniversary <ArrowRight size={16} />
            </p>
          </Link>
          <Link className="letter-teaser" href="/demo/letters">
            <Mail size={25} />
            <div>
              <span className="eyebrow">WORDS TO KEEP</span>
              <h3>A little love, just for you.</h3>
              <p>A little love, waiting to be opened.</p>
            </div>
            <ArrowRight size={20} />
          </Link>
        </div>
        <div className="section-heading">
          <h2>Little moments, big feelings</h2>
          <Link href="/demo/memories">
            All memories <ArrowRight size={16} />
          </Link>
        </div>
        <p className="swipe-hint">Swipe to explore · Tap a memory to open</p>
        <MemoryCards swipe />
      </>
    );
  if (section === "memories")
    return (
      <>
        <Heading
          label="THE DAYS WE KEEP"
          title="Our memories"
          description="Not every day was a milestone. Every one mattered."
        />
        <MemoryCards />
        <p className="sample-hint">
          Open a card to read a sample memory. Adding your own comes after
          private account setup.
        </p>
      </>
    );
  if (section === "story")
    return (
      <>
        <Heading
          label="HOW WE BECAME US"
          title="Our story"
          description="A few beginnings, and so much still unwritten."
        />
        <div className="timeline">
          {[...demoMemories].reverse().map((m, i) => (
            <article key={m.id}>
              <span className="timeline-number">0{i + 1}</span>
              <p className="eyebrow">{format(m.date)}</p>
              <h2>{m.title}</h2>
              <p>{m.body}</p>
            </article>
          ))}
        </div>
      </>
    );
  if (section === "gallery")
    return (
      <>
        <Heading
          label="THROUGH OUR EYES"
          title="Our gallery"
          description="A home for the photos and films that feel like us."
        />
        <section className="empty-state">
          <ImagePlus size={42} strokeWidth={1} />
          <h2>Your story deserves its own photos.</h2>
          <p>
            There are no personal photos in this preview.
            <br />
            Private photo and video uploads arrive in the media step.
          </p>
          <Link href="/demo/memories" className="button">
            Explore sample memories <Camera size={16} />
          </Link>
        </section>
      </>
    );
  if (section === "letters")
    return (
      <>
        <Heading
          label="FROM MY HEART TO YOURS"
          title="Love letters"
          description="The words we want to keep coming back to."
        />
        <button
          className="envelope"
          aria-expanded={openLetter}
          onClick={() => setOpenLetter(!openLetter)}
        >
          <Mail size={36} strokeWidth={1} />
          <span className="eyebrow">A SAMPLE LETTER</span>
          <h2>For an ordinary Tuesday</h2>
          <span>
            {openLetter ? "Fold this letter" : "Open this letter"}{" "}
            <ArrowRight size={16} />
          </span>
        </button>
        {openLetter && (
          <article className="letter-paper">
            <p>My favorite person,</p>
            <p>
              I used to think the best memories had to be big ones. A trip
              somewhere new. A day we planned for months.
            </p>
            <p>
              Then there was you. And now it’s the small things: your laugh from
              the other room, the first sip of coffee, a walk with nowhere to
              be.
            </p>
            <p>Thank you for making ordinary days worth remembering.</p>
            <p>Always, with love ♡</p>
          </article>
        )}
      </>
    );
  if (section === "jar")
    return (
      <>
        <Heading
          label="A LITTLE LOVE, PICKED FOR YOU"
          title="The memory jar"
          description="For the days you need a small reason to smile."
        />
        <section className="jar-panel">
          <Sparkles size={38} strokeWidth={1} />
          <p className="eyebrow">LITTLE REMINDERS OF US</p>
          <blockquote aria-live="polite">
            <span key={noteIndex} className="note-reveal">
              {noteIndex < 0
                ? "A little happiness is waiting in here."
                : demoNotes[noteIndex]}
            </span>
          </blockquote>
          <button
            className="button"
            onClick={() =>
              setNoteIndex((previous) => {
                const choices = demoNotes
                  .map((_, i) => i)
                  .filter((i) => i !== previous);
                return choices[Math.floor(Math.random() * choices.length)];
              })
            }
          >
            {noteIndex < 0 ? "Pick a little note" : "Another little note"}
            <Sparkles size={16} />
          </button>
          <small>3 fictional notes · preview only</small>
        </section>
      </>
    );
  return (
    <>
      <Heading
        label="ANOTHER YEAR, A LITTLE MORE US"
        title="Counting down to us"
        description="Something lovely to look forward to."
      />
      <section className="anniversary-panel">
        <Heart size={36} strokeWidth={1} />
        <strong>{stats.daysUntil}</strong>
        <span className="eyebrow">DAYS UNTIL OUR ANNIVERSARY</span>
        <h2>{format(stats.nextDate)}</h2>
        <p>
          {stats.daysTogether.toLocaleString()} days together, and counting.
        </p>
        <small>
          Sample date: 14 September 2025 · Asia/Bangkok
          <br />
          Calendar days; February 29 is celebrated on February 28 in non-leap
          years.
        </small>
      </section>
    </>
  );
}
