"use client"

import { useState, useEffect } from "react"
import AnimatedBackground from "./animated-background"

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [accentColor, setAccentColor] = useState<"pink" | "gold">("pink")
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    
    // Listen for custom event from page component
    const handleAccentChange = (e: Event) => {
      const customEvent = e as CustomEvent<"pink" | "gold">
      setAccentColor(customEvent.detail)
      
      // Apply class to html element to toggle CSS color swaps
      if (customEvent.detail === "gold") {
        document.documentElement.classList.add("gold-mode")
      } else {
        document.documentElement.classList.remove("gold-mode")
      }
    }

    window.addEventListener("accentChange", handleAccentChange)
    return () => window.removeEventListener("accentChange", handleAccentChange)
  }, [])

  if (!isMounted) return <AnimatedBackground accentColor="pink" />

  return (
    <>
      <AnimatedBackground accentColor={accentColor} />
      <div style={{ position: "relative", zIndex: 2 }}>
        {children}
      </div>
    </>
  )
}
