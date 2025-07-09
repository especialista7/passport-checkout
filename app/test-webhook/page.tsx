"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function TestWebhookPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [currentUrl, setCurrentUrl] = useState("")

  useEffect(() => {
    setCurrentUrl(window.location.origin)
  }, [])

  const testWebhook = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-webhook", { method: "GET" })
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: error.message })
    }
    setLoading(false)
  }

  const testWebhookPost = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          test: true,
          message: "Testing webhook POST",
        }),
      })
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: error.message })
    }
    setLoading(false)
  }

  const isLocalhost = currentUrl.includes("localhost")
  const webhookUrl = `${currentUrl}/api/webhooks/viperpay`

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Teste Webhook ViperpPay
            <Badge variant={isLocalhost ? "secondary" : "default"}>
              {isLocalhost ? "Desenvolvimento" : "Produção"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLocalhost && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
              <h3 className="font-semibold text-yellow-800">⚠️ Ambiente de Desenvolvimento</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Você está testando localmente. Para testar o webhook completamente, faça o deploy para produção.
              </p>
            </div>
          )}

          <div className="flex gap-4">
            <Button onClick={testWebhook} disabled={loading}>
              Testar Conectividade
            </Button>
            <Button onClick={testWebhookPost} disabled={loading} variant="outline">
              Testar Recebimento
            </Button>
          </div>

          {result && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <h3 className="font-bold mb-2">Resultado:</h3>
              <div className="space-y-2">
                {result.success && (
                  <div className="flex items-center gap-2">
                    <Badge variant="default">✅ Sucesso</Badge>
                    <span className="text-sm">{result.message}</span>
                  </div>
                )}
                {!result.success && (
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">❌ Erro</Badge>
                    <span className="text-sm">{result.error}</span>
                  </div>
                )}
              </div>
              <details className="mt-4">
                <summary className="cursor-pointer font-medium">Ver detalhes técnicos</summary>
                <pre className="text-xs mt-2 overflow-auto bg-white p-2 rounded border">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </div>
          )}

          <div className="mt-6 space-y-4">
            <div className="p-4 bg-blue-50 rounded">
              <h3 className="font-bold mb-2">🔗 URL do Webhook Atual:</h3>
              <code className="text-sm bg-white p-2 rounded border block">{webhookUrl}</code>
            </div>

            <div className="p-4 bg-green-50 rounded">
              <h3 className="font-bold mb-2">📋 Como configurar na ViperpPay:</h3>
              <ol className="text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <span className="font-bold">1.</span>
                  <span>Acesse o painel da ViperpPay</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">2.</span>
                  <span>
                    Vá em <strong>Configurações → Webhooks</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">3.</span>
                  <span>
                    Adicione a URL: <code className="bg-white px-1 rounded">{webhookUrl}</code>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">4.</span>
                  <span>
                    Selecione os eventos: <strong>AUTHORIZED, FAILED, CHARGEBACK, PENDING</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">5.</span>
                  <span>Salve as configurações</span>
                </li>
              </ol>
            </div>

            {!isLocalhost && (
              <div className="p-4 bg-purple-50 rounded">
                <h3 className="font-bold mb-2">🧪 Teste Manual do Webhook:</h3>
                <p className="text-sm mb-2">Você pode testar manualmente enviando uma requisição POST para:</p>
                <code className="text-xs bg-white p-2 rounded border block">
                  curl -X POST {webhookUrl} \<br />
                  &nbsp;&nbsp;-H "Content-Type: application/json" \<br />
                  &nbsp;&nbsp;-d '{`{"id":"test","status":"AUTHORIZED","external_id":"test-123"}`}'
                </code>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
