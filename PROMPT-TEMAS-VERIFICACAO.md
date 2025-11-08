# 🎨 PROMPT GERADOR DE TEMAS - UserVerification.tsx

## 📋 Como Usar:
Copie o prompt abaixo e cole no chat, substituindo [TEMA] pelo tema desejado.

---

## 🚀 PROMPT UNIVERSAL:
🧠 Prompt aprimorado (geração aleatória de tema e estilo visual)

Recrie o estilo visual completo do componente UserVerification.tsx com base em um tema gerado aleatoriamente.

O tema deve ser coerente, criativo e visualmente distinto, mas nunca reutilizar o mesmo padrão visual.

Não use ícones prontos (como FontAwesome, Material Icons, emojis etc). Prefira formas criadas com CSS/SVG e animações sutis e fluidas.

Cada execução deve gerar um novo conceito estético, como: “Energia Cósmica”, “Neon Urbano”, “Névoa Digital”, “Fibras de Luz”, “Areia Dourada”, “Gelo Futurista”, “Cidades Espelhadas”, etc.

⚙️ REGRAS FIXAS:

Não altere funcionalidades, estados, ou validações.

Não modifique a estrutura dos steps (initial, terms, quiz, result, verification).

Mantenha todas as props e funções originais.

Alterações somente visuais (cores, gradientes, formas, CSS, animações, modal).

🎨 DIRETRIZES PARA O NOVO TEMA (gerado automaticamente):

Nome do tema: gere um nome criativo aleatório.

Cores: escolha 3–4 cores principais que harmonizem entre si.

Formas: crie formas decorativas com CSS/SVG relacionadas ao tema.

Animações: adicione pelo menos uma animação CSS relevante (ex: pulsar, rotação suave, fluidez, deslocamento, reflexão).

Gradientes: utilize gradientes modernos (linear, radial ou cônicos) em elementos de fundo.

Fundo: altere o background principal com textura, brilho ou movimento leve.

Sem ícones ou emojis: substitua por elementos visuais gerados via CSS (formas geométricas, partículas, brilhos etc).

🪟 ESTILO DO MODAL (variável por tema):

Gere um layout único para o modal, variando levemente entre:

Compacto (h-20, p-5, textos pequenos)

Espaçado (h-24, p-8, fontes médias)

Minimalista (fundo translúcido com blur)

Vibrante (gradiente animado com borda suave)

Sempre use o tema visual gerado para guiar o estilo.

📜 ESTRUTURA A MANTER:

Arquivo: components/UserVerification.tsx

Steps: initial, terms, quiz, result, verification

Props, estados e validações originais

Sistema de verificação de ID

## 🎭 EXEMPLOS DE TEMAS:

Tema Plasma/Energia Dinâmica

[TEMA] = Energia fluida e pulsante, com gradientes em movimento
Cores: Roxo elétrico, Azul plasma, Rosa neon
Formas: Manchas fluidas, ondas contínuas, gradientes animados
CSS: background: radial-gradient(...) com animation: pulse 6s infinite alternate;
Efeitos: Mistura de camadas com mix-blend-mode: overlay, blur dinâmico, brilho em hover
Sensação: Movimento constante, energia digital fluindo

Tema Minimalista/Geometria Limpa

[TEMA] = Layouts com formas vetoriais puras e contraste equilibrado
Cores: Branco gelo, Preto suave, Azul acinzentado
Formas: Linhas diagonais, triângulos sutis, grids geométricos
CSS: clip-path em seções e transform: skewY() para blocos
Efeitos: Sombras suaves (box-shadow) e micro animações de escala (transform: scale(1.02))
Sensação: Profissionalismo, organização, clareza

Tema Vapor/Blur Futurista

[TEMA] = Fundo com transparências e efeitos de vidro
Cores: Azul translúcido, Rosa etéreo, Branco gelo
Formas: Camadas translúcidas com bordas curvas
CSS: backdrop-filter: blur(20px); e border-radius: 30px;
Efeitos: Transição suave entre cores e reflexos móveis
Sensação: Interface moderna tipo Apple Glass / UI futurista

Tema Digital Grid / Tech Mesh

[TEMA] = Rede digital simulando circuitos e conexões
Cores: Azul escuro, Ciano, Verde neon
Formas: Linhas finas, pontos conectados, malhas 3D simuladas
CSS: linear-gradient com repeating-linear-gradient sobrepostos
Efeitos: Linhas piscando com animation-delay aleatórios
Sensação: Tecnologia, precisão, sistemas avançados

Tema Holográfico/Reflexo Iridescente

