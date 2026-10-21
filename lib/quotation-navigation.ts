export function parsePricingPipelineId(value: string | string[] | null | undefined): number | null {
  if (typeof value !== "string" || !/^\d+$/.test(value)) return null;
  const id = Number(value);
  return Number.isInteger(id) && id > 0 && id <= 2147483647 ? id : null;
}

export function pricingUrlForPipeline(pipelineId: number) {
  return `/pricing?${new URLSearchParams({ pipeline_id: String(pipelineId) })}`;
}
