/**
 * Utility functions for formatting time/date for database
 */

/**
 * Get current time in HH:MM:SS format for PostgreSQL time fields
 * @returns Time string in HH:MM:SS format
 */
export function getCurrentTimeString(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Convert Date object to HH:MM:SS format
 * @param date Date object
 * @returns Time string in HH:MM:SS format
 */
export function formatTimeString(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Parse HH:MM:SS string to Date object (today's date with that time)
 * @param timeString Time string in HH:MM:SS format
 * @returns Date object
 */
export function parseTimeString(timeString: string): Date {
  const [hours, minutes, seconds] = timeString.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, seconds, 0);
  return date;
}

/**
 * Format time string for display (remove seconds if needed)
 * @param timeString Time string in HH:MM:SS format
 * @param includeSeconds Whether to include seconds (default: false)
 * @returns Formatted time string
 */
export function displayTimeString(
  timeString: string,
  includeSeconds: boolean = false
): string {
  const parts = timeString.split(":");
  if (includeSeconds) {
    return timeString;
  }
  return `${parts[0]}:${parts[1]}`;
}
