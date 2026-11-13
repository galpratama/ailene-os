"use client";

import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import AppNumberInput from "@/components/fields/AppNumberInput";
import AlertConfirmationOS from "@/components/modals/AlertConfirmationOS";
import SheetOS from "@/components/modals/SheetOS";
import { createRevenueTarget, deleteRevenueTarget, listRevenueTargets, updateRevenueTarget } from "@/lib/actions";
import { requireApiData } from "@/lib/api-result";
import { getRupiahCurrency } from "@/lib/currency";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";

type Figures = { leads: string; sqls: string; closings: string; revenue: string };

const EMPTY: Figures = { leads: "", sqls: "", closings: "", revenue: "" };

// Administrators set one month's plan; the month picker loads whatever target that month already has.
export default function RevenueTargetFormOS({ initialMonth, onClose, onSaved }: { initialMonth: string; onClose: () => void; onSaved: () => Promise<void> }) {
  const [month, setMonth] = useState(initialMonth);
  const [figures, setFigures] = useState<Figures>(EMPTY);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const existing = useQuery({
    queryKey: ["revenue", "targets", month],
    queryFn: async () => requireApiData(await listRevenueTargets({ start_month: month, end_month: month })).list[0] ?? null,
    enabled: /^\d{4}-\d{2}$/.test(month),
  });

  // Prefill once per picked month, during render, so typing is never overwritten by a refetch.
  if (existing.data !== undefined && loadedFor !== month) {
    setLoadedFor(month);
    const target = existing.data;
    setFigures(target ? { leads: String(target.leads), sqls: String(target.sqls), closings: String(target.closings), revenue: String(target.revenue) } : EMPTY);
  }

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        month,
        leads: Number(figures.leads || 0),
        sqls: Number(figures.sqls || 0),
        closings: Number(figures.closings || 0),
        revenue: Number(figures.revenue || 0),
      };
      return requireApiData(existing.data ? await updateRevenueTarget(payload) : await createRevenueTarget(payload));
    },
    onSuccess: async () => {
      showSuccessToast(`Target ${month} disimpan`);
      await onSaved();
      onClose();
    },
    onError: (cause) => showErrorToast(cause),
  });

  const remove = useMutation({
    mutationFn: async () => requireApiData(await deleteRevenueTarget(month)),
    onSuccess: async () => {
      showSuccessToast(`Target ${month} dihapus`);
      await onSaved();
      onClose();
    },
    onError: (cause) => showErrorToast(cause),
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = !/^\d{4}-\d{2}$/.test(month) ? "Pilih bulan." : Number.isNaN(Number(figures.revenue || 0)) ? "Revenue harus angka." : "";
    setError(next);
    if (next || existing.isLoading) return;
    save.mutate();
  }

  const busy = save.isPending || remove.isPending;
  const field = (key: keyof Figures) => (value: string) => setFigures((current) => ({ ...current, [key]: value }));

  return (
    <SheetOS title="Target bulanan" description="Target lead, SQL, closing, dan revenue untuk satu bulan. Dipakai di Revenue vs target dan Monthly plan vs actual." isOpen onClose={onClose}>
      <form noValidate onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <AppInput
            inputId="target-month"
            label="Bulan"
            type="month"
            value={month}
            onChange={(event) => {
              setMonth(event.target.value);
              setError("");
            }}
            errorMessage={error}
            required
            disabled={busy}
          />
          {existing.isLoading ? (
            <p className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400">
              <Loader2 size={14} className="animate-spin" /> Memuat target...
            </p>
          ) : (
            <p className="text-xs text-gray-500 dark:text-zinc-400">{existing.data ? "Bulan ini sudah punya target; simpan untuk menggantinya." : "Bulan ini belum punya target."}</p>
          )}
          <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-3" disabled={busy || existing.isLoading}>
            <AppNumberInput inputId="target-leads" label="Leads" mode="numeric" value={figures.leads} onValueChange={field("leads")} placeholder="0" />
            <AppNumberInput inputId="target-sqls" label="SQL" mode="numeric" value={figures.sqls} onValueChange={field("sqls")} placeholder="0" />
            <AppNumberInput inputId="target-closings" label="Closing" mode="numeric" value={figures.closings} onValueChange={field("closings")} placeholder="0" />
          </fieldset>
          <div className="space-y-1.5">
            <AppNumberInput inputId="target-revenue" label="Revenue (Rp)" mode="decimal" value={figures.revenue} onValueChange={field("revenue")} placeholder="0" disabled={busy || existing.isLoading} />
            <p className="text-xs tabular-nums text-gray-500 dark:text-zinc-400">{getRupiahCurrency(Number(figures.revenue || 0))}</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-line-soft px-6 py-4">
          <div>
            {existing.data && (
              <AppButton type="button" variant="dangerGhost" size="sm" onClick={() => setConfirmDelete(true)} disabled={busy}>
                <Trash2 size={14} /> Hapus target
              </AppButton>
            )}
          </div>
          <div className="flex gap-2">
            <AppButton type="button" variant="outline" size="sm" onClick={onClose} disabled={busy}>
              Batal
            </AppButton>
            <AppButton type="submit" size="sm" disabled={busy || existing.isLoading}>
              {save.isPending && <Loader2 size={14} className="animate-spin" />}
              Simpan target
            </AppButton>
          </div>
        </div>
      </form>

      <AlertConfirmationOS
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => remove.mutate()}
        title="Hapus target?"
        message={`Target ${month} akan dihapus. Bulan ini akan tampil tanpa target.`}
        confirmLabel="Hapus"
        destructive
        isPending={remove.isPending}
      />
    </SheetOS>
  );
}
