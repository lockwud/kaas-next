import React from "react";
import { PageLoadingSkeleton } from "../components/ui/PageLoadingSkeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-6xl p-6">
      <PageLoadingSkeleton />
    </main>
  );
}
