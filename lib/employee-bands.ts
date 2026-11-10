import type { EmployeeBand } from "@/apis/sales";

export const employeeBandLabels: Record<EmployeeBand, string> = {
  "1_49": "1–49 karyawan",
  "50_99": "50–99 karyawan",
  "100_499": "100–499 karyawan",
  "500_999": "500–999 karyawan",
  "1000_plus": "1000+ karyawan",
};

export const employeeBandOptions = (Object.keys(employeeBandLabels) as EmployeeBand[]).map((band) => ({ value: band, label: employeeBandLabels[band] }));
