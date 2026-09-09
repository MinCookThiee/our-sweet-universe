import Link from "next/link";
import { BookHeart, CalendarHeart, Settings } from "lucide-react";

export default function MorePage() {
  return <section><p className="eyebrow">A FEW MORE LITTLE THINGS</p><h1>More of us.</h1><div className="more-links">
    <Link href="/space/story"><BookHeart aria-hidden="true"/><span><strong>Our Story</strong><small>Milestones that brought you here.</small></span><b>→</b></Link>
    <Link href="/space/settings"><CalendarHeart aria-hidden="true"/><span><strong>Anniversary & details</strong><small>Dates, timezone and your shared space.</small></span><b>→</b></Link>
    <Link href="/space/settings"><Settings aria-hidden="true"/><span><strong>Settings</strong><small>Account and sign out.</small></span><b>→</b></Link>
  </div></section>;
}
