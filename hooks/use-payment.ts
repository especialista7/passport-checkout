"use client"

import { useState } from "react"

interface CustomerData {
  name: string
  email: string
  phone: string
  cpf: string
}

interface PaymentItem {
  id?: string
  title?: string
  description?: string
  price: number
  quantity?: number
  is_physical?: boolean
}

interface PaymentResponse {
  success: boolean
  transaction?: {
    id: string
    external_id: string
    status: string
    total_value: number
    pix_payload: string
    payment_method: string
  }
  error?: string
}

export function usePayment() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createPayment = async (
    customerData: CustomerData,
    amount: number,
    items: PaymentItem[] = [],
  ): Promise<PaymentResponse | null> => {
    console.log("🚀 usePayment.createPayment called with REAL data:")
    console.log("- Customer:", customerData)
    console.log("- Amount:", amount, typeof amount)
    console.log("- Items:", items)

    setLoading(true)
    setError(null)

    try {
      // ✅ Preparar dados REAIS do cliente (sem alterações)
      const requestBody = {
        customerData: {
          name: customerData.name.trim(),
          email: customerData.email.trim().toLowerCase(),
          phone: customerData.phone.replace(/\D/g, ""), // Apenas números
          cpf: customerData.cpf.replace(/\D/g, ""), // Apenas números
        },
        amount: Number(amount),
        items:
          items.length > 0
            ? items.map((item) => ({
                id: item.id || "passport-service",
                title: item.title || "Emissão de Primeiro Passaporte",
                description: item.description || "Serviço de emissão de primeiro passaporte brasileiro",
                price: Number(item.price),
                quantity: Number(item.quantity || 1),
                is_physical: Boolean(item.is_physical || false),
              }))
            : [
                {
                  id: "passport-service",
                  title: "Emissão de Primeiro Passaporte",
                  description: "Serviço de emissão de primeiro passaporte brasileiro",
                  price: Number(amount),
                  quantity: 1,
                  is_physical: false,
                },
              ],
      }

      console.log("📤 Sending REAL request body:", JSON.stringify(requestBody, null, 2))

      const response = await fetch("/api/payments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      console.log("📥 Response received:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      })

      const data = await response.json()
      console.log("📥 Response data:", data)

      if (!response.ok) {
        console.error("❌ Request failed:", {
          status: response.status,
          data,
        })
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      console.log("✅ Payment created successfully with REAL data:", data)
      return data
    } catch (err) {
      console.error("❌ Error in createPayment:", err)
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  const checkPaymentStatus = async (transactionId: string) => {
    console.log("🔍 Checking payment status for:", transactionId)

    try {
      const response = await fetch(`/api/payments/status/${transactionId}`)
      const data = await response.json()

      console.log("📥 Payment status response:", data)

      if (!response.ok) {
        throw new Error(data.error || "Failed to check payment status")
      }

      return data.transaction
    } catch (err) {
      console.error("❌ Error checking payment status:", err)
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
      setError(errorMessage)
      return null
    }
  }

  return {
    createPayment,
    checkPaymentStatus,
    loading,
    error,
    clearError: () => setError(null),
  }
}
