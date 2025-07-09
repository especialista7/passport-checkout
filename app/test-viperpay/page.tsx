"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestViperpayPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testAuth = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-viperpay", { method: "GET" })
      const data = await response.json()
      setResult({ type: "auth", data })
    } catch (error) {
      setResult({ type: "error", error: error.message })
    }
    setLoading(false)
  }

  const testTransaction = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-viperpay", { method: "POST" })
      const data = await response.json()
      setResult({ type: "transaction", data })
    } catch (error) {
      setResult({ type: "error", error: error.message })
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Teste ViperpPay</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={testAuth} disabled={loading}>
              Testar Autenticação
            </Button>
            <Button onClick={testTransaction} disabled={loading}>
              Testar Transação
            </Button>
          </div>

          {result && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <h3 className="font-bold mb-2">Resultado:</h3>
              <pre className="text-sm overflow-auto">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
