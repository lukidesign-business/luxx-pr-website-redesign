"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

type FormData = {
  websiteType: string
  productCount: string
  pageCount: string
  domainName: string
  domainValue: string
  branding: string
  websitePurpose: string
  contentReady: string
  advancedFeatures: string
  name: string
  businessName: string
  email: string
  phone: string
  businessDescription: string
  referralCode: string
}

// ─── Pricing Engine ───────────────────────────────────────────────────────────

function calculateEstimate(data: Partial<FormData>): { low: number; high: number } | null {
  if (!data.websiteType) return null

  const type = data.websiteType

  // Base prices per type
  let low = 500
  let high = 800

  if (type === "An e-commerce store") {
    low = 1000; high = 2000
    const pc = data.productCount || ""
    if (pc.includes("10-20")) { low = 1200; high = 2500 }
    else if (pc.includes("20-30")) { low = 1500; high = 3000 }
    else if (pc.includes("30-50")) { low = 2000; high = 4000 }
    else if (pc.includes("50+")) { low = 2500; high = 5000 }
  } else if (type === "Fast food / Delivery & Collection ordering system") {
    low = 1500; high = 3000
  } else if (type === "A membership or course-based site") {
    low = 1200; high = 2500
  } else if (type === "A blog or news platform") {
    low = 600; high = 1200
  } else if (type === "Portfolio website") {
    low = 500; high = 900
  } else if (type === "A simple informational website") {
    low = 500; high = 800
    const pg = data.pageCount || ""
    if (pg.includes("3-5")) { low = 600; high = 1000 }
    else if (pg.includes("5-10")) { low = 800; high = 1400 }
    else if (pg.includes("10-20")) { low = 1200; high = 2000 }
    else if (pg.includes("20-50")) { low = 1800; high = 3000 }
    else if (pg.includes("50+")) { low = 2500; high = 5000 }
  }

  // Page count modifier for non-ecommerce
  if (type !== "An e-commerce store" && type !== "Fast food / Delivery & Collection ordering system") {
    const pg = data.pageCount || ""
    if (pg.includes("10-20")) { low += 200; high += 400 }
    else if (pg.includes("20-50")) { low += 500; high += 800 }
    else if (pg.includes("50+")) { low += 1000; high += 1500 }
  }

  // Content creation add-on
  const content = data.contentReady || ""
  if (content.includes("Some but I need help")) { low += 150; high += 300 }
  else if (content.includes("No, I need full content creation")) { low += 300; high += 600 }

  // Advanced features add-on
  const adv = data.advancedFeatures || ""
  if (adv.includes("Yes, I need advanced features") || adv.includes("Advanced integrations")) { low += 300; high += 700 }
  else if (adv.includes("Custom functionality")) { low += 500; high += 1200 }

  return { low, high }
}

function formatPrice(n: number) {
  return `$${n.toLocaleString()}`
}

// ─── Step definitions ─────────────────────────────────────────────────────────

const WEBSITE_TYPES = [
  "A simple informational website",
  "An e-commerce store",
  "A membership or course-based site",
  "A blog or news platform",
  "Portfolio website",
  "Fast food / Delivery & Collection ordering system",
  "Other",
]

// Free demo only covers simpler, informational websites
const DEMO_WEBSITE_TYPES = [
  "A simple informational website",
  "A blog or news platform",
  "Portfolio website",
  "Other",
]

const DEMO_PURPOSES = [
  "Showcase my business / services",
  "Share personal content (blog, portfolio)",
  "Build credibility and trust",
  "Other",
]

const PRODUCT_COUNTS = [
  "1-5 products",
  "5-10 products",
  "10-20 products",
  "20-30 products",
  "30-50 products",
  "50+ products",
]

const PAGE_COUNTS = [
  "1-3 pages",
  "3-5 pages",
  "5-10 pages",
  "10-20 pages",
  "20-50 pages",
  "50+ pages",
]

const DEMO_PAGE_COUNTS = [
  "1-3 pages",
  "3-5 pages",
]

const PURPOSES_GENERAL = [
  "Showcase my business / services",
  "Sell products online",
  "Share personal content (blog, portfolio)",
  "Build credibility and trust",
  "Other",
]

const PURPOSES_FASTFOOD = [
  "Take online delivery & collection orders",
  "Let customers customise their order",
  "Manage orders from a kitchen dashboard",
  "All of the above",
  "Something slightly different",
]

const CONTENT_OPTIONS = [
  "Yes, everything is ready",
  "Not yet but I can get it ready",
  "Some but I need help",
  "No, I need full content creation",
]

const ADVANCED_OPTIONS = [
  "No, just a simple website",
  "Yes, I need advanced features",
]

const YES_NO = [
  "Yes",
  "No",
]

const DOMAIN_VALUES = [
  "It's new",
  "It's already registered",
  "I need to buy a premium domain",
]

const PURPOSE_OPTIONS = PURPOSES_GENERAL

// ─── Design tokens ────────────────────────────────────────────────────────────

// LuxxPR brand colors: deep dark navy + steel-blue accent (#99b9d5)
const PINK = "#99b9d5"       // LuxxPR exact brand blue (rgb 153,185,213)
const PINK_LIGHT = "#dde9f3" // Light tint
const PINK_GLOW = "rgba(153, 185, 213, 0.30)"
const GOLD = "#d4a847"
const GOLD_LIGHT = "#f5e6b8"
const GOLD_GLOW = "rgba(212, 168, 71, 0.35)"
const BG_DARK = "#050d14"    // LuxxPR deep navy
const BG_MID = "#0a1a28"
const BG_DEEP = "#04111c"

// Helper function to get accent color based on demo mode
const getAccentColor = (isDemoMode: boolean) => isDemoMode ? GOLD : PINK
const getAccentLight = (isDemoMode: boolean) => isDemoMode ? GOLD_LIGHT : PINK_LIGHT
const getAccentGlow = (isDemoMode: boolean) => isDemoMode ? GOLD_GLOW : PINK_GLOW

// ─── Shared components ────────────────────────────────────────────────────────

function ProgressBar({ current, total, gold = false }: { current: number; total: number; gold?: boolean }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          height: 4,
          flex: 1,
          borderRadius: 2,
          backgroundColor: i < current ? (gold ? getAccentColor(true) : getAccentColor(false)) : "#e5e7eb",
          transition: "all 0.3s ease"
        }} />
      ))}
    </div>
  )
}

