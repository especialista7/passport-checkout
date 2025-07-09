import { NextResponse } from "next/server"

export async function GET() {
  // Debug das variáveis de ambiente em produção
  const envDebug = {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    VIPERPAY_API_URL: {
      exists: !!process.env.VIPERPAY_API_URL,
      value: process.env.VIPERPAY_API_URL,
      length: process.env.VIPERPAY_API_URL?.length || 0,
      trimmed: process.env.VIPERPAY_API_URL?.trim(),
      startsWithHttps: process.env.VIPERPAY_API_URL?.startsWith("https://"),
      type: typeof process.env.VIPERPAY_API_URL,
    },
    VIPERPAY_API_SECRET: {
      exists: !!process.env.VIPERPAY_API_SECRET,
      length: process.env.VIPERPAY_API_SECRET?.length || 0,
      prefix: process.env.VIPERPAY_API_SECRET?.substring(0, 10) || "N/A",
      startsWithSk: process.env.VIPERPAY_API_SECRET?.startsWith("sk_") || false,
      trimmed_length: process.env.VIPERPAY_API_SECRET?.trim().length || 0,
      type: typeof process.env.VIPERPAY_API_SECRET,
    },
    VIPERPAY_WEBHOOK_URL: {
      exists: !!process.env.VIPERPAY_WEBHOOK_URL,
      value: process.env.VIPERPAY_WEBHOOK_URL,
      type: typeof process.env.VIPERPAY_WEBHOOK_URL,
    },
    // Verificar se há espaços ou caracteres invisíveis
    raw_check: {
      api_url_raw: JSON.stringify(process.env.VIPERPAY_API_URL),
      api_secret_raw: JSON.stringify(process.env.VIPERPAY_API_SECRET?.substring(0, 20)),
    },
    // Verificar todas as variáveis que começam com VIPERPAY
    all_viperpay_vars: Object.keys(process.env)
      .filter((key) => key.startsWith("VIPERPAY"))
      .reduce(
        (acc, key) => {
          acc[key] = {
            exists: !!process.env[key],
            length: process.env[key]?.length || 0,
            value: key.includes("SECRET") ? process.env[key]?.substring(0, 10) + "..." : process.env[key],
          }
          return acc
        },
        {} as Record<string, any>,
      ),
  }

  console.log("🔍 Environment debug:", envDebug)

  return NextResponse.json(envDebug)
}
