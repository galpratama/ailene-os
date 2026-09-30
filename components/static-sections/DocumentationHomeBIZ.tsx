import SectionHeaderHomeBIZ from "./SectionHeaderHomeBIZ";
import Image from "next/image";

const PHOTO_BASE =
  "https://tskubmriuclmbcfmaiur.supabase.co/storage/v1/object/public/ailene/image-web";

type Photo = { file: string; width: number; height: number; alt: string };

// Mixed landscape/portrait shots keep their own ratio at a shared row height.
const topRow: Photo[] = [
  {
    file: "20260714_Google_126.webp",
    width: 4903,
    height: 3262,
    alt: "Diskusi panel AI di depan ratusan peserta",
  },
  {
    file: "28.webp",
    width: 2048,
    height: 1365,
    alt: "Peserta workshop AI memenuhi ruang kelas",
  },
  {
    file: "HYP02595 (1).webp",
    width: 1146,
    height: 645,
    alt: 'Sesi "AI is a Must, Not a Trend" bersama tim perusahaan',
  },
  {
    file: "DSC07477.webp",
    width: 902,
    height: 601,
    alt: "Peserta workshop AI di kantor klien",
  },
  {
    file: "HYP02669 (1).webp",
    width: 1146,
    height: 645,
    alt: "Foto bersama tim peserta setelah sesi AI",
  },
  {
    file: "DSC07431.webp",
    width: 902,
    height: 601,
    alt: "Presentasi use case AI di depan tim",
  },
  {
    file: "IMG_9201.webp",
    width: 563,
    height: 375,
    alt: "Peserta mengangkat tangan saat sesi tanya jawab",
  },
];

const bottomRow: Photo[] = [
  {
    file: "20260714_Google_163.webp",
    width: 4899,
    height: 3266,
    alt: "Trainer Ailene berbicara di sesi panel",
  },
  {
    file: "DSC09696.webp",
    width: 601,
    height: 902,
    alt: "Trainer memandu workshop AI di atas panggung",
  },
  {
    file: "ANG00255.webp",
    width: 592,
    height: 395,
    alt: "Trainer Ailene membawakan sesi di panggung",
  },
  {
    file: "DSC09694.webp",
    width: 902,
    height: 601,
    alt: "Trainer memaparkan contoh prompt di layar",
  },
  {
    file: "WhatsApp Image 2026-01-09 at 15.18.35 (2).webp",
    width: 854,
    height: 1280,
    alt: "Trainer Ailene di sesi talkshow",
  },
  {
    file: "HYP02657 (1).webp",
    width: 1146,
    height: 645,
    alt: "Diskusi bersama peserta di sela sesi",
  },
  {
    file: "DSC09705.webp",
    width: 601,
    height: 902,
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
              src={`${PHOTO_BASE}/${encodeURIComponent(photo.file)}`}
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

export default function DocumentationHomeBIZ() {
  return (
    <section
      id="dokumentasi"
      className="overflow-hidden bg-biz-forest py-18 sm:py-28"
    >
      <SectionHeaderHomeBIZ
        eyebrow="Program overview"
        title="Belajar AI secara optimal, dari individu sampai tim."
        copy="Kelas kami dirancang khusus lewat sesi tatap muka yang interaktif, agar tiap peserta praktik langsung sesuai perannya dan tim berkembang bersama."
        centered
        dark
        className="px-5"
      />
      <div className="flex flex-col gap-3 sm:gap-4">
        <PhotoRow photos={topRow} />
        <PhotoRow photos={bottomRow} reverse />
      </div>
    </section>
  );
}
