"use client";

import React from "react";

export default function AuraBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* soft radial color blobs */}
      <div className="absolute left-1/2 top-1/3 w-[50rem] h-[50rem] -translate-x-1/2 blur-3xl opacity-40 animate-aura-1"
           style={{ background: "radial-gradient(circle at 20% 30%, rgba(99,102,241,0.35), transparent 25%), radial-gradient(circle at 80% 70%, rgba(16,185,129,0.25), transparent 20%)" }} />
      <div className="absolute left-1/4 top-2/3 w-[36rem] h-[36rem] -translate-x-1/2 blur-2xl opacity-30 animate-aura-2"
           style={{ background: "radial-gradient(circle at 60% 40%, rgba(236,72,153,0.25), transparent 22%), radial-gradient(circle at 10% 80%, rgba(59,130,246,0.18), transparent 18%)" }} />
      <div className="absolute right-0 top-0 w-[24rem] h-[24rem] -translate-y-1/4 blur-2xl opacity-20 animate-aura-3"
           style={{ background: "radial-gradient(circle at 40% 60%, rgba(139,92,246,0.22), transparent 20%)" }} />

      {/* subtle particle dots */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        <g className="opacity-5">
          <circle cx="6%" cy="12%" r="1.5" fill="currentColor" />
          <circle cx="82%" cy="22%" r="1.5" fill="currentColor" />
          <circle cx="42%" cy="78%" r="1.5" fill="currentColor" />
          <circle cx="16%" cy="62%" r="1.5" fill="currentColor" />
          <circle cx="72%" cy="82%" r="1.5" fill="currentColor" />
        </g>
      </svg>
    </div>
  );
}
