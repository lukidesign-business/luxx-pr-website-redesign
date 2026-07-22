import { NextResponse } from "next/server"
import { Resend } from "resend"

function sanitize(str: string): string {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .trim()
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.error("[submit] Missing RESEND_API_KEY environment variable")
      return NextResponse.json(
        { error: "Email service not configured. Please contact support." },
        { status: 500 }
      )
    }

    const body = await request.json()

    const {
      websiteType,
      productCount,
      pageCount,
      domainName,
      domainValue,
      branding,
      websitePurpose,
      contentReady,
      advancedFeatures,
      estimatedPrice,
      name,
      businessName,
      email,
      phone,
      businessDescription,
      referralCode,
      isDemoMode,
    } = body

    // Validate required fields
    if (!name?.trim() || !businessName?.trim() || !email?.trim() || !businessDescription?.trim()) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 })
    }

    const row = (label: string, value: string, bg: string) => `
      <tr style="background:${bg};">
        <td style="padding:12px 16px;font-weight:600;color:#555;font-size:13px;width:42%;border-bottom:1px solid #eee;">${label}</td>
        <td style="padding:12px 16px;color:#1a1a2e;font-size:14px;border-bottom:1px solid #eee;">${sanitize(value) || "—"}</td>
      </tr>`

    const buildEmailTemplate = (isDemo: boolean) => {
      const accentColor = isDemo ? "#d4a847" : "#1d3557"
      const accentBg = isDemo ? "rgba(212, 168, 71, 0.1)" : "rgba(29, 53, 87, 0.08)"
      const titleText = isDemo ? "Free Demo Enquiry" : "Website Enquiry"
      const titleDesc = isDemo ? "A client has requested a free demo website." : "A potential client has requested a custom website quote."
      const priceRowBg = isDemo ? "rgba(212, 168, 71, 0.15)" : "rgba(29, 53, 87, 0.12)"

      return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:32px 16px;">

  <div style="background:linear-gradient(135deg,#1a1a2e 0%,#111125 100%);border-radius:12px 12px 0 0;padding:28px 24px;text-align:center;">
    <div style="display:flex;align-items:center;justify-content:center;gap:12px;">
      <div style="width:48px;height:48px;background:${accentColor};border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:18px;">L</div>
      <div style="color:#f5f5f5;font-size:18px;font-weight:700;">LUXX PR</div>
    </div>
  </div>

  <div style="background:#fff;padding:28px 24px;border-radius:0 0 12px 12px;box-shadow:0 4px 16px rgba(0,0,0,0.06);">

    <h2 style="color:${accentColor};font-size:18px;margin:0 0 4px;font-weight:700;">${titleText}</h2>
    <p style="color:#888;font-size:13px;margin:0 0 24px;">${titleDesc}</p>

    <h3 style="color:${accentColor};font-size:14px;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;padding-bottom:8px;border-bottom:2px solid ${accentColor}33;">Contact Details</h3>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      ${row("Name", name, "#fff")}
      ${row("Business Name", businessName, "#fafafa")}
      ${row("Email", email, "#fff")}
      ${row("Phone", phone || "Not provided", "#fafafa")}
      ${row("Referral Code", referralCode || "None", "#fff")}
      <tr style="background:#fafafa;">
        <td style="padding:12px 16px;font-weight:600;color:#555;font-size:13px;border-bottom:1px solid #eee;vertical-align:top;">About Business</td>
        <td style="padding:12px 16px;color:#1a1a2e;font-size:14px;border-bottom:1px solid #eee;">${sanitize(businessDescription)}</td>
      </tr>
    </table>

    <h3 style="color:${accentColor};font-size:14px;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;padding-bottom:8px;border-bottom:2px solid ${accentColor}33;">Questionnaire Answers</h3>
    <table style="width:100%;border-collapse:collapse;">
      ${row("Website Type", websiteType, "#fff")}
      ${row("Product Count", productCount || "N/A", "#fafafa")}
      ${row("Pages Needed", pageCount || "N/A", "#fff")}
      ${row("Domain Name", domainName, "#fafafa")}
      ${row("Domain", domainValue || "Not provided", "#fff")}
      ${row("Branding", branding, "#fafafa")}
      ${row("Website Purpose", websitePurpose, "#fff")}
      ${row("Content Ready", contentReady, "#fafafa")}
      ${row("Advanced Features", advancedFeatures, "#fff")}
      <tr style="background:${priceRowBg};">
        <td style="padding:12px 16px;font-weight:700;color:${accentColor};font-size:13px;border-bottom:1px solid #eee;">Estimated Price</td>
        <td style="padding:12px 16px;color:${accentColor};font-size:15px;font-weight:700;border-bottom:1px solid #eee;">${sanitize(estimatedPrice || "Not calculated")}</td>
      </tr>
    </table>

  </div>

  <p style="text-align:center;color:#aaa;font-size:11px;margin-top:20px;">
    Website enquiry submitted via LUXX PR
  </p>
</div>
</body>
</html>`
    }

    const emailHtml = buildEmailTemplate(isDemoMode === true)

    const resend = new Resend(apiKey)

    const subjectPrefix = isDemoMode ? "Free Demo Enquiry" : "Website Enquiry"
    const { error: resendError } = await resend.emails.send({
      from: "LUXX PR <onboarding@resend.dev>",
      to: ["lukidesign.business@gmail.com"],
      subject: `${subjectPrefix}: ${sanitize(name)} — ${sanitize(businessName)}`,
      html: emailHtml,
      replyTo: email,
    })

    if (resendError) {
      console.error("[submit] Resend error:", JSON.stringify(resendError))
      return NextResponse.json({ 
        error: "Failed to send email. Please try again or contact support.",
        details: resendError?.message || "Unknown error"
      }, { status: 500 })
    }

    console.log("[submit] Email sent successfully to lukidesign.business@gmail.com")
    return NextResponse.json({ success: true, message: "Enquiry submitted successfully!" })
  } catch (err) {
    console.error("[submit] Unexpected error:", err)
    return NextResponse.json({ error: "Internal server error." }, { status: 500 })
  }
}
