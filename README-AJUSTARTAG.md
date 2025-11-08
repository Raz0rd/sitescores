# 🎯 Script para Ajustar Tags do Google Ads

## 📋 Como usar

### 1️⃣ **Instalação no servidor Ubuntu (RECOMENDADO):**

```bash
# Fazer upload dos scripts
scp ajustartag.sh instalar-ajustartag.sh root@seu-servidor:/root/

# Conectar no servidor
ssh root@seu-servidor

# Instalar no PATH
sudo bash instalar-ajustartag.sh

# Recarregar PATH
source ~/.bashrc

# Agora pode usar de qualquer lugar!
ajustartag
```

### 2️⃣ **Uso manual (sem instalar):**

```bash
# Fazer upload do script
scp ajustartag.sh root@seu-servidor:/root/

# Conectar no servidor
ssh root@seu-servidor

# Dar permissão de execução
chmod +x /root/ajustartag.sh

# Executar
bash /root/ajustartag.sh
```

### 3️⃣ **O script vai pedir:**

1. **Domínio** (ex: `exemplo.com`)
2. **Google Ads ID** (ex: `AW-17703595002`)
3. **Conversion Label** (ex: `PvJCCLXTirobEPrX3flB`)

### 4️⃣ **O que o script faz automaticamente:**

✅ Detecta o diretório do projeto  
✅ Atualiza o `.env.production`  
✅ Faz o build do Next.js  
✅ Detecta o processo PM2  
✅ Reinicia o PM2  
✅ Mostra o status final  

---

## 🚀 **Exemplo de uso:**

```bash
root@servidor:~# bash ajustartag.sh

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 AJUSTAR TAGS DO GOOGLE ADS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌐 Digite o domínio (ex: exemplo.com): free-firesite.shop
📊 Digite o Google Ads ID (ex: AW-17703595002): AW-12345678901
🎯 Digite a Conversion Label (ex: PvJCCLXTirobEPrX3flB): AbCdEfGhIjKl

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 CONFIRMAÇÃO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Domínio: free-firesite.shop
   Google Ads ID: AW-12345678901
   Conversion Label: AbCdEfGhIjKl

Continuar? (s/N): s

✅ Projeto encontrado: /var/www/free-firesite-shop
📝 Atualizando .env.production...
✅ .env.production atualizado

🔨 Fazendo build do projeto...
✅ Build concluído

🔍 Detectando processo PM2...
🔄 Reiniciando PM2: free-firesite-shop...
✅ PM2 reiniciado

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ TAGS ATUALIZADAS COM SUCESSO!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🔧 **Comandos úteis:**

```bash
# Ver logs do PM2
sudo pm2 logs nome-do-projeto

# Ver status de todos os projetos
sudo pm2 status

# Reiniciar manualmente
sudo pm2 restart nome-do-projeto
```

---

## ⚠️ **Requisitos:**

- ✅ Node.js instalado
- ✅ PM2 instalado
- ✅ Projeto Next.js com `.env.production`
- ✅ Permissões de root/sudo

---

## 📝 **Variáveis que serão atualizadas:**

```env
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-17703595002
NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL=PvJCCLXTirobEPrX3flB
```

**Pronto para usar!** 🚀
