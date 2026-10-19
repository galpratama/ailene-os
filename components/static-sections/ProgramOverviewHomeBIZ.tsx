import SectionHeaderHomeBIZ from "./SectionHeaderHomeBIZ";
import Image from "next/image";

// Resized to 512px tall (2x the sm:h-64 row) from the Supabase originals in ailene/image-web.
const PHOTO_BASE = "/biz/photos";

type Photo = { file: string; width: number; height: number; alt: string };

// Mixed landscape/portrait shots keep their own ratio at a shared row height.
const topRow: Photo[] = [
  {
    file: "overview-google-126.webp",
    width: 770,
    height: 512,
    alt: "Diskusi panel AI di depan ratusan peserta",
  },
  {
    file: "overview-28.webp",
    width: 768,
    height: 512,
    alt: "Peserta workshop AI memenuhi ruang kelas",
  },
  {
    file: "overview-hyp02595.webp",
    width: 910,
    height: 512,
    alt: 'Sesi "AI is a Must, Not a Trend" bersama tim perusahaan',
  },
  {
    file: "overview-dsc07477.webp",
    width: 768,
    height: 512,
    alt: "Peserta workshop AI di kantor klien",
  },
  {
    file: "overview-hyp02669.webp",
    width: 910,
    height: 512,
    alt: "Foto bersama tim peserta setelah sesi AI",
  },
  {
    file: "overview-dsc07431.webp",
    width: 768,
    height: 512,
    alt: "Presentasi use case AI di depan tim",
  },
  {
    file: "overview-img9201.webp",
    width: 563,
    height: 375,
    alt: "Peserta mengangkat tangan saat sesi tanya jawab",
  },
];

const bottomRow: Photo[] = [
  {
    file: "overview-google-163.webp",
    width: 768,
    height: 512,
    alt: "Trainer Ailene berbicara di sesi panel",
  },
  {
    file: "overview-dsc09696.webp",
    width: 341,
    height: 512,
    alt: "Trainer memandu workshop AI di atas panggung",
  },
  {
    file: "overview-ang00255.webp",
    width: 592,
    height: 395,
    alt: "Trainer Ailene membawakan sesi di panggung",
  },
  {
    file: "overview-dsc09694.webp",
    width: 768,
    height: 512,
    alt: "Trainer memaparkan contoh prompt di layar",
  },
  {
    file: "overview-whatsapp-0109.webp",
    width: 342,
    height: 512,
    alt: "Trainer Ailene di sesi talkshow",
  },
  {
    file: "overview-hyp02657.webp",
    width: 910,
    height: 512,
    alt: "Diskusi bersama peserta di sela sesi",
  },
  {
    file: "overview-dsc09705.webp",
    width: 341,
    height: 512,
    alt: "Trainer menjawab pertanyaan peserta",
  },
];

function PhotoRow({ photos, reverse }: { photos: Photo[]; reverse?: boolean }) {
  return (
    <div className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
      <div
        className={`biz-marquee flex w-max hover:[animation-play-state:paused] ${
          reverse
            ? "[animation:biz-marquee-reverse_70s_linear_infinite]"
            : "[animation:biz-marquee_70s_linear_infinite]"
        }`}
      >
        {[...photos, ...photos].map((photo, index) => {
          const isClone = index >= photos.length;
          return (
            <Image
              key={`${photo.file}-${index}`}
              src={`${PHOTO_BASE}/${photo.file}`}
              alt={isClone ? "" : photo.alt}
              aria-hidden={isClone}
              width={photo.width}
              height={photo.height}
              draggable={false}
              className="mr-3 h-52 w-auto shrink-0 rounded-2xl object-cover sm:mr-4 sm:h-64"
            />
          );
        })}
      </div>
    </div>
  );
}

export default function ProgramOverviewHomeBIZ() {
  return (
    <section
      id="program-overview"
      className="overflow-hidden bg-white py-18 sm:py-28"
    >
      <SectionHeaderHomeBIZ
        eyebrow="Program overview"
        title="Belajar AI secara optimal, dari individu sampai tim."
        copy="Pelatihan tatap muka interaktif untuk staff, manager, hingga direktur, agar setiap peserta dapat langsung mempraktikkan AI sesuai perannya dan tim berkembang bersama."
        centered
        className="px-5"
      />
      <div className="flex flex-col gap-3 sm:gap-4">
        <PhotoRow photos={topRow} />
        <PhotoRow photos={bottomRow} reverse />
      </div>
    </section>
  );
}
