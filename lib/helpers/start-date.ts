export const getStartDate = (vip?: boolean) => {
  const defaultStartDate = process.env.NEXT_PUBLIC_SIGNUP_START_DATE
  if (!defaultStartDate)
    return { error: "Start date not found", startDate: null }
  let startDate = parseInt(defaultStartDate)
  if (isNaN(startDate))
    return { error: "Start date is not a number", startDate: null }
  const hasStarted = Date.now() > startDate
  if (vip) startDate -= 1000 * 60 * 60 * 24 // 1 day earlier for VIPs
  const hasStarted2 = Date.now() > startDate
  return { startDate, vipEarlyAccess: !hasStarted && hasStarted2, error: null }
}
