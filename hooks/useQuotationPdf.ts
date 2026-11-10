"use client";

import type { QuotationDetails } from "@/apis/quotations";
import { downloadQuotationPDF, getQuotationPDFBlobUrl } from "@/components/pdf/QuotationPDF";
import { getQuotationDetails } from "@/lib/actions";
import { requireApiData } from "@/lib/api-result";
import { formatQuotationNumber } from "@/lib/quotation-number";
import { buildQuotationPDFPropsFromQuotation, quotationPdfFilename } from "@/lib/quotation-pdf";
import { showErrorToast } from "@/lib/toast";
import { useState } from "react";

type PdfAction = { id: number; kind: "view" | "download" };

// Preview and download for any quotation; pass the loaded details when the page already has them.
export function useQuotationPdf() {
  const [busy, setBusy] = useState<PdfAction | null>(null);
  const [preview, setPreview] = useState<{ url: string; title: string } | null>(null);

  async function load(id: number, loaded?: QuotationDetails) {
    return loaded ?? requireApiData(await getQuotationDetails(id));
  }

  async function run(action: PdfAction, loaded: QuotationDetails | undefined, fallback: string) {
    setBusy(action);
    try {
      const quotation = await load(action.id, loaded);
      const props = buildQuotationPDFPropsFromQuotation(quotation);
      if (action.kind === "download") {
        await downloadQuotationPDF(props, quotationPdfFilename(quotation));
      } else {
        const url = await getQuotationPDFBlobUrl(props);
        setPreview({ url, title: `${formatQuotationNumber(quotation)} · ${quotation.company_name}` });
      }
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : fallback);
    } finally {
      setBusy(null);
    }
  }

  function closePreview() {
    if (preview) URL.revokeObjectURL(preview.url);
    setPreview(null);
  }

  return {
    isBusy: (id: number, kind: PdfAction["kind"]) => busy?.id === id && busy.kind === kind,
    view: (id: number, loaded?: QuotationDetails) => run({ id, kind: "view" }, loaded, "Gagal membuka PDF."),
    download: (id: number, loaded?: QuotationDetails) => run({ id, kind: "download" }, loaded, "Gagal membuat PDF."),
    previewProps: { isOpen: preview !== null, url: preview?.url ?? null, title: preview?.title ?? "", onClose: closePreview },
  };
}
