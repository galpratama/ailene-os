import AppButton from "@/components/buttons/AppButton";
import PageMargin from "@/components/layouts/PageMargin";

export default function CTAHomeBIZ() {
  return (
    <section className="bg-biz-paper pt-6.5 pb-21">
      <PageMargin>
        <div className="grid items-center gap-5 rounded-xl border border-biz-forest/18 bg-white p-5.5 sm:grid-cols-[minmax(0,1fr)_auto] sm:p-7">
          <div>
            <p className="biz-topic-label">Langkah berikutnya</p>
            <h2 className="mt-2 max-w-162.5 text-[36px] leading-[1.02] font-medium tracking-[-0.055em] text-biz-forest lg:text-[44px]">
              Mulai dari satu workflow yang ingin dibuat lebih baik.
            </h2>
            <p className="mt-2 max-w-155 text-[13px] leading-[1.65] text-biz-muted">
              Kami bantu tim memilih langkah adopsi AI yang jelas, relevan, dan
              siap dicoba.
            </p>
          </div>
          <AppButton
            href="#contact"
            variant="forest"
            size="cta"
            trackPlacement="final_cta"
          >
            Mulai dari kebutuhan tim
          </AppButton>
        </div>
      </PageMargin>
    </section>
  );
}
