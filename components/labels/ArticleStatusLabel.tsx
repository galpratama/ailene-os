import Label, { LabelVariant } from "@/components/labels/Label";
import type { ArticleStatus } from "@/apis/articles";
import { EyeOff, FilePen, Globe, LucideIcon } from "lucide-react";

const statusStyles: Record<
  ArticleStatus,
  { variant: LabelVariant; icon: LucideIcon; label: string }
> = {
  draft: { variant: "gray", icon: FilePen, label: "Draft" },
  published: { variant: "hijau", icon: Globe, label: "Published" },
  unpublished: { variant: "oranye", icon: EyeOff, label: "Unpublished" },
};

export default function ArticleStatusLabel({ status }: { status: ArticleStatus }) {
  const { variant, icon: Icon, label } = statusStyles[status];

  return (
    <Label variant={variant}>
      <Icon size={12} />
      {label}
    </Label>
  );
}
