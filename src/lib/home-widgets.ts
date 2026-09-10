import { z } from "zod";

export const homeWidgetIds = ["photo", "jar", "question", "memory"] as const;
export type HomeWidgetId = (typeof homeWidgetIds)[number];
export type HomeWidgetSize = "half" | "full";
export type HomeWidgetConfig = {
  id: HomeWidgetId;
  visible: boolean;
  size: HomeWidgetSize;
};

export const defaultHomeWidgets: HomeWidgetConfig[] = [
  { id: "photo", visible: true, size: "half" },
  { id: "jar", visible: true, size: "half" },
  { id: "question", visible: true, size: "half" },
  { id: "memory", visible: true, size: "full" },
];

const widgetConfigInput = z.object({
  id: z.enum(homeWidgetIds),
  visible: z.boolean(),
  size: z.enum(["half", "full"]),
});

export function normalizeHomeWidgets(value: unknown): HomeWidgetConfig[] {
  const parsed = z.array(widgetConfigInput).safeParse(value);
  if (!parsed.success) return defaultHomeWidgets;
  const provided = new Map(parsed.data.map((widget) => [widget.id, widget]));
  return [
    ...parsed.data.filter((widget, index) => parsed.data.findIndex(({ id }) => id === widget.id) === index),
    ...defaultHomeWidgets.filter((widget) => !provided.has(widget.id)),
  ];
}

export const homeWidgetsInput = z.array(widgetConfigInput).length(homeWidgetIds.length);
