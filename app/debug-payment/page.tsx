"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function DebugPaymentPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [envCheck, setEnvCheck] = useState<any>(null)
  const [formData, setFormData] = useState({
    fullName: "João Silva Santos",
    email: "joao@email.com",
    phone: "(11) 99999-9999",
    cpf: "111.444.777-35", // CPF válido usado no teste
  })

  const checkEnv = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/check-env")
      const data = await response.json()
      setEnvCheck(data)
    } catch (error) {
      console.error("Error checking env:", error)
    }
    setLoading(false)
  }

  const testWorkingPayload = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/debug-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          testMode: true,
        }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: error.message })
    }
    setLoading(false)
  }

  const debugPaymentVariations = async () => {
    setLoading(true)
    try {
      const customerData = {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        cpf: formData.cpf,
      }

      const response = await fetch("/api/debug-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerData,
          amount: 360.9,
          items: [
            {
              id: "passport-emission",
              title: "Emissão de Primeiro Passaporte",
              description: "Taxa para emissão de primeiro passaporte brasileiro",
              price: 360.9,
              quantity: 1,
            },
          ],
          testMode: false,
        }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: error.message })
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Debug Payment - ViperpPay</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => setFormData((prev) => ({ ...prev, cpf: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex gap-4 flex-wrap">
            <Button onClick={checkEnv} disabled={loading}>
              Verificar Env
            </Button>
            <Button onClick={testWorkingPayload} disabled={loading} variant="outline">
              Testar Payload que Funcionou
            </Button>
            <Button onClick={debugPaymentVariations} disabled={loading}>
              Testar Variações
            </Button>
          </div>

          {envCheck && (
            <div className="mt-4 p-4 bg-blue-50 rounded">
              <h3 className="font-bold mb-2">Environment Check:</h3>
              <pre className="text-sm overflow-auto">{JSON.stringify(envCheck, null, 2)}</pre>
            </div>
          )}

          {result && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <h3 className="font-bold mb-2">Debug Result:</h3>
              <div className="max-h-96 overflow-auto">
                {result.tests ? (
                  <div className="space-y-4">
                    {result.tests.map((test: any, index: number) => (
                      <div key={index} className={`p-3 rounded ${test.success ? "bg-green-50" : "bg-red-50"}`}>
                        <h4 className="font-semibold">{test.name}</h4>
                        <p className="text-sm">Status: {test.status}</p>
                        <p className="text-sm">Success: {test.success ? "✅" : "❌"}</p>
                        <details className="mt-2">
                          <summary className="cursor-pointer text-sm font-medium">Ver detalhes</summary>
                          <pre className="text-xs mt-2 overflow-auto">{JSON.stringify(test, null, 2)}</pre>
                        </details>
                      </div>
                    ))}
                  </div>
                ) : (
                  <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
