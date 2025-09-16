import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get environment variable with fallback to default value
 * @param key - Environment variable key
 * @param defaultValue - Default value if environment variable is not set
 * @returns Environment variable value or default value
 */
export function getEnvVar(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue
}

/**
 * Get Supabase schema name with fallback to 'boulder-league-dev'
 * @returns Schema name from environment or default
 */
export function getSupabaseSchema(): string {
  return getEnvVar('SUPABASE_SCHEMA', 'boulder-league-dev')
}
