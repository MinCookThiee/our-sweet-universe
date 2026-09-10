"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, House, MessageCircleHeart, MoreHorizontal, NotebookText } from "lucide-react";
export function PrivateNav() {
  const path = usePathname();
  return (
    <nav className="private-nav" aria-label="Our space">
      {[
        { href: "/space", text: "Home", Icon: House },
        { href: "/space/memories", text: "Memories", Icon: Heart },
        { href: "/space/questions", text: "Question", Icon: MessageCircleHeart },
        { href: "/space/notes", text: "Notes", Icon: NotebookText },
        { href: "/space/more", text: "More", Icon: MoreHorizontal },
      ].map(({ href, text, Icon }) => {
        const active =
          href === "/space"
            ? path === href
            : path === href || path.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            prefetch={true}
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
