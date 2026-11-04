// A context-only trend line for stat tiles: no axis, no hover, the tile's number stays the point.
export default function WarehouseSparklineOS({ values, color = "var(--viz-1)" }: { values: (number | null)[]; color?: string }) {
  const known = values.filter((value): value is number => value !== null);
  if (known.length < 2) return <div className="h-7" aria-hidden="true" />;
  const min = Math.min(...known);
  const span = Math.max(...known) - min || 1;
  const step = 100 / (values.length - 1);
  const points = values.flatMap((value, index) => (value === null ? [] : [`${(index * step).toFixed(2)},${(26 - ((value - min) / span) * 22).toFixed(2)}`])).join(" ");
  return (
    <svg viewBox="0 0 100 28" preserveAspectRatio="none" className="h-7 w-full" aria-hidden="true">
      <polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
