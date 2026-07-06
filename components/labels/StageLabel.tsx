import Label, { LabelVariant } from "@/components/labels/Label";
import type { B2BStageEnum } from "@prisma/client";
import {
  CheckCircle2,
  Handshake,
  LucideIcon,
  MessagesSquare,
  PauseCircle,
  PhoneCall,
  Target,
  XCircle,
} from "lucide-react";

const stageStyles: Record<
  B2BStageEnum,
  { variant: LabelVariant; icon: LucideIcon; label: string }
> = {
  LEAD_IDENTIFIED: { variant: "gray", icon: Target, label: "Lead Identified" },
  CONTACTED: { variant: "biru", icon: PhoneCall, label: "Contacted" },
  NEGOTIATION: { variant: "pink", icon: MessagesSquare, label: "Negotiation" },
  VERBAL_COMMIT: { variant: "kuning", icon: Handshake, label: "Verbal Commit" },
  CLOSED_WON: { variant: "hijau", icon: CheckCircle2, label: "Closed Won" },
  CLOSED_LOST: { variant: "merah", icon: XCircle, label: "Closed Lost" },
  ON_HOLD: { variant: "gray", icon: PauseCircle, label: "On Hold" },
};

export default function StageLabel({ stage }: { stage: B2BStageEnum }) {
  const { variant, icon: Icon, label } = stageStyles[stage];

  return (
    <Label variant={variant}>
      <Icon size={12} />
      {label}
    </Label>
  );
}
