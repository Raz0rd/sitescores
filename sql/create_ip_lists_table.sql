-- Tabela para armazenar IPs whitelist e blacklist do cloaker
CREATE TABLE IF NOT EXISTS cloaker (
  id BIGSERIAL PRIMARY KEY,
  ip VARCHAR(45) NOT NULL,
  user_agent TEXT NOT NULL,
  list_type VARCHAR(20) NOT NULL CHECK (list_type IN ('whitelist', 'blacklist')),
  bearer_token VARCHAR(64),
  source VARCHAR(50) DEFAULT 'cloaker',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  -- Índice único para evitar duplicatas
  UNIQUE(ip, list_type)
);

-- Índices para buscas rápidas
CREATE INDEX IF NOT EXISTS idx_cloaker_ip ON cloaker(ip);
CREATE INDEX IF NOT EXISTS idx_cloaker_list_type ON cloaker(list_type);
CREATE INDEX IF NOT EXISTS idx_cloaker_expires_at ON cloaker(expires_at);
CREATE INDEX IF NOT EXISTS idx_cloaker_created_at ON cloaker(created_at DESC);

-- Comentários
COMMENT ON TABLE cloaker IS 'Armazena IPs whitelist e blacklist para o cloaker privado';
COMMENT ON COLUMN cloaker.ip IS 'Endereço IP do visitante';
COMMENT ON COLUMN cloaker.user_agent IS 'User-Agent do navegador';
COMMENT ON COLUMN cloaker.list_type IS 'Tipo da lista: whitelist ou blacklist';
COMMENT ON COLUMN cloaker.bearer_token IS 'Token bearer gerado para o IP (apenas whitelist)';
COMMENT ON COLUMN cloaker.source IS 'Origem do registro: cloaker, manual, keyword';
COMMENT ON COLUMN cloaker.expires_at IS 'Data de expiração (apenas whitelist)';

-- Habilitar RLS (Row Level Security)
ALTER TABLE cloaker ENABLE ROW LEVEL SECURITY;

-- Política para permitir todas as operações com service key
CREATE POLICY "Allow all operations with service key" ON cloaker
  FOR ALL
  USING (true)
  WITH CHECK (true);
