"use client";

import Label, { LabelVariant } from "@/components/labels/Label";
import type { PipelineStage } from "@/apis/sales";
import { usePipelineStages } from "@/hooks/usePipelineStages";
import { pipelineStageName } from "@/lib/sales";
import {
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  LucideIcon,
  MessagesSquare,
  PhoneCall,
  Reply,
  Sparkles,
  Target,
  XCircle,
} from "lucide-react";

const stageStyles: Record<
  PipelineStage,
  { variant: LabelVariant; icon: LucideIcon }
> = {
  lead_identified: { variant: "gray", icon: Target },
  triaging: { variant: "biru", icon: PhoneCall },
  attempting: { variant: "biru", icon: PhoneCall },
  engaged: { variant: "toska", icon: Reply },
  qualified: { variant: "ungu", icon: Sparkles },
  scheduling_meeting: { variant: "oranye", icon: CalendarClock },
  meeting_booked: { variant: "pink", icon: CalendarCheck },
  disqualified: { variant: "merah", icon: XCircle },
  discovery_done: { variant: "kuning", icon: CheckCircle2 },
  proposal_negotiation: { variant: "pink", icon: MessagesSquare },
  closed_won: { variant: "hijau", icon: CheckCircle2 },
  closed_lost: { variant: "merah", icon: XCircle },
};

export default function StageLabel({ stage, withIcon = true }: { stage: PipelineStage; withIcon?: boolean }) {
  const catalog = usePipelineStages();
  const { variant, icon: Icon } = stageStyles[stage] ?? { variant: "gray", icon: Target };
  const label = pipelineStageName(stage, catalog.stages);

  return (
    <Label variant={variant}>
      {withIcon && <Icon size={12} />}
      {label}
    </Label>
  );
}
