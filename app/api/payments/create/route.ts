import { type NextRequest, NextResponse } from "next/server"
import { ViperpPayService } from "@/lib/viperpay"
import { validateEmail, validatePhone, validateDocument, getDocumentType } from "@/lib/validators"

function resolveWebhookUrl(request: NextRequest): string {
  const envWebhookUrl = process.env.VIPERPAY_WEBHOOK_URL

  // Se tiver webhook configurado no .env e for HTTPS, usar ele
  if (envWebhookUrl?.startsWith("https://")) {
    return envWebhookUrl
  }

  // Senão, construir dinamicamente
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000"
  const proto = request.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https")

  return `${proto}://${host}/api/webhooks/viperpay`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerData, amount, items } = body

    console.log("Received payment creation request:", {
      customer: customerData?.name,
      amount,
      items_count: items?.length || 0,
      environment: process.env.NODE_ENV,
    })

    // Validate required fields
    if (!customerData || !amount || !items) {
      return NextResponse.json({ error: "Missing required fields: customerData, amount, items" }, { status: 400 })
    }

    // Validate customer data
    if (!customerData.name || !customerData.email || !customerData.phone || !customerData.cpf) {
      return NextResponse.json({ error: "Missing required customer fields" }, { status: 400 })
    }

    // Validate email format
    if (!validateEmail(customerData.email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Validate phone format
    if (!validatePhone(customerData.phone)) {
      return NextResponse.json({ error: "Invalid phone format" }, { status: 400 })
    }

    // Validate document (CPF/CNPJ)
    if (!validateDocument(customerData.cpf)) {
      return NextResponse.json({ error: "Invalid CPF/CNPJ format" }, { status: 400 })
    }

    const viperpay = new ViperpPayService()
    const external_id = `passport-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // ✅ Usar webhook resolver
    const webhookUrl = resolveWebhookUrl(request)

    // ✅ Usar dados REAIS do cliente (não mais dados de teste)
    const customer = {
      name: customerData.name.trim(),
      email: customerData.email.trim().toLowerCase(),
      phone: customerData.phone.replace(/\D/g, ""),
      document_type: getDocumentType(customerData.cpf),
      document: customerData.cpf.replace(/\D/g, ""),
    }

    console.log("👤 Using REAL customer data:", {
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      document_type: customer.document_type,
      document: customer.document,
    })

    // ✅ Usar items REAIS da requisição
    const processedItems = items.map((item: any) => ({
      id: String(item.id || "passport-service"),
      title: String(item.title || "Emissão de Passaporte"),
      description: String(item.description || "Serviço de emissão de primeiro passaporte"),
      price: Number(item.price),
      quantity: Number(item.quantity || 1),
      is_physical: Boolean(item.is_physical || false),
    }))

    // ✅ Usar valor REAL da requisição
    const realAmount = Number(amount)

    console.log("💰 Using REAL amount:", realAmount)
    console.log("📦 Using REAL items:", processedItems)
    console.log("🔗 Using webhook:", webhookUrl)

    // ✅ Obter IP real da requisição
    const clientIP =
      request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || "127.0.0.1"

    // ✅ Create transaction data com dados REAIS
    const transactionData = {
      external_id,
      total_amount: realAmount, // ✅ VALOR REAL
      payment_method: "PIX" as const,
      webhook_url: webhookUrl, // ✅ WEBHOOK REAL
      items: processedItems, // ✅ ITEMS REAIS
      ip: clientIP, // ✅ IP REAL
      customer, // ✅ CUSTOMER REAL
    }

    console.log("📤 Final transaction data with REAL values:", JSON.stringify(transactionData, null, 2))

    const transaction = await viperpay.createTransaction(transactionData)

    console.log("✅ ViperpPay transaction created successfully:", {
      id: transaction.id,
      status: transaction.status,
      total_value: transaction.total_value,
      customer_name: transaction.customer.name,
    })

    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.id,
        external_id: transaction.external_id,
        status: transaction.status,
        total_value: transaction.total_value,
        pix_payload: transaction.pix.payload,
        payment_method: transaction.payment_method,
        hasError: transaction.hasError,
      },
    })
  } catch (error) {
    console.error("Error creating ViperpPay transaction:", error)

    return NextResponse.json(
      {
        error: "Failed to create payment transaction",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
