import { notFound } from "next/navigation";
import { Preview } from "@/components/preview";
import { calendarDate } from "@/lib/dates";
export const dynamic = "force-dynamic";
export default async function Page({
  params,
}: {
  params: Promise<{ section?: string[] }>;
}) {
  const { section } = await params;
  const slug = section?.[0] ?? "home";
  if (
    (section?.length ?? 0) > 1 ||
    ![
      "home",
      "story",
      "memories",
      "gallery",
      "letters",
      "jar",
      "anniversary",
    ].includes(slug)
  )
    notFound();
  return (
    <Preview section={slug} today={calendarDate(new Date(), "Asia/Bangkok")} />
  );
}
