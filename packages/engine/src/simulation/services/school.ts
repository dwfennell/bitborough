export const SCHOOL_CAPACITY: Record<string, number> = {
  'service.school': 300,
  'service.school.small': 50,
}

export const SCHOOL_OVER_CAPACITY_RATIO = 1.2

export function computeSchoolQuality(
  enrolledChildren: number,
  capacity: number,
  fundingLevel: number,
): number {
  if (capacity === 0) return 0
  const ratio = enrolledChildren / capacity
  const occupancyFactor = ratio <= 1.0
    ? 1.0
    : Math.max(0, 1.0 - (ratio - 1.0) * 2.5)
  return (fundingLevel / 100) * occupancyFactor
}
