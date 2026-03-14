export const MONTHS: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function formatGameDate(month: number, year: number): string {
  return `${MONTHS[month - 1]} ${year}`
}

export function computeDemandBarStyle(demand: number, maxH: number): { height: number; opacity: string } {
  return {
    height: Math.max(4, Math.abs(demand) * maxH),
    opacity: demand >= 0 ? '1' : '0.4',
  }
}
