import { HOME_EXPERIMENT_ID, HOME_VARIANT_MAX_AGE, type HomeVariant } from "@/lib/biz-experiment";
import { BIZ_HOME_VARIANT_COOKIE } from "@/lib/constants";

// Inline in the server HTML so home_variant is in the dataLayer before GTM loads, and the first page_view already carries it.
export default function HomeExperimentBIZ({
  variant,
  persist,
}: {
  variant: HomeVariant;
  persist: boolean;
}) {
  const push = JSON.stringify({ event: "experiment_view", experiment_id: HOME_EXPERIMENT_ID, home_variant: variant });
  const cookie = persist
    ? `document.cookie=${JSON.stringify(`${BIZ_HOME_VARIANT_COOKIE}=${variant}; path=/; max-age=${HOME_VARIANT_MAX_AGE}; SameSite=Lax`)};`
    : "";
  return <script dangerouslySetInnerHTML={{ __html: `${cookie}(window.dataLayer=window.dataLayer||[]).push(${push});` }} />;
}
