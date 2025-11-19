/**
 * Calculate time slot from time string
 * @param timeString - Time in HH:MM:SS or HH:MM format
 * @returns 'morning' | 'afternoon' | 'evening'
 */
export function calculateTimeSlot(
  timeString: string
): "morning" | "afternoon" | "evening" {
  const [hours] = timeString.split(":").map(Number);

  if (hours >= 6 && hours < 12) {
    return "morning";
  } else if (hours >= 12 && hours < 18) {
    return "afternoon";
  } else {
    return "evening";
  }
}

/**
 * Get display label for time slot
 */
export function getTimeSlotLabel(timeSlot: string): string {
  switch (timeSlot) {
    case "morning":
      return "Buổi sáng";
    case "afternoon":
      return "Buổi chiều";
    case "evening":
      return "Buổi tối";
    default:
      return timeSlot;
  }
}
