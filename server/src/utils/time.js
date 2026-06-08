import dayjs from "dayjs";

export function dateKey(value = new Date()) {
  return dayjs(value).format("YYYY-MM-DD");
}

export function combineDateTime(date, hhmm) {
  const [hours, minutes] = hhmm.split(":").map(Number);
  return dayjs(date).hour(hours).minute(minutes).second(0).millisecond(0);
}

export function shiftBounds(date, shift) {
  const start = combineDateTime(date, shift.startTime);
  let end = combineDateTime(date, shift.endTime);
  if (end.isBefore(start) || end.isSame(start)) end = end.add(1, "day");
  return { start, end };
}

export function minutesBetween(start, end) {
  if (!start || !end) return 0;
  return Math.max(0, dayjs(end).diff(dayjs(start), "minute"));
}

export function formatMinutes(minutes) {
  const h = Math.floor((minutes || 0) / 60);
  const m = (minutes || 0) % 60;
  return `${h}h ${m}m`;
}

