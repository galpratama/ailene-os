import LinkButtonBIZ from "@/components/buttons/LinkButtonBIZ";

export default function CTAHomeBIZ() {
  return (
    <section className="bg-biz-paper pt-6.5 pb-21">
      <div className="mx-auto w-full max-w-315 px-4.5 sm:px-7.5">
        <div className="grid items-center gap-5 rounded-xl border border-biz-forest/18 bg-white p-5.5 sm:grid-cols-[minmax(0,1fr)_auto] sm:p-7">
          <div>
            <p className="text-[12px] font-medium tracking-[0.08em] text-biz-forest-light uppercase">Langkah berikutnya</p>
            <h2 className="mt-2 max-w-162.5 text-[clamp(1.8rem,2.8vw,2.45rem)] leading-[1.02] font-medium tracking-[-0.055em] text-biz-forest">Mulai dari satu workflow yang ingin dibuat lebih baik.</h2>
            <p className="mt-2 max-w-155 text-[13px] leading-[1.65] text-biz-muted">Kami bantu tim memilih langkah adopsi AI yang jelas, relevan, dan siap dicoba.</p>
          </div>
          <LinkButtonBIZ href="#contact" variant="dark" className="!rounded-lg !bg-biz-forest normal-case">Mulai dari kebutuhan tim</LinkButtonBIZ>
        </div>
      </div>
    </section>
  );
}
