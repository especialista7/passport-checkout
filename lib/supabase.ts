import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Cliente para operações do servidor (com service role key)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Cliente para operações do cliente (com anon key)
export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export interface TransactionItem {
  id: string
  title: string
  description: string
  price: number
  quantity: number
  is_physical: boolean
}

export interface CustomerAddress {
  cep: string
  city: string
  state: string
  number: string
  street: string
  complement?: string
  neighborhood: string
}

export interface ViperpPayCustomerResponse {
  email: string
  name: string
  phone?: string
  document?: string
  address?: CustomerAddress
}

export interface TransactionRecord {
  id?: string
  external_id: string
  viperpay_transaction_id?: string
  status: string
  total_amount: number
  total_value?: number // Valor retornado pela ViperpPay
  payment_method: string
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_document: string
  customer_document_type: string

  // Campos de endereço estruturados
  customer_cep?: string
  customer_city?: string
  customer_state?: string
  customer_street?: string
  customer_number?: string
  customer_complement?: string
  customer_neighborhood?: string

  // Campos JSONB para flexibilidade
  customer_address?: CustomerAddress
  items?: TransactionItem[]
  viperpay_customer?: ViperpPayCustomerResponse

  pix_payload?: string
  webhook_url?: string
  ip_address?: string
  has_error?: boolean
  created_at?: string
  updated_at?: string
}
