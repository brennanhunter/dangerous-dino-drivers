"use client";

import { useState } from "react";
import { FAQS } from "@/lib/content";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-2xl divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      {FAQS.map((f, i) => {
        const isOpen = open === i;
        const panelId = `faq-panel-${i}`;
        return (
          <div key={f.q}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              aria-controls={panelId}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left focus-visible:outline-2 focus-visible:outline-aqua focus-visible:[outline-offset:-2px]"
            >
              <span className="font-semibold text-white">{f.q}</span>
              <span
                aria-hidden
                className={`shrink-0 text-xl text-aqua transition-transform ${
                  isOpen ? "rotate-45" : ""
                }`}
              >
                +
              </span>
            </button>
            {isOpen && (
              <p
                id={panelId}
                className="px-5 pb-4 text-sm leading-6 text-white/70"
              >
                {f.a}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
