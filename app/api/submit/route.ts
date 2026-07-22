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

    const buildEmailTemplate = (isDemo: boolean) => {
      const accentColor = isDemo ? "#d4a847" : "#99b9d5"
      const accentColorDim = isDemo ? "#b8902f" : "#7a9dbd"
      const titleText = isDemo ? "Free Demo Enquiry" : "New Website Enquiry"
      const titleDesc = isDemo
        ? "A client has requested a free demo website."
        : "A potential client has requested a custom website quote."
      const logoUrl = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/luxx-logo-3-lLgBQHLHnO9dYbm4cCsrgIHyVUEYn5.png"
      const bgUrl = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/lux-mockup1%20%281%29-zES1ceEPRx8Uh3C1OBDdMzr5Ew4Gn9.png"

      // Data row — alternating subtle background, accent-tinted label
      const row = (label: string, value: string, last = false) => `
      <tr>
        <td style="padding:14px 20px;font-weight:600;color:#5f7285;font-size:12px;letter-spacing:0.3px;text-transform:uppercase;width:42%;vertical-align:top;${last ? "" : "border-bottom:1px solid #eef1f5;"}">${label}</td>
        <td style="padding:14px 20px;color:#0a1a28;font-size:14px;font-weight:600;text-align:right;line-height:1.5;${last ? "" : "border-bottom:1px solid #eef1f5;"}">${sanitize(value) || "—"}</td>
      </tr>`

      const sectionHeader = (title: string) => `
      <tr>
        <td colspan="2" style="padding:22px 20px 10px;">
          <span style="display:inline-block;color:${accentColorDim};font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;">${title}</span>
          <div style="height:2px;width:32px;background:${accentColor};border-radius:2px;margin-top:8px;"></div>
        </td>
      </tr>`

      return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"></head>
<body style="margin:0;padding:0;background-color:#050d14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<!-- Outer background: LUXX image with deep navy fallback, no stretch (cover keeps ratio) -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#050d14;background-image:url('${bgUrl}');background-size:cover;background-position:center top;background-repeat:no-repeat;">
<tr><td align="center" style="padding:40px 16px;">

  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;">

    <!-- HEADER: glassy dark panel over the LUXX background -->
    <tr><td style="background:linear-gradient(155deg, rgba(10,26,40,0.82) 0%, rgba(5,13,20,0.9) 100%);border:1px solid rgba(153,185,213,0.14);border-bottom:3px solid ${accentColor};border-radius:22px 22px 0 0;padding:40px 32px 32px;text-align:center;">
      <img src="${logoUrl}" alt="LUXX PR" width="160" style="display:block;margin:0 auto 20px;max-width:160px;height:auto;" />
      <span style="display:inline-block;background:rgba(153,185,213,0.10);border:1px solid ${accentColor};color:${accentColor};font-size:11px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;padding:8px 18px;border-radius:9999px;">${titleText}</span>
      <p style="color:rgba(255,255,255,0.65);font-size:14px;line-height:1.6;margin:20px 0 0;">${titleDesc}</p>
    </td></tr>

    <!-- ESTIMATE HIGHLIGHT -->
    <tr><td style="background:#0a1a28;padding:28px 32px;border-left:1px solid rgba(153,185,213,0.14);border-right:1px solid rgba(153,185,213,0.14);">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(150deg,#0e2233 0%,#081521 100%);border:1px solid ${accentColor}55;border-radius:16px;">
        <tr><td style="padding:26px;text-align:center;">
          <div style="color:rgba(255,255,255,0.5);font-size:11px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;margin-bottom:10px;">Estimated Price</div>
          <div style="color:${accentColor};font-size:34px;font-weight:800;letter-spacing:-0.5px;line-height:1;">${sanitize(estimatedPrice || "Not calculated")}</div>
        </td></tr>
      </table>
    </td></tr>

    <!-- DETAILS: white card -->
    <tr><td style="background:#ffffff;border-radius:0 0 22px 22px;overflow:hidden;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${sectionHeader("Contact Details")}
        ${row("Name", name)}
        ${row("Business Name", businessName)}
        ${row("Email", email)}
        ${row("Phone", phone || "Not provided")}
        ${row("Referral Code", referralCode || "None")}
        ${row("About Business", businessDescription, true)}

        ${sectionHeader("Project Details")}
        ${row("Website Type", websiteType)}
        ${row("Product Count", productCount || "N/A")}
        ${row("Pages Needed", pageCount || "N/A")}
        ${row("Domain Name", domainName)}
        ${row("Domain", domainValue || "Not provided")}
        ${row("Branding", branding)}
        ${row("Website Purpose", websitePurpose)}
        ${row("Content Ready", contentReady)}
        ${row("Advanced Features", advancedFeatures, true)}
      </table>
      <div style="height:28px;"></div>
    </td></tr>

    <!-- FOOTER -->
    <tr><td style="padding:24px 16px 8px;text-align:center;">
      <p style="color:rgba(255,255,255,0.55);font-size:11px;letter-spacing:0.4px;margin:0;">
        Enquiry submitted via <span style="color:${accentColor};font-weight:700;">LUXX PR</span>
      </p>
    </td></tr>

  </table>

</td></tr>
</table>
</body>
</html>`
    }

    const emailHtml = buildEmailTemplate(isDemoMode === true)

    const resend = new Resend(apiKey)

    const subjectPrefix = isDemoMode ? "Free Demo Enquiry" : "Website Enquiry"
    const { error: resendError } = await resend.emails.send({
      from: "LUXX PR <noreply@luxxpr.com>",
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
