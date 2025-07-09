"use client"

import { useState } from "react"
import { CheckCircle, Clock, AlertCircle, XCircle, RefreshCw } from "lucide-react"
import { usePayment } from "@/hooks/use-payment"

interface TransactionStatusProps {
  transactionId: string
  onStatusChange?: (status: string) => void
}

export function TransactionStatus({ transactionId, onStatusChange }: TransactionStatusProps) {
  const { checkPaymentStatus } = usePayment()
  const [status, setStatus] = useState<string>("PENDING")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)

  const checkStatusManually = async () => {
    if (!transactionId) {
      console.log("❌ No transaction ID provided")
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log("🔍 Manual status check for:", transactionId)
      const transaction = await checkPaymentStatus(transactionId)

      if (transaction) {
        console.log("✅ Manual status check successful:", transaction.status)
        const newStatus = transaction.status

        setStatus(newStatus)
        setLastCheck(new Date())

        // Notificar mudança de status
        if (onStatusChange) {
          onStatusChange(newStatus)
        }
      } else {
        console.log("❌ No transaction data received")
        setError("Erro ao verificar status do pagamento")
      }
    } catch (err) {
      console.error("❌ Error checking status:", err)
      setError("Erro na verificação do status")
    } finally {
      setLoading(false)
    }
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "AUTHORIZED":
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          text: "Pagamento Aprovado",
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
        }
      case "PENDING":
        return {
          icon: <Clock className="w-5 h-5 text-yellow-600" />,
          text: "Aguardando Pagamento",
          color: "text-yellow-600",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
        }
      case "FAILED":
        return {
          icon: <XCircle className="w-5 h-5 text-red-600" />,
          text: "Pagamento Falhou",
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
        }
      default:
        return {
          icon: <AlertCircle className="w-5 h-5 text-gray-600" />,
          text: "Status Desconhecido",
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
        }
    }
  }

  const statusInfo = getStatusInfo(status)

  return (
    <div className={`p-4 rounded-lg border ${statusInfo.bgColor} ${statusInfo.borderColor} mb-6`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {loading ? (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          ) : (
            statusInfo.icon
          )}
          <span className={`font-medium ${statusInfo.color}`}>{statusInfo.text}</span>
        </div>

        {/* Botão para verificar manualmente */}
        <button
          onClick={checkStatusManually}
          disabled={loading}
          className="flex items-center gap-1 px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Verificando..." : "Atualizar"}
        </button>
      </div>

      {/* Mostrar timestamp da última verificação */}
      {lastCheck && !loading && (
        <p className="text-xs text-gray-500 mt-2">Última verificação: {lastCheck.toLocaleTimeString()}</p>
      )}

      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline hover:no-underline">
            Limpar erro
          </button>
        </div>
      )}

      {status === "PENDING" && !error && (
        <div className="mt-2">
          <p className="text-sm text-gray-600">Clique em "Atualizar" para verificar se o pagamento foi processado.</p>
        </div>
      )}

      {status === "AUTHORIZED" && (
        <p className="text-sm text-green-700 mt-2">🎉 Pagamento confirmado! Você pode prosseguir.</p>
      )}
    </div>
  )
}
