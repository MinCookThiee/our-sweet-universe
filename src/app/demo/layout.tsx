import { Shell } from "@/components/shell";
export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Shell>{children}</Shell>;
}
