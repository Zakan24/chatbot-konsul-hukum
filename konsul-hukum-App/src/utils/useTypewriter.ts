"use client"

import { useState, useEffect, useRef, useCallback } from "react"

interface UseTypewriterOptions {
  /** Characters to reveal per tick */
  chunkSize?: number
  /** Milliseconds between each tick */
  speed?: number
}

interface UseTypewriterReturn {
  /** The text to display (progressively revealed) */
  displayText: string
  /** Whether the animation is still running */
  isAnimating: boolean
  /** Skip to the end immediately */
  skip: () => void
}

/**
 * Hook that progressively reveals text character-by-character.
 * Only animates when `enabled` is true (for new messages only, not history).
 */
export function useTypewriter(
  fullText: string,
  enabled: boolean,
  options: UseTypewriterOptions = {}
): UseTypewriterReturn {
  const { chunkSize = 3, speed = 12 } = options

  const [displayLength, setDisplayLength] = useState(enabled ? 0 : fullText.length)
  const [isAnimating, setIsAnimating] = useState(enabled)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const fullTextRef = useRef(fullText)
  const hasStartedRef = useRef(false)

  // Keep ref in sync
  fullTextRef.current = fullText

  // Clear any running timer
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  // Start the animation interval
  const startAnimation = useCallback(() => {
    clearTimer()
    hasStartedRef.current = true
    setIsAnimating(true)

    timerRef.current = setInterval(() => {
      setDisplayLength((prev) => {
        const next = prev + chunkSize
        if (next >= fullTextRef.current.length) {
          // Animation complete
          if (timerRef.current) clearInterval(timerRef.current)
          timerRef.current = null
          setIsAnimating(false)
          return fullTextRef.current.length
        }
        return next
      })
    }, speed)
  }, [chunkSize, speed, clearTimer])

  // Main animation effect
  useEffect(() => {
    if (!enabled) {
      clearTimer()
      setDisplayLength(fullText.length)
      setIsAnimating(false)
      hasStartedRef.current = false
      return
    }

    // Start animation when enabled with text, and haven't started yet
    if (fullText.length > 0 && !hasStartedRef.current) {
      setDisplayLength(0)
      startAnimation()
    }

    return clearTimer
  }, [enabled, fullText, startAnimation, clearTimer])

  // If text changes and we're done animating, update to full length
  useEffect(() => {
    if (!isAnimating) {
      setDisplayLength(fullText.length)
    }
  }, [fullText, isAnimating])

  const skip = useCallback(() => {
    clearTimer()
    hasStartedRef.current = true
    setDisplayLength(fullTextRef.current.length)
    setIsAnimating(false)
  }, [clearTimer])

  return {
    displayText: fullText.slice(0, displayLength),
    isAnimating,
    skip,
  }
}
