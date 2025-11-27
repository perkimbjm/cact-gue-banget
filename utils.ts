import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { GoogleGenAI } from "@google/genai";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getGenAI = () => {
  const apiKey = import.meta.env.VITE_GEMINI_TOKEN;
  if (!apiKey) throw new Error("VITE_GEMINI_TOKEN not found in .env file");
  return new GoogleGenAI({ apiKey });
};