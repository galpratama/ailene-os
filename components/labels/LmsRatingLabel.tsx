import Label from "@/components/labels/Label";
import { ratingVariant } from "@/lib/lms-insights";
import { Star } from "lucide-react";

export default function LmsRatingLabel({ rating }: { rating: number | null }) {
  return (
    <Label variant={ratingVariant(rating)} className="tabular-nums">
      <Star size={11} className="fill-current" />
      {rating === null ? "—" : rating.toFixed(1)}
    </Label>
  );
}
