import Link from "next/link";
import { requireCouple } from "@/lib/authorization";

export async function PrivateHeader() {
  const couple = await requireCouple();

  return <Link href="/space">♡ {couple.name}</Link>;
}
