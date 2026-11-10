import { Document, Page, Path, StyleSheet, Svg, Text, View, pdf } from "@react-pdf/renderer";
import {
  ADDON_PRICE,
  MN,
  PricingAddons,
  PricingDay,
  PricingResult,
  TRN,
  dayPrice,
  sesiFullLabel,
  uniquePax,
} from "@/lib/pricing-b2b";
import { getRupiahCurrency, getRupiahWords } from "@/lib/currency";

// Current Ailene mark (wordmark + symbol), ported from components/svg/LogoAilene.tsx — react-pdf's Path accepts the same `d`.
const AILENE_WORDMARK_PATHS = [
  "M296.879 33.8055H327.775V260.36H296.879V33.8055Z",
  "M432.878 264.979C416.131 264.979 401.598 261.418 389.278 254.296C376.959 246.981 367.334 236.876 360.404 223.979C353.667 211.082 350.298 196.356 350.298 179.802C350.298 163.055 353.667 148.233 360.404 135.336C367.334 122.439 376.959 112.333 389.278 105.018C401.598 97.7035 416.131 94.0461 432.878 94.0461C443.85 94.0461 454.148 96.1635 463.773 100.398C473.397 104.633 481.675 110.889 488.604 119.166C495.534 127.444 500.635 137.549 503.907 149.484C507.18 161.226 508.046 174.7 506.506 189.907H367.911V163.921H489.182L476.188 172.872C476.766 163.632 475.419 155.259 472.146 147.752C468.874 140.052 463.965 133.892 457.42 129.272C450.876 124.652 442.695 122.342 432.878 122.342C421.521 122.342 412.089 124.845 404.581 129.85C397.074 134.855 391.396 141.688 387.546 150.35C383.888 159.012 382.06 168.829 382.06 179.802C382.06 190.581 383.888 200.302 387.546 208.964C391.396 217.626 397.074 224.46 404.581 229.465C412.089 234.277 421.521 236.683 432.878 236.683C444.235 236.683 453.186 234.084 459.73 228.887C466.468 223.497 471.087 216.953 473.59 209.253H506.506C504.004 220.417 499.384 230.138 492.647 238.415C486.102 246.693 477.728 253.237 467.526 258.05C457.517 262.67 445.967 264.979 432.878 264.979Z",
  "M530.056 98.6659H560.951V125.23C563.261 119.84 566.63 114.835 571.057 110.215C575.484 105.403 581.259 101.553 588.381 98.6659C595.504 95.586 604.166 94.0461 614.368 94.0461C624.763 94.0461 634.002 96.1635 642.087 100.398C650.364 104.633 656.813 111.659 661.432 121.476C666.245 131.101 668.651 144.19 668.651 160.745V260.36H637.756V164.498C637.756 155.644 636.89 148.04 635.157 141.688C633.425 135.143 630.249 130.138 625.629 126.674C621.009 123.016 614.56 121.188 606.283 121.188C598.584 121.188 591.269 123.401 584.339 127.829C577.409 132.256 571.731 138.801 567.304 147.463C563.069 156.125 560.951 166.905 560.951 179.802V260.36H530.056V98.6659Z",
  "M772.935 264.979C756.188 264.979 741.655 261.418 729.336 254.296C717.016 246.981 707.392 236.876 700.462 223.979C693.725 211.082 690.356 196.356 690.356 179.802C690.356 163.055 693.725 148.233 700.462 135.336C707.392 122.439 717.016 112.333 729.336 105.018C741.655 97.7035 756.188 94.0461 772.935 94.0461C783.907 94.0461 794.206 96.1635 803.83 100.398C813.455 104.633 821.732 110.889 828.662 119.166C835.591 127.444 840.693 137.549 843.965 149.484C847.237 161.226 848.104 174.7 846.564 189.907H707.969V163.921H829.239L816.246 172.872C816.823 163.632 815.476 155.259 812.204 147.752C808.931 140.052 804.023 133.892 797.478 129.272C790.933 124.652 782.752 122.342 772.935 122.342C761.578 122.342 752.146 124.845 744.639 129.85C737.132 134.855 731.453 141.688 727.603 150.35C723.946 159.012 722.117 168.829 722.117 179.802C722.117 190.581 723.946 200.302 727.603 208.964C731.453 217.626 737.132 224.46 744.639 229.465C752.146 234.277 761.578 236.683 772.935 236.683C784.292 236.683 793.243 234.084 799.788 228.887C806.525 223.497 811.145 216.953 813.647 209.253H846.564C844.061 220.417 839.441 230.138 832.704 238.415C826.159 246.693 817.786 253.237 807.584 258.05C797.574 262.67 786.025 264.979 772.935 264.979Z",
];
const AILENE_SYMBOL_PATHS = [
  "M282.154 34.8237C265.948 39.9696 253.105 52.3502 247.447 68.2786L246.758 70.2195L244.629 65.4485C238.292 51.252 226.243 40.3484 211.417 35.3958C226.338 29.6784 238.403 18.3772 245.018 3.92213L246.813 0L247.182 1.00836C253.032 16.9862 265.91 29.4385 282.154 34.8237Z",
  "M155.644 36.01L187.539 114.231C201.325 113.441 215.89 115.326 230.692 120.631V86.8614H262.719V259.524H230.692V155.46L229.389 154.819C219.83 150.106 210.399 147.474 201.345 146.522L215.054 178.591L215.424 179.539C236.599 239.311 160.115 292.652 110.947 243.484C95.8662 228.402 90.9868 209.287 93.9459 190.787C96.8267 172.777 106.958 155.863 120.962 142.739C130.591 133.717 142.387 126.178 155.644 121.098L138.944 82.0359L38.1757 251.877H0L127.213 36.01H155.644ZM168.239 150.561C158.469 154.115 149.838 159.571 142.863 166.107C132.974 175.374 127.119 186.166 125.571 195.845C124.101 205.034 126.348 213.592 133.594 220.837C157.509 244.753 195.18 219.425 185.356 190.597L168.239 150.561Z",
];

