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

/**
 * Resolves an API path with the application base path if configured (e.g. /ReviewFlow/api/...).
 */
export function apiUrl(endpoint: string): string {
  const base = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${base}${cleanEndpoint}`;
}


