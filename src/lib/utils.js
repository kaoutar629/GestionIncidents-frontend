/**
 * Utility: cn()
 * Merges class names, filtering out falsy values.
 * Mirrors the shadcn/ui `cn` helper without requiring clsx/tailwind-merge as deps,
 * since all UI components in this project are hand-written without those libraries.
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
