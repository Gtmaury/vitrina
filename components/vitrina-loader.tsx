"use client";

import dynamic from "next/dynamic";

const VitrinaApp = dynamic(
  () => import("@/components/vitrina-app").then((mod) => mod.VitrinaApp),
  {
    ssr: false,
    loading: () => (
      <div className="mx-auto grid min-h-dvh max-w-6xl gap-6 px-4 py-10 md:grid-cols-[1.2fr_0.8fr]">
        <div className="h-80 animate-pulse rounded-3xl bg-card" />
        <div className="h-80 animate-pulse rounded-3xl bg-card" />
      </div>
    ),
  },
);

export function VitrinaLoader() {
  return <VitrinaApp />;
}
