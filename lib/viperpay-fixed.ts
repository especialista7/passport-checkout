import { supabaseAdmin, type TransactionRecord, type TransactionItem } from "./supabase"

interface ViperpPayCustomer {
  name: string
  email: string
  phone: string
  document_type: "CPF" | "CNPJ"
  document: string
}

interface ViperpPayItem {
  id: string
  title: string
  description: string
  price: number
  quantity: number
  is_physical: boolean
}

interface CreateTransactionRequest {
  external_id: string
  total_amount: number
  payment_method: "PIX"
  webhook_url: string
  items: ViperpPayItem[]
  ip: string
  customer: ViperpPayCustomer
}

interface ViperpPayTransaction {
  id: string
  external_id: string
  status: "AUTHORIZED" | "PENDING" | "CHARGEBACK" | "FAILED" | "IN_DISPUTE"
  total_value: number
  customer: {
    email: string
    name: string
    phone?: string
    document?: string
    address?: {
      cep: string
      city: string
      state: string
      number: string
      street: string
      complement?: string
      neighborhood: string
    }
  }
  payment_method: string
  pix: {
    payload: string
  }
  hasError: boolean
}

interface AccountInfo {
  email: string
  name: string
  document: string
}

class ViperpPayServiceFixed {
  private apiUrl: string
  private apiSecret: string

  constructor() {
    // 🔧 Debug completo das variáveis de ambiente
    console.log("🔧 ViperpPay Service initialization - Environment check:", {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
      all_env_keys: Object.keys(process.env).filter((k) => k.includes("VIPER")),
      VIPERPAY_API_URL_raw: JSON.stringify(process.env.VIPERPAY_API_URL),
      VIPERPAY_API_SECRET_exists: !!process.env.VIPERPAY_API_SECRET,
      VIPERPAY_API_SECRET_length: process.env.VIPERPAY_API_SECRET?.length,
    })

    // 🔧 Definir valores com fallbacks mais robustos
    this.apiUrl = this.getApiUrl()
    this.apiSecret = this.getApiSecret()

    console.log("✅ ViperpPay Service initialized:", {
      apiUrl: this.apiUrl,
      hasApiSecret: !!this.apiSecret,
      apiSecretLength: this.apiSecret.length,
      apiSecretPrefix: this.apiSecret.substring(0, 10) + "...",
    })
  }

  private getApiUrl(): string {
    // Tentar diferentes formas de obter a URL
    const candidates = [
      process.env.VIPERPAY_API_URL?.trim(),
      process.env.VIPERPAY_API_URL,
      "https://api.viperpay.com.br", // fallback
    ]

    for (const candidate of candidates) {
      if (candidate && candidate.startsWith("https://")) {
        console.log("✅ Using API URL:", candidate)
        return candidate.endsWith("/") ? candidate.slice(0, -1) : candidate
      }
    }

    // Se chegou aqui, usar o padrão
    console.log("⚠️ Using fallback API URL: https://api.viperpay.com.br")
    return "https://api.viperpay.com.br"
  }

  private getApiSecret(): string {
    const secret = process.env.VIPERPAY_API_SECRET?.trim() || ""

    if (!secret) {
      throw new Error("VIPERPAY_API_SECRET is required")
    }

    if (!secret.startsWith("sk_")) {
      throw new Error("VIPERPAY_API_SECRET must start with 'sk_'")
    }

    return secret
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!endpoint.startsWith("/")) {
      endpoint = "/" + endpoint
    }

    const fullUrl = this.apiUrl + endpoint

    console.log("🌐 Making ViperpPay API request:", {
      baseUrl: this.apiUrl,
      endpoint: endpoint,
      fullUrl: fullUrl,
      method: options.method || "GET",
    })

    const requestHeaders = {
      "Content-Type": "application/json",
      "api-secret": this.apiSecret,
      ...options.headers,
    }

    if (options.body) {
      console.log("📤 Request body:", options.body)
    }

    const response = await fetch(fullUrl, {
      ...options,
      headers: requestHeaders,
    })

