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
      const accent = isDemo ? "#d4a847" : "#5a7fa3"
      const accentSoft = isDemo ? "#faf4e6" : "#eef3f8"
      const titleText = isDemo ? "Free Demo Enquiry" : "New Website Enquiry"
      const titleDesc = isDemo
        ? "A client has requested a free demo website."
        : "A potential client has requested a custom website quote."
      const logoUrl = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/luxx-logo-3-lLgBQHLHnO9dYbm4cCsrgIHyVUEYn5.png"
      const bgUrl = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/lux-mockup1%20%281%29-zES1ceEPRx8Uh3C1OBDdMzr5Ew4Gn9.png"

      // Clean two-column data row
      const row = (label: string, value: string, last = false) => `
      <tr>
        <td style="padding:15px 0;color:#7c8794;font-size:13px;font-weight:500;width:40%;vertical-align:top;${last ? "" : "border-bottom:1px solid #eef0f3;"}">${label}</td>
        <td style="padding:15px 0 15px 16px;color:#111827;font-size:14px;font-weight:600;text-align:right;line-height:1.5;${last ? "" : "border-bottom:1px solid #eef0f3;"}">${sanitize(value) || "—"}</td>
      </tr>`

      // Card wrapper with a titled header bar
      const card = (title: string, rows: string) => `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e8ebef;border-radius:16px;margin-bottom:16px;overflow:hidden;">
        <tr><td style="padding:18px 24px;border-bottom:1px solid #f1f3f5;">
          <span style="color:#111827;font-size:14px;font-weight:700;letter-spacing:0.2px;">${title}</span>
        </td></tr>
        <tr><td style="padding:6px 24px 12px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
        </td></tr>
      </table>`

      return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"></head>
<body style="margin:0;padding:0;background-color:#eef1f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#eef1f5;">
<tr><td align="center" style="padding:32px 16px;">

  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;">

    <!-- HERO BANNER: LUXX image, contained (no stretch), with dark overlay -->
    <tr><td style="background-color:#0a1420;background-image:linear-gradient(rgba(6,14,22,0.72),rgba(6,14,22,0.82)),url('${bgUrl}');background-size:cover;background-position:center;border-radius:20px 20px 0 0;padding:44px 32px;text-align:center;">
      <img src="${logoUrl}" alt="LUXX PR" width="150" style="display:block;margin:0 auto 22px;max-width:150px;height:auto;" />
      <span style="display:inline-block;background:linear-gradient(135deg,${accent} 0%,${isDemo ? "#e8bf5a" : "#6fa3c9"} 100%);color:#ffffff;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:10px 22px;border-radius:9999px;box-shadow:0 4px 12px ${isDemo ? "rgba(212,168,71,0.3)" : "rgba(90,127,163,0.25)"};">${titleText}</span>
    </td></tr>

    <!-- CONTENT AREA -->
    <tr><td style="background:#ffffff;border-radius:0 0 20px 20px;padding:32px 24px;">

      <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 24px;text-align:center;">${titleDesc}</p>

      <!-- Estimate highlight -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${accentSoft};border:1px solid ${accent}40;border-radius:16px;margin-bottom:24px;">
        <tr><td style="padding:24px;text-align:center;">
          <div style="color:#6b7280;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">Estimated Price</div>
          <div style="color:${accent};font-size:32px;font-weight:800;letter-spacing:-0.5px;line-height:1;">${sanitize(estimatedPrice || "Not calculated")}</div>
        </td></tr>
      </table>

      ${card("Contact Details", `
        ${row("Name", name)}
        ${row("Business Name", businessName)}
        ${row("Email", email)}
        ${row("Phone", phone || "Not provided")}
        ${row("Referral Code", referralCode || "None")}
        ${row("About Business", businessDescription, true)}
      `)}

      ${card("Project Details", `
        ${row("Website Type", websiteType)}
        ${row("Product Count", productCount || "N/A")}
        ${row("Pages Needed", pageCount || "N/A")}
        ${row("Domain Name", domainName)}
        ${row("Domain", domainValue || "Not provided")}
        ${row("Branding", branding)}
        ${row("Website Purpose", websitePurpose)}
        ${row("Content Ready", contentReady)}
        ${row("Advanced Features", advancedFeatures, true)}
      `)}

    </td></tr>

    <!-- FOOTER -->
    <tr><td style="padding:24px 16px 8px;text-align:center;">
      <p style="color:#9ca3af;font-size:12px;letter-spacing:0.3px;margin:0;">
        Enquiry submitted via <span style="color:${accent};font-weight:700;">LUXX PR</span>
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
    const logoUrl = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/luxx-logo-3-lLgBQHLHnO9dYbm4cCsrgIHyVUEYn5.png"
    
    const { error: resendError } = await resend.emails.send({
      from: "LUXX PR <noreply@luxxpr.com>",
      to: ["info@luxxpr.com"],
      subject: `${subjectPrefix}: ${sanitize(name)} — ${sanitize(businessName)}`,
      html: emailHtml,
      replyTo: email,
      headers: {
        "X-Logo": logoUrl,
        "X-Entity-Ref-ID": "luxx-pr-enquiry",
      },
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