function OptionCard({
  label,
  sublabel,
  isSelected,
  onClick,
  accentPrimary,
  accentLight,
}: {
  label: string
  sublabel?: string
  isSelected: boolean
  onClick: () => void
  accentPrimary: string
  accentLight: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        padding: "11px 14px",
        borderRadius: 10,
        border: isSelected ? `2px solid ${accentPrimary}` : "2px solid #e5e7eb",
        backgroundColor: isSelected ? accentLight : "#fafafa",
        color: "#1f2937",
        fontSize: 14,
        fontWeight: 500,
        textAlign: "left",
        cursor: "pointer",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "#d1d5db"
          ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = "#f3f4f6"
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "#e5e7eb"
          ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = "#fafafa"
        }
      }}
    >
      <span style={{ display: "block" }}>{label}</span>
      {sublabel && (
        <span style={{ display: "block", fontSize: 12, color: "#9ca3af", marginTop: 3, fontWeight: 400 }}>
          {sublabel}
        </span>
      )}
    </button>
  )
}

function PriceChip({ 
  estimate,
  accentPrimary,
  accentLight,
}: { 
  estimate: { low: number; high: number } | null
  accentPrimary: string
  accentLight: string
}) {
  if (!estimate) return null
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        backgroundColor: accentLight,
        border: `1px solid ${accentPrimary}`,
        borderRadius: 9999,
        padding: "6px 14px",
        marginTop: 28,
        marginBottom: 16,
        alignSelf: "center",
      }}
    >
      <span style={{ fontSize: 11, fontWeight: 600, color: "#1e1e1e", textTransform: "uppercase", letterSpacing: "0.8px" }}>
        Estimated
      </span>
      <span style={{ fontSize: 14, fontWeight: 700, color: "#1d3557" }}>
        {formatPrice(estimate.low)} – {formatPrice(estimate.high)}
      </span>
    </div>
  )
}

function LukiLogo({ large = false, onClick }: { large?: boolean; url?: string; onClick?: () => void }) {
  return (
    <img
      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/luxx-logo-3-lLgBQHLHnO9dYbm4cCsrgIHyVUEYn5.png"
      alt="LuxxPR"
      onClick={onClick}
      style={{
        width: large ? 260 : 130,
        height: "auto",
        display: "block",
        cursor: onClick ? "pointer" : "default",
        paddingTop: large ? 10 : 0,
      }}
    />
  )
}

