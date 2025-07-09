import { type NextRequest, NextResponse } from "next/server"
import { getDocumentType } from "@/lib/validators"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerData, amount, items, testMode } = body

    console.log("=== DEBUG PAYMENT REQUEST ===")
    console.log("Test mode:", testMode)

    if (testMode) {
      // Usar exatamente o mesmo payload que funcionou no teste
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

      console.log("Using working test payload:", JSON.stringify(workingPayload, null, 2))

      const response = await fetch("https://api.viperpay.com.br/v1/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-secret": process.env.VIPERPAY_API_SECRET || "",
        },
        body: JSON.stringify(workingPayload),
      })

      const responseText = await response.text()
      console.log("Test mode response:", response.status, responseText)

      return NextResponse.json({
        success: response.ok,
        status: response.status,
        payload: workingPayload,
        response: responseText,
      })
    }

    // Modo normal - vamos testar diferentes variações
    const external_id = `passport-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Teste 1: Com webhook URL do teste que funcionou
    const payload1 = {
      external_id: external_id + "-test1",
      total_amount: 10.0, // Mesmo valor que funcionou
      payment_method: "PIX" as const,
      webhook_url: "https://webhook.site/unique-id", // Mesmo webhook que funcionou
      items: [
        {
          id: "passport-service",
          title: "Emissão de Primeiro Passaporte",
          description: "Serviço de emissão de primeiro passaporte brasileiro",
          price: 10.0,
          quantity: 1,
          is_physical: false,
        },
      ],
      ip: "127.0.0.1",
      customer: {
        name: customerData.name.trim(),
        email: customerData.email.trim().toLowerCase(),
        phone: customerData.phone.replace(/\D/g, ""),
        document_type: getDocumentType(customerData.cpf),
        document: customerData.cpf.replace(/\D/g, ""),
      },
    }

    console.log("=== TESTE 1: Com webhook e valor que funcionaram ===")
    console.log(JSON.stringify(payload1, null, 2))

    const response1 = await fetch("https://api.viperpay.com.br/v1/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-secret": process.env.VIPERPAY_API_SECRET || "",
      },
      body: JSON.stringify(payload1),
    })

    const responseText1 = await response1.text()
    console.log("Teste 1 response:", response1.status, responseText1)

    // Teste 2: Com valor real mas webhook de teste
    const payload2 = {
      external_id: external_id + "-test2",
      total_amount: 360.9,
      payment_method: "PIX" as const,
      webhook_url: "https://webhook.site/unique-id", // Webhook de teste
      items: [
        {
          id: "passport-service",
          title: "Emissão de Primeiro Passaporte",
          description: "Serviço de emissão de primeiro passaporte brasileiro",
          price: 360.9,
          quantity: 1,
          is_physical: false,
        },
      ],
      ip: "127.0.0.1",
      customer: {
        name: customerData.name.trim(),
        email: customerData.email.trim().toLowerCase(),
        phone: customerData.phone.replace(/\D/g, ""),
        document_type: getDocumentType(customerData.cpf),
        document: customerData.document_type || getDocumentType(customerData.cpf),
        document: customerData.cpf.replace(/\D/g, ""),
      },
    }

    console.log("=== TESTE 2: Com valor real mas webhook de teste ===")
    console.log(JSON.stringify(payload2, null, 2))

    const response2 = await fetch("https://api.viperpay.com.br/v1/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-secret": process.env.VIPERPAY_API_SECRET || "",
      },
      body: JSON.stringify(payload2),
    })

    const responseText2 = await response2.text()
    console.log("Teste 2 response:", response2.status, responseText2)

    // Teste 3: Sem webhook URL
    const payload3 = {
      external_id: external_id + "-test3",
      total_amount: 10.0,
      payment_method: "PIX" as const,
      // webhook_url: "", // Removido
      items: [
        {
          id: "passport-service",
          title: "Emissão de Primeiro Passaporte",
          description: "Serviço de emissão de primeiro passaporte brasileiro",
          price: 10.0,
          quantity: 1,
          is_physical: false,
        },
      ],
      ip: "127.0.0.1",
      customer: {
        name: customerData.name.trim(),
        email: customerData.email.trim().toLowerCase(),
        phone: customerData.phone.replace(/\D/g, ""),
        document_type: getDocumentType(customerData.cpf),
        document: customerData.cpf.replace(/\D/g, ""),
      },
    }

    console.log("=== TESTE 3: Sem webhook URL ===")
    console.log(JSON.stringify(payload3, null, 2))

    const response3 = await fetch("https://api.viperpay.com.br/v1/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-secret": process.env.VIPERPAY_API_SECRET || "",
      },
      body: JSON.stringify(payload3),
    })

    const responseText3 = await response3.text()
    console.log("Teste 3 response:", response3.status, responseText3)

    return NextResponse.json({
      tests: [
        {
          name: "Teste 1: Webhook e valor que funcionaram",
          payload: payload1,
          status: response1.status,
          response: responseText1,
          success: response1.ok,
        },
        {
          name: "Teste 2: Valor real com webhook de teste",
          payload: payload2,
          status: response2.status,
          response: responseText2,
          success: response2.ok,
        },
        {
          name: "Teste 3: Sem webhook URL",
          payload: payload3,
          status: response3.status,
          response: responseText3,
          success: response3.ok,
        },
      ],
    })
  } catch (error) {
    console.error("Debug error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
