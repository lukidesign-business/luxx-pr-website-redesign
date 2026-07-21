"use client"

import { useEffect, useRef } from "react"

interface Orb {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  opacity: number
  opacityDir: number
  color: string
  blur: number
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
}

interface AnimatedBackgroundProps {
  accentColor?: "pink" | "gold"
}

export default function AnimatedBackground({ accentColor = "pink" }: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animId: number
    let width = window.innerWidth
    let height = window.innerHeight

    canvas.width = width
    canvas.height = height

    // Colors based on accent
    let PRIMARY = ""
    let BRIGHT = ""
    let PALE = ""

    if (accentColor === "gold") {
      PRIMARY = "255, 193, 7"      // Bright gold
      BRIGHT = "255, 214, 100"     // Pale gold
      PALE = "255, 235, 150"       // Light gold
    } else {
      PRIMARY = "153, 185, 213"    // LuxxPR exact brand blue
      BRIGHT = "176, 204, 224"     // Lighter tint
      PALE = "200, 220, 235"       // Pale tint
    }

    const PINK = PRIMARY
    const PINK_BRIGHT = BRIGHT
    const PINK_PALE = PALE

    // Floating orbs
    const orbs: Orb[] = Array.from({ length: 6 }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      radius: 180 + Math.random() * 220,
      opacity: 0.04 + Math.random() * 0.06,
      opacityDir: Math.random() > 0.5 ? 1 : -1,
      color: i % 3 === 0 ? PINK : i % 3 === 1 ? PINK_BRIGHT : PINK_PALE,
      blur: 60 + Math.random() * 80,
    }))

    // Floating particles
    const particles: Particle[] = []
    const MAX_PARTICLES = 55

    function spawnParticle() {
      const edge = Math.floor(Math.random() * 4)
      let x = 0, y = 0
      if (edge === 0) { x = Math.random() * width; y = -10 }
      else if (edge === 1) { x = width + 10; y = Math.random() * height }
      else if (edge === 2) { x = Math.random() * width; y = height + 10 }
      else { x = -10; y = Math.random() * height }

      particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        life: 0,
        maxLife: 180 + Math.random() * 240,
        size: 1 + Math.random() * 2.2,
        color: Math.random() > 0.4 ? PINK : PINK_PALE,
      })
    }

    // Streak lines
    interface Streak {
      x: number; y: number; angle: number; speed: number
      length: number; life: number; maxLife: number; alpha: number
    }
    const streaks: Streak[] = []

    function spawnStreak() {
      streaks.push({
        x: Math.random() * width,
        y: Math.random() * height,
        angle: Math.random() * Math.PI * 2,
        speed: 0.8 + Math.random() * 1.4,
        length: 40 + Math.random() * 80,
        life: 0,
        maxLife: 90 + Math.random() * 60,
        alpha: 0,
      })
    }

    let frame = 0

    function draw() {
      animId = requestAnimationFrame(draw)
      frame++

      ctx.clearRect(0, 0, width, height)

      // Draw orbs
      for (const orb of orbs) {
        orb.x += orb.vx
        orb.y += orb.vy
        if (orb.x < -orb.radius) orb.x = width + orb.radius
        if (orb.x > width + orb.radius) orb.x = -orb.radius
        if (orb.y < -orb.radius) orb.y = height + orb.radius
        if (orb.y > height + orb.radius) orb.y = -orb.radius

        orb.opacity += orb.opacityDir * 0.0003
        if (orb.opacity > 0.10) orb.opacityDir = -1
        if (orb.opacity < 0.02) orb.opacityDir = 1

        const grd = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius)
        grd.addColorStop(0, `rgba(${orb.color}, ${orb.opacity})`)
        grd.addColorStop(0.5, `rgba(${orb.color}, ${orb.opacity * 0.4})`)
        grd.addColorStop(1, `rgba(${orb.color}, 0)`)
        ctx.beginPath()
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2)
        ctx.fillStyle = grd
        ctx.fill()
      }

      // Spawn particles
      if (particles.length < MAX_PARTICLES && frame % 4 === 0) spawnParticle()

      // Draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        p.life++

        const progress = p.life / p.maxLife
        const alpha = progress < 0.15
          ? progress / 0.15 * 0.7
          : progress > 0.8
            ? (1 - progress) / 0.2 * 0.7
            : 0.7

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${p.color}, ${alpha})`
        ctx.fill()

        // Subtle glow
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4)
        glow.addColorStop(0, `rgba(${p.color}, ${alpha * 0.3})`)
        glow.addColorStop(1, `rgba(${p.color}, 0)`)
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2)
        ctx.fillStyle = glow
        ctx.fill()

        if (p.life >= p.maxLife) particles.splice(i, 1)
      }

      // Spawn streaks
      if (streaks.length < 8 && frame % 90 === 0) spawnStreak()

      // Draw streaks
      for (let i = streaks.length - 1; i >= 0; i--) {
        const s = streaks[i]
        s.life++
        const progress = s.life / s.maxLife
        s.alpha = progress < 0.2
          ? progress / 0.2 * 0.35
          : progress > 0.7
            ? (1 - progress) / 0.3 * 0.35
            : 0.35

        const ex = s.x + Math.cos(s.angle) * s.length * progress
        const ey = s.y + Math.sin(s.angle) * s.length * progress

        const grad = ctx.createLinearGradient(s.x, s.y, ex, ey)
        grad.addColorStop(0, `rgba(${PINK}, 0)`)
        grad.addColorStop(0.5, `rgba(${PINK}, ${s.alpha})`)
        grad.addColorStop(1, `rgba(${PINK}, 0)`)

        ctx.beginPath()
        ctx.moveTo(s.x, s.y)
        ctx.lineTo(ex, ey)
        ctx.strokeStyle = grad
        ctx.lineWidth = 1
        ctx.stroke()

        if (s.life >= s.maxLife) streaks.splice(i, 1)
      }

      // Horizontal scan line effect
      const scanY = ((frame * 0.4) % (height + 40)) - 20
      const scanGrad = ctx.createLinearGradient(0, scanY - 60, 0, scanY + 60)
      scanGrad.addColorStop(0, `rgba(${PINK}, 0)`)
      scanGrad.addColorStop(0.5, `rgba(${PINK}, 0.018)`)
      scanGrad.addColorStop(1, `rgba(${PINK}, 0)`)
      ctx.fillStyle = scanGrad
      ctx.fillRect(0, scanY - 60, width, 120)
    }

    draw()

    const onResize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
    }
    window.addEventListener("resize", onResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", onResize)
    }
  }, [accentColor])

  return (
    <>
      {/* Base dark background — LuxxPR deep navy */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -2,
          backgroundColor: "#050d14",
        }}
      />

      {/* Animated canvas layer — particles behind the image overlay */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -1,
          pointerEvents: "none",
        }}
      />

      {/* Mockup image overlay at 0.3 opacity — sits above particles */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          backgroundImage: "url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/lux-mockup1%20%281%29-akhqpMMGugW0w2FBXgVPr0obimNck1.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 0.3,
          pointerEvents: "none",
        }}
      />

      {/* Dark tint to keep page content legible */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1,
          backgroundColor: "rgba(5, 13, 20, 0.50)",
          pointerEvents: "none",
        }}
      />
    </>
  )
}
