const stats = [
  { label: "Package A", value: "1 hari offline" },
  { label: "Package B", value: "2 hari offline / hybrid" },
  { label: "Package C", value: "2-3 minggu hybrid" },
  { label: "Proposal", value: "24-72 jam setelah brief" },
];

export default function StatsBandHomeBIZ() {
  return (
    <section className="bg-charcoal py-5.5 text-white">
      <div className="mx-auto grid w-[min(1180px,calc(100%-48px))] grid-cols-2 gap-6 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label}>
            <span className="mb-1 block text-[11px] font-bold tracking-[0.08em] text-white/55 uppercase">
              {stat.label}
            </span>
            <strong className="text-lg font-bold">{stat.value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
