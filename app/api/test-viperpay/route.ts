import { type NextRequest, NextResponse } from "next/server"
import { ViperpPayServiceFixed } from "@/lib/viperpay-fixed"

export async function GET(request: NextRequest) {
  try {
    console.log("Testing ViperpPay authentication...")

    const viperpay = new ViperpPayServiceFixed()

    // Teste 1: Verificar informações da conta
    console.log("Step 1: Testing account info...")
    const accountInfo = await viperpay.getAccountInfo()
    console.log("Account info success:", accountInfo)

    return NextResponse.json({
      success: true,
      message: "ViperpPay authentication working",
      accountInfo,
    })
  } catch (error) {
    console.error("ViperpPay test failed:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("Testing ViperpPay transaction creation with minimal payload...")

    const viperpay = new ViperpPayServiceFixed()

    // Payload mínimo para teste com valor maior
    const testPayload = {
      external_id: `test-${Date.now()}`,
      total_amount: 10.0, // Valor maior para teste
      payment_method: "PIX" as const,
      webhook_url: "https://webhook.site/unique-id", // URL de teste
      items: [
        {
          id: "test-item",
          title: "Test Item",
          description: "Test Description",
          price: 10.0, // Mesmo valor do total
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
        document: "11144477735", // CPF válido para teste
      },
    }

    console.log("Test payload:", JSON.stringify(testPayload, null, 2))

    // Fazer requisição direta sem salvar no Supabase
    const response = await fetch("https://api.viperpay.com.br/v1/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-secret": process.env.VIPERPAY_API_SECRET || "",
      },
      body: JSON.stringify(testPayload),
    })

    const responseText = await response.text()
    console.log("ViperpPay response status:", response.status)
    console.log("ViperpPay response body:", responseText)

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `ViperpPay API Error: ${response.status}`,
          details: responseText,
          payload: testPayload,
        },
        { status: 400 },
      )
    }

    const result = JSON.parse(responseText)

    return NextResponse.json({
      success: true,
      message: "ViperpPay transaction test successful",
      result,
    })
  } catch (error) {
    console.error("ViperpPay transaction test failed:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
