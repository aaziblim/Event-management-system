export function formatLongDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

export function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

export function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}
