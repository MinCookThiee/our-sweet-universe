import Link from "next/link";
import { Suspense } from "react";
import { PrivateNav } from "@/components/private-nav";
import { PrivateHeader } from "@/components/private-header";
export const dynamic = "force-dynamic";
export default function PrivateLayout({children}: {children: React.ReactNode}) {
  return <div className="private-shell">
    <a className="skip-link" href="#private-content">Skip to content</a>
    <header className="private-header"><Suspense fallback={<Link className="private-brand" href="/space">♡ <span>Our Sweet Universe</span></Link>}><PrivateHeader /></Suspense></header>
    <PrivateNav />
    <main id="private-content" className="private-content">{children}</main>
  </div>;
}
