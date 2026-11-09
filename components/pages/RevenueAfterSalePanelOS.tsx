import RevenueCardOS from "@/components/elements/RevenueCardOS";
import RevenueKpiOS from "@/components/elements/RevenueKpiOS";

// The right side of the bowtie has no data source in Ailene OS yet, so every widget keeps its slot and says what it needs.
export default function RevenueAfterSalePanelOS() {
  return (
    <>
      <p className="text-base text-gray-800 dark:text-zinc-200">
        The right side of the bowtie: did the training land, and did the client come back?
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <RevenueKpiOS label="Clients who bought again" pending="Needs more than one deal per company." />
        <RevenueKpiOS label="Reaction score (Kirkpatrick L1)" pending="Needs delivery evaluations." />
        <RevenueKpiOS label="Using AI at 30 days (L3)" pending="Needs 30-day follow-up results." />
        <RevenueKpiOS label="NalarX referral commission" pending="Needs referral partner records." />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <RevenueCardOS
          title="Clients at each step after the sale"
          description="Memantau apakah klien yang sudah deal benar-benar di-onboard, menyelesaikan training, merasakan dampaknya, lalu membeli lagi atau memberi referral."
          pending="Needs delivery records per won deal."
        />
        <RevenueCardOS
          title="Trainer load, next 30 days"
          description="Memastikan jadwal training 30 hari ke depan tidak melebihi kapasitas trainer, dan menentukan kapan perlu merekrut trainer baru."
          pending="Needs scheduled deliveries and trainer availability."
        />
      </div>

      <RevenueCardOS
        title="Delivered sessions and impact"
        description="Menilai kualitas setiap sesi training yang sudah berjalan, dan trainer mana yang memberi dampak terbaik bagi klien."
        pending="Needs delivery records."
        pendingShape="table"
        pendingColumns={["Client", "Session", "Trainer", "Participants", "L1", "L2 pre → post", "L3"]}
      />
    </>
  );
}
