import { sendGTMEvent } from "@next/third-parties/google";

// Single door to the dataLayer; sendGTMEvent queues pushes made before GTM loads.
export function pushGTMEvent(
  event: string,
  payload: Record<string, unknown> = {}
) {
  if (typeof window === "undefined") return;

  const data: Record<string, unknown> = { event, ...payload };
  // Undefined values surface as the literal "undefined" in GTM variables.
  Object.keys(data).forEach((key) => data[key] === undefined && delete data[key]);

  sendGTMEvent(data);
}
