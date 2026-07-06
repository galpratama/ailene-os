import AppButton from "../buttons/AppButton";

const channels = [
  { name: "pengumuman", active: false },
  { name: "tanya-apa-aja", active: true },
  { name: "share-prompt", active: false },
  { name: "pamer-hasil", active: false },
  { name: "cari-squad", active: false },
  { name: "event", active: false },
];

const messages = [
  {
    name: "Dina",
    time: "hari ini 10:12",
    color: "bg-pink",
    text: "guys baru kelar Foundation, ternyata AI nggak seribet yang kubayangin 😭 makasih yang kemarin bantu jawab",
  },
  {
    name: "Arya",
    time: "hari ini 10:15",
    color: "bg-biru",
    text: "congrats! lanjut ke KelasClaude gih, kepake banget buat kerjaan",
  },
  {
    name: "Rudi",
    time: "hari ini 10:23",
    color: "bg-oranye",
    text: "ada yang udah nyoba bikin tools pake vibe coding? mau tanya2 dong",
  },
  {
    name: "Nadia",
    time: "hari ini 10:31",
    color: "bg-hijau",
    text: "aku udah! gampang kok, nanti aku share screenshotnya 🧠",
  },
];

export default function CommunityHomeBIZ() {
  return (
    <section className="bg-[#5865F2] py-22 text-white">
      <div className="mx-auto max-w-280 px-7">
        <div className="mx-auto mb-10 max-w-145 text-center">
          <span className="mb-4 inline-block text-[12.5px] font-bold uppercase tracking-wider text-white/70">
            Gen AI Labs
          </span>
          <h2 className="mb-4 text-[30px] font-extrabold leading-tight text-white md:text-[42px]">
            Belajar bareng lebih seru daripada sendirian.
          </h2>
          <p className="text-[17px] leading-[1.65] text-white/75">
            Ribuan orang Indonesia yang antusias sama AI ngumpul di satu
            Discord. Tanya apa aja, share progres, atau cuma lurking — bebas.
          </p>
        </div>

        <div className="mx-auto grid max-w-180 grid-cols-1 overflow-hidden rounded-2xl bg-[#36393f] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.5)] md:grid-cols-[180px_1fr]">
          <div className="hidden bg-[#2f3136] p-4 md:block">
            <div className="mb-3 border-b border-white/[0.06] pb-3 text-[13px] font-bold text-white">
              🤖 Gen AI Labs
            </div>
            <div className="flex flex-col gap-0.5">
              {channels.map((ch) => (
                <div
                  key={ch.name}
                  className={`rounded-[5px] px-2 py-1.5 text-[12.5px] ${
                    ch.active ? "bg-white/[0.08] text-white" : "text-[#8e9297]"
                  }`}
                >
                  # {ch.name}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#36393f] p-5">
            {messages.map((msg) => (
              <div key={msg.name} className="mb-4 flex gap-2.5 last:mb-0">
                <div
                  className={`flex size-8.5 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white ${msg.color}`}
                >
                  {msg.name[0]}
                </div>
                <div>
                  <div className="mb-0.5 text-[13px] font-semibold text-white">
                    {msg.name}{" "}
                    <span className="ml-1.5 text-[10px] font-normal text-[#72767d]">
                      {msg.time}
                    </span>
                  </div>
                  <div className="text-[12.5px] leading-[1.45] text-[#dcddde]">
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 text-center">
          <AppButton variant="discord" size="cta">Gabung Gen AI Labs — gratis —</AppButton>
        </div>
      </div>
    </section>
  );
}