[TEMA] = Gradientes mutáveis com brilho holográfico
Cores: Azul celeste, Rosa claro, Lilás perolado
Formas: Superfícies onduladas, luz refletida, refração
CSS: background: linear-gradient(120deg, #a8edea, #fed6e3); com animation: hueRotate
Efeitos: Alteração suave de matiz e rotação do gradiente
Sensação: Inovação, luxo digital, estética premium

Tema Partículas/Atmosfera

[TEMA] = Fundo dinâmico com partículas flutuando
Cores: Azul petróleo, Preto, Dourado suave
Formas: Pontos, círculos, pequenas partículas animadas
CSS: @keyframes float com transform: translateY() aleatório
Efeitos: Movimento contínuo e leve paralaxe com perspective
Sensação: Profundidade e movimento realista

Tema Neon Outline / Linha Viva

[TEMA] = Bordas animadas simulando energia percorrendo os contornos
Cores: Verde neon, Azul elétrico, Preto
Formas: Contornos brilhantes, linhas contínuas, retângulos energizados
CSS: border-image: linear-gradient() com animation: gradientMove
Efeitos: Linhas que “correm” nas bordas com gradiente em loop
Sensação: Alta tecnologia, identidade gamer ou tech

Tema Futuro Minimalista/Space Clean

[TEMA] = Espaço limpo com efeitos sutis de luz e sombra
Cores: Branco fosco, Cinza grafite, Azul gelo
Formas: Retângulos sobrepostos, seções com luz lateral
CSS: box-shadow: inset e background: conic-gradient(...)
Efeitos: Movimento lento de luz simulando reflexo
Sensação: Modernidade, marca de alto padrão

Tema Energia Pulsar/Heartbeat

[TEMA] = Efeito de pulsação suave simulando energia viva
Cores: Vermelho profundo, Rosa neon, Preto
Formas: Ondas concêntricas, círculos pulsando
CSS: animation: pulseGlow 2.5s ease-in-out infinite;
Efeitos: Escala e brilho alternando em loop suave
Sensação: Intensidade, poder, ritmo

Tema Origami/Vetor Modular

[TEMA] = Formas triangulares sobrepostas criando textura
Cores: Azul petróleo, Verde acinzentado, Cinza claro
Formas: Triângulos em padrões clip-path: polygon(...)
CSS: transform: rotateZ() com opacity alternada
Efeitos: Movimento leve, textura dinâmica sem imagens
Sensação: Sofisticação, design autoral, estética digital
---

## 📝 EXEMPLO DE USO COMPLETO:

Altere o tema visual do componente UserVerification.tsx para o tema Espacial/Galáxia.

[TEMA] = Espacial/Galáxia com estrelas, planetas e nebulosas
Cores: Roxo escuro (#1a0033), Azul espacial (#0a1929), Rosa nebulosa (#ff006e)
Formas: Estrelas de 5 pontas, planetas circulares, órbitas elípticas, constelações conectadas
Emojis: 🌌 (galáxia), 🚀 (foguete), ⭐ (estrela), 🪐 (planeta), 🌠 (estrela cadente)
Animações: Estrelas piscando suavemente, planetas orbitando lentamente, brilho estelar pulsante

REQUISITOS:
- Modal compacto com header h-20
- 4 formas nos cantos: estrelas (top-left), planeta (top-right), constelação (bottom-left), galáxia espiral (bottom-right)
- Background com gradiente espacial e estrelas de fundo
- Ícone central: planeta com anéis girando
- Animação customizada: twinkle (piscar de estrelas)
- Formas decorativas: pequenas estrelas no header

---

## 🎯 DICAS PARA CRIAR TEMAS PERSONALIZADOS:

1. **Escolha 3 Cores Principais**: Uma escura, uma média, uma clara
2. **Defina Formas Características**: 4-5 formas que representem o tema
3. **Selecione Emojis Temáticos**: 5-7 emojis relacionados
4. **Crie 1-2 Animações Únicas**: Movimentos característicos do tema
5. **Pense no Background**: Gradiente + padrão/textura sutil

---

## ⚠️ IMPORTANTE:

Este prompt GARANTE que:
- ✅ Todas as funcionalidades permanecem intactas
- ✅ Verificação de ID continua funcionando
- ✅ Quiz e steps não são alterados
- ✅ Apenas visual é modificado
- ✅ Modal fica compacto e moderno
- ✅ Tema é aplicado consistentemente

---

## 🚀 COMO USAR:

1. Copie o PROMPT UNIVERSAL acima
2. Substitua [TEMA] por um dos exemplos OU crie seu próprio
3. Cole no chat com a IA
4. Aguarde a aplicação do tema
5. Teste no navegador
6. Faça commit quando aprovar

---

Criado em: 06/11/2025
Versão: 1.0
Arquivo alvo: components/UserVerification.tsx
