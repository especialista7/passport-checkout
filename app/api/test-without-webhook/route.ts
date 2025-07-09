import { type NextRequest, NextResponse } from "next/server"
import { ViperpPayService } from "@/lib/viperpay"

export async function POST(request: NextRequest) {
  try {
    console.log("🧪 Testing ViperpPay transaction WITHOUT webhook...")

    const viperpay = new ViperpPayService()

    // Primeiro testar autenticação
    console.log("1️⃣ Testing authentication...")
    const accountInfo = await viperpay.getAccountInfo()
    console.log("✅ Authentication successful:", accountInfo)

    // Payload mínimo SEM webhook
    const testPayload = {
      external_id: `test-no-webhook-${Date.now()}`,
      total_amount: 10.0,
      payment_method: "PIX" as const,
      // webhook_url: "", // REMOVIDO para testar
      items: [
        {
          id: "test-item",
          title: "Test Item",
          description: "Test Description",
          price: 10.0,
          quantity: 1,
          is_physical: false,
        },
      ],
      ip: "127.0.0.1",
      customer: {
        name: "Test User",
        email: "test@example.com",
        phone: "11999999999",
        document_type: "CPF" as const,
        document: "11144477735",
      },
    }

    console.log("2️⃣ Testing transaction creation without webhook...")
    console.log("Test payload:", JSON.stringify(testPayload, null, 2))

    // Fazer requisição direta
    const response = await fetch("https://api.viperpay.com.br/v1/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-secret": process.env.VIPERPAY_API_SECRET || "",
      },
      body: JSON.stringify(testPayload),
    })

    const responseText = await response.text()
    console.log("ViperpPay response:", response.status, responseText)

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: `ViperpPay API Error: ${response.status}`,
        details: responseText,
        accountInfo,
        testPayload,
      })
    }

    const result = JSON.parse(responseText)

    return NextResponse.json({
      success: true,
      message: "Test successful - both auth and transaction work without webhook",
      accountInfo,
      transaction: result,
    })
  } catch (error) {
    console.error("❌ Test failed:", error)

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
