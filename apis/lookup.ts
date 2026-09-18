import "server-only";

import { callApi, clientSecret, type ApiEnvelope, type ApiList } from "./api";

export type IndustryEntry = {
  id: number;
  name: string;
};

export type ListIndustriesOptions = {
  keyword?: string;
  page?: number;
  page_size?: number;
};

// Reference data behind the static client secret, so a signed-out form can fill its dropdowns.
export async function listIndustries(
  options: ListIndustriesOptions = {}
): Promise<ApiEnvelope<ApiList<IndustryEntry>>> {
  return callApi("/api/v1/industries", {
    token: clientSecret(),
    body: options,
    // Industries barely change, so the marketing page can stay prerendered.
    revalidate: 3600,
  });
}
