"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, BookHeart, Settings } from "lucide-react";
export function PrivateNav() {
  const path = usePathname();
  return (
    <nav className="private-nav" aria-label="Our space">
      {[
        { href: "/space", text: "Memories", Icon: Heart },
        { href: "/space/story", text: "Our Story", Icon: BookHeart },
        { href: "/space/settings", text: "Settings", Icon: Settings },
      ].map(({ href, text, Icon }) => {
        const active =
          href === "/space"
            ? path === href || path.startsWith("/space/memories/")
            : path === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
          >
            <Icon size={20} aria-hidden="true" />
            <span>{text}</span>
          </Link>
        );
      })}
    </nav>
  );
}
