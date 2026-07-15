import TrainerScreeningOS from "@/components/pages/TrainerScreeningOS";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ trainer_id: string }>;
}) {
  const { trainer_id } = await params;
  if (!/^[0-9a-f-]{32,}$/i.test(trainer_id)) notFound();

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? "";

  return (
    <TrainerScreeningOS sessionToken={sessionToken} trainerId={trainer_id} />
  );
}
