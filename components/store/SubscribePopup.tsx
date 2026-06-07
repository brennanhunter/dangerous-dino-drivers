"use client";

import { useEffect, useState } from "react";

// Shown once per visitor, ONLY on exit-intent (cursor moving up to leave/close the
// tab). Desktop-only signal — mobile has no reliable exit-intent, so the inline
// "Join the Dino Club" section handles capture there.
const STORAGE_KEY = "ddd_dino_club_v1"; // set once subscribed or dismissed

export function SubscribePopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [msg, setMsg] = useState("");

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      // localStorage unavailable — just allow the popup
    }
    let shown = false;
    const onLeave = (e: MouseEvent) => {
      // Cursor left through the top of the viewport → they're heading for the
      // tab/close/URL bar.
      if (!shown && e.clientY <= 0) {
        shown = true;
        setOpen(true);
      }
    };
    document.addEventListener("mouseout", onLeave);
    return () => document.removeEventListener("mouseout", onLeave);
  }, []);

  function dismiss() {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {}
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMsg("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setStatus("done");
      try {
        localStorage.setItem(STORAGE_KEY, "1");
      } catch {}
      setTimeout(() => setOpen(false), 2500);
    } catch (err) {
      setStatus("error");
      setMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Join the Dino Club"
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/60" onClick={dismiss} aria-hidden />
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-navy p-8 text-center shadow-2xl">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close"
          className="absolute right-4 top-4 text-white/50 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aqua"
        >
          ✕
        </button>
        <div className="text-5xl" aria-hidden>
          🦕
        </div>
        {status === "done" ? (
          <>
            <h2 className="mt-3 font-display text-2xl text-white">
              You&apos;re in the club!
            </h2>
            <p className="mt-2 text-white/60">
              Watch your inbox — we&apos;ll tell you the moment new dinos drop.
            </p>
          </>
        ) : (
          <>
            <h2 className="mt-3 font-display text-2xl text-white">
              Don&apos;t miss the next drop
            </h2>
            <p className="mt-2 text-white/60">
              More dino drivers are coming — plus sheets &amp; blankets. Join the
              Dino Club for first dibs and launch-day deals.
            </p>
            <form onSubmit={submit} className="mt-5 flex flex-col gap-2 sm:flex-row">
              <label htmlFor="popup-email" className="sr-only">
                Email address
              </label>
              <input
                id="popup-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aqua"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="rounded-xl bg-purple px-6 py-3 font-bold text-white transition-colors hover:bg-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aqua disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "loading" ? "Joining…" : "Join"}
              </button>
            </form>
            {status === "error" && (
              <p className="mt-3 text-sm text-red-400" role="alert">
                {msg}
              </p>
            )}
            <button
              type="button"
              onClick={dismiss}
              className="mt-3 text-xs text-white/40 transition-colors hover:text-white/70"
            >
              No thanks
            </button>
          </>
        )}
      </div>
    </div>
  );
}
