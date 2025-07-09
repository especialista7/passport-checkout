"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function DebugEnvPage() {
  const [loading, setLoading] = useState(false)
  const [envData, setEnvData] = useState<any>(null)

  const checkEnv = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/debug-env")
      const data = await response.json()
      setEnvData(data)
    } catch (error) {
      setEnvData({ error: error.message })
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔍 Debug Environment Variables
            <Badge variant="outline">{typeof window !== "undefined" ? "Client" : "Server"}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={checkEnv} disabled={loading}>
            {loading ? "Verificando..." : "Verificar Variáveis de Ambiente"}
          </Button>

          {envData && (
            <div className="space-y-4">
              {envData.error ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded">
                  <h3 className="font-bold text-red-800">❌ Erro</h3>
                  <p className="text-red-700">{envData.error}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* NODE_ENV */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                    <h3 className="font-bold text-blue-800">🌍 Environment</h3>
                    <p className="text-blue-700">NODE_ENV: {envData.NODE_ENV}</p>
                  </div>

                  {/* VIPERPAY_API_URL */}
                  <div
                    className={`p-4 border rounded ${
                      envData.VIPERPAY_API_URL.exists && envData.VIPERPAY_API_URL.startsWithHttps
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <h3
                      className={`font-bold ${
                        envData.VIPERPAY_API_URL.exists && envData.VIPERPAY_API_URL.startsWithHttps
                          ? "text-green-800"
                          : "text-red-800"
                      }`}
                    >
                      🔗 VIPERPAY_API_URL
                    </h3>
                    <div className="text-sm space-y-1">
                      <p>Exists: {envData.VIPERPAY_API_URL.exists ? "✅" : "❌"}</p>
                      <p>Value: {envData.VIPERPAY_API_URL.value || "N/A"}</p>
                      <p>Length: {envData.VIPERPAY_API_URL.length}</p>
                      <p>Starts with https: {envData.VIPERPAY_API_URL.startsWithHttps ? "✅" : "❌"}</p>
                      <p>Trimmed: {envData.VIPERPAY_API_URL.trimmed || "N/A"}</p>
                    </div>
                  </div>

                  {/* VIPERPAY_API_SECRET */}
                  <div
                    className={`p-4 border rounded ${
                      envData.VIPERPAY_API_SECRET.exists && envData.VIPERPAY_API_SECRET.startsWithSk
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <h3
                      className={`font-bold ${
                        envData.VIPERPAY_API_SECRET.exists && envData.VIPERPAY_API_SECRET.startsWithSk
                          ? "text-green-800"
                          : "text-red-800"
                      }`}
                    >
                      🔑 VIPERPAY_API_SECRET
                    </h3>
                    <div className="text-sm space-y-1">
                      <p>Exists: {envData.VIPERPAY_API_SECRET.exists ? "✅" : "❌"}</p>
                      <p>Length: {envData.VIPERPAY_API_SECRET.length}</p>
                      <p>Trimmed Length: {envData.VIPERPAY_API_SECRET.trimmed_length}</p>
                      <p>Prefix: {envData.VIPERPAY_API_SECRET.prefix}</p>
                      <p>Starts with sk_: {envData.VIPERPAY_API_SECRET.startsWithSk ? "✅" : "❌"}</p>
                    </div>
                  </div>

                  {/* Raw Check */}
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded">
                    <h3 className="font-bold text-gray-800">🔍 Raw Values (JSON)</h3>
                    <div className="text-xs font-mono space-y-1">
                      <p>API URL: {envData.raw_check.api_url_raw}</p>
                      <p>API Secret (first 20 chars): {envData.raw_check.api_secret_raw}</p>
                    </div>
                  </div>

                  {/* Full Debug */}
                  <details className="p-4 bg-gray-50 border border-gray-200 rounded">
                    <summary className="cursor-pointer font-bold">Ver dados completos</summary>
                    <pre className="text-xs mt-2 overflow-auto">{JSON.stringify(envData, null, 2)}</pre>
                  </details>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
