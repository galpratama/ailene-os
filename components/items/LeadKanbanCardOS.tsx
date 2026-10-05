"use client";

import type { PipelineData } from "@/apis/sales";
import AppButton from "@/components/buttons/AppButton";
import { getRupiahCurrency } from "@/lib/currency";
import { Banknote, Mail, MoreHorizontal, Phone, UserRound, type LucideIcon } from "lucide-react";
import Image from "next/image";
import type { DragEvent, MouseEvent, ReactNode } from "react";

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

function InfoRow({ icon: Icon, children, muted }: { icon: LucideIcon; children: ReactNode; muted?: boolean }) {
  return (
    <div className={`flex min-w-0 items-center gap-2 text-xs ${muted ? "text-gray-400 dark:text-zinc-500" : "text-gray-600 dark:text-zinc-300"}`}>
      <Icon size={13} className="shrink-0 text-gray-400 dark:text-zinc-500" />
      <span className="truncate">{children}</span>
    </div>
  );
}

// Contact actions sit inside a clickable, draggable card, so they must not open or drag it.
function stopCardClick(event: MouseEvent) {
  event.stopPropagation();
}

export default function LeadKanbanCardOS({
  lead,
  isDragging,
  onOpen,
  onDragStart,
  onDragEnd,
}: {
  lead: PipelineData;
  isDragging: boolean;
  onOpen: () => void;
  onDragStart: (event: DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
}) {
  const contact = lead.primary_contact ?? null;
  const phoneHref = contact?.phone ? `tel:${contact.phone.replace(/[^\d+]/g, "")}` : null;
  const emailHref = contact?.email ? `mailto:${contact.email}` : null;

  return (
    <div
      role="button"
      tabIndex={0}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      className={`flex shrink-0 cursor-grab flex-col rounded-xl border border-line bg-kanban-card-bg text-left transition-colors hover:border-claude/40 active:cursor-grabbing ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-center gap-2.5 px-3.5 py-3">
        <div className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-[10px] font-semibold text-gray-500 dark:bg-zinc-700 dark:text-zinc-300">
          {lead.company_image_url ? (
            <Image src={lead.company_image_url} alt={lead.company_name} width={28} height={28} className="size-full object-cover" />
          ) : (
            initialsOf(lead.company_name)
          )}
        </div>
        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-900 dark:text-zinc-100">{lead.company_name}</p>
        <MoreHorizontal size={16} className="shrink-0 text-gray-400" aria-hidden />
      </div>

      <div className="flex flex-col gap-2 border-t border-line-soft px-3.5 py-3">
        <InfoRow icon={UserRound} muted={!contact}>{contact?.full_name ?? "No contact yet"}</InfoRow>
        <InfoRow icon={Mail} muted={!contact?.email}>{contact?.email ?? "No email"}</InfoRow>
        <InfoRow icon={Phone} muted={!contact?.phone}>{contact?.phone ?? "No phone"}</InfoRow>
        <InfoRow icon={Banknote}>
          <span className="font-semibold text-gray-900 dark:text-zinc-100">{getRupiahCurrency(Number(lead.estimated_value))}</span>
        </InfoRow>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-line-soft p-2.5">
        {phoneHref ? (
          <AppButton href={phoneHref} variant="outline" size="sm" draggable={false} onClick={stopCardClick} className="justify-center">
            <Phone size={13} />
            Phone
          </AppButton>
        ) : (
          <AppButton type="button" variant="outline" size="sm" disabled className="justify-center">
            <Phone size={13} />
            Phone
          </AppButton>
        )}
        {emailHref ? (
          <AppButton href={emailHref} variant="outline" size="sm" draggable={false} onClick={stopCardClick} className="justify-center">
            <Mail size={13} />
            Email
          </AppButton>
        ) : (
          <AppButton type="button" variant="outline" size="sm" disabled className="justify-center">
            <Mail size={13} />
            Email
          </AppButton>
        )}
      </div>
    </div>
  );
}
