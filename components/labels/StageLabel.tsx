import Label, { LabelVariant } from "@/components/labels/Label";
import type { PipelineStage } from "@/apis/sales";
import {
  CalendarCheck,
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
  { variant: LabelVariant; icon: LucideIcon; label: string }
> = {
  lead_identified: { variant: "gray", icon: Target, label: "Lead Identified" },
  triaging: { variant: "biru", icon: PhoneCall, label: "Triaging" },
  attempting: { variant: "biru", icon: PhoneCall, label: "Attempting" },
  engaged: { variant: "toska", icon: Reply, label: "Engaged" },
  qualified: { variant: "ungu", icon: Sparkles, label: "Qualified" },
  meeting_booked: { variant: "pink", icon: CalendarCheck, label: "Meeting Booked" },
  disqualified: { variant: "merah", icon: XCircle, label: "Disqualified" },
  discovery_done: { variant: "kuning", icon: CheckCircle2, label: "Discovery Done" },
  proposal_negotiation: { variant: "pink", icon: MessagesSquare, label: "Proposal Negotiation" },
  closed_won: { variant: "hijau", icon: CheckCircle2, label: "Closed Won" },
  closed_lost: { variant: "merah", icon: XCircle, label: "Closed Lost" },
};

export default function StageLabel({ stage }: { stage: PipelineStage }) {
  const { variant, icon: Icon, label } = stageStyles[stage];

  return (
    <Label variant={variant}>
      <Icon size={12} />
      {label}
    </Label>
  );
}
