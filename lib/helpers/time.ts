// Optimized version of getTimeLeft
export function getTimeLeft(targetTimestamp: number) {
  const now = Date.now()
  let delta = Math.max(0, targetTimestamp - now)

  const days = Math.floor(delta / 86_400_000) // 1000 * 60 * 60 * 24
  delta -= days * 86_400_000

  const hours = Math.floor(delta / 3_600_000) // 1000 * 60 * 60
  delta -= hours * 3_600_000

  const minutes = Math.floor(delta / 60_000) // 1000 * 60
  delta -= minutes * 60_000

  const seconds = Math.floor(delta / 1000)

  return { days, hours, minutes, seconds }
}
