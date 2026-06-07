"use client";

import { useState } from "react";

export function EmailCapture() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [msg, setMsg] = useState("");

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
    } catch (err) {
      setStatus("error");
      setMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <section className="mx-auto max-w-3xl px-6 py-12">
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
        <h2 className="font-display text-2xl text-white">Join the Dino Club</h2>
        <p className="mx-auto mt-2 max-w-md text-white/60">
          First dibs on new designs, restocks, and launch-day deals. No spam —
          just dinos.
        </p>
        {status === "done" ? (
          <p className="mt-6 font-semibold text-aqua">
            🦕 You’re in! Watch your inbox.
          </p>
        ) : (
          <form
            onSubmit={submit}
            className="mx-auto mt-6 flex max-w-md flex-col gap-2 sm:flex-row"
          >
            <label htmlFor="dino-club-email" className="sr-only">
              Email address
            </label>
            <input
              id="dino-club-email"
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
        )}
        {status === "error" && (
          <p className="mt-3 text-sm text-red-400" role="alert">
            {msg}
          </p>
        )}
      </div>
    </section>
  );
}
