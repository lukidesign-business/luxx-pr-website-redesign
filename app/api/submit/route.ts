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
      const accent = isDemo ? "#d4a847" : "#99b9d5"
      const accentBg = isDemo ? "#faf4e6" : "#eef3f8"
      const titleText = isDemo ? "FREE DEMO ENQUIRY" : "NEW WEBSITE ENQUIRY"
      const titleDesc = isDemo
        ? "A client has requested a free demo website."
        : "A potential client has requested a custom website quote."
      const logoUrl = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/luxx-logo-3-lLgBQHLHnO9dYbm4cCsrgIHyVUEYn5.png"
      const bgUrl = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/lux-mockup1%20%281%29-zES1ceEPRx8Uh3C1OBDdMzr5Ew4Gn9.png"

      // Simple data row - no borders between rows
      const row = (label: string, value: string) => `
      <tr>
        <td style="padding:13px 0;color:#a3aab5;font-size:13px;font-weight:400;">${label}</td>
        <td style="padding:13px 0;color:#111827;font-size:14px;font-weight:600;text-align:right;">${sanitize(value) || "—"}</td>
      </tr>`

      // Card with minimal styling - just header with bottom border
      const card = (title: string, rows: string) => `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;background:#ffffff;border:1px solid #f3f4f6;border-radius:12px;overflow:hidden;">
        <tr><td style="padding:18px 24px;border-bottom:1px solid #f3f4f6;">
          <span style="color:#111827;font-size:14px;font-weight:700;">${title}</span>
        </td></tr>
        <tr><td style="padding:18px 24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
        </td></tr>
      </table>`

      return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;">
<tr><td align="center" style="padding:24px 16px;">

  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

    <!-- HERO BANNER with LUXX background -->
    <tr><td style="background-color:#0a1420;background-image:url('${bgUrl}'),linear-gradient(135deg,rgba(10,20,32,0.8) 0%,rgba(5,13,20,0.9) 100%);background-size:cover;background-position:center;background-repeat:no-repeat;padding:48px 32px;text-align:center;">
      <img src="${logoUrl}" alt="LUXX PR" width="140" style="display:block;margin:0 auto 24px;max-width:140px;height:auto;" />
      <span style="display:inline-block;background:${accent};color:#ffffff;font-size:10px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;padding:10px 24px;border-radius:50px;">${titleText}</span>
    </td></tr>

    <!-- CONTENT -->
    <tr><td style="padding:32px 24px;">

      <p style="color:#9ca3af;font-size:14px;line-height:1.6;margin:0 0 28px;text-align:center;">${titleDesc}</p>

      <!-- ESTIMATE BOX -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${accentBg};border-radius:12px;margin-bottom:28px;border:1px solid ${accent}20;">
        <tr><td style="padding:28px;text-align:center;">
          <div style="color:#a3aab5;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;">Estimated Price</div>
          <div style="color:${accent};font-size:38px;font-weight:800;line-height:1;">${sanitize(estimatedPrice || "Not calculated")}</div>
        </td></tr>
      </table>

      <!-- CONTACT DETAILS CARD -->
      ${card("Contact Details", `
        ${row("Name", name)}
        ${row("Business Name", businessName)}
        ${row("Email", email)}
        ${row("Phone", phone || "Not provided")}
        ${row("Referral Code", referralCode || "None")}
        ${row("About Business", businessDescription)}
      `)}

      <!-- PROJECT DETAILS CARD -->
      ${card("Project Details", `
        ${row("Website Type", websiteType)}
        ${row("Product Count", productCount || "N/A")}
        ${row("Pages Needed", pageCount || "N/A")}
        ${row("Domain Name", domainName)}
        ${row("Domain", domainValue || "Not provided")}
        ${row("Branding", branding)}
        ${row("Website Purpose", websitePurpose)}
        ${row("Content Ready", contentReady)}
        ${row("Advanced Features", advancedFeatures)}
      `)}

    </td></tr>

    <!-- FOOTER -->
    <tr><td style="padding:20px 24px;text-align:center;border-top:1px solid #f3f4f6;background:#fafbfc;">
      <p style="color:#d1d5db;font-size:11px;margin:0;">Enquiry submitted via <span style="color:${accent};font-weight:700;">LUXX PR</span></p>
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
