// No error_logs table in this schema yet (sevenpreneur persists to one) —
// log to console until ailene-os needs durable error logging.
export default async function LogError(
  context: string,
  ...messages: unknown[]
) {
  console.error(context + ":", ...messages);
}
