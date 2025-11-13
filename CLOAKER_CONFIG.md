# Configuração do Cloaker

## Como configurar o ID do Cloaker

1. Adicione a variável no seu arquivo `.env`:

```env
NEXT_PUBLIC_CLOAKER_TRACKING_ID=969-8f076e082dbcb1d080037ec2c216d589-15523
```

2. O ID completo do cloaker é composto por: `{stream_id}-{hash}-{campaign_id}`

Exemplo do arquivo PHP recebido:
```php
$curl = curl_init( "https://www.altercpa.one/fltr/969-8f076e082dbcb1d080037ec2c216d589-15523" );
```

Extraia apenas a parte final da URL: `969-8f076e082dbcb1d080037ec2c216d589-15523`

3. Se a variável não estiver definida, o sistema usa o ID padrão hardcoded no `middleware.ts`

## Ativar/Desativar Cloaker

```env
NEXT_PUBLIC_CLOAKER_TRACKING_ENABLED=true  # Ativar
NEXT_PUBLIC_CLOAKER_TRACKING_ENABLED=false # Desativar
```

## Testando

Após configurar, reinicie o servidor Next.js:
```bash
npm run dev
```

O middleware irá usar automaticamente o ID configurado no `.env`.