    console.log("📥 Response received:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    })

    const responseText = await response.text()
    console.log("📥 Response body:", responseText)

    if (!response.ok) {
      throw new Error(`ViperpPay API Error: ${response.status} - ${responseText}`)
    }

    try {
      return JSON.parse(responseText)
    } catch (parseError) {
      console.error("❌ Failed to parse response JSON:", parseError)
      throw new Error(`Invalid JSON response: ${responseText}`)
    }
  }

  async getAccountInfo(): Promise<AccountInfo> {
    return this.makeRequest<AccountInfo>("/v1/account-info")
  }

  async createTransaction(data: CreateTransactionRequest): Promise<ViperpPayTransaction> {
    // Preparar registro completo para Supabase
    const transactionRecord: TransactionRecord = {
      external_id: data.external_id,
      status: "PENDING",
      total_amount: data.total_amount,
      payment_method: data.payment_method,
      customer_name: data.customer.name,
      customer_email: data.customer.email,
      customer_phone: data.customer.phone,
      customer_document: data.customer.document,
      customer_document_type: data.customer.document_type,
      items: data.items as TransactionItem[],
      webhook_url: data.webhook_url,
      ip_address: data.ip,
    }

    console.log("💾 Saving transaction to Supabase:", {
      external_id: transactionRecord.external_id,
      customer_name: transactionRecord.customer_name,
      total_amount: transactionRecord.total_amount,
    })

    const { error: insertError } = await supabaseAdmin.from("transactions").insert(transactionRecord)

    if (insertError) {
      console.error("❌ Error saving transaction to Supabase:", insertError)
      throw new Error(`Failed to save transaction: ${insertError.message}`)
    }

    console.log("✅ Transaction saved to Supabase successfully")

    // Criar payload para ViperpPay
    const viperpayPayload = {
      external_id: data.external_id,
      total_amount: data.total_amount,
      payment_method: data.payment_method,
      webhook_url: data.webhook_url,
      items: data.items,
      ip: data.ip,
      customer: {
        name: data.customer.name,
        email: data.customer.email,
        phone: data.customer.phone,
        document_type: data.customer.document_type,
        document: data.customer.document,
      },
    }

    console.log("📤 Final payload to ViperpPay:", JSON.stringify(viperpayPayload, null, 2))

    // Criar transação na ViperpPay
    const viperpayTransaction = await this.makeRequest<ViperpPayTransaction>("/v1/transactions", {
      method: "POST",
      body: JSON.stringify(viperpayPayload),
    })

    console.log("✅ ViperpPay transaction created successfully:", {
      id: viperpayTransaction.id,
      status: viperpayTransaction.status,
      total_value: viperpayTransaction.total_value,
    })

    // Atualizar registro no Supabase
    const { error: updateError } = await supabaseAdmin
      .from("transactions")
      .update({
        viperpay_transaction_id: viperpayTransaction.id,
        status: viperpayTransaction.status,
        total_value: viperpayTransaction.total_value,
        has_error: viperpayTransaction.hasError,
        pix_payload: viperpayTransaction.pix.payload,
        viperpay_customer: viperpayTransaction.customer,
      })
      .eq("external_id", data.external_id)

    if (updateError) {
      console.error("❌ Error updating transaction in Supabase:", updateError)
    } else {
      console.log("✅ Transaction updated in Supabase with ViperpPay response")
    }

    return viperpayTransaction
  }

  async getTransaction(transactionId: string): Promise<ViperpPayTransaction> {
    return this.makeRequest<ViperpPayTransaction>(`/v1/transactions/${transactionId}`)
  }

  async updateTransactionStatus(transactionId: string, status: string): Promise<void> {
    console.log(`🔄 Updating transaction ${transactionId} status to ${status}`)

    const { error } = await supabaseAdmin
      .from("transactions")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("viperpay_transaction_id", transactionId)

    if (error) {
      console.error("❌ Error updating transaction status in Supabase:", error)
      throw new Error("Failed to update transaction status")
    }

    console.log(`✅ Transaction ${transactionId} status updated to ${status}`)
  }
}

export { ViperpPayServiceFixed, type ViperpPayTransaction, type CreateTransactionRequest }
