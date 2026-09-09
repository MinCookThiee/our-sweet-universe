import Link from "next/link";
import { Sparkles } from "lucide-react";
import { requireCouple } from "@/lib/authorization";

export default async function JarPage() {
  await requireCouple();
  return <section className="future-page"><Sparkles size={34} aria-hidden="true"/><p className="eyebrow">A LITTLE PICK-ME-UP</p><h1>Memory jar.</h1><p>Soon, you’ll keep tiny notes here and pick one when you need a smile.</p><Link className="button" href="/space">Back Home</Link></section>;
}
