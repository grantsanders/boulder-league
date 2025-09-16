import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function getSupabaseSchema(): string {
  return process.env.SUPABASE_SCHEMA || 'boulder-league-dev'
}
