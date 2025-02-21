import { useEffect, useState } from "react"

/**
 * Universal debounce hook with deep comparison to prevent rerender loops.
 * @param value The value to debounce.
 * @param delay Delay in milliseconds.
 * @returns Debounced value.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  const valueString = JSON.stringify(value)

  useEffect(() => {
    // Convert object to string to avoid reference changes
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueString, delay]) // Using JSON.stringify to compare object content

  return debouncedValue
}
