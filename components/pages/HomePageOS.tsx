"use client";

import RevenueEngineOS from "@/components/pages/RevenueEngineOS";

export default function HomePageOS({ sessionToken }: { sessionToken: string }) {
  return (
    <div className="flex min-h-full flex-col">
      <div className="flex flex-1 flex-col gap-6 px-4 py-6 sm:px-8">
        <RevenueEngineOS sessionToken={sessionToken} />
      </div>
    </div>
  );
}
