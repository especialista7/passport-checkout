"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, Copy, CheckCircle, Clock, QrCode, Mail } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

export default function PagamentoPIXPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [copied, setCopied] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [timeLeft, setTimeLeft] = useState(15 * 60) // 15 minutos em segundos
  const [transactionData, setTransactionData] = useState({
    transactionId: "",
    pixPayload: "",
    amount: 0,
  })

  // Usar useRef para controlar se já foi inicializado
  const initialized = useRef(false)

  // Carregar dados da URL apenas uma vez
  useEffect(() => {
    if (initialized.current) return

    console.log("🔄 Initializing PIX payment page...")

    const transactionId = searchParams.get("transactionId") || ""
    const pixPayload = searchParams.get("pixPayload") || ""
    const amount = Number.parseFloat(searchParams.get("amount") || "360.90")

    console.log("📋 Transaction data loaded:", {
      transactionId,
      pixPayload: pixPayload ? "Present" : "Missing",
      amount,
    })

    setTransactionData({
      transactionId,
      pixPayload,
      amount,
    })

    initialized.current = true
    console.log("✅ PIX payment page initialized")
  }, [])

  // Timer countdown - apenas para exibição
  useEffect(() => {
    if (timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          console.log("⏰ Payment timer expired")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const copyToClipboard = async () => {
    if (!transactionData.pixPayload) {
      console.log("❌ No PIX payload to copy")
      return
    }

    try {
      await navigator.clipboard.writeText(transactionData.pixPayload)
      setCopied(true)
      console.log("✅ PIX code copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("❌ Error copying to clipboard:", err)
    }
  }

  const getQRCodeUrl = (pixPayload: string) => {
    if (!pixPayload) {
      console.log("❌ No PIX payload for QR code")
      return "/placeholder.svg?height=240&width=240&text=QR+Code+PIX"
    }

    const encodedPayload = encodeURIComponent(pixPayload)
    return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodedPayload}`
  }

  const handleManualConfirmation = () => {
    console.log("👆 Manual confirmation clicked")
    setShowConfirmation(true)
  }

  const handleFinish = () => {
    console.log("🏁 Finishing payment flow")
    setShowConfirmation(false)
    router.push("/")
  }

  // Loading state
  if (!initialized.current || !transactionData.transactionId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando dados do pagamento...</p>
        </div>
      </div>
    )
  }

  const pixCode =
    transactionData.pixPayload ||
    "00020126580014br.gov.bcb.pix013636c4c14c-4d64-4f2a-8b5a-1234567890ab5204000053039865802BR5925MINISTERIO DAS RELACOES6009BRASILIA62070503***6304A1B2"

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <div className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-bold">MP</div>
          <span className="text-lg">
            Meu <span className="text-orange-500 font-semibold">Passaporte</span>
          </span>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Pagamento via PIX</h1>
          <p className="text-gray-600">Escaneie o QR Code ou copie o código PIX</p>
        </div>

        {/* Timer */}
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-2 text-orange-700">
              <Clock className="w-5 h-5" />
              <span className="font-semibold">Tempo restante: {timeLeft > 0 ? formatTime(timeLeft) : "Expirado"}</span>
            </div>
            <p className="text-center text-sm text-orange-600 mt-2">
              {timeLeft > 0 ? "O código PIX expira em 15 minutos" : "O código PIX expirou"}
            </p>
          </CardContent>
        </Card>

        {/* Payment Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center text-gray-800">Detalhes do Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">Emissão de Primeiro Passaporte</p>
              <p className="text-3xl font-bold text-green-600">
                R$ {transactionData.amount.toFixed(2).replace(".", ",")}
              </p>
              <p className="text-sm text-gray-500">Pagamento via PIX</p>
            </div>
          </CardContent>
        </Card>

        {/* QR Code */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <QrCode className="w-5 h-5" />
              QR Code PIX
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-4">
              <div className="w-64 h-64 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center">
                <img
                  src={getQRCodeUrl(transactionData.pixPayload) || "/placeholder.svg"}
                  alt="QR Code PIX"
                  className="w-60 h-60"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    console.log("❌ QR Code image failed to load")
                    e.currentTarget.src = "/placeholder.svg?height=240&width=240&text=QR+Code+PIX"
                  }}
                />
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">Abra o app do seu banco e escaneie o código</p>
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Pagamento instantâneo</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PIX Code */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Código PIX - Copia e Cola</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-gray-100 p-3 rounded-lg border">
                <p className="text-xs font-mono break-all text-gray-700">{pixCode}</p>
              </div>
              <Button
                onClick={copyToClipboard}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={copied || !transactionData.pixPayload}
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Código Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Código PIX
                  </>
                )}
              </Button>
              <p className="text-sm text-gray-600 text-center">Cole este código no seu app de pagamentos</p>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Como pagar com PIX</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 text-sm text-blue-700">
              <li className="flex gap-2">
                <span className="font-bold">1.</span>
                <span>Abra o aplicativo do seu banco</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">2.</span>
                <span>Escolha a opção PIX</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">3.</span>
                <span>Escaneie o QR Code ou cole o código PIX</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">4.</span>
                <span>Confirme o pagamento de R$ {transactionData.amount.toFixed(2).replace(".", ",")}</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">5.</span>
                <span>Após o pagamento, clique em "Confirmar Pagamento" abaixo</span>
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4">
          <Button variant="ghost" className="flex items-center gap-2" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <Button className="bg-green-600 hover:bg-green-700 px-8" onClick={handleManualConfirmation}>
            Confirmar Pagamento
          </Button>
        </div>

        {/* Help */}
        <div className="text-center mt-6 text-sm text-gray-500">
          Problemas com o pagamento?{" "}
          <a href="#" className="text-blue-600 underline">
            Entre em contato
          </a>
        </div>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-6 h-6" />
                Pagamento Confirmado!
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <Mail className="w-8 h-8 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Confirmação por Email</p>
                  <p className="text-sm text-green-700">
                    A confirmação do seu agendamento chegará em até <strong>72 horas</strong> na caixa do email
                    cadastrado.
                  </p>
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>Emissão de Primeiro Passaporte</strong>
                </p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {transactionData.amount.toFixed(2).replace(".", ",")}
                </p>
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleFinish}>
                Finalizar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
