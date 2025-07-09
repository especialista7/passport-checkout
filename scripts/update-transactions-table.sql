-- Adicionar campos faltantes para enviar à ViperpPay
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS items JSONB;

-- Adicionar campos faltantes para receber da ViperpPay
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS total_value DECIMAL(10,2);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS has_error BOOLEAN DEFAULT FALSE;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS viperpay_customer JSONB;

-- Adicionar campos de endereço do cliente (estruturados)
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS customer_cep VARCHAR(10);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS customer_city VARCHAR(100);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS customer_state VARCHAR(2);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS customer_street VARCHAR(255);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS customer_number VARCHAR(20);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS customer_complement VARCHAR(100);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS customer_neighborhood VARCHAR(100);

-- Atualizar comentários da tabela
COMMENT ON COLUMN transactions.items IS 'Array de itens da transação conforme ViperpPay API';
COMMENT ON COLUMN transactions.total_value IS 'Valor total retornado pela ViperpPay (pode diferir do total_amount)';
COMMENT ON COLUMN transactions.has_error IS 'Campo hasError retornado pela ViperpPay';
COMMENT ON COLUMN transactions.viperpay_customer IS 'Dados completos do customer retornados pela ViperpPay';
COMMENT ON COLUMN transactions.customer_address IS 'Endereço completo do cliente (JSONB para flexibilidade)';
