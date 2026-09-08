"use client";
import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import {
  defaultCrop,
  MAX_PHOTO_BYTES,
  photoGeometry,
  type SavedHeartPhoto,
} from "@/lib/heart-photo-input";
import styles from "./heart-photo-editor.module.css";
export function HeartPhotoEditor({
  photo,
  revision,
  ready,
  uploadsEnabled,
  onClose,
  onSaved,
}: {
  ready: boolean;
  uploadsEnabled: boolean;
  photo: SavedHeartPhoto | null;
  revision: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const objectUrl = useRef<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const selection = useRef({ ticket: 0 });
  const id = useId();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(
    photo
      ? {
          src: `/api/heart-photo/${photo.id}`,
          width: photo.width,
          height: photo.height,
        }
      : null,
  );
  const [crop, setCrop] = useState(photo?.crop ?? { ...defaultCrop });
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(false);
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const activeSelection = selection.current;
    return () => {
      activeSelection.ticket++;
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
      requestAnimationFrame(() => previousFocus?.focus());
    };
  }, []);
  function choose(candidate: File | undefined) {
    if (!candidate) return;
    setMessage("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(candidate.type)) {
      setMessage(
        "Choose a JPG, PNG or WebP photo. Export HEIC photos as JPG first.",
      );
      return;
    }
    if (candidate.size > MAX_PHOTO_BYTES) {
      setMessage("Choose a photo smaller than 4 MB.");
      return;
    }
    const ticket = ++selection.current.ticket;
    const src = URL.createObjectURL(candidate);
    const img = new Image();
    setLoading(true);
    img.onload = () => {
      if (ticket !== selection.current.ticket) {
        URL.revokeObjectURL(src);
        return;
      }
      setLoading(false);
      if (
        !img.naturalWidth ||
        !img.naturalHeight ||
        img.naturalWidth * img.naturalHeight > 40000000
      ) {
        URL.revokeObjectURL(src);
        setMessage("Choose a photo smaller than 40 megapixels.");
        return;
      }
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
      objectUrl.current = src;
      setFile(candidate);
      setPreview({ src, width: img.naturalWidth, height: img.naturalHeight });
      setCrop({ ...defaultCrop });
      setConfirmRemove(false);
    };
    img.onerror = () => {
      URL.revokeObjectURL(src);
      if (ticket === selection.current.ticket) {
        setLoading(false);
        setMessage("This photo couldn’t be opened. Choose another photo.");
      }
    };
    img.src = src;
  }
  async function save(remove = false) {
    if (pending || loading || !ready) return;
    setPending(true);
    setMessage("");
    try {
      const method = remove ? "DELETE" : file ? "POST" : "PATCH";
      const response = await fetch(
        `/api/heart-photo${method === "POST" ? `?revision=${revision}` : ""}`,
        {
          method,
          signal: AbortSignal.timeout(75000),
          headers:
            method === "POST"
              ? {
                  "Content-Type": file!.type,
                  "X-Photo-Crop": JSON.stringify(crop),
                }
              : { "Content-Type": "application/json" },
          body: method === "POST" ? file : JSON.stringify({ revision, crop }),
        },
      );
      const result = await response.json();
      if (!response.ok) {
        setMessage(result.message ?? "Couldn’t save. Please try again.");
        return;
      }
      onSaved();
    } catch {
      setMessage(
        "Connection interrupted. Reopen the editor to check whether your photo saved before retrying.",
      );
    } finally {
      setPending(false);
    }
  }
  if (!mounted) return null;
  return createPortal(
    <div className={styles.backdrop} role="presentation">
      <section
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
        >
          <div className={styles.heading}>
            <h2 id={`${id}-title`}>
              {photo ? "Our heart photo" : "Add our first photo"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              disabled={pending}
              aria-label="Close photo editor"
            >
              ×
            </button>
          </div>
          <p className={styles.hint}>
            A little picture of us. Only Save changes our shared heart.
          </p>
          <svg
            className={styles.preview}
            viewBox="0 0 240 220"
            role="img"
            aria-label="Heart photo preview"
          >
            <defs>
              <clipPath id={`${id}-heart`}>
                <path d="M120 204C100 187 20 132 14 78C8 22 80 1 120 48C160 1 232 22 226 78C220 132 140 187 120 204Z" />
              </clipPath>
            </defs>
            <g clipPath={`url(#${id}-heart)`}>
              <rect width="240" height="220" fill="#f6d3df" />
              {preview && (
                <image
                  href={preview.src}
                  {...photoGeometry(preview.width, preview.height, crop)}
                  preserveAspectRatio="none"
                />
              )}
            </g>
          </svg>
          {(!ready || !uploadsEnabled) && (
            <p role="status" className={styles.status}>
              Photo uploads are being set up. Please try again later.
            </p>
          )}
          <button
            className={styles.file}
            type="button"
            disabled={pending || !ready || !uploadsEnabled}
            onClick={() => fileInput.current?.click()}
          >
            <span>{preview ? "Choose another photo" : "Choose a photo"}</span>
          </button>
          <input
            ref={fileInput}
            className={styles.fileInput}
            id={`${id}-file`}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={pending || !ready || !uploadsEnabled}
            onChange={(e) => {
              choose(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <p className={styles.hint}>JPG, PNG or WebP · up to 4 MB</p>
          {preview && (
            <fieldset disabled={pending || loading} className={styles.adjust}>
              <legend>Adjust the photo</legend>
              {(
                [
                  ["zoom", "Zoom", 1, 3, 0.05],
                  ["x", "Horizontal position", 0, 100, 1],
                  ["y", "Vertical position", 0, 100, 1],
                ] as const
              ).map(([key, label, min, max, step]) => (
                <label key={key} htmlFor={`${id}-${key}`}>
                  <span>{label}</span>
                  <input
                    id={`${id}-${key}`}
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={crop[key]}
                    onChange={(e) =>
                      setCrop({ ...crop, [key]: Number(e.target.value) })
                    }
                  />
                </label>
              ))}
              <button type="button" onClick={() => setCrop({ ...defaultCrop })}>
                Reset position
              </button>
            </fieldset>
          )}
          <p role="status" className={styles.status}>
            {loading ? "Opening photo…" : message}
          </p>
          <div className={styles.actions}>
            <button type="button" onClick={onClose} disabled={pending}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={!preview || pending || loading || !ready}
            >
              {pending ? "Saving…" : "Save photo"}
            </button>
          </div>
          {photo && (
            <div className={styles.remove}>
              {!confirmRemove ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setConfirmRemove(true)}
                >
                  Remove photo
                </button>
              ) : (
                <>
                  <p>Remove this photo from our heart?</p>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => void save(true)}
                  >
                    Yes, remove photo
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => setConfirmRemove(false)}
                  >
                    Keep photo
                  </button>
                </>
              )}
            </div>
          )}
        </form>
      </section>
    </div>,
    document.body,
  );
}
