import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const webhookUrl = `${request.nextUrl.origin}/api/webhooks/viperpay`

    console.log("Testing webhook URL:", webhookUrl)

    // Testar GET primeiro
    const getResponse = await fetch(webhookUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "ViperpPay-Webhook-Test",
      },
    })

    const getResponseText = await getResponse.text()
    console.log("GET test response:", getResponse.status, getResponseText)

    // Testar POST com payload de teste
    const testPayload = {
      id: "test-webhook-" + Date.now(),
      external_id: "test-external-" + Date.now(),
      status: "PENDING",
      total_amount: 10.0,
      payment_method: "PIX",
    }

    const postResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "ViperpPay-Webhook-Test",
      },
      body: JSON.stringify(testPayload),
    })

    const postResponseText = await postResponse.text()
    console.log("POST test response:", postResponse.status, postResponseText)

    return NextResponse.json({
      success: true,
      webhookUrl,
      tests: {
        get: {
          status: getResponse.status,
          ok: getResponse.ok,
          response: getResponseText,
        },
        post: {
          status: postResponse.status,
          ok: postResponse.ok,
          response: postResponseText,
          payload: testPayload,
        },
      },
    })
  } catch (error) {
    console.error("Webhook test error:", error)

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
