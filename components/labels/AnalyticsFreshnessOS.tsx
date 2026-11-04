import type { WarehouseAnalytics } from "@/apis/analytics";
import Label from "@/components/labels/Label";

const sourceNames: Record<string, string> = {
  meta_ads: "Meta",
  ga4: "GA4",
  search_console: "Search Console",
  google_ads: "Google Ads",
};

function dateLabel(value: string | null) {
  if (!value) return "no data";
  return new Date(`${value}T00:00:00Z`).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

export default function AnalyticsFreshnessOS({ freshness }: { freshness: WarehouseAnalytics["freshness"] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {freshness.map((item) => (
        <Label key={item.source} variant={item.last_date ? "hijau" : "gray"}>
          {sourceNames[item.source] ?? item.source}: s.d. {dateLabel(item.last_date)}
        </Label>
      ))}
    </div>
  );
}
