export default function PromptingHomeBIZ() {
  return (
    <section className="bg-pink-t py-22">
      <div className="mx-auto max-w-280 px-7">
        <div className="mb-12 max-w-150">
          <span className="mb-4 inline-block text-[12.5px] font-bold uppercase tracking-wider text-merah">
            Salah satu yang kamu pelajari
          </span>
          <h2 className="mb-4 text-[30px] font-extrabold leading-tight md:text-[42px]">
            Beda cara nanya, beda banget hasilnya.
          </h2>
          <p className="text-[17px] leading-[1.65] text-ink-soft">
            Ini contoh kecil dari yang kamu pelajari di Foundation. Dua orang,
            AI yang sama — beda 30 detik nulis prompt, beda langit dan bumi
            hasilnya.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Prompt asal */}
          <div className="overflow-hidden rounded-2xl border-[1.5px] border-ink-line bg-white">
            <div className="bg-merah-t px-5 py-3.5 text-[13.5px] font-bold text-merah">
              ❌ Prompt asal
            </div>
            <div className="flex flex-col gap-3.5 p-5">
              <div className="flex gap-2.5">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-ink-soft text-[11px] font-bold text-white">
                  K
                </div>
                <div>
                  <div className="mb-0.5 text-[11px] font-semibold text-ink-soft">
                    Kamu
                  </div>
                  <div className="rounded-tr-2xl rounded-bl-2xl rounded-br-2xl bg-off px-3 py-2.5 text-[13px] leading-[1.55]">
                    &ldquo;Buatkan konten marketing buat produk saya&rdquo;
                  </div>
                </div>
              </div>
              <div className="flex gap-2.5">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-merah text-[11px] font-bold text-white">
                  AI
                </div>
                <div>
                  <div className="mb-0.5 text-[11px] font-semibold text-ink-soft">
                    ChatGPT
                  </div>
                  <div className="rounded-tr-2xl rounded-bl-2xl rounded-br-2xl bg-merah-t px-3 py-2.5 text-[13px] leading-[1.55] text-[#8a2a1a]">
                    &ldquo;Tentu! Produk kami berkualitas tinggi dan terpercaya.
                    Dapatkan sekarang dengan harga terjangkau! Hubungi kami
                    untuk info lebih lanjut…&rdquo;
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-ink-line px-5 py-3 text-[12.5px] font-semibold text-merah">
              Generik. Nggak ada yang mau berhenti scroll.
            </div>
          </div>

          {/* Prompt Ailene */}
          <div className="overflow-hidden rounded-2xl border-[1.5px] border-ink-line bg-white">
            <div className="bg-hijau-t px-5 py-3.5 text-[13.5px] font-bold text-[#5a8a2a]">
              ✅ Prompt yang kamu pelajari di Ailene
            </div>
            <div className="flex flex-col gap-3.5 p-5">
              <div className="flex gap-2.5">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-hijau text-[11px] font-bold text-white">
                  K
                </div>
                <div>
                  <div className="mb-0.5 text-[11px] font-semibold text-ink-soft">
                    Kamu
                  </div>
                  <div className="rounded-tr-2xl rounded-bl-2xl rounded-br-2xl bg-off px-3 py-2.5 text-[13px] leading-[1.55]">
                    &ldquo;Kamu copywriter skincare lokal. Target: perempuan
                    22-30, kerja kantoran, Jakarta. Buat 2 hook IG buat
                    sunscreen baru. Tone jujur, nggak lebay. Max 2
                    kalimat.&rdquo;
                  </div>
                </div>
              </div>
              <div className="flex gap-2.5">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-hijau text-[11px] font-bold text-white">
                  AI
                </div>
                <div>
                  <div className="mb-0.5 text-[11px] font-semibold text-ink-soft">
                    ChatGPT
                  </div>
                  <div className="rounded-tr-2xl rounded-bl-2xl rounded-br-2xl bg-hijau-t px-3 py-2.5 text-[13px] leading-[1.55] text-[#3d5e1f]">
                    &ldquo;SPF 50 tapi nggak bikin muka jadi topeng putih.
                    Akhirnya ketemu yang cocok buat kulit tropis.&rdquo;
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-ink-line px-5 py-3 text-[12.5px] font-semibold text-[#5a8a2a]">
              Spesifik. Bisa langsung di-post hari ini.
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-lg font-bold">
          Bedanya cuma tau caranya. Dan itu yang Ailene ajarin.
        </p>
      </div>
    </section>
  );
}
