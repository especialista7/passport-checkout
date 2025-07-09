import { NextResponse } from "next/server"

export async function GET() {
  console.log("🧪 Simple test endpoint called")
  return NextResponse.json({
    success: true,
    message: "API is working",
    timestamp: new Date().toISOString(),
  })
}

export async function POST(request: Request) {
  try {
    console.log("🧪 Simple test POST endpoint called")
    const body = await request.json()
    console.log("📥 Received body:", body)

    return NextResponse.json({
      success: true,
      message: "POST request received successfully",
      received: body,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Error in simple test:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
