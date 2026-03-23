"use client";

import { useEffect } from "react";
import { FullPageError } from "@/components/UI/FullPageError";

export default function ChangelogRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <FullPageError
      title="Something went wrong"
      description={
        error.message ||
        "An unexpected error occurred while loading this changelog."
      }
      actionLabel="Try another repo"
      secondaryLabel="Retry"
      onSecondary={reset}
    />
  );
}
