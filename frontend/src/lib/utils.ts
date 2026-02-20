import { useRef, useCallback } from "react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function useThrottledCallback(fn: () => void, limit: number) {
  const inThrottle = useRef(false)
  const fnRef = useRef(fn)
  fnRef.current = fn 

  return useCallback(() => {
    if (inThrottle.current) return
    fnRef.current()
    inThrottle.current = true
    setTimeout(() => {
      inThrottle.current = false
    }, limit)
  }, [limit])
}
