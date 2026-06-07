"use client";

import { useState } from "react";

export function ReviewForm({ orderId }: { orderId?: string }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (rating < 1) {
      setStatus("error");
      setMsg("Please pick a star rating.");
      return;
    }
    setStatus("loading");
    setMsg("");
    const fd = new FormData(e.currentTarget);
    fd.set("rating", String(rating));
    try {
      const res = await fetch("/api/reviews", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-aqua/20 bg-aqua/5 p-8 text-center">
        <div className="text-5xl" aria-hidden>
          🦕
        </div>
        <h2 className="mt-3 font-display text-2xl text-white">Thank you!</h2>
        <p className="mt-2 text-white/60">
          Your review is in — we&apos;ll post it after a quick look. You&apos;re
          the best.
        </p>
      </div>
    );
  }

  const active = hover || rating;

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* honeypot — hidden from humans, bots fill it */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="hidden"
      />
      {orderId && <input type="hidden" name="order_id" value={orderId} />}

      <div>
        <span
          id="rating-label"
          className="mb-2 block text-sm font-semibold text-white/70"
        >
          Your rating
        </span>
        <div
          role="radiogroup"
          aria-labelledby="rating-label"
          className="flex gap-1"
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              className="text-3xl leading-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aqua"
            >
              <span className={active >= n ? "text-aqua" : "text-white/25"}>
                ★
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="review-name" className="sr-only">
            Your name
          </label>
          <input
            id="review-name"
            name="name"
            required
            maxLength={80}
            placeholder="Your name"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aqua"
          />
        </div>
        <div>
          <label htmlFor="review-location" className="sr-only">
            City, State (optional)
          </label>
          <input
            id="review-location"
            name="location"
            maxLength={80}
            placeholder="City, State (optional)"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aqua"
          />
        </div>
      </div>

      <div>
        <label htmlFor="review-body" className="sr-only">
          Your review
        </label>
        <textarea
          id="review-body"
          name="body"
          required
          minLength={3}
          maxLength={1000}
          rows={4}
          placeholder="What did your kid think?"
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aqua"
        />
      </div>

      <div>
        <label
          htmlFor="review-photo"
          className="mb-2 block text-sm font-semibold text-white/70"
        >
          Add a photo (optional)
        </label>
        <input
          id="review-photo"
          type="file"
          name="photo"
          accept="image/png,image/jpeg,image/webp"
          className="block w-full text-sm text-white/70 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-white/20"
        />
        <p className="mt-1 text-xs text-white/40">
          A photo of your kid with it makes our day — JPG/PNG/WEBP, under 5MB.
        </p>
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-xl bg-purple px-8 py-4 text-lg font-bold text-white transition-colors hover:bg-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aqua disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "loading" ? "Submitting…" : "Submit review"}
      </button>
      {status === "error" && (
        <p className="text-sm text-red-400" role="alert">
          {msg}
        </p>
      )}
    </form>
  );
}