function StarRating() {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ fontSize: 24, color: "#f59e0b" }}>★</span>
      ))}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Home() {
  const [showLanding, setShowLanding] = useState(true)
  const [showSecret, setShowSecret] = useState(false)
  const [confetti, setConfetti] = useState<{ id: number; tx: number; ty: number; rot: number; color: string; size: number; delay: number; round: boolean }[]>([])
  const [cardRevealed, setCardRevealed] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [showDemoInfo, setShowDemoInfo] = useState(false)
  const [cardFlipped, setCardFlipped] = useState(false)
  const cardInnerRef = useRef<HTMLDivElement>(null)

  // Dynamic color based on demo mode
  const accentPrimary = isDemoMode ? GOLD : PINK
  const accentLight = isDemoMode ? GOLD_LIGHT : PINK_LIGHT
  const accentGlow = isDemoMode ? GOLD_GLOW : PINK_GLOW

  // Dispatch accent color change event
  useEffect(() => {
    const accentColor = isDemoMode ? "gold" : "pink"
    const event = new CustomEvent<"pink" | "gold">("accentChange", { detail: accentColor })
    window.dispatchEvent(event)
  }, [isDemoMode])
  const cardFlippedRef = useRef(false)
  const cardAnimatingRef = useRef(false)
  const tiltXRef = useRef(0)
  const tiltYRef = useRef(0)
  const cardContainerRef = useRef<HTMLDivElement>(null)

  // Device orientation tilt effect for mobile
  useEffect(() => {
    if (!showSecret) return

    const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
      if (!cardInnerRef.current || cardAnimatingRef.current) return
      
      const alpha = event.alpha || 0 // Z axis (0-360)
      const beta = event.beta || 0   // X axis (-180 to 180)
      const gamma = event.gamma || 0 // Y axis (-90 to 90)

      // Map device rotation to card tilt
      // Clamp and scale the values for subtle tilt effect
      const tiltY = (gamma / 90) * -20  // Left-right tilt
      const tiltX = (beta / 180) * 20   // Up-down tilt

      tiltXRef.current = tiltX
      tiltYRef.current = tiltY

      if (cardInnerRef.current) {
        cardInnerRef.current.style.transition = "transform 0.1s ease-out"
        if (cardFlippedRef.current) {
          cardInnerRef.current.style.transform = `rotateY(180deg) rotateX(${-tiltX}deg) rotateY(${-tiltY}deg)`
        } else {
          cardInnerRef.current.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`
        }
      }
    }

    window.addEventListener("deviceorientation", handleDeviceOrientation)

    return () => {
      window.removeEventListener("deviceorientation", handleDeviceOrientation)
    }
  }, [showSecret])

  function fireBurst() {
    const palette = ["#d4a847", "#e8c35a", "#f5e6b8", "#ffffff", "#fffef0", "#0d1b3e", "#1a2f5e", "#102040"]
    const pieces = Array.from({ length: 60 }, (_, i) => {
      const angle = Math.random() * Math.PI * 2
      const dist = 120 + Math.random() * 200
      return {
        id: i,
        tx: Math.cos(angle) * dist,
        ty: Math.sin(angle) * dist,
        rot: (Math.random() - 0.5) * 900,
        color: palette[Math.floor(Math.random() * palette.length)],
        size: 7 + Math.random() * 9,
        delay: Math.random() * 0.12,
        round: Math.random() > 0.6,
      }
    })
    setConfetti(pieces)
    setTimeout(() => setConfetti([]), 2200)
  }

  function triggerSecret() {
    if (!showSecret) {
      setCardRevealed(true)
      setShowSecret(true)
      // Burst fires via onLoad on the card image — nothing to do here
    } else {
      // Hiding the card — send them into the free demo form
      setIsDemoMode(true)
      setShowLanding(false)
    }
  }
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    websiteType: "",
    productCount: "",
    pageCount: "",
    domainName: "",
    domainValue: "",
    branding: "",
    websitePurpose: "",
    contentReady: "",
    advancedFeatures: "",
    name: "",
    businessName: "",
    email: "",
    phone: "",
    businessDescription: "",
    referralCode: "",
  })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [contactErrors, setContactErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  const isEcommerce = formData.websiteType === "An e-commerce store"
  const isFastFood = formData.websiteType === "Fast food / Delivery & Collection ordering system"
  const hasDomain = formData.domainName === "Yes, I have one"

  // Build the dynamic step list based on answers
  // Step numbers are logical, not index-based
  // 1: website type
  // 2: product count (ecommerce only)
  // 3: page count (skip for fast food)
  // 4: domain yes/no
  // 4b: domain text input (only if hasDomain)
  // 5: branding
  // 6: purpose
  // 7: content ready
  // 8: advanced features
  // 9: contact details

  // We track a virtual step list
  type StepId =
    | "websiteType"
    | "productCount"
    | "pageCount"
    | "domainName"
    | "domainValue"
    | "branding"
    | "websitePurpose"
    | "contentReady"
    | "advancedFeatures"
    | "contact"

  function buildStepList(): StepId[] {
    const list: StepId[] = ["websiteType"]
    if (!isDemoMode) {
      if (isEcommerce) list.push("productCount")
      if (!isFastFood) list.push("pageCount")
    } else {
      list.push("pageCount")
    }
    list.push("domainName")
    if (hasDomain) list.push("domainValue")
    list.push("branding")
    list.push("websitePurpose")
    list.push("contentReady")
    if (!isDemoMode) list.push("advancedFeatures")
    list.push("contact")
    return list
  }

  const stepList = buildStepList()
  const totalSteps = stepList.length
  const currentStepId = stepList[step - 1]
  const estimate = calculateEstimate(formData)

  function goNext() {
    setStep((s) => s + 1)
  }

  function goPrev() {
    setStep((s) => Math.max(1, s - 1))
  }

  function selectOption(field: keyof FormData, value: string) {
    const updated = { ...formData, [field]: value }
    setFormData(updated)

    // Rebuild step list with updated data to decide next step
    const isEc = updated.websiteType === "An e-commerce store"
    const isFF = updated.websiteType === "Fast food / Delivery & Collection ordering system"
    const hasD = updated.domainName === "Yes, I have one"

    const list: StepId[] = ["websiteType"]
    if (!isDemoMode) {
      if (isEc) list.push("productCount")
      if (!isFF) list.push("pageCount")
    } else {
      list.push("pageCount")
    }
    list.push("domainName")
    if (hasD) list.push("domainValue")
    list.push("branding")
    list.push("websitePurpose")
    list.push("contentReady")
    if (!isDemoMode) list.push("advancedFeatures")
    list.push("contact")

    const currentIndex = list.indexOf(field as StepId)
    setTimeout(() => setStep(currentIndex + 2), 200)
  }

  function validateContact() {
    const errs: Partial<Record<keyof FormData, string>> = {}
    if (!formData.name.trim()) errs.name = "Name is required"
    if (!formData.businessName.trim()) errs.businessName = "Business name is required"
    if (!formData.email.trim()) errs.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = "Enter a valid email address"
    if (!formData.businessDescription.trim()) errs.businessDescription = "Please describe your business"
    // Validate referral code if provided
    if (formData.referralCode.trim() && formData.referralCode !== "DESIGN20") {
      errs.referralCode = "Invalid referral code"
    }
    setContactErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validateContact()) return
    setSubmitting(true)
    setError("")
    try {
      const payload = {
        ...formData,
        estimatedPrice: estimate ? `${formatPrice(estimate.low)} – ${formatPrice(estimate.high)}` : "Not calculated",
      }
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Something went wrong")
      setSubmitted(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  // ── Success Screen ���──────�����─────────────────────────────────────────────��────
  if (submitted) {
    return (
      <main
        className="min-h-screen flex flex-col items-center justify-center"
        style={{
          padding: "40px 16px",
          paddingTop: "clamp(20px, 4vw, 50px)",
          paddingBottom: "clamp(20px, 4vw, 50px)",
          background: "transparent",
        }}
      >
        <div
          className="w-full text-center"
          style={{
            maxWidth: 440,
            backgroundColor: "#ffffff",
            borderRadius: 20,
            padding: "40px 28px",
            boxShadow: "0 25px 50px rgba(0,0,0,0.3)",
          }}
        >
          <div
            className="flex items-center justify-center mx-auto"
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              backgroundColor: accentLight,
              marginBottom: 20,
            }}
          >
            <Check style={{ width: 32, height: 32, color: accentPrimary }} strokeWidth={2.5} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: "#1f2937", marginBottom: 8 }}>
            {"Thank you, "}{formData.name}{"!"}
          </h2>
          <p style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
            {"We have received your enquiry and will be in touch with you shortly at "}
            <span style={{ fontWeight: 600, color: "#1f2937" }}>{formData.email}</span>
            {"."}
          </p>

          {/* Price estimate summary */}
          {estimate && (
            <div
              style={{
                backgroundColor: accentLight,
                border: `1px solid ${accentPrimary}`,
                padding: 16,
                borderRadius: 8,
                marginTop: 40,
              }}
            >
              <p style={{ fontSize: 11, fontWeight: 700, color: accentPrimary, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>
                Your Estimate
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "#6b7280" }}>Website type</span>
                  <span style={{ fontWeight: 600, color: "#1f2937", textAlign: "right", maxWidth: "58%" }}>{formData.websiteType}</span>
                </div>
                {formData.productCount && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "#6b7280" }}>Products</span>
                    <span style={{ fontWeight: 600, color: "#1f2937" }}>{formData.productCount}</span>
                  </div>
                )}
                {formData.pageCount && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "#6b7280" }}>Pages</span>
                    <span style={{ fontWeight: 600, color: "#1f2937" }}>{formData.pageCount}</span>
                  </div>
                )}
                {formData.contentReady && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "#6b7280" }}>Content</span>
                    <span style={{ fontWeight: 600, color: "#1f2937", textAlign: "right", maxWidth: "58%" }}>{formData.contentReady}</span>
                  </div>
                )}
                <div style={{ borderTop: `1px solid ${accentPrimary}33`, marginTop: 6, paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#1f2937" }}>Estimated total</span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: "#1d3557" }}>
                    {formatPrice(estimate.low)} – {formatPrice(estimate.high)}
                  </span>
                </div>
              </div>
              <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 10, lineHeight: 1.5 }}>
                This is a rough estimate only. Final pricing will be confirmed after a discovery call with our team.
              </p>
            </div>
          )}

          <div style={{ paddingTop: 16, borderTop: "1px solid #e5e7eb", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <LukiLogo onClick={() => { setShowLanding(true); setIsDemoMode(false); setCardRevealed(false); setShowSecret(false) }} />
          </div>
        </div>
      </main>
    )
  }

  // ── Landing Screen ──���──��───────────────────���───────────────────────────────
  if (showLanding) {
    return (
      <main
        style={{
          minHeight: "100svh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          padding: "40px 20px",
          paddingTop: "clamp(20px, 4vw, 50px)",
          paddingBottom: "clamp(20px, 4vw, 50px)",
          background: "transparent",
        }}
      >
        {/* When card is revealed, only render card — fully centered in the viewport */}
        {!cardRevealed && (
        <div
          className="w-full flex flex-col items-center text-center"
          style={{ maxWidth: 440 }}
        >
          {/* Logo */}
          <div style={{ margin: "-20px 0", paddingBottom: 40 }}>
            <LukiLogo large={true} />
          </div>

          {/* Landing text */}
          <div
            style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}
          >
            {/* Headline */}
            <h1
              className="luki-fade-up"
              style={{
                fontSize: 32,
                fontWeight: 800,
                color: "#f5f5f5",
                lineHeight: 1.25,
                marginBottom: 8,
                textWrap: "balance",
                animationDelay: "0.05s",
              }}
            >
              Your brand deserves a digital presence that converts.
            </h1>

            {/* Price */}
            <div className="luki-fade-up" style={{ marginBottom: 8, animationDelay: "0.15s" }}>
              <p style={{ fontSize: 13, fontWeight: 400, color: "rgba(255,255,255,0.5)", letterSpacing: "3px", textTransform: "uppercase", marginBottom: 2 }}>
                Prices starting
              </p>
              <p style={{ fontSize: 13, fontWeight: 300, color: "rgba(255,255,255,0.7)", letterSpacing: "1px", marginBottom: 4 }}>
                from just
              </p>
              <p className="luki-price-glow" style={{ fontSize: 72, fontWeight: 900, color: accentPrimary, lineHeight: 1, letterSpacing: "-2px" }}>
                $500
              </p>
            </div>

            {/* Subheading */}
            <h2 className="luki-fade-up" style={{ fontSize: 28, fontWeight: 700, color: "#f5f5f5", lineHeight: 1.3, marginBottom: 16, animationDelay: "0.25s" }}>
              {"Ready in "}
              <span style={{ color: accentPrimary }}>3 Days!</span>
            </h2>

            {/* Description */}
            <p className="luki-fade-up" style={{ fontSize: 15, color: "#a0aec0", lineHeight: 1.6, marginBottom: 32, maxWidth: 340, animationDelay: "0.35s" }}>
              From zero to online in just 3 days without breaking the bank! Plus FREE hosting for 1 year!
            </p>

            {/* CTA Button */}
            <button
              type="button"
              onClick={() => setShowLanding(false)}
              className="luki-cta-button luki-fade-up"
              style={{ marginBottom: 36, animationDelay: "0.45s" }}
            >
              <span style={{ color: "#ffffff" }}>{"GET YOUR'S"}</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 66 43">
                <polygon points="39.58,4.46 44.11,0 66,21.5 44.11,43 39.58,38.54 56.94,21.5" />
                <polygon points="19.79,4.46 24.32,0 46.21,21.5 24.32,43 19.79,38.54 37.15,21.5" />
                <polygon points="0,4.46 4.53,0 26.42,21.5 4.53,43 0,38.54 17.36,21.5" />
              </svg>
            </button>

            {/* Stars */}
            <div className="luki-fade-up" style={{ animationDelay: "0.55s" }}>
              <StarRating />
            </div>

            {/* Social proof */}
            <p className="luki-fade-up" style={{ fontSize: 16, color: "#f5f5f5", lineHeight: 1.5, marginTop: 14, maxWidth: 320, animationDelay: "0.65s" }}>
              {"We've helped "}
              <span style={{ color: accentPrimary, fontWeight: 700 }}>100+</span>
              {" businesses get online with our 3 Day website programme"}
            </p>

            {/* Secret trigger */}
            {!showSecret && (
              <button
                type="button"
                onClick={triggerSecret}
                aria-label="Reveal secret offer"
                className="luki-secret-trigger"
              >
                <div className="trigger-orb">
                  {/* Orbiting sparkle ring */}
                  <span className="orb-ring" aria-hidden="true" />
                  <span className="orb-ring orb-ring-2" aria-hidden="true" />
                  {/* Sparkles */}
                  <span className="orb-sparkle s1" aria-hidden="true">✦</span>
                  <span className="orb-sparkle s2" aria-hidden="true">✧</span>
                  <span className="orb-sparkle s3" aria-hidden="true">✦</span>
                  {/* Gift / mystery icon */}
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f5e6b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ position: "relative", zIndex: 2 }}>
                    <rect x="3" y="8" width="18" height="4" rx="1" />
                    <path d="M12 8v13" />
                    <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
                    <path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5" />
                  </svg>
                </div>
                <span className="trigger-label">psst... tap me</span>
              </button>
            )}
          </div>
        </div>
        )}

        {/* 3D Gold card reveal — centered in viewport */}
        {showSecret && (
            <div
              style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", marginTop: "auto", marginBottom: "auto" }}
            >
              {/* Piñata burst — blasts outward from behind the card */}
              <div className="luki-burst-origin" aria-hidden="true">
                {confetti.map((p) => (
                  <span
                    key={p.id}
                    className="luki-burst-piece"
                    style={
                      {
                        width: p.size,
                        height: p.round ? p.size : p.size * 0.5,
                        borderRadius: p.round ? "50%" : "1px",
                        background: p.color,
                        animationDelay: `${p.delay}s`,
                        "--tx": `${p.tx}px`,
                        "--ty": `${p.ty}px`,
                        "--rot": `${p.rot}deg`,
                      } as React.CSSProperties
                    }
                  />
                ))}
              </div>

              {/* Title above card */}
              <div className="luki-card-title" style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 26, textAlign: "center", width: "100%", maxWidth: 460, paddingLeft: 12, paddingRight: 12, boxSizing: "border-box" }}>
                <p style={{ fontSize: 11, letterSpacing: "4px", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", fontWeight: 600, margin: 0 }}>
                  Congratulations
                </p>
                <h2
                  style={{
                    fontSize: "clamp(1.75rem, 7vw, 2.6rem)",
                    fontWeight: 800,
                    lineHeight: 1.15,
                    letterSpacing: "-0.5px",
                    margin: 0,
                    color: "#ffffff",
                    textWrap: "balance",
                    textShadow: "0 2px 24px rgba(0,0,0,0.5)",
                  }}
                >
                  You just got yourself a free website demo!
                </h2>
                <div style={{ width: 60, height: 1, marginTop: 2, background: "linear-gradient(90deg, transparent, rgba(212,168,71,0.55), transparent)" }} />
              </div>

              {/* Flip Card */}
              <div
                ref={cardContainerRef}
                className="luki-card-entry luki-card-float"
                onClick={() => {
                  if (cardAnimatingRef.current) return
                  const next = !cardFlippedRef.current
                  cardFlippedRef.current = next
                  setCardFlipped(next)
                  cardAnimatingRef.current = true
                  // Reset tilt immediately and lock during flip animation
                  if (cardInnerRef.current) {
                    cardInnerRef.current.style.transition = "transform 0.65s cubic-bezier(0.4, 0.2, 0.2, 1)"
                    cardInnerRef.current.style.transform = next ? "rotateY(180deg)" : "rotateY(0deg)"
                  }
                  setTimeout(() => { cardAnimatingRef.current = false }, 700)
                }}
                onMouseMove={(e) => {
                  if (cardAnimatingRef.current || !cardInnerRef.current) return
                  const rect = e.currentTarget.getBoundingClientRect()
                  const px = (e.clientX - rect.left) / rect.width   // 0→1
                  const py = (e.clientY - rect.top) / rect.height    // 0→1
                  const rotX = (py - 0.5) * -22  // tilt up/down
                  const rotY = (px - 0.5) * 22   // tilt left/right
                  const base = cardFlippedRef.current ? "rotateY(180deg) " : ""
                  cardInnerRef.current.style.transition = "transform 0.08s ease-out"
                  cardInnerRef.current.style.transform = cardFlippedRef.current
                    ? `rotateY(180deg) rotateX(${-rotX}deg) rotateY(${-rotY}deg)`
                    : `rotateX(${rotX}deg) rotateY(${rotY}deg)`
                }}
                onMouseLeave={() => {
                  if (!cardInnerRef.current) return
                  cardInnerRef.current.style.transition = "transform 0.4s ease-out"
                  cardInnerRef.current.style.transform = cardFlippedRef.current
                    ? "rotateY(180deg)"
                    : "rotateX(0deg) rotateY(0deg)"
                }}
                style={{
                  width: 280, height: 424,
                  perspective: "1200px",
                  cursor: "pointer",
                  userSelect: "none",
                  flexShrink: 0,
                  position: "relative",
                  zIndex: 2,
                }}
              >
                <div
                  ref={cardInnerRef}
                  style={{
                    position: "relative",
                    width: "100%", height: "100%",
                    transformStyle: "preserve-3d",
                    transition: "transform 0.65s cubic-bezier(0.4, 0.2, 0.2, 1)",
                    transform: "rotateX(0deg) rotateY(0deg)",
                  }}
                >

                  {/* FRONT FACE — transparent-bg artwork over dark background */}
                  <div style={{
                    position: "absolute", inset: 0,
                    borderRadius: 18, overflow: "hidden",
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    MozBackfaceVisibility: "hidden",
                    willChange: "transform",
                    background: "linear-gradient(160deg, #0d1b2a 0%, #060e17 100%)",
                    boxShadow: "0 0 60px rgba(212,168,71,0.28), 0 0 120px rgba(212,168,71,0.10), 0 20px 50px rgba(0,0,0,0.5)",
                  }}>
                    <img
                      src="/images/card-front.webp"
                      alt="LUXX PR exclusive card — front"
                      draggable={false}
                      onLoad={fireBurst}
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                    />
                    {/* Holographic sheen sweep */}
                    <div className="luki-holo-sheen" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
                  </div>

                  {/* BACK FACE — full-bleed card artwork */}
                  <div style={{
                    position: "absolute", inset: 0,
                    borderRadius: 18, overflow: "hidden",
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    MozBackfaceVisibility: "hidden",
                    willChange: "transform",
                    transform: "rotateY(180deg)",
                    boxShadow: "0 0 60px rgba(212,168,71,0.28), 0 0 120px rgba(212,168,71,0.10), 0 20px 50px rgba(0,0,0,0.5)",
                  }}>
                    <img
                      src="/images/card-back.webp"
                      alt="LUXX PR card — how it works: fill in the short form, we build your website completely free, you review your tailored demo, only pay if you like the outcome"
                      draggable={false}
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                    {/* Holographic sheen sweep */}
                    <div className="luki-holo-sheen" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
                  </div>

                </div>
              </div>

              {/* Flip instruction — visible only when card front is shown */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 16, opacity: cardFlipped ? 0 : 1, transition: "opacity 0.3s ease", pointerEvents: "none" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" />
                </svg>
                <span style={{ fontSize: 10, color: "rgba(212,168,71,0.75)", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 600 }}>
                  Tap card to see how it works
                </span>
              </div>

              {/* Claim button — gold glow */}
              <button
                type="button"
                onClick={triggerSecret}
                className="luki-claim-button"
                style={{ marginTop: 26, position: "relative", zIndex: 2 }}
              >
                Claim now
              </button>
            </div>
          )}
      </main>
    )
  }

  // ── Main Form ───────────────────────────────────────────────────────────────
  return (
    <main
      className="flex flex-col items-center"
      style={{
        height: "100svh",
        overflow: "hidden",
        padding: "0 16px",
        background: "transparent",
      }}
    >
      {/* Header */}
      <header className="w-full text-center flex-shrink-0" style={{ maxWidth: 440, paddingBottom: 10, paddingTop: 20 }}>
        {isDemoMode ? (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "rgba(212,168,71,0.12)", border: "1px solid rgba(212,168,71,0.35)",
                borderRadius: 9999, padding: "3px 12px",
              }}>
                <span style={{ fontSize: 11, color: GOLD, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>Free Demo</span>
              </div>
              {/* Info button */}
              <button
                type="button"
                onClick={() => setShowDemoInfo(true)}
                aria-label="What is included in the free demo?"
                style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)",
                  color: "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: 700,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                ?
              </button>
            </div>
            <h1 style={{ color: "#f5f5f5", fontSize: 18, fontWeight: 700, lineHeight: 1.3, marginTop: 8 }}>
              Claim Your Free Demo
            </h1>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 4 }}>
              Tell us about your project — no payment needed
            </p>
          </>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <h1 style={{ color: "#f5f5f5", fontSize: 18, fontWeight: 700, lineHeight: 1.3 }}>
                Enquire Now
              </h1>
              <button
                type="button"
                onClick={() => setShowDemoInfo(true)}
                aria-label="Learn about this form"
                style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)",
                  color: "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: 700,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                ?
              </button>
            </div>
            <p style={{ color: accentPrimary, fontSize: 13, fontWeight: 500, marginTop: 6 }}>
              Answer a few questions below to get started
            </p>
          </>
        )}
      </header>

      {/* Demo info modal */}
      {showDemoInfo && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 24,
          }}
          onClick={() => setShowDemoInfo(false)}
        >
          <div
            style={{
              background: "#ffffff", borderRadius: 20, padding: "28px 24px",
              maxWidth: 380, width: "100%", boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {isDemoMode ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: accentPrimary, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 4 }}>Free Demo</p>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1f2937", lineHeight: 1.25 }}>{"What's included?"}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDemoInfo(false)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 20, lineHeight: 1, padding: 0 }}
                  >
                    ×
                  </button>
                </div>
                <p style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.65, marginBottom: 16 }}>
                  Our free demo covers straightforward, informational websites — the kind most small businesses actually need to get online quickly.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                  {[
                    "Simple informational / business websites",
                    "Blog or news platforms",
                    "Portfolio & personal websites",
                  ].map((item) => (
                    <div key={item} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 18, height: 18, borderRadius: "50%", background: accentLight, border: `1.5px solid ${accentPrimary}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Check style={{ width: 10, height: 10, color: accentPrimary }} strokeWidth={3} />
                      </div>
                      <span style={{ fontSize: 13, color: "#374151" }}>{item}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background: "#f9fafb", borderRadius: 12, padding: "12px 14px", marginBottom: 20 }}>
                  <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6 }}>
                    Complex systems like e-commerce stores, delivery/ordering platforms, and membership sites are not part of the free demo — but we can still quote you for those separately.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: accentPrimary, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 4 }}>How to proceed</p>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1f2937", lineHeight: 1.25 }}>{"Complete the form"}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDemoInfo(false)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 20, lineHeight: 1, padding: 0 }}
                  >
                    ×
                  </button>
                </div>
                <p style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.65, marginBottom: 16 }}>
                  Answer a few quick questions about your project and needs. Your responses help us understand your requirements and provide an accurate quote.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                  {[
                    "Answer all questions honestly",
                    "Take your time to think through each answer",
                    "Review your information before submitting",
                  ].map((item) => (
                    <div key={item} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 18, height: 18, borderRadius: "50%", background: accentLight, border: `1.5px solid ${accentPrimary}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Check style={{ width: 10, height: 10, color: accentPrimary }} strokeWidth={3} />
                      </div>
                      <span style={{ fontSize: 13, color: "#374151" }}>{item}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background: "#f9fafb", borderRadius: 12, padding: "12px 14px", marginBottom: 20 }}>
                  <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6 }}>
                    Once you submit your information, we'll review it carefully and get back to you with good news and a customized quote within 2-3 business days.
                  </p>
                </div>
              </>
            )}
            <button
              type="button"
              onClick={() => setShowDemoInfo(false)}
              style={{
                width: "100%", padding: "13px", borderRadius: 9999,
                background: accentPrimary, color: "#ffffff", fontWeight: 700, fontSize: 15,
                border: "none", cursor: "pointer",
              }}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Form Card */}
      <div
        className="w-full flex flex-col flex-1 min-h-0"
        style={{
          maxWidth: 440,
          backgroundColor: "#ffffff",
          borderRadius: 20,
          boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
          marginBottom: 16,
        }}
      >
        <div className="flex flex-col flex-1 min-h-0" style={{ padding: "30px 20px 30px 20px" }}>
          <ProgressBar current={step} total={totalSteps} gold={isDemoMode} />

          {currentStepId !== "contact" ? (
            <div className="flex flex-col flex-1 min-h-0">
              {/* Price chip — updates live, hidden in demo mode */}
              {!isDemoMode && (
                <div className="flex justify-center flex-shrink-0">
                  <PriceChip estimate={estimate} accentPrimary={accentPrimary} accentLight={accentLight} />
                </div>
              )}

              {/* Question */}
              {/* Scrollable options area */}
              <div className="luki-scroll-area flex-1 min-h-0 overflow-y-auto" style={{ paddingTop: 60, paddingBottom: 60 }}>

              {currentStepId === "websiteType" && (
                <>
  <h2 className="text-center" style={{ fontSize: 18, fontWeight: 700, color: "#1f2937", lineHeight: 1.3, marginTop: 10, marginBottom: 4 }}>
What type of website do you need?
  </h2>
                  {isDemoMode && (
                    <p className="text-center" style={{ fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>
                      Your free demo covers simple, informational websites
                    </p>
                  )}
                  <div className="flex flex-col" style={{ gap: 8, marginTop: 12 }}>
                    {(isDemoMode ? DEMO_WEBSITE_TYPES : WEBSITE_TYPES).map((opt) => {
                      const sublabels: Record<string, string> = {
                        "A simple informational website": "ideal for showcasing your business",
                        "An e-commerce store": "from $1,000 — sell products online",
                        "A membership or course-based site": "from $1,200 — gated content & user accounts",
                        "A blog or news platform": "articles, posts & media",
                        "Portfolio website": "show off your work",
                        "Fast food / Delivery & Collection ordering system": "from $1,500 — custom order & delivery panel",
                        "Other": "get in touch and we'll figure it out",
                      }
                      return (
                        <OptionCard
                          key={opt}
                          label={opt}
                          sublabel={sublabels[opt]}
                          isSelected={formData.websiteType === opt}
                          onClick={() => selectOption("websiteType", opt)}
                          accentPrimary={accentPrimary}
                          accentLight={accentLight}
                        />
                      )
                    })}
                  </div>
                </>
              )}

              {currentStepId === "productCount" && (
                <>
                  <h2 className="text-center" style={{ fontSize: 18, fontWeight: 700, color: "#1f2937", lineHeight: 1.3, marginBottom: 2 }}>
                    How many products do you need?
                  </h2>
                  <p className="text-center" style={{ fontSize: 12, color: "#9ca3af", marginBottom: 2 }}>
                    More products means more setup — this affects your estimate
                  </p>
                  <div className="flex flex-col" style={{ gap: 8, marginTop: 10 }}>
                    {PRODUCT_COUNTS.map((opt) => (
                      <OptionCard
                        key={opt}
                        label={opt}
                        isSelected={formData.productCount === opt}
                        onClick={() => selectOption("productCount", opt)}
                        accentPrimary={accentPrimary}
                        accentLight={accentLight}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={goNext}
                    style={{
                      margin: "20px auto 0",
                      padding: "12px 32px",
                      borderRadius: 9999,
                      backgroundColor: accentPrimary,
                      color: "#ffffff",
                      fontWeight: 700,
                      fontSize: 16,
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    Continue <ArrowRight style={{ width: 18, height: 18 }} />
                  </button>
                </>
              )}

              {currentStepId === "pageCount" && (
                <>
                  <h2 className="text-center" style={{ fontSize: 18, fontWeight: 700, color: "#1f2937", lineHeight: 1.3, marginBottom: 2 }}>
                    How many pages do you need?
                  </h2>
                  <p className="text-center" style={{ fontSize: 12, color: "#9ca3af", marginBottom: 2 }}>
                    {isDemoMode ? "Free demos cover up to 5 pages" : "More pages means more design and content work"}
                  </p>
                  <div className="flex flex-col" style={{ gap: 8, marginTop: 10 }}>
                    {PAGE_COUNTS.map((opt) => (
                      <OptionCard
                        key={opt}
                        label={opt}
                        isSelected={formData.pageCount === opt}
                        onClick={() => selectOption("pageCount", opt)}
                        accentPrimary={accentPrimary}
                        accentLight={accentLight}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={goNext}
                    style={{
                      margin: "20px auto 0",
                      padding: "12px 32px",
                      borderRadius: 9999,
                      backgroundColor: accentPrimary,
                      color: "#ffffff",
                      fontWeight: 700,
                      fontSize: 16,
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    Continue <ArrowRight style={{ width: 18, height: 18 }} />
                  </button>
                </>
              )}

              {currentStepId === "domainName" && (
                <>
                  <h2 className="text-center" style={{ fontSize: 18, fontWeight: 700, color: "#1f2937", lineHeight: 1.3, marginBottom: 12 }}>
                    What's your domain idea?
                  </h2>
                  <input
                    type="text"
                    placeholder="e.g., myawesomesite.ie"
                    value={formData.domainName}
                    onChange={(e) => setFormData((p) => ({ ...p, domainName: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 10,
                      backgroundColor: "#f9fafb",
                      border: "2px solid #e5e7eb",
                      color: "#1f2937",
                      fontSize: 14,
                      outline: "none",
                    }}
                  />
                  <button
                    type="button"
                    onClick={goNext}
                    style={{
                      margin: "20px auto 0",
                      padding: "12px 32px",
                      borderRadius: 9999,
                      backgroundColor: accentPrimary,
                      color: "#ffffff",
                      fontWeight: 700,
                      fontSize: 16,
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    Continue <ArrowRight style={{ width: 18, height: 18 }} />
                  </button>
                </>
              )}

              {currentStepId === "domainValue" && (
                <>
                  <h2 className="text-center" style={{ fontSize: 18, fontWeight: 700, color: "#1f2937", lineHeight: 1.3, marginBottom: 4 }}>
                    How much is your domain worth?
                  </h2>
                  <p className="text-center" style={{ fontSize: 12, color: "#9ca3af", marginBottom: 12 }}>
                    Premium domains add to your overall cost
                  </p>
                  <div className="flex flex-col" style={{ gap: 8 }}>
                    {DOMAIN_VALUES.map((opt) => (
                      <OptionCard
                        key={opt}
                        label={opt}
                        isSelected={formData.domainValue === opt}
                        onClick={() => selectOption("domainValue", opt)}
                        accentPrimary={accentPrimary}
                        accentLight={accentLight}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={goNext}
                    style={{
                      margin: "20px auto 0",
                      padding: "12px 32px",
                      borderRadius: 9999,
                      backgroundColor: accentPrimary,
                      color: "#ffffff",
                      fontWeight: 700,
                      fontSize: 16,
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    Continue <ArrowRight style={{ width: 18, height: 18 }} />
                  </button>
                </>
              )}

              {currentStepId === "branding" && (
                <>
                  <h2 className="text-center" style={{ fontSize: 18, fontWeight: 700, color: "#1f2937", lineHeight: 1.3, marginBottom: 2 }}>
                    Do you have branding?
                  </h2>
                  <p className="text-center" style={{ fontSize: 12, color: "#9ca3af", marginBottom: 2 }}>
                    Logo, brand colours, fonts, etc.
                  </p>
                  <div className="flex flex-col" style={{ gap: 8, marginTop: 12 }}>
                    {YES_NO.map((opt) => (
                      <OptionCard
                        key={opt}
                        label={opt}
                        isSelected={formData.branding === opt}
                        onClick={() => selectOption("branding", opt)}
                        accentPrimary={accentPrimary}
                        accentLight={accentLight}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={goNext}
                    style={{
                      margin: "20px auto 0",
                      padding: "12px 32px",
                      borderRadius: 9999,
                      backgroundColor: accentPrimary,
                      color: "#ffffff",
                      fontWeight: 700,
                      fontSize: 16,
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    Continue <ArrowRight style={{ width: 18, height: 18 }} />
                  </button>
                </>
              )}

              {currentStepId === "websitePurpose" && (
                <>
                  <h2 className="text-center" style={{ fontSize: 18, fontWeight: 700, color: "#1f2937", lineHeight: 1.3, marginBottom: 12 }}>
                    What's the main purpose?
                  </h2>
                  <div className="flex flex-col" style={{ gap: 8 }}>
                    {PURPOSE_OPTIONS.map((opt) => (
                      <OptionCard
                        key={opt}
                        label={opt}
                        isSelected={formData.websitePurpose === opt}
                        onClick={() => selectOption("websitePurpose", opt)}
                        accentPrimary={accentPrimary}
                        accentLight={accentLight}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={goNext}
                    style={{
                      margin: "20px auto 0",
                      padding: "12px 32px",
                      borderRadius: 9999,
                      backgroundColor: accentPrimary,
                      color: "#ffffff",
                      fontWeight: 700,
                      fontSize: 16,
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    Continue <ArrowRight style={{ width: 18, height: 18 }} />
                  </button>
                </>
              )}

              {currentStepId === "contentReady" && (
                <>
                  <h2 className="text-center" style={{ fontSize: 18, fontWeight: 700, color: "#1f2937", lineHeight: 1.3, marginBottom: 12 }}>
                    Do you have content ready?
                  </h2>
                  <div className="flex flex-col" style={{ gap: 8 }}>
                    {YES_NO.map((opt) => (
                      <OptionCard
                        key={opt}
                        label={opt}
                        isSelected={formData.contentReady === opt}
                        onClick={() => selectOption("contentReady", opt)}
                        accentPrimary={accentPrimary}
                        accentLight={accentLight}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={goNext}
                    style={{
                      margin: "20px auto 0",
                      padding: "12px 32px",
                      borderRadius: 9999,
                      backgroundColor: accentPrimary,
                      color: "#ffffff",
                      fontWeight: 700,
                      fontSize: 16,
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    Continue <ArrowRight style={{ width: 18, height: 18 }} />
                  </button>
                </>
              )}

              {currentStepId === "advancedFeatures" && (
                <>
                  <h2 className="text-center" style={{ fontSize: 18, fontWeight: 700, color: "#1f2937", lineHeight: 1.3, marginBottom: 12 }}>
                    Advanced features needed?
                  </h2>
                  <div className="flex flex-col" style={{ gap: 8 }}>
                    {YES_NO.map((opt) => (
                      <OptionCard
                        key={opt}
                        label={opt}
                        isSelected={formData.advancedFeatures === opt}
                        onClick={() => selectOption("advancedFeatures", opt)}
                        accentPrimary={accentPrimary}
                        accentLight={accentLight}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={goNext}
                    style={{
                      margin: "20px auto 0",
                      padding: "12px 32px",
                      borderRadius: 9999,
                      backgroundColor: accentPrimary,
                      color: "#ffffff",
                      fontWeight: 700,
                      fontSize: 16,
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    Continue <ArrowRight style={{ width: 18, height: 18 }} />
                  </button>
                </>
              )}

              {/* end scroll area */}
              </div>

              <div className="flex-shrink-0" style={{ minHeight: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {step > 1 && (
                  <button
                    type="button"
                    onClick={goPrev}
                    className="flex items-center justify-center cursor-pointer"
                    style={{
                      gap: 6,
                      color: "#9ca3af",
                      fontSize: 13,
                      padding: "6px 0 10px",
                      background: "none",
                      border: "none",
                    }}
                  >
                    <ArrowLeft style={{ width: 14, height: 14 }} />
                    Previous Step
                  </button>
                )}
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => { setShowLanding(true); setIsDemoMode(false); setCardRevealed(false); setShowSecret(false) }}
                    style={{
                      background: "none",
                      border: "1px solid #e5e7eb",
                      borderRadius: 9999,
                      cursor: "pointer",
                      color: "#6b7280",
                      fontSize: 13,
                      fontWeight: 500,
                      letterSpacing: "0.3px",
                      padding: "7px 20px",
                      display: "block",
                      margin: "6px auto 0",
                    }}
                  >
                    Start again
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* ── Contact Details Step ── */
            <form onSubmit={handleSubmit} noValidate className="luki-scroll-area flex flex-col flex-1 min-h-0 overflow-y-auto" style={{ paddingBottom: 16 }}>
              {/* Price chip on contact step — hidden in demo mode */}
              {!isDemoMode && (
                <div className="flex justify-center" style={{ marginBottom: 12 }}>
                  <PriceChip estimate={estimate} accentPrimary={accentPrimary} accentLight={accentLight} />
                </div>
              )}

              <h2 className="text-center" style={{ fontSize: 18, fontWeight: 700, color: "#1f2937", marginTop: 40, marginBottom: 2 }}>
                {isDemoMode ? "Last step!" : "Almost there!"}
              </h2>
              <p className="text-center" style={{ fontSize: 12, color: "#9ca3af", marginBottom: 14 }}>
                {isDemoMode
                  ? "Enter your details and we'll start building your free demo."
                  : "Fill in your details and we'll be in touch with a full quote."}
              </p>

              <div className="flex flex-col" style={{ gap: 12 }}>
                {/* Name */}
                <div>
                  <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 4 }}>
                    Name <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 10,
                      backgroundColor: "#f9fafb",
                      border: contactErrors.name ? "2px solid #ef4444" : "2px solid #e5e7eb",
                      color: "#1f2937",
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  {contactErrors.name && <p style={{ fontSize: 12, marginTop: 6, color: "#ef4444" }}>{contactErrors.name}</p>}
                </div>

                {/* Business Name */}
                <div>
                  <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 4 }}>
                    Business Name <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData((p) => ({ ...p, businessName: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 10,
                      backgroundColor: "#f9fafb",
                      border: contactErrors.businessName ? "2px solid #ef4444" : "2px solid #e5e7eb",
                      color: "#1f2937",
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  {contactErrors.businessName && <p style={{ fontSize: 12, marginTop: 6, color: "#ef4444" }}>{contactErrors.businessName}</p>}
                </div>

                {/* Email */}
                <div>
                  <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 4 }}>
                    Email <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 10,
                      backgroundColor: "#f9fafb",
                      border: contactErrors.email ? "2px solid #ef4444" : "2px solid #e5e7eb",
                      color: "#1f2937",
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  {contactErrors.email && <p style={{ fontSize: 12, marginTop: 4, color: "#ef4444" }}>{contactErrors.email}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 4 }}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="085 012 3456"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 10,
                      backgroundColor: "#f9fafb",
                      border: "2px solid #e5e7eb",
                      color: "#1f2937",
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* Business Description */}
                <div>
                  <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 4 }}>
                    {"Tell us a bit about your business "}
                    <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={formData.businessDescription}
                    onChange={(e) => setFormData((p) => ({ ...p, businessDescription: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 10,
                      backgroundColor: "#f9fafb",
                      border: contactErrors.businessDescription ? "2px solid #ef4444" : "2px solid #e5e7eb",
                      color: "#1f2937",
                      fontSize: 14,
                      outline: "none",
                      resize: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  {contactErrors.businessDescription && <p style={{ fontSize: 12, marginTop: 6, color: "#ef4444" }}>{contactErrors.businessDescription}</p>}
                </div>

                {/* Referral Code */}
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
                    Do you have a referral code? <span style={{ color: "#9ca3af" }}>(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter referral code"
                    value={formData.referralCode}
                    onChange={(e) => setFormData((p) => ({ ...p, referralCode: e.target.value.toUpperCase() }))}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 10,
                      backgroundColor: "#f9fafb",
                      border: contactErrors.referralCode ? "2px solid #ef4444" : "2px solid #e5e7eb",
                      color: "#1f2937",
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  {contactErrors.referralCode && <p style={{ fontSize: 12, marginTop: 6, color: "#ef4444" }}>{contactErrors.referralCode}</p>}
                </div>
              </div>

              {error && (
                <p
                  className="text-center"
                  style={{
                    fontSize: 14,
                    marginTop: 16,
                    padding: "10px 16px",
                    borderRadius: 12,
                    color: "#ef4444",
                    backgroundColor: "#fef2f2",
                  }}
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="flex items-center justify-center cursor-pointer"
                style={{
                  width: "auto",
                  margin: "28px auto 0",
                  padding: "16px 44px",
                  borderRadius: 9999,
                  backgroundColor: accentPrimary,
                  color: "#ffffff",
                  fontWeight: 600,
                  fontSize: 16,
                  gap: 8,
                  border: "none",
                  opacity: submitting ? 0.6 : 1,
                  boxShadow: `0 4px 16px ${accentGlow}`,
                }}
              >
                {submitting ? (
                  <span className="flex items-center" style={{ gap: 8 }}>
                    <svg className="animate-spin" style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="none">
                      <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending...
                  </span>
                ) : (
                  <>{isDemoMode ? "Request Free Demo" : "Submit"} <ArrowRight style={{ width: 16, height: 16 }} /></>
                )}
              </button>

                <div className="flex flex-col items-center" style={{ gap: 4, marginTop: 20 }}>
                  <button
                    type="button"
                    onClick={goPrev}
                    className="flex items-center justify-center cursor-pointer"
                    style={{
                      gap: 8,
                      color: "#9ca3af",
                      fontSize: 14,
                      background: "none",
                      border: "none",
                    }}
                  >
                    <ArrowLeft style={{ width: 16, height: 16 }} />
                    Previous Step
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowLanding(true); setIsDemoMode(false); setCardRevealed(false); setShowSecret(false) }}
                    style={{
                      background: "none",
                      border: "1px solid #e5e7eb",
                      borderRadius: 9999,
                      cursor: "pointer",
                      color: "#6b7280",
                      fontSize: 13,
                      fontWeight: 500,
                      letterSpacing: "0.3px",
                      padding: "7px 20px",
                    }}
                  >
                    Start again
                  </button>
                </div>
            </form>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col items-center" style={{ gap: 16, paddingBottom: 36 }}>
        <LukiLogo onClick={() => { setShowLanding(true); setIsDemoMode(false); setCardRevealed(false); setShowSecret(false) }} />
      </div>
    </main>
  )
}
