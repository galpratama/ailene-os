import { LogoAilene } from "@/components/svg/LogoAilene";

export default function FooterHomeBIZ() {
  return (
    <footer className="bg-ink py-8.5 text-white">
      <div className="mx-auto flex w-[min(1180px,calc(100%-48px))] flex-wrap items-center justify-between gap-6">
        <LogoAilene className="h-6 w-auto" />
        <small className="opacity-55">
          Corporate AI Training Menu · Consultative Edition · 2026
        </small>
      </div>
    </footer>
  );
}
