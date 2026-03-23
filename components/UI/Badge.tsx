type Variant = "feature" | "fix" | "breaking" | "perf" | "dx";

const styles: Record<Variant, string> = {
  feature: "border-cat-feature/40 bg-cat-feature/15 text-cat-feature",
  fix: "border-cat-fix/40 bg-cat-fix/15 text-cat-fix",
  breaking: "border-cat-breaking/40 bg-cat-breaking/15 text-cat-breaking",
  perf: "border-cat-perf/40 bg-cat-perf/15 text-cat-perf",
  dx: "border-cat-dx/40 bg-cat-dx/15 text-cat-dx",
};

const labels: Record<Variant, string> = {
  feature: "Feature",
  fix: "Fix",
  breaking: "Breaking",
  perf: "Performance",
  dx: "Dev experience",
};

export function Badge({
  variant,
  className = "",
}: {
  variant: Variant;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[variant]} ${className}`}
    >
      {labels[variant]}
    </span>
  );
}
