"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function TestGradualPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [formData, setFormData] = useState({
    fullName: "João Silva Santos",
    email: "joao@email.com",
    phone: "(11) 99999-9999",
    cpf: "111.444.777-35",
  })

  const runGradualTest = async () => {
    setLoading(true)
    try {
      const customerData = {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        cpf: formData.cpf,
      }

      const response = await fetch("/api/test-gradual", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerData,
          amount: 360.9,
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
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Teste Gradual - Identificar Campo Problemático</CardTitle>
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

          <Button onClick={runGradualTest} disabled={loading}>
            {loading ? "Testando..." : "🧪 Executar Teste Gradual"}
          </Button>

          {result && (
            <div className="space-y-4">
              {result.error ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded">
                  <h3 className="font-bold text-red-800">❌ Erro</h3>
                  <p className="text-red-700">{result.error}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Resumo */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                    <h3 className="font-bold text-blue-800 mb-2">📊 Resumo dos Testes</h3>
                    <div className="text-sm space-y-1">
                      <p>Total de testes: {result.summary?.total_tests}</p>
                      <p className="text-green-600">✅ Sucessos: {result.summary?.successful}</p>
                      <p className="text-red-600">❌ Falhas: {result.summary?.failed}</p>
                    </div>
                  </div>

                  {/* Resultados individuais */}
                  <div className="space-y-4">
                    {result.results?.map((test: any, index: number) => (
                      <div
                        key={index}
                        className={`p-4 border rounded ${
                          test.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                        }`}
                      >
                        <h4 className="font-semibold mb-2">
                          {test.success ? "✅" : "❌"} {test.name}
                        </h4>
                        <div className="text-sm space-y-1">
                          <p>Status: {test.status}</p>
                          {test.error && <p className="text-red-600">Error: {test.error}</p>}
                        </div>
                        <details className="mt-2">
                          <summary className="cursor-pointer text-sm font-medium">Ver resposta</summary>
                          <pre className="text-xs mt-2 overflow-auto bg-white p-2 rounded border max-h-32">
                            {test.response || test.error}
                          </pre>
                        </details>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
