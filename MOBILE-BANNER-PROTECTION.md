# 📱 Proteção de Banner Mobile

## 🛡️ Componente: MobileOnlyBanner

Exibe conteúdo APENAS para usuários reais em dispositivos mobile.

## ✅ Verificações Implementadas

### 1️⃣ **Detecção de Dispositivo Mobile Real**

**Verifica 4 características:**
- ✅ Touch screen (`ontouchstart` ou `maxTouchPoints`)
- ✅ User agent mobile (Android, iPhone, iPad, etc)
- ✅ Largura da tela (< 768px)
- ✅ API de orientação (screen.orientation)

**Critério:** Precisa ter **pelo menos 2** características

### 2️⃣ **Detecção de Bots**

**Bloqueia user agents com:**
- ❌ `bot`, `crawler`, `spider`, `scraper`
- ❌ `curl`, `wget`, `python`, `java`
- ❌ `headless`, `phantom`, `selenium`

### 3️⃣ **Comportamento Humano**

**Verifica:**
- ✅ Tem plugins instalados (bots não têm)
- ✅ Tem linguagens configuradas (bots têm array vazio)
- ❌ Não tem `navigator.webdriver` (automação)

### 4️⃣ **Delay Anti-Scraping**

- ⏱️ **500ms de delay** antes de mostrar
- Scrapers rápidos não veem o banner

## 📝 Como Usar

### Exemplo 1: Banner Simples

```tsx
import MobileOnlyBanner from '@/components/MobileOnlyBanner'

export default function Page() {
  return (
    <div>
      <MobileOnlyBanner>
        <div className="bg-red-600 text-white p-4">
          🎁 Oferta exclusiva mobile!
        </div>
      </MobileOnlyBanner>
      
      {/* Resto do conteúdo */}
    </div>
  )
}
```

### Exemplo 2: Banner com Imagem

```tsx
import MobileOnlyBanner from '@/components/MobileOnlyBanner'

export default function Page() {
  return (
    <div>
      <MobileOnlyBanner>
        <div className="fixed top-0 left-0 right-0 z-50">
          <img 
            src="/banner-mobile.jpg" 
            alt="Promoção" 
            className="w-full"
          />
        </div>
      </MobileOnlyBanner>
    </div>
  )
}
```

### Exemplo 3: Banner com Link

```tsx
import MobileOnlyBanner from '@/components/MobileOnlyBanner'
import Link from 'next/link'

export default function Page() {
  return (
    <div>
      <MobileOnlyBanner>
        <Link href="/promocao">
          <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-4 text-center cursor-pointer">
            <p className="font-bold">🔥 PROMOÇÃO MOBILE</p>
            <p className="text-sm">Toque para ver</p>
          </div>
        </Link>
      </MobileOnlyBanner>
    </div>
  )
}
```

## 🎯 O Que Acontece

### ✅ Usuário Real Mobile:
```
1. Página carrega
2. JavaScript executa
3. Verifica: touch ✅, mobile UA ✅, largura ✅
4. Verifica: não é bot ✅
5. Verifica: tem plugins ✅, tem linguagens ✅
6. Aguarda 500ms
7. Banner aparece
```

### ❌ Bot/Scraper:
```
1. Página carrega
2. JavaScript não executa OU
3. Verifica: não tem touch ❌
4. Verifica: user agent = bot ❌
5. Banner NÃO aparece
```

### ❌ Desktop:
```
1. Página carrega
2. JavaScript executa
3. Verifica: não tem touch ❌, largura > 768px ❌
4. Score mobile < 2
5. Banner NÃO aparece
```

## 📊 Tabela de Compatibilidade

| Dispositivo | Touch | Mobile UA | Largura | Orientação | Score | Mostra? |
|-------------|-------|-----------|---------|------------|-------|---------|
| iPhone Real | ✅ | ✅ | ✅ | ✅ | 4 | ✅ SIM |
| Android Real | ✅ | ✅ | ✅ | ✅ | 4 | ✅ SIM |
| iPad | ✅ | ✅ | ❌ | ✅ | 3 | ✅ SIM |
| Desktop | ❌ | ❌ | ❌ | ❌ | 0 | ❌ NÃO |
| Bot Mobile | ❌ | ✅ | ✅ | ❌ | 2 | ❌ NÃO (bloqueado por UA) |
| Scraper | ❌ | ❌ | ✅ | ❌ | 1 | ❌ NÃO |

## 🔒 Camadas de Proteção

### Camada 1: JavaScript
- Banner só renderiza com JS habilitado
- Bots sem JS não veem

### Camada 2: Detecção Mobile
- Precisa ter características de mobile real
- Emuladores podem ser detectados

### Camada 3: Anti-Bot
- User agent verificado
- Padrões de bot bloqueados

### Camada 4: Comportamento Humano
- Plugins, linguagens, webdriver
- Bots sofisticados detectados

### Camada 5: Delay
- 500ms antes de mostrar
- Scrapers rápidos não capturam

## 💡 Dicas Adicionais

### Para Maior Segurança:

**1. Adicionar verificação de interação:**
```tsx
const [hasInteracted, setHasInteracted] = useState(false)

useEffect(() => {
  const handleInteraction = () => setHasInteracted(true)
  
  window.addEventListener('touchstart', handleInteraction)
  window.addEventListener('scroll', handleInteraction)
  
  return () => {
    window.removeEventListener('touchstart', handleInteraction)
    window.removeEventListener('scroll', handleInteraction)
  }
}, [])

// Só mostrar banner após interação
if (!hasInteracted) return null
```

**2. Verificar velocidade de carregamento:**
```tsx
const loadTime = Date.now() - performance.timing.navigationStart
if (loadTime < 100) return null // Muito rápido = bot
```

**3. Adicionar fingerprinting:**
```tsx
const hasCanvas = !!document.createElement('canvas').getContext
const hasWebGL = !!document.createElement('canvas').getContext('webgl')
if (!hasCanvas || !hasWebGL) return null // Provável bot
```

## 🎯 Resultado Final

- ✅ **Mobile real** → Vê banner
- ❌ **Desktop** → Não vê
- ❌ **Bots** → Não vê
- ❌ **Scrapers** → Não vê
- ❌ **Automação** → Não vê

---

**Última atualização:** 13/11/2025 00:19
**Status:** ✅ Pronto para uso
**Proteção:** 🛡️ Multi-camadas
