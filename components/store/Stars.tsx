// Pure presentational — usable in both server and client trees.
export function Stars({
  rating = 5,
  className = "",
}: {
  rating?: number;
  className?: string;
}) {
  const full = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <span
      className={`text-aqua ${className}`}
      role="img"
      aria-label={`${rating} out of 5 stars`}
    >
      {"★".repeat(full)}
      <span className="text-white/20">{"★".repeat(5 - full)}</span>
    </span>
  );
}
