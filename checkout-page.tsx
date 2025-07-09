"use client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, CreditCard, User } from "lucide-react"
import { usePayment } from "@/hooks/use-payment"
import { useState } from "react"
import {
  validateEmail,
  validatePhone,
  validateDocument,
  formatCPF,
  formatCNPJ,
  formatPhone,
  getDocumentType,
} from "@/lib/validators"

export default function CheckoutPage() {
  const router = useRouter()
  const { createPayment, loading, error } = usePayment()
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    cpf: "",
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // ✅ VALOR REAL DO PRODUTO
  const PRODUCT_PRICE = 360.9

  const validateForm = () => {
    const errors: Record<string, string> = {}

    // Validação de nome
    if (!formData.fullName.trim()) {
      errors.fullName = "Nome completo é obrigatório"
    } else if (formData.fullName.trim().length < 2) {
      errors.fullName = "Nome deve ter pelo menos 2 caracteres"
    } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(formData.fullName.trim())) {
      errors.fullName = "Nome deve conter apenas letras e espaços"
    }

    // Validação de email
    if (!formData.email.trim()) {
      errors.email = "Email é obrigatório"
    } else if (!validateEmail(formData.email)) {
      errors.email = "Email inválido"
    }

    // Validação de telefone
    if (!formData.phone.trim()) {
      errors.phone = "Telefone é obrigatório"
    } else if (!validatePhone(formData.phone)) {
      errors.phone = "Telefone inválido. Use formato: (11) 99999-9999"
    }

    // Validação de CPF/CNPJ
    if (!formData.cpf.trim()) {
      errors.cpf = "CPF/CNPJ é obrigatório"
    } else if (!validateDocument(formData.cpf)) {
      errors.cpf = "CPF/CNPJ inválido"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value

    // Aplicar formatação em tempo real
    switch (field) {
      case "cpf":
        const cleanDoc = value.replace(/\D/g, "")
        if (cleanDoc.length <= 11) {
          formattedValue = formatCPF(value)
        } else {
          formattedValue = formatCNPJ(value)
        }
        break
      case "phone":
        formattedValue = formatPhone(value)
        break
      case "fullName":
        // Capitalizar primeira letra de cada palavra
        formattedValue = value.replace(/\b\w/g, (l) => l.toUpperCase())
        break
    }

    setFormData((prev) => ({ ...prev, [field]: formattedValue }))

    // Limpar erro do campo quando usuário começar a digitar
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handlePayment = async () => {
    console.log("🎯 handlePayment called with REAL form data")
    console.log("📋 Form data:", formData)
    console.log("💰 Product price:", PRODUCT_PRICE)

    if (!validateForm()) {
      console.log("❌ Form validation failed:", formErrors)
      return
    }

    console.log("✅ Form validation passed")

    // ✅ Preparar dados REAIS do cliente (sem dados de teste)
    const customerData = {
      name: formData.fullName.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone, // Manter formatação para validação
      cpf: formData.cpf, // Manter formatação para validação
      document_type: getDocumentType(formData.cpf),
    }

    console.log("👤 REAL Customer data prepared:", customerData)

    // ✅ Items com valor REAL
    const paymentItems = [
      {
        id: "passport-emission",
        title: "Emissão de Primeiro Passaporte",
        description: "Taxa para emissão de primeiro passaporte brasileiro",
        price: PRODUCT_PRICE, // ✅ USAR VALOR REAL
        quantity: 1,
        is_physical: false,
      },
    ]

    console.log("📦 REAL Payment items:", paymentItems)

    try {
      console.log("🚀 Calling createPayment with REAL data...")
      console.log("- Customer:", customerData.name, customerData.email)
      console.log("- Amount:", PRODUCT_PRICE)
      console.log("- CPF:", customerData.cpf)

      // ✅ Passar dados REAIS para a API
      const paymentData = await createPayment(customerData, PRODUCT_PRICE, paymentItems)

      console.log("📥 Payment response received:", paymentData)

      if (paymentData?.success && paymentData.transaction) {
        console.log("✅ Payment successful with REAL data, redirecting...")
        console.log("💰 Transaction amount:", paymentData.transaction.total_value)

        // Redirecionar para página de pagamento PIX com os dados da transação
        const params = new URLSearchParams({
          transactionId: paymentData.transaction.id,
          pixPayload: paymentData.transaction.pix_payload,
          amount: paymentData.transaction.total_value.toString(),
        })
        router.push(`/pagamento-pix?${params.toString()}`)
      } else {
        console.log("❌ Payment failed or invalid response:", paymentData)
      }
    } catch (err) {
      console.error("❌ Error in handlePayment:", err)
    }
  }

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
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Checkout - Emissão de Passaporte</h1>
          <p className="text-gray-600">Complete suas informações para finalizar</p>
        </div>

        {/* Order Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-orange-500 text-lg">Resumo do Pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-blue-700 font-medium">Emissão de Primeiro Passaporte</h3>
                  <p className="text-sm text-gray-600">Quantidade: 1</p>
                </div>
                <span className="text-blue-700 font-bold">R$ {PRODUCT_PRICE.toFixed(2).replace(".", ",")}</span>
              </div>
            </div>
            <div className="flex justify-between items-center font-bold text-lg">
              <span>Total:</span>
              <span>R$ {PRODUCT_PRICE.toFixed(2).replace(".", ",")}</span>
            </div>
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <User className="w-5 h-5" />
              Informações do Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Nome Completo *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  placeholder="João Silva Santos"
                  className={`mt-1 ${formErrors.fullName ? "border-red-500" : ""}`}
                  maxLength={100}
                />
                {formErrors.fullName && <p className="text-red-500 text-sm mt-1">{formErrors.fullName}</p>}
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="joao@email.com"
                  className={`mt-1 ${formErrors.email ? "border-red-500" : ""}`}
                  maxLength={100}
                />
                {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="(11) 99999-9999"
                  className={`mt-1 ${formErrors.phone ? "border-red-500" : ""}`}
                  maxLength={15}
                />
                {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
              </div>
              <div>
                <Label htmlFor="cpf">CPF/CNPJ *</Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => handleInputChange("cpf", e.target.value)}
                  placeholder="000.000.000-00"
                  className={`mt-1 ${formErrors.cpf ? "border-red-500" : ""}`}
                  maxLength={18}
                />
                {formErrors.cpf && <p className="text-red-500 text-sm mt-1">{formErrors.cpf}</p>}
              </div>
            </div>
            <p className="text-sm text-blue-600">* Campos obrigatórios</p>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-orange-500">Forma de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-teal-200 bg-teal-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-teal-600 rounded flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-teal-800">PIX</h3>
                    <p className="text-sm text-teal-700">Pagamento instantâneo e seguro</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-teal-800">R$ {PRODUCT_PRICE.toFixed(2).replace(".", ",")}</div>
                  <div className="text-sm text-teal-600">Aprovação imediata</div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-4 h-4 bg-teal-600 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="text-sm text-teal-700">
                  PIX selecionado automaticamente - A forma mais rápida e segura de pagar
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4">
          <Button variant="ghost" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <Button className="bg-teal-600 hover:bg-teal-700 px-8" onClick={handlePayment} disabled={loading}>
            {loading ? "Processando..." : "Pagar com PIX"}
          </Button>
        </div>

        {/* Terms */}
        <div className="text-center mt-6 text-sm text-gray-500">
          Ao prosseguir você concorda com os termos do nosso{" "}
          <a href="#" className="text-blue-600 underline">
            Contrato de Serviço
          </a>{" "}
          e{" "}
          <a href="#" className="text-blue-600 underline">
            Privacidade
          </a>
        </div>
      </div>
    </div>
  )
}
