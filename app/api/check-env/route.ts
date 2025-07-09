import { NextResponse } from "next/server"

export async function GET() {
  const envCheck = {
    VIPERPAY_API_SECRET: {
      exists: !!process.env.VIPERPAY_API_SECRET,
      length: process.env.VIPERPAY_API_SECRET?.length || 0,
      prefix: process.env.VIPERPAY_API_SECRET?.substring(0, 10) || "N/A",
      isValid: process.env.VIPERPAY_API_SECRET?.startsWith("sk_") || false,
    },
    VIPERPAY_API_URL: {
      exists: !!process.env.VIPERPAY_API_URL,
      value: process.env.VIPERPAY_API_URL || "N/A",
      isValid: process.env.VIPERPAY_API_URL?.startsWith("http") || false,
    },
    VIPERPAY_WEBHOOK_URL: {
      exists: !!process.env.VIPERPAY_WEBHOOK_URL,
      value: process.env.VIPERPAY_WEBHOOK_URL || "N/A",
      isValid: process.env.VIPERPAY_WEBHOOK_URL?.startsWith("http") || false,
    },
  }

  console.log("Environment check:", envCheck)

  // Teste básico de construção de URL
  const testUrl = `${process.env.VIPERPAY_API_URL || "https://api.viperpay.com.br"}/v1/account-info`

  return NextResponse.json({
    ...envCheck,
    testUrl,
    constructedCorrectly: testUrl.includes("api.viperpay.com.br/v1/account-info"),
  })
}
