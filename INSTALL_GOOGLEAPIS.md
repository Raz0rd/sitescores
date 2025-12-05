# Instalação do Google Sheets API

## 📦 Instalar dependência

```bash
npm install googleapis
```

## 🔑 Configurar credenciais

1. ✅ Arquivo `chavesheets.json` já está na raiz do projeto
2. ✅ Já está no `.gitignore` (não será commitado)
3. ✅ Copiar para o servidor em `/var/www/aprovarevolucaoweb-click/`

## 🚀 Deploy no servidor

```bash
# 1. SSH no servidor
ssh user@server

# 2. Ir para o diretório do projeto
cd /var/www/aprovarevolucaoweb-click

# 3. Copiar chavesheets.json para o servidor (fazer upload via SCP ou criar manualmente)
nano chavesheets.json
# Cole o conteúdo do arquivo e salve (Ctrl+O, Enter, Ctrl+X)

# 4. Instalar googleapis
npm install googleapis

# 5. Build e restart
rm -rf .next && npm run build && pm2 restart aprovarevolucaoweb-click
```

## ✅ Verificar

Após uma compra, verificar nos logs:

```bash
pm2 logs aprovarevolucaoweb-click --lines 50
```

Deve aparecer:
```
✅ [GOOGLE SHEETS] Aba "aprovarevolucaoweb" já existe
📊 [GOOGLE SHEETS] Salvando dados na aba "aprovarevolucaoweb"
   - Email: cliente@email.com
   - Valor: R$ 11.99
✅ [GOOGLE SHEETS] Dados salvos com sucesso!
   - Linhas adicionadas: 1
✅ [GOOGLE SHEETS] Cliente salvo: cliente@email.com
   - Aba: aprovarevolucaoweb
   - Linhas: 1
```

## 📊 Planilha

ID: `19noK4HT3COT-r-dJU3ZE6WRZvZMmffdRo0DzJDr0cwI`
Link: https://docs.google.com/spreadsheets/d/19noK4HT3COT-r-dJU3ZE6WRZvZMmffdRo0DzJDr0cwI/edit

## 🔐 Permissões

O Service Account precisa ter acesso à planilha:
- Email: `sheets-api@solar-bebop-469002-h1.iam.gserviceaccount.com`
- Permissão: **Editor**

Para adicionar:
1. Abra a planilha
2. Clique em "Compartilhar"
3. Cole o email do Service Account
4. Defina como "Editor"
5. Desmarque "Notificar pessoas"
6. Clique em "Compartilhar"
