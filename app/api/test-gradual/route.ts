import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerData, amount } = body

    console.log("🧪 Testing gradual changes to identify the problematic field...")

    const baseWorkingPayload = {
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

    const tests = []

    // Teste 1: Payload base que funciona
    tests.push({
      name: "1. Base Working Payload",
      payload: { ...baseWorkingPayload },
    })

    // Teste 2: Mudar apenas o webhook
    tests.push({
      name: "2. Change Webhook Only",
      payload: {
        ...baseWorkingPayload,
        webhook_url: "https://v0-criar-pagina-de-doacao.vercel.app/api/webhooks/viperpay",
      },
    })

    // Teste 3: Mudar apenas o valor
    tests.push({
      name: "3. Change Amount Only",
      payload: {
        ...baseWorkingPayload,
        total_amount: 360.9,
        items: [
          {
            ...baseWorkingPayload.items[0],
            price: 360.9,
          },
        ],
      },
    })

    // Teste 4: Mudar apenas o customer
    tests.push({
      name: "4. Change Customer Only",
      payload: {
        ...baseWorkingPayload,
        customer: {
          name: customerData.name.trim(),
          email: customerData.email.trim().toLowerCase(),
          phone: customerData.phone.replace(/\D/g, ""),
          document_type: "CPF" as const,
          document: customerData.cpf.replace(/\D/g, ""),
        },
      },
    })

    // Teste 5: Mudar apenas os items
    tests.push({
      name: "5. Change Items Only",
      payload: {
        ...baseWorkingPayload,
        items: [
          {
            id: "passport-emission",
            title: "Emissão de Primeiro Passaporte",
            description: "Taxa para emissão de primeiro passaporte brasileiro",
            price: 10.0, // Manter preço baixo
            quantity: 1,
            is_physical: false,
          },
        ],
      },
    })

    // Executar todos os testes
    const results = []

    for (const test of tests) {
      try {
        console.log(`🧪 Testing: ${test.name}`)
        console.log("Payload:", JSON.stringify(test.payload, null, 2))

        const response = await fetch("https://api.viperpay.com.br/v1/transactions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-secret": process.env.VIPERPAY_API_SECRET || "",
          },
          body: JSON.stringify(test.payload),
        })

        const responseText = await response.text()

        results.push({
          name: test.name,
          status: response.status,
          success: response.ok,
          response: responseText,
          payload: test.payload,
        })

        console.log(`✅ ${test.name}: ${response.status} - ${response.ok ? "SUCCESS" : "FAILED"}`)
      } catch (error) {
        results.push({
          name: test.name,
          status: "ERROR",
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
          payload: test.payload,
        })

        console.log(`❌ ${test.name}: ERROR - ${error}`)
      }
    }

    return NextResponse.json({
      message: "Gradual testing completed",
      results,
      summary: {
        total_tests: results.length,
        successful: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
      },
    })
  } catch (error) {
    console.error("Gradual test error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
