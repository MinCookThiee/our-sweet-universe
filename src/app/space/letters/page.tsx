import Link from "next/link";
import { Mail } from "lucide-react";
import { requireCouple } from "@/lib/authorization";

export default async function LettersPage() {
  await requireCouple();
  return <section className="future-page"><Mail size={34} aria-hidden="true"/><p className="eyebrow">FOR WORDS THAT STAY</p><h1>Love letters.</h1><p>Private writing and saving are the next Home feature.</p><Link className="button" href="/space">Back Home</Link></section>;
}
