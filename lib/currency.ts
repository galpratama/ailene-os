export function getRupiahCurrency(value: number): string {
  const formatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });
  const formatted = formatter.format(value);

  /*
   * CLDR has an issue regarding number format for Indonesian language (id):
   * https://www.unicode.org/cldr/charts/48/summary/id.html#6154e7673c3829ce
   * Correct format:
   * https://ejaan.kemendikdasmen.go.id/eyd/penulisan-kata/angka-dan-bilangan/
   */
  return formatted.replace(" ", "");
}

export function getShortRupiahCurrency(value: number): string {
  if (isNaN(value)) {
    return "Rp0";
  }

  const units = ["", "rb", "jt", "M", "T"];
  const isNegative = value < 0;
  value = Math.abs(value);

  let unitIndex = 0;
  while (value >= 1000 && unitIndex < units.length - 1) {
    value /= 1000;
    unitIndex++;
  }

  const rounded = Math.round(value * 10) / 10;
  return `${isNegative ? "-" : ""}Rp${rounded}${units[unitIndex]}`;
}

// Ad platforms report in the ad account's own currency, which is not always IDR.
export function getAccountCurrency(value: number, currency: string): string {
  if (currency === "IDR") {
    return getRupiahCurrency(value);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function getShortAccountCurrency(value: number, currency: string): string {
  if (currency === "IDR") {
    return getShortRupiahCurrency(value);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

const WORD_UNITS = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"];
const WORD_SCALES: [number, string][] = [[1e12, "triliun"], [1e9, "miliar"], [1e6, "juta"]];

function spellNumber(n: number): string {
  if (n < 12) return WORD_UNITS[n];
  if (n < 20) return `${spellNumber(n - 10)} belas`;
  if (n < 100) return `${spellNumber(Math.floor(n / 10))} puluh ${spellNumber(n % 10)}`;
  if (n < 200) return `seratus ${spellNumber(n - 100)}`;
  if (n < 1000) return `${spellNumber(Math.floor(n / 100))} ratus ${spellNumber(n % 100)}`;
  if (n < 2000) return `seribu ${spellNumber(n - 1000)}`;
  if (n < 1e6) return `${spellNumber(Math.floor(n / 1000))} ribu ${spellNumber(n % 1000)}`;
  const [scale, word] = WORD_SCALES.find(([size]) => n >= size) ?? WORD_SCALES[WORD_SCALES.length - 1];
  return `${spellNumber(Math.floor(n / scale))} ${word} ${spellNumber(n % scale)}`;
}

// Terbilang for documents, rounded to whole rupiah like getRupiahCurrency, e.g. 1250000 -> "Satu juta dua ratus lima puluh ribu rupiah".
export function getRupiahWords(value: number): string {
  const rupiah = Math.round(Math.abs(value));
  const words = `${rupiah === 0 ? "nol" : spellNumber(rupiah)} rupiah`.replace(/\s+/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}
