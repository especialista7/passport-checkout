import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Simular a mesma lógica do resolveWebhookUrl
    const envWebhookUrl = process.env.VIPERPAY_WEBHOOK_URL
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000"
    const proto = request.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https")
    const dynamicUrl = `${proto}://${host}/api/webhooks/viperpay`

    const finalUrl = envWebhookUrl?.startsWith("https://") ? envWebhookUrl : dynamicUrl

    // Testar se a URL é válida
    let urlValid = false
    let urlError = null
    try {
      const urlObj = new URL(finalUrl)
      urlValid = urlObj.protocol.startsWith("http") && urlObj.hostname !== "localhost"
    } catch (e) {
      urlError = e instanceof Error ? e.message : "Unknown error"
    }

    return NextResponse.json({
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VIPERPAY_WEBHOOK_URL: envWebhookUrl,
      },
      headers: {
        "x-forwarded-host": request.headers.get("x-forwarded-host"),
        "x-forwarded-proto": request.headers.get("x-forwarded-proto"),
        host: request.headers.get("host"),
      },
      urls: {
        fromEnv: envWebhookUrl,
        dynamic: dynamicUrl,
        final: finalUrl,
      },
      validation: {
        valid: urlValid,
        error: urlError,
        isProduction: process.env.NODE_ENV === "production",
        isLocalhost: finalUrl.includes("localhost"),
      },
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
