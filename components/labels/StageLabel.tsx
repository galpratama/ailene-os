import Label, { LabelVariant } from "@/components/labels/Label";
import type { PipelineStage } from "@/apis/sales";
import type { B2BStageEnum } from "@prisma/client";
import {
  CalendarCheck,
  CheckCircle2,
  Handshake,
  LucideIcon,
  MessagesSquare,
  PauseCircle,
  PhoneCall,
  Reply,
  Sparkles,
  Target,
  XCircle,
} from "lucide-react";

const stageStyles: Record<
  B2BStageEnum | PipelineStage,
  { variant: LabelVariant; icon: LucideIcon; label: string }
> = {
  LEAD_IDENTIFIED: { variant: "gray", icon: Target, label: "Lead Identified" },
  CONTACTED: { variant: "biru", icon: PhoneCall, label: "Contacted" },
  REPLIED: { variant: "biru", icon: Reply, label: "Replied" },
  SHOW_INTEREST: { variant: "toska", icon: Sparkles, label: "Show Interest" },
  MEETING_BOOKED: { variant: "ungu", icon: CalendarCheck, label: "Meeting Booked" },
  NEGOTIATION: { variant: "pink", icon: MessagesSquare, label: "Negotiation" },
  VERBAL_COMMIT: { variant: "kuning", icon: Handshake, label: "Verbal Commit" },
  CLOSED_WON: { variant: "hijau", icon: CheckCircle2, label: "Closed Won" },
  CLOSED_LOST: { variant: "merah", icon: XCircle, label: "Closed Lost" },
  ON_HOLD: { variant: "oranye", icon: PauseCircle, label: "On Hold" },
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

export default function StageLabel({
  stage,
}: {
  stage: B2BStageEnum | PipelineStage;
}) {
  const { variant, icon: Icon, label } = stageStyles[stage];

  return (
    <Label variant={variant}>
      <Icon size={12} />
      {label}
    </Label>
  );
}
