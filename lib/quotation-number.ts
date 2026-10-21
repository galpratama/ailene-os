import dayjs from "dayjs";

export function formatQuotationNumber(quotation: {
  id: number;
  version: number;
  created_at: string | Date;
}) {
  return `QUO/${dayjs(quotation.created_at).format("YYYYMMDD")}/${String(quotation.id).padStart(4, "0")}v${quotation.version}`;
}
