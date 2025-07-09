import { type NextRequest, NextResponse } from "next/server"
import { ViperpPayService } from "@/lib/viperpay"

export async function GET(request: NextRequest, { params }: { params: { transactionId: string } }) {
  try {
    const { transactionId } = params

    if (!transactionId) {
      return NextResponse.json({ error: "Transaction ID is required" }, { status: 400 })
    }

    const viperpay = new ViperpPayService()
    const transaction = await viperpay.getTransaction(transactionId)

    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.id,
        external_id: transaction.external_id,
        status: transaction.status,
        total_value: transaction.total_value,
        customer: transaction.customer,
        payment_method: transaction.payment_method,
        pix_payload: transaction.pix?.payload,
      },
    })
  } catch (error) {
    console.error("Error fetching transaction status:", error)

    return NextResponse.json(
      {
        error: "Failed to fetch transaction status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
