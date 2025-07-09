import { type NextRequest, NextResponse } from "next/server"
import { ViperpPayService } from "@/lib/viperpay"

interface WebhookPayload {
  id: string
  external_id: string
  total_amount: number
  status: "AUTHORIZED" | "PENDING" | "CHARGEBACK" | "FAILED" | "IN_DISPUTE"
  payment_method: string
}

// Permitir CORS para webhooks
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  })
}

export async function GET(request: NextRequest) {
  console.log("=== WEBHOOK GET REQUEST ===")
  console.log("Headers:", Object.fromEntries(request.headers.entries()))
  console.log("URL:", request.url)

  return NextResponse.json(
    {
      message: "ViperpPay webhook endpoint is active",
      timestamp: new Date().toISOString(),
      url: request.url,
      status: "healthy",
    },
    {
      status: 200,
      headers: corsHeaders,
    },
  )
}

export async function POST(request: NextRequest) {
  try {
    // Log headers para debug
    console.log("=== VIPERPAY WEBHOOK RECEIVED ===")
    console.log("Headers:", Object.fromEntries(request.headers.entries()))
    console.log("URL:", request.url)
    console.log("Method:", request.method)

    const payload: WebhookPayload = await request.json()
    console.log("Webhook payload:", JSON.stringify(payload, null, 2))

    // Validate webhook payload
    if (!payload.id || !payload.status) {
      console.error("Invalid webhook payload - missing id or status")
      return NextResponse.json(
        {
          error: "Invalid webhook payload",
          received: true, // Importante: sempre retornar received: true
        },
        {
          status: 400,
          headers: corsHeaders,
        },
      )
    }

    const viperpay = new ViperpPayService()

    // Update transaction status in Supabase
    console.log(`Updating transaction ${payload.id} to status ${payload.status}`)
    await viperpay.updateTransactionStatus(payload.id, payload.status)

    // Process the webhook based on status
    switch (payload.status) {
      case "AUTHORIZED":
        console.log(`✅ Payment authorized for transaction ${payload.id}`)
        await handleAuthorizedPayment(payload)
        break

      case "FAILED":
        console.log(`❌ Payment failed for transaction ${payload.id}`)
        await handleFailedPayment(payload)
        break

      case "CHARGEBACK":
        console.log(`🔄 Chargeback for transaction ${payload.id}`)
        await handleChargeback(payload)
        break

      case "PENDING":
        console.log(`⏳ Payment pending for transaction ${payload.id}`)
        // Usually no action needed for pending status
        break

      case "IN_DISPUTE":
        console.log(`⚠️ Payment in dispute for transaction ${payload.id}`)
        await handleDispute(payload)
        break

      default:
        console.log(`❓ Unknown status ${payload.status} for transaction ${payload.id}`)
    }

    // Always respond with 200 to acknowledge receipt
    return NextResponse.json(
      {
        received: true,
        status: "processed",
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: corsHeaders,
      },
    )
  } catch (error) {
    console.error("❌ Error processing ViperpPay webhook:", error)

    // Still return 200 to avoid webhook retries for parsing errors
    return NextResponse.json(
      {
        error: "Webhook processing failed",
        received: true,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: corsHeaders,
      },
    )
  }
}

async function handleAuthorizedPayment(payload: WebhookPayload) {
  console.log("🎉 Processing authorized payment:", {
    transactionId: payload.id,
    externalId: payload.external_id,
    amount: payload.total_amount,
  })

  // TODO: Implement your business logic here
  // Examples:
  // - Send confirmation email to customer
  // - Trigger passport application process
  // - Log successful payment
  // - Update order status
}

async function handleFailedPayment(payload: WebhookPayload) {
  console.log("💔 Processing failed payment:", {
    transactionId: payload.id,
    externalId: payload.external_id,
  })

  // TODO: Implement failure handling
  // - Send failure notification
  // - Log failed payment
  // - Update order status
}

async function handleChargeback(payload: WebhookPayload) {
  console.log("🔄 Processing chargeback:", {
    transactionId: payload.id,
    externalId: payload.external_id,
    amount: payload.total_amount,
  })

  // TODO: Implement chargeback handling
  // - Alert admin
  // - Update records
  // - Handle dispute process
}

async function handleDispute(payload: WebhookPayload) {
  console.log("⚠️ Processing dispute:", {
    transactionId: payload.id,
    externalId: payload.external_id,
  })

  // TODO: Implement dispute handling
  // - Alert admin
  // - Prepare dispute documentation
}
