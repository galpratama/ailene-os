export default function LmsInsightSkeletonOS() {
  return (
    <div className="flex animate-pulse flex-col gap-4" aria-busy="true">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-19 rounded-xl bg-gray-100 dark:bg-zinc-800/60" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-72 rounded-2xl bg-gray-100 dark:bg-zinc-800/60" />
        <div className="h-72 rounded-2xl bg-gray-100 dark:bg-zinc-800/60" />
      </div>
      <div className="h-64 rounded-2xl bg-gray-100 dark:bg-zinc-800/60" />
    </div>
  );
}
