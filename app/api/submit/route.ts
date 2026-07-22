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

    const row = (label: string, value: string) => `
      <tr>
        <td style="padding:13px 0;font-weight:500;color:#8a8a9a;font-size:13px;width:40%;border-bottom:1px solid #f0f0f3;vertical-align:top;">${label}</td>
        <td style="padding:13px 0;color:#1a1a2e;font-size:14px;font-weight:600;border-bottom:1px solid #f0f0f3;text-align:right;">${sanitize(value) || "—"}</td>
      </tr>`

    const buildEmailTemplate = (isDemo: boolean) => {
      const accentColor = isDemo ? "#d4a847" : "#5a7fa3"
      const accentSoft = isDemo ? "rgba(212, 168, 71, 0.12)" : "rgba(90, 127, 163, 0.12)"
      const titleText = isDemo ? "Free Demo Enquiry" : "New Website Enquiry"
      const titleDesc = isDemo
        ? "A client has requested a free demo website."
        : "A potential client has requested a custom website quote."
      const logoUrl = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/luxx-logo-3-lLgBQHLHnO9dYbm4cCsrgIHyVUEYn5.png"

      return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#ececef;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:32px 16px;">

  <!-- Header -->
  <div style="background:linear-gradient(150deg,#1c1c30 0%,#101019 100%);border-radius:20px 20px 0 0;padding:36px 32px 30px;text-align:center;border-bottom:3px solid ${accentColor};">
    <img src="${logoUrl}" alt="LUXX PR" width="150" style="display:block;margin:0 auto 18px;max-width:150px;height:auto;" />
    <div style="display:inline-block;background:${accentSoft};border:1px solid ${accentColor}55;color:${accentColor};font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:6px 16px;border-radius:9999px;">${titleText}</div>
  </div>

  <!-- Body -->
  <div style="background:#ffffff;padding:32px;border-radius:0 0 20px 20px;box-shadow:0 10px 40px rgba(0,0,0,0.08);">

    <p style="color:#6a6a7a;font-size:14px;line-height:1.6;margin:0 0 28px;text-align:center;">${titleDesc}</p>

    <!-- Estimate highlight -->
    <div style="background:linear-gradient(150deg,#1c1c30 0%,#12121f 100%);border-radius:16px;padding:24px;text-align:center;margin-bottom:32px;border:1px solid ${accentColor}40;">
      <div style="color:rgba(255,255,255,0.5);font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">Estimated Price</div>
      <div style="color:${accentColor};font-size:30px;font-weight:800;letter-spacing:-0.5px;">${sanitize(estimatedPrice || "Not calculated")}</div>
    </div>

    <!-- Contact -->
    <h3 style="color:#1a1a2e;font-size:13px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 4px;font-weight:700;">Contact Details</h3>
    <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
      ${row("Name", name)}
      ${row("Business Name", businessName)}
      ${row("Email", email)}
      ${row("Phone", phone || "Not provided")}
      ${row("Referral Code", referralCode || "None")}
      <tr>
        <td style="padding:13px 0;font-weight:500;color:#8a8a9a;font-size:13px;vertical-align:top;">About Business</td>
        <td style="padding:13px 0;color:#1a1a2e;font-size:14px;font-weight:500;text-align:right;line-height:1.5;">${sanitize(businessDescription)}</td>
      </tr>
    </table>

    <!-- Questionnaire -->
    <h3 style="color:#1a1a2e;font-size:13px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 4px;font-weight:700;">Project Details</h3>
    <table style="width:100%;border-collapse:collapse;">
      ${row("Website Type", websiteType)}
      ${row("Product Count", productCount || "N/A")}
      ${row("Pages Needed", pageCount || "N/A")}
      ${row("Domain Name", domainName)}
      ${row("Domain", domainValue || "Not provided")}
      ${row("Branding", branding)}
      ${row("Website Purpose", websitePurpose)}
      ${row("Content Ready", contentReady)}
      ${row("Advanced Features", advancedFeatures)}
    </table>

  </div>

  <p style="text-align:center;color:#a8a8b3;font-size:11px;margin-top:24px;letter-spacing:0.3px;">
    Enquiry submitted via <span style="color:${accentColor};font-weight:600;">LUXX PR</span>
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
      to: ["info@luxxpr.com"],
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

    console.log("[submit] Email sent successfully to info@luxxpr.com")
    return NextResponse.json({ success: true, message: "Enquiry submitted successfully!" })
  } catch (err) {
    console.error("[submit] Unexpected error:", err)
    return NextResponse.json({ error: "Internal server error." }, { status: 500 })
  }
}
