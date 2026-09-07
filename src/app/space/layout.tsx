import Link from "next/link";
import { requireCouple } from "@/lib/authorization";
import { PrivateNav } from "@/components/private-nav";
export const dynamic = "force-dynamic";
export default async function PrivateLayout({children}: {children: React.ReactNode}) {
  const couple = await requireCouple();
  return <div className="private-shell">
    <a className="skip-link" href="#private-content">Skip to content</a>
    <header className="private-header"><Link href="/space">♡ {couple.name}</Link><span>Just for us</span></header>
    <PrivateNav />
    <main id="private-content" className="private-content">{children}</main>
  </div>;
}