function AileneLogo({ color, width }: { color: string; width: number }) {
  const height = width * (265 / 848);
  return (
    <Svg viewBox="0 0 848 265" width={width} height={height}>
      {[...AILENE_WORDMARK_PATHS, ...AILENE_SYMBOL_PATHS].map((d, i) => (
        <Path key={i} d={d} fill={color} />
      ))}
    </Svg>
  );
}

// react-pdf cannot read CSS variables, so the document carries its own print palette.
const INK = "#17171a";
const BRAND = "#1a7a52";
const BRAND_SOFT = "#ecf5f0";
const GRAY = "#6b7280";
const MUTED = "#9ca3af";
const LINE = "#e5e7eb";
const PANEL = "#f7f8f7";
const ZEBRA = "#fbfbfb";
const WHITE = "#ffffff";

const COMPANY = "PT Pengusaha Muda Indonesia";
const COMPANY_ADDRESS = ["Soho Capital Floor 19, Podomoro City", "Jl. Letjend S. Parman Kav 28, Jakarta Barat", "DKI Jakarta, Indonesia"];

const styles = StyleSheet.create({
  page: { paddingTop: 44, paddingBottom: 72, paddingHorizontal: 44, fontSize: 9, color: INK, fontFamily: "Helvetica", lineHeight: 1.35 },
  accent: { position: "absolute", top: 0, left: 0, right: 0, height: 5, backgroundColor: BRAND },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  senderName: { marginTop: 10, fontSize: 8.5, fontFamily: "Helvetica-Bold" },
  senderLine: { fontSize: 7.5, color: GRAY },
  headerRight: { alignItems: "flex-end" },
  docTitle: { fontSize: 22, lineHeight: 1.2, fontFamily: "Helvetica-Bold", letterSpacing: 2, textAlign: "right" },
  docSubtitle: { fontSize: 8.5, color: GRAY, textAlign: "right", marginTop: 4 },
  metaBox: { marginTop: 10, width: 200, borderWidth: 0.75, borderColor: LINE, borderRadius: 4 },
  metaRow: { flexDirection: "row", paddingVertical: 4, paddingHorizontal: 8 },
  metaRowDivider: { borderTopWidth: 0.75, borderTopColor: LINE },
  metaLabel: { width: 76, fontSize: 7.5, color: GRAY },
  metaValue: { flex: 1, fontSize: 8, fontFamily: "Helvetica-Bold", textAlign: "right" },
  parties: { flexDirection: "row", marginTop: 22, gap: 10 },
  party: { flex: 1, backgroundColor: PANEL, borderRadius: 4, paddingVertical: 10, paddingHorizontal: 12 },
  eyebrow: { fontSize: 6.5, color: GRAY, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 },
  partyName: { fontSize: 12, fontFamily: "Helvetica-Bold" },
  partySub: { fontSize: 8, color: GRAY, marginTop: 2 },
  summary: { flexDirection: "row", marginTop: 12, borderWidth: 0.75, borderColor: LINE, borderRadius: 4 },
  summaryCell: { flex: 1, paddingVertical: 8, paddingHorizontal: 10 },
  summaryDivider: { borderLeftWidth: 0.75, borderLeftColor: LINE },
  summaryValue: { fontSize: 10.5, fontFamily: "Helvetica-Bold" },
  sectionTitle: { marginTop: 22, marginBottom: 6, fontSize: 9.5, fontFamily: "Helvetica-Bold" },
  thead: { flexDirection: "row", backgroundColor: INK, borderRadius: 3, paddingVertical: 6, paddingHorizontal: 8 },
  th: { fontSize: 7, fontFamily: "Helvetica-Bold", color: WHITE, textTransform: "uppercase", letterSpacing: 0.6 },
  tr: { flexDirection: "row", paddingVertical: 7, paddingHorizontal: 8, borderBottomWidth: 0.75, borderBottomColor: LINE },
  trAlt: { backgroundColor: ZEBRA },
  colNo: { width: "6%" },
  colDesc: { width: "48%", paddingRight: 8 },
  colQty: { width: "10%", textAlign: "center" },
  colUnit: { width: "18%", textAlign: "right" },
  colAmount: { width: "18%", textAlign: "right", fontFamily: "Helvetica-Bold" },
  cell: { fontSize: 8.5 },
  cellMuted: { fontSize: 8.5, color: GRAY },
  itemTitle: { fontSize: 9, fontFamily: "Helvetica-Bold" },
  itemSub: { fontSize: 7.5, color: GRAY, marginTop: 2 },
  bottom: { flexDirection: "row", marginTop: 14, gap: 16, alignItems: "flex-start" },
  words: { flex: 1, backgroundColor: PANEL, borderRadius: 4, padding: 10 },
  wordsText: { fontSize: 8.5, fontFamily: "Helvetica-Oblique", lineHeight: 1.45 },
  totals: { width: 220 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3.5, paddingHorizontal: 2 },
  totalLabel: { fontSize: 8.5, color: GRAY },
  totalValue: { fontSize: 8.5, fontFamily: "Helvetica-Bold" },
  discount: { color: BRAND },
  grand: { marginTop: 6, flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: BRAND_SOFT, borderLeftWidth: 3, borderLeftColor: BRAND, borderRadius: 3, paddingVertical: 9, paddingHorizontal: 10 },
  grandLabel: { fontSize: 8, fontFamily: "Helvetica-Bold", letterSpacing: 0.8, color: BRAND },
  grandValue: { fontSize: 14, fontFamily: "Helvetica-Bold" },
  termRow: { flexDirection: "row", marginTop: 3 },
  termNo: { width: 12, fontSize: 8, color: GRAY },
  termText: { flex: 1, fontSize: 8, color: GRAY, lineHeight: 1.45 },
  signs: { flexDirection: "row", marginTop: 28, gap: 40 },
  sign: { flex: 1 },
  signSpace: { height: 54 },
  signLine: { borderTopWidth: 0.75, borderTopColor: INK, paddingTop: 4 },
  signName: { fontSize: 9, fontFamily: "Helvetica-Bold" },
  signSub: { fontSize: 7.5, color: GRAY, marginTop: 1 },
  footer: { position: "absolute", bottom: 26, left: 44, right: 44, borderTopWidth: 0.75, borderTopColor: LINE, paddingTop: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  footerText: { fontSize: 7, color: MUTED },
});

export interface QuotationPDFProps {
  clientName: string;
  quotationNumber: string;
  quotationDate: string;
  validUntil: string;
  preparedBy: string | null;
  days: PricingDay[];
  materi: keyof typeof MN;
  addons: PricingAddons;
  dcPct: number;
  result: PricingResult;
}

type LineItem = { title: string; detail?: string; qty: number; unit: number };

function lineItems(days: PricingDay[], materi: keyof typeof MN, addons: PricingAddons): LineItem[] {
  const items: LineItem[] = days.map((d, i) => ({
    title: `Hari ${i + 1}: Pelatihan ${d.format === "offline" ? "offline" : "online"}`,
    detail: `${sesiFullLabel(d.sesi)} · ${d.peserta} peserta · Trainer ${TRN[d.trainer]} · Materi ${MN[materi]}`,
    qty: 1,
    unit: dayPrice(d, materi),
  }));
  if (addons.assessment) items.push({ title: "AI Readiness Assessment", detail: "Pemetaan kesiapan AI tim sebelum pelatihan", qty: 1, unit: ADDON_PRICE.assessment });
  if (addons.klinik) items.push({ title: "Klinik lanjutan", detail: "Sesi pendampingan setelah pelatihan", qty: addons.klinikSesi, unit: ADDON_PRICE.klinikPerSesi });
  if (addons.rekaman) items.push({ title: "Rekaman + akses LMS", detail: "Akses rekaman selama 6 bulan", qty: 1, unit: ADDON_PRICE.rekaman });
  if (addons.sertifikat) items.push({ title: "Sertifikat peserta", qty: addons.sertifikatQty, unit: ADDON_PRICE.sertifikatPerOrang });
  if (addons.perjalanan) items.push({ title: "Perjalanan luar kota", detail: "Transportasi dan akomodasi tim", qty: 1, unit: addons.perjalananRp });
  return items;
}

function programSummary(days: PricingDay[], materi: keyof typeof MN) {
  const hours = days.reduce((total, d) => total + d.sesi * 3, 0);
  const formats = new Set(days.map((d) => d.format));
  return [
    { label: "Durasi", value: `${days.length} hari` },
    { label: "Total waktu", value: `${hours.toLocaleString("id-ID")} jam` },
    { label: "Peserta", value: `${uniquePax(days)} orang` },
    { label: "Format", value: formats.size > 1 ? "Hybrid" : formats.has("online") ? "Online" : "Offline" },
    { label: "Materi", value: MN[materi] },
  ];
}

export function QuotationPDF({ clientName, quotationNumber, quotationDate, validUntil, preparedBy, days, materi, addons, dcPct, result }: QuotationPDFProps) {
  const items = lineItems(days, materi, addons);
  const sender = preparedBy || "Tim Ailene";
  const terms = [
    `Penawaran ini berlaku hingga ${validUntil}, kecuali dinyatakan lain secara tertulis.`,
    "Total penawaran sudah termasuk gross-up PPh Final 0,5%, sehingga nilai yang kami terima sama dengan nilai program.",
    ...(days.some((d) => d.format === "offline") ? ["Ruang dan konsumsi untuk sesi offline disediakan oleh klien."] : []),
    "Penawaran dianggap disetujui setelah ditandatangani oleh perwakilan klien yang berwenang.",
  ];

  return (
    <Document title={`Quotation ${quotationNumber}`} author={COMPANY} subject={`Penawaran untuk ${clientName}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.accent} fixed />

        <View style={styles.header}>
          <View>
            <AileneLogo color={INK} width={104} />
            <Text style={styles.senderName}>{COMPANY}</Text>
            {COMPANY_ADDRESS.map((line) => (
              <Text key={line} style={styles.senderLine}>
                {line}
              </Text>
            ))}
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.docTitle}>QUOTATION</Text>
            <Text style={styles.docSubtitle}>Penawaran harga program pelatihan</Text>
            <View style={styles.metaBox}>
              {[
                ["Nomor", quotationNumber],
                ["Tanggal", quotationDate],
                ["Berlaku hingga", validUntil],
              ].map(([label, value], i) => (
                <View key={label} style={i > 0 ? [styles.metaRow, styles.metaRowDivider] : styles.metaRow}>
                  <Text style={styles.metaLabel}>{label}</Text>
                  <Text style={styles.metaValue}>{value}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.parties}>
          <View style={styles.party}>
            <Text style={styles.eyebrow}>Ditujukan kepada</Text>
            <Text style={styles.partyName}>{clientName || "-"}</Text>
          </View>
          <View style={styles.party}>
            <Text style={styles.eyebrow}>Disiapkan oleh</Text>
            <Text style={styles.partyName}>{sender}</Text>
            <Text style={styles.partySub}>Ailene · {COMPANY}</Text>
          </View>
        </View>

        <View style={styles.summary}>
          {programSummary(days, materi).map((entry, i) => (
            <View key={entry.label} style={i > 0 ? [styles.summaryCell, styles.summaryDivider] : styles.summaryCell}>
              <Text style={styles.eyebrow}>{entry.label}</Text>
              <Text style={styles.summaryValue}>{entry.value}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Rincian penawaran</Text>
        <View style={styles.thead}>
          <Text style={[styles.th, styles.colNo]}>No</Text>
          <Text style={[styles.th, styles.colDesc]}>Deskripsi</Text>
          <Text style={[styles.th, styles.colQty]}>Qty</Text>
          <Text style={[styles.th, styles.colUnit]}>Harga satuan</Text>
          <Text style={[styles.th, styles.colAmount]}>Jumlah</Text>
        </View>
        {items.map((item, i) => (
          <View key={i} style={i % 2 === 1 ? [styles.tr, styles.trAlt] : styles.tr} wrap={false}>
            <Text style={[styles.cellMuted, styles.colNo]}>{i + 1}</Text>
            <View style={styles.colDesc}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              {item.detail && <Text style={styles.itemSub}>{item.detail}</Text>}
            </View>
            <Text style={[styles.cell, styles.colQty]}>{item.qty}</Text>
            <Text style={[styles.cell, styles.colUnit]}>{getRupiahCurrency(item.unit)}</Text>
            <Text style={[styles.cell, styles.colAmount]}>{getRupiahCurrency(item.unit * item.qty)}</Text>
          </View>
        ))}

        <View style={styles.bottom} wrap={false}>
          <View style={styles.words}>
            <Text style={styles.eyebrow}>Terbilang</Text>
            <Text style={styles.wordsText}>{getRupiahWords(result.invoice)}</Text>
          </View>
          <View style={styles.totals}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>{getRupiahCurrency(result.subtotal)}</Text>
            </View>
            {dcPct > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Diskon {dcPct}%</Text>
                <Text style={[styles.totalValue, styles.discount]}>-{getRupiahCurrency(result.discount)}</Text>
              </View>
            )}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Nilai program</Text>
              <Text style={styles.totalValue}>{getRupiahCurrency(result.netValue)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>PPh Final 0,5% (gross-up)</Text>
              <Text style={styles.totalValue}>{getRupiahCurrency(result.pphTax)}</Text>
            </View>
            <View style={styles.grand}>
              <Text style={styles.grandLabel}>TOTAL</Text>
              <Text style={styles.grandValue}>{getRupiahCurrency(result.invoice)}</Text>
            </View>
          </View>
        </View>

        <View wrap={false}>
          <Text style={styles.sectionTitle}>Syarat dan ketentuan</Text>
          {terms.map((term, i) => (
            <View key={i} style={styles.termRow}>
              <Text style={styles.termNo}>{i + 1}.</Text>
              <Text style={styles.termText}>{term}</Text>
            </View>
          ))}
        </View>

        <View style={styles.signs} wrap={false}>
          <View style={styles.sign}>
            <Text style={styles.eyebrow}>Hormat kami</Text>
            <View style={styles.signSpace} />
            <View style={styles.signLine}>
              <Text style={styles.signName}>{sender}</Text>
              <Text style={styles.signSub}>{COMPANY}</Text>
            </View>
          </View>
          <View style={styles.sign}>
            <Text style={styles.eyebrow}>Disetujui oleh</Text>
            <View style={styles.signSpace} />
            <View style={styles.signLine}>
              <Text style={styles.signName}>Nama dan jabatan</Text>
              <Text style={styles.signSub}>{clientName || "-"} · Tanggal: ____________</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {COMPANY} · {quotationNumber}
          </Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Halaman ${pageNumber} dari ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

export async function downloadQuotationPDF(props: QuotationPDFProps, filename: string) {
  const blob = await pdf(<QuotationPDF {...props} />).toBlob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

// Caller owns the URL and must URL.revokeObjectURL it once the preview closes.
export async function getQuotationPDFBlobUrl(props: QuotationPDFProps) {
  const blob = await pdf(<QuotationPDF {...props} />).toBlob();
  return URL.createObjectURL(blob);
}
