const columns = [
  {
    title: "Yang termasuk dalam setiap program",
    items: [
      "Discovery dan training customization dasar",
      "Training delivery sesuai durasi program",
      "Slide deck dan participant materials",
      "Output sesuai program yang dipilih",
    ],
  },
  {
    title: "Yang disepakati saat konsultasi",
    items: [
      "Target peserta dan departemen yang terlibat",
      "Lokasi, format, dan jadwal pelaksanaan",
      "Tools, use case, dan tingkat customization",
      "Output lanjutan atau implementation support",
    ],
  },
];

export default function NotesHomeBIZ() {
  return (
    <section className="py-18">
      <div className="mx-auto w-[min(1180px,calc(100%-48px))]">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {columns.map((col) => (
            <div key={col.title} className="border-t-4 border-ink pt-5.5">
              <h3 className="mb-4 text-[25px]">{col.title}</h3>
              <ul className="list-none p-0">
                {col.items.map((item) => (
                  <li
                    key={item}
                    className="border-b border-gray-200 py-2.5 text-sm before:mr-2.25 before:font-bold before:text-coral before:content-['—_']"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
