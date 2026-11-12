import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines Tailwind classes safely with clsx and twMerge.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Generates an opaque random request identifier.
 */
export function generateRequestId(): string {
  return "req_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

