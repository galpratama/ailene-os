import LinkButtonBIZ from "@/components/buttons/LinkButtonBIZ";

export default function CTAHomeBIZ() {
  return (
    <section id="contact" className="bg-coral py-24 text-center">
      <div className="mx-auto w-[min(1180px,calc(100%-48px))]">
        <div className="font-script mb-3 text-[34px] leading-none">
          Mulai dari brief singkat
        </div>
        <h2 className="mx-auto max-w-225 text-[42px] leading-[1.05] font-light sm:text-[clamp(42px,6vw,78px)]">
          Mulai dari kebutuhan tim. Kami bantu menentukan programnya.
        </h2>
        <p className="mx-auto mt-6 max-w-162.5 text-[19px] leading-relaxed">
          Ceritakan jumlah peserta, role atau departemen, lokasi, serta
          target yang ingin dicapai. Konsultan kami akan membantu
          merekomendasikan format dan scope program yang paling relevan.
        </p>
        <div className="mt-9 flex justify-center">
          <LinkButtonBIZ href="https://ailene.id" variant="dark">
            Talk to a Consultant
          </LinkButtonBIZ>
        </div>
      </div>
    </section>
  );
}
