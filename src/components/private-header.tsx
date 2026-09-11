import Link from "next/link";
import { Heart } from "lucide-react";
import { requireCouple } from "@/lib/authorization";

export async function PrivateHeader() {
  const couple = await requireCouple();

  return <Link className="private-brand" href="/space" aria-label={`Go to ${couple.name} home`}><Heart size={18} aria-hidden="true" /><span>{couple.name}</span></Link>;
}
