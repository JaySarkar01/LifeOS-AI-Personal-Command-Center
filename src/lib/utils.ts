/**
 * Combines and filters conditional CSS class names.
 * Lightweight, zero-dependency alternative to clsx/tailwind-merge.
 */
export function cn(...inputs: unknown[]): string {
  const classes: string[] = [];

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === "string") {
      classes.push(input);
    } else if (Array.isArray(input)) {
      const resolved = cn(...(input as unknown[]));
      if (resolved) classes.push(resolved);
    } else if (typeof input === "object") {
      const obj = input as Record<string, unknown>;
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key) && obj[key]) {
          classes.push(key);
        }
      }
    }
  }

  return classes.join(" ");
}
