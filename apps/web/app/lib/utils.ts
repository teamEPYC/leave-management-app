import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getApiKey() {
  const apiKey = localStorage.getItem("apiKey");
  if (!apiKey) {
    window.location.href = "/";
  }
  return apiKey;
}

export function handleApiError<T>(res: { data?: T; error?: unknown }): T {
  if (res.error) {
    console.error("API error:", res.error);
    throw new Error(JSON.stringify(res.error));
  }
  return res.data!;
}
