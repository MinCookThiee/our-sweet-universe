export function calendarDate(now: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)!.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function localClock(now: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hourCycle: "h23",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => Number(parts.find((p) => p.type === type)!.value);
  return { hour: get("hour"), minute: get("minute") };
}

export function isQuestionTime(now: Date, timezone: string) {
  const { hour } = localClock(now, timezone);
  return hour >= 12;
}
export function anniversaryStats(start: string, today: string) {
  const parse = (value: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value))
      throw new Error("Invalid calendar date");
    const date = new Date(`${value}T00:00:00Z`);
    if (
      !Number.isFinite(date.getTime()) ||
      date.toISOString().slice(0, 10) !== value
    )
      throw new Error("Invalid calendar date");
    return date;
  };
  const beginning = parse(start),
    current = parse(today);
  const year = current.getUTCFullYear(),
    month = beginning.getUTCMonth(),
    day = beginning.getUTCDate();
  // February 29 anniversaries fall on February 28 in non-leap years.
  const inYear = (y: number) =>
    new Date(
      Date.UTC(
        y,
        month,
        Math.min(day, new Date(Date.UTC(y, month + 1, 0)).getUTCDate()),
      ),
    );
  let next = inYear(year);
  if (next < current) next = inYear(year + 1);
  if (beginning > current) next = beginning;
  return {
    daysTogether: Math.max(0, Math.round((+current - +beginning) / 86400000)),
    daysUntil: Math.round((+next - +current) / 86400000),
    nextDate: next.toISOString().slice(0, 10),
  };
}
