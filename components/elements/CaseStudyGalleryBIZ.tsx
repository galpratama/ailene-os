import { hutamaKaryaCase } from "@/lib/biz-case-studies";
import Image from "next/image";

export default function CaseStudyGalleryBIZ() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {hutamaKaryaCase.gallery.map((photo) => (
        <figure key={photo.src} className="group relative overflow-hidden rounded-2xl bg-biz-forest">
          <Image
            src={photo.src}
            alt={photo.alt}
            width={1400}
            height={788}
            loading="lazy"
            sizes="(max-width: 640px) 100vw, 50vw"
            className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:transition-none"
          />
          <figcaption className="absolute inset-x-0 bottom-0 bg-linear-to-t from-biz-forest/90 via-biz-forest/55 to-transparent px-4 pt-12 pb-3.5 text-[13px] leading-snug text-white sm:px-5">
            {photo.caption}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
