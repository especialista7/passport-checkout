import { type NextRequest, NextResponse } from "next/server"
import { getDocumentType } from "@/lib/validators"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerData, amount, items } = body

    console.log("=== DEBUGGING PAYMENT COMPARISON ===")
    console.log("Received data:", { customerData, amount, items })

    // Payload que FUNCIONA no teste
    const workingPayload = {
      external_id: `test-${Date.now()}`,
      total_amount: 10.0,
      payment_method: "PIX" as const,
      webhook_url: "https://webhook.site/unique-id",
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

    // Payload do fluxo real (como está sendo gerado)
    const external_id = `passport-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const realPayload = {
      external_id,
      total_amount: Number(amount),
      payment_method: "PIX" as const,
      webhook_url: `${request.nextUrl.origin}/api/webhooks/viperpay`,
      items: items.map((item: any) => ({
        id: String(item.id || "passport-service"),
        title: String(item.title || "Emissão de Passaporte"),
        description: String(item.description || "Serviço de emissão de primeiro passaporte"),
        price: Number(item.price || amount),
        quantity: Number(item.quantity || 1),
        is_physical: Boolean(item.is_physical || false),
      })),
      ip: "127.0.0.1", // Usando o mesmo IP do teste
      customer: {
        name: customerData.name.trim(),
        email: customerData.email.trim().toLowerCase(),
        phone: customerData.phone.replace(/\D/g, ""),
        document_type: getDocumentType(customerData.cpf),
        document: customerData.cpf.replace(/\D/g, ""),
      },
    }

    console.log("=== WORKING PAYLOAD ===")
    console.log(JSON.stringify(workingPayload, null, 2))

    console.log("=== REAL PAYLOAD ===")
    console.log(JSON.stringify(realPayload, null, 2))

    // Testar ambos os payloads
    const testResults = []

    // Teste 1: Payload que funciona
    try {
      const response1 = await fetch("https://api.viperpay.com.br/v1/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-secret": process.env.VIPERPAY_API_SECRET || "",
        },
        body: JSON.stringify(workingPayload),
      })

      const responseText1 = await response1.text()
      testResults.push({
        name: "Working Payload",
        status: response1.status,
        success: response1.ok,
        response: responseText1,
        payload: workingPayload,
      })
    } catch (error) {
      testResults.push({
        name: "Working Payload",
        status: "ERROR",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        payload: workingPayload,
      })
    }

    // Teste 2: Payload real
    try {
      const response2 = await fetch("https://api.viperpay.com.br/v1/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-secret": process.env.VIPERPAY_API_SECRET || "",
        },
        body: JSON.stringify(realPayload),
      })

      const responseText2 = await response2.text()
      testResults.push({
        name: "Real Payload",
        status: response2.status,
        success: response2.ok,
        response: responseText2,
        payload: realPayload,
      })
    } catch (error) {
      testResults.push({
        name: "Real Payload",
        status: "ERROR",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        payload: realPayload,
      })
    }

    return NextResponse.json({
      comparison: {
        working: workingPayload,
        real: realPayload,
      },
      tests: testResults,
      differences: {
        external_id: workingPayload.external_id !== realPayload.external_id,
        total_amount: workingPayload.total_amount !== realPayload.total_amount,
        webhook_url: workingPayload.webhook_url !== realPayload.webhook_url,
        items_different: JSON.stringify(workingPayload.items) !== JSON.stringify(realPayload.items),
        customer_different: JSON.stringify(workingPayload.customer) !== JSON.stringify(realPayload.customer),
      },
    })
  } catch (error) {
    console.error("Debug comparison error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
