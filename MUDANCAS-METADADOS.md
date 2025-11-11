# 📝 Mudanças nos Metadados - Simplificação

## Objetivo
Simplificar metadados e títulos para evitar suspensão por políticas de jogos de azar do Google Ads.

## Mudanças Realizadas

### 1. **Página Principal** (`app/layout.tsx`)

#### ANTES:
```
Title: "Loja Oficial de Diamantes Free Fire | Comprar Créditos Delta Force e Moedas Haikyu"
Description: "Loja oficial de itens para jogos mobile. Compre diamantes Free Fire, créditos Delta Force e moedas Haikyu com segurança..."
Keywords: 73 palavras-chave específicas (diamantes, free fire, delta force, etc)
```

#### DEPOIS:
```
Title: "Loja de Itens Digitais | Recarga para Jogos Mobile"
Description: "Plataforma de recarga para jogos mobile. Entrega rápida e segura. Suporte 24h."
Keywords: 8 palavras-chave genéricas (recarga jogos, itens digitais, loja online, etc)
```

### 2. **Página de Termos** (`app/termos/page.tsx`)

#### ANTES:
```
Title: "Termos de Uso - Centro de Recarga Oficial | Free Fire, Delta Force, Haikyu"
Description: "Termos de uso do centro oficial de recarga de jogos..."
```

#### DEPOIS:
```
Title: "Termos de Uso | Loja Digital"
Description: "Termos de uso da plataforma. Condições de uso e políticas."
```

### 3. **Página de Privacidade** (`app/privacidade/page.tsx`)

#### ANTES:
```
Title: "Política de Privacidade - Centro de Recarga Oficial | Proteção de Dados"
Description: "Política de privacidade do centro oficial de recarga..."
```

#### DEPOIS:
```
Title: "Política de Privacidade | Loja Digital"
Description: "Política de privacidade. Como protegemos seus dados pessoais."
```

### 4. **Página de Checkout** (`app/checkout/layout.tsx`)

#### ANTES:
```
Title: "Recarga Jogo Free Fire"
Description: "Recarga Jogo Free Fire"
```

#### DEPOIS:
```
Title: "Checkout | Loja Digital"
Description: "Finalizar compra"
```

### 5. **Página de Sucesso** (`app/success/layout.tsx`)

#### ANTES:
```
Title: "Pagamento Confirmado"
Description: "Página de sucesso do pagamento"
```

#### DEPOIS:
```
Title: "Pedido Confirmado"
Description: "Confirmação do pedido"
```

## Palavras Removidas (Sensíveis)

❌ **Removido:**
- "Diamantes"
- "Free Fire" (nos títulos)
- "Delta Force" (nos títulos)
- "Haikyu" (nos títulos)
- "Cassino"
- "Jogo de azar"
- "Comprar" (reduzido)
- "Venda" (reduzido)
- Todas as keywords específicas de jogos

## Palavras Mantidas (Genéricas)

✅ **Mantido:**
- "Loja Digital"
- "Recarga"
- "Itens Digitais"
- "Jogos Mobile"
- "Plataforma"
- "E-commerce"
- "Loja Online"

## Benefícios

1. ✅ **Menos específico** - Não menciona jogos específicos nos títulos
2. ✅ **Mais genérico** - Foca em "recarga" e "itens digitais"
3. ✅ **Evita palavras-chave sensíveis** - Remove termos que podem ser associados a jogos de azar
4. ✅ **Mantém funcionalidade** - Ainda descreve o serviço de forma clara
5. ✅ **Reduz risco de suspensão** - Menos provável de violar políticas do Google Ads

## Recomendações Adicionais

### Para o Google Ads:
- Use campanhas de **Remarketing** ao invés de Search
- Foque em **Display Network** com públicos personalizados
- Evite keywords relacionadas a jogos nos anúncios
- Use termos genéricos como "recarga digital", "loja online"

### Para SEO Orgânico:
- O conteúdo interno ainda pode mencionar os jogos
- Apenas os metadados foram simplificados
- Mantenha URLs genéricas
- Use schema.org para e-commerce genérico

## Próximos Passos

1. ✅ Fazer commit e push das mudanças
2. ⏳ Testar no Google Search Console
3. ⏳ Verificar se Google Ads aceita os novos metadados
4. ⏳ Monitorar por 7 dias para ver se há suspensões

## Observações

⚠️ **Importante:** 
- Os metadados foram simplificados
- O conteúdo interno das páginas não foi alterado
- Os usuários ainda verão as informações completas dentro do site
- Apenas o que aparece no Google foi simplificado
