import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Usar a URL correta baseada no ambiente
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000"

    const webhookUrl = `${baseUrl}/api/webhooks/viperpay`

    console.log("Testing webhook URL:", webhookUrl)
    console.log("Environment:", {
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      VERCEL_URL: process.env.VERCEL_URL,
      NODE_ENV: process.env.NODE_ENV,
    })

    // Se estiver em localhost, apenas retornar info sem testar
    if (webhookUrl.includes("localhost")) {
      return NextResponse.json({
        success: true,
        message: "Webhook URL configured for localhost - skipping external test",
        webhookUrl,
        note: "Deploy to production to test webhook connectivity",
        environment: "development",
      })
    }

    // Testar se o webhook está acessível (apenas em produção)
    const response = await fetch(webhookUrl, {
      method: "GET", // Usar GET primeiro para testar conectividade
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "ViperpPay-Webhook-Test",
      },
    })

    const responseText = await response.text()

    console.log("Webhook test response:", {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseText,
    })

    return NextResponse.json({
      success: response.ok,
      webhookUrl,
      test: {
        status: response.status,
        ok: response.ok,
        response: responseText,
        headers: Object.fromEntries(response.headers.entries()),
      },
      environment: "production",
    })
  } catch (error) {
    console.error("Webhook test error:", error)

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      webhookUrl: process.env.VIPERPAY_WEBHOOK_URL || "",
      note: "This error is expected in localhost. Deploy to production to test properly.",
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Webhook test received:", body)

    return NextResponse.json({
      success: true,
      message: "Webhook test received successfully",
      received: body,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Webhook test POST error:", error)

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
