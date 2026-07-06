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
