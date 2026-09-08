"use client";
import Link from "next/link";
import { useActionState, useState } from "react";
import { CoupleMainCard } from "./couple-main-card";
import { defaultCardText, type CardText } from "@/lib/card-text";
import { saveCardText } from "@/app/space/customize/actions";
import styles from "./card-customizer.module.css";
export function CardCustomizer({
  text,
  revision,
  name,
  togetherSince,
  timezone,
  initialToday,
}: {
  text: CardText;
  revision: number;
  name: string;
  togetherSince: string;
  timezone: string;
  initialToday: string;
}) {
  const [draft, setDraft] = useState(text);
  const [state, action, pending] = useActionState(saveCardText, {
    message: "",
  });
  return (
    <div className={styles.editor}>
      <form action={action} className="private-form">
        <input type="hidden" name="revision" value={revision} />
        <fieldset disabled={pending}>
          {(
            [
              { key: "ribbon", label: "Your names on the ribbon", max: 32 },
              { key: "heading", label: "Main heading", max: 70 },
              { key: "message", label: "Your little message", max: 160 },
            ] as const
          ).map(({ key, label, max }) => (
            <div key={key} className={styles.field}>
              <label htmlFor={key}>{label}</label>
              {key === "message" ? (
                <textarea
                  id={key}
                  name={key}
                  rows={3}
                  value={draft[key]}
                  onChange={(e) =>
                    setDraft({ ...draft, [key]: e.target.value })
                  }
                  required
                  maxLength={max}
                  aria-describedby={`${key}-count`}
                />
              ) : (
                <input
                  id={key}
                  name={key}
                  value={draft[key]}
                  onChange={(e) =>
                    setDraft({ ...draft, [key]: e.target.value })
                  }
                  required
                  maxLength={max}
                  aria-describedby={`${key}-count`}
                />
              )}
              <small id={`${key}-count`}>
                {draft[key].length}/{max}
              </small>
            </div>
          ))}
          <button className="button" type="submit">
            {pending ? "Saving…" : "Save to our Home"}
          </button>
          <button
            className={styles.reset}
            type="button"
            onClick={() => setDraft({ ...defaultCardText })}
          >
            Reset to default
          </button>
        </fieldset>
        <p role="status">{state.message}</p>
        <p className={styles.hint}>
          Changes are shared only after Save. Reset updates this preview first.
        </p>
        <Link className="quiet-link" href="/space">
          Cancel and return Home
        </Link>
      </form>
      <section className={styles.preview} aria-label="Card preview">
        <p className="eyebrow">LIVE PREVIEW · NOT SAVED YET</p>
        <CoupleMainCard
          name={name}
          togetherSince={togetherSince}
          timezone={timezone}
          initialToday={initialToday}
          text={draft}
        />
      </section>
    </div>
  );
}
