# Task ABA CRIATIVO: Studio de Criativos, Redes Sociais, SEO & Scroll-Craft

Este documento detalha o planejamento, arquitetura técnica, status de implementação e progresso percentual dos módulos que compõem a nova aba **"Criativos"** e as integrações dos repositórios [`scroll-craft`](https://github.com/nateherkai/scroll-craft) e [`humanizer`](https://github.com/blader/humanizer), além do motor SEO e do importador de templates OpenDesign/Figma.

---

## 📊 Progresso Geral do Desenvolvimento

| Módulo | Escopo & Responsabilidade | Progresso | Status |
| :--- | :--- | :---: | :---: |
| **M1: Creative Canvas Studio** | Editor visual de posts, stories, reels e banners para Instagram & Facebook com exportação | 100% | ✅ Concluído |
| **M2: Agendador Social & Melhores Horários** | Calendário inteligente com cálculo de picos de engajamento por público-alvo (B2B, E-commerce, Luxo, etc.) | 100% | ✅ Concluído |
| **M3: SEO Engine & Structured Data** | Geração automática de OpenGraph, Twitter Cards, Meta tags e Schemas JSON-LD (Product, FAQ, Org) | 100% | ✅ Concluído |
| **M4: Humanizer Engine (`blader/humanizer`)** | Remoção de vícios de IA, humanização de copy para sites e anúncios, tom autêntico e persuasivo | 100% | ✅ Concluído |
| **M5: Scroll-Craft Engine (`nateherkai/scroll-craft`)** | Demonstração interativa de produtos com scrollytelling, pinned stages, scrub de timeline e gramáticas imersivas | 100% | ✅ Concluído |
| **M6: OpenDesign & Figma Batch Importer** | Importador em lote de templates da comunidade Figma, vetores SVG e JSON de design tokens | 100% | ✅ Concluído |
| **M7: Integração na Aba Principal & Categorias** | Nova vertical "Scroll-Craft & Demonstrativos" no catálogo do Studio com 10 design systems e skills | 100% | ✅ Concluído |

**Status Geral**: **100% dos Módulos Desenvolvidos e Integrados** 🚀

---

## 🧱 Detalhamento dos Módulos e Testes

### M1: Creative Canvas Studio (Instagram & Facebook)
- **Formatos suportados**:
  - Feed Instagram Quadrado (`1080x1080` - 1:1)
  - Feed Facebook / Anúncio Horizontal (`1200x628` - 1.91:1)
  - Instagram Stories & Reels (`1080x1920` - 9:16)
  - Carrossel de Lançamento (`1080x1080` multi-slide)
- **Capacidades Visuais**:
  - Camadas editáveis: Headline, Subtítulo, Preço/Tag promocional, Badge de urgência, Mockup do produto, Call to Action.
  - Paletas de cor sincronizadas com o Design System ativo.
  - Exportação em tempo real (HTML/Canvas para PNG/SVG).
- **Testes**:
  - [x] Renderização de canvas nos 4 formatos padrão.
  - [x] Sincronização de texto e cores ao vivo.
  - [x] Download do criativo em imagem.

---

### M2: Agendador Social & Melhores Horários
- **Cálculo de Pico de Engajamento por Nicho**:
  - *E-commerce & Acessórios*: Terça e Quinta às 19:00 - 21:00; Domingo às 20:00.
  - *Joias & Luxo*: Quarta e Sexta às 12:30 e 18:30; Sábado às 11:00.
  - *Tech & Portfólio B2B*: Terça a Quinta às 08:30 e 14:00.
  - *Infantil & Família*: Segunda a Quarta às 14:30 e 20:30.
  - *Beleza & Cosméticos*: Quarta e Sexta às 18:00; Sábado às 15:00.
- **Painel de Agendamento**:
  - Visualização semanal com slots recomendados.
  - Integração visual com canais Meta (Instagram Feed, Stories, Facebook Page).
  - Status de postagem: Rascunho, Agendado, Publicado.
- **Testes**:
  - [x] Cálculo dinâmico de horários baseado na vertical escolhida.
  - [x] Criação e alteração de agendamentos no estado.

---

### M3: SEO Engine & Structured Data
- **Geração de Metadados**:
  - Title tag otimizado (50-60 caracteres com intenção e marca).
  - Meta description com gatilho de ação (145-155 caracteres).
  - Tags OpenGraph (`og:title`, `og:description`, `og:image`, `og:url`, `og:site_name`, `og:type`).
  - Twitter Card (`summary_large_image`).
  - Robôs: `index, follow, max-image-preview:large`.
- **JSON-LD Schema**:
  - `Product` (com `offers`, `price`, `availability`, `aggregateRating`).
  - `Organization` / `LocalBusiness`.
  - `FAQPage` e `BreadcrumbList`.
- **SERP Preview**:
  - Google Search Snippet preview.
  - Facebook/WhatsApp Link Card preview.
- **Testes**:
  - [x] Validação sintática do JSON-LD.
  - [x] Preview de SERP responsivo.

---

### M4: Humanizer Engine (`blader/humanizer`)
- **Regras Implementadas da Skill Humanizer v4.0.0**:
  - **§1 Eliminação de "Not X but Y"**: Substituição de frases artificiais de contraste duplo.
  - **§2 Eliminação de Fechamentos Teatrais**: Corte de "That is the real win", "Let that sink in", etc.
  - **§6 Quebra de Tríades Forçadas**: Evita listas automáticas de 3 adjetivos vazios.
  - **§8 Redução de Travessões Excessivos (—)**: Troca por pontuação natural humana.
  - **§14 Expurgador de Palavras Clichês de IA**: Remoção de termos como "delve", "testament", "tapestry", "seamlessly", "revolutionize".
- **Modos de Tom de Voz**:
  - *Conversacional Autêntico*
  - *Editorial & Sofisticado*
  - *Direto & Comercial*
  - *Técnico & Factual*
- **Testes**:
  - [x] Pipeline de sanitização de texto antes e depois.
  - [x] Botão "Humanizar Copy" aplicado em 1 clique em qualquer texto gerado.

---

### M5: Scroll-Craft Engine (`nateherkai/scroll-craft`)
- **Conceito Extraído**:
  - "Scroll is the timeline": animação orientada a rolagem, sem scroll sequestrado.
  - Gramáticas de página: *Filmic One-Shot*, *Split Stage*, *Live Surface*, *Continuous World*.
  - Efeitos de demonstração de produto:
    - Pinned viewport com revelação progressiva de especificações.
    - Rotação / scrub 360° do produto.
    - Zoom fotográfico macro com transição suave para detalhes de engenharia.
    - Efeito de profundidade com iluminação direcional e grain texturizado.
- **Testes**:
  - [x] Demonstração interativa de produto com scroll acoplado.
  - [x] Injeção de componentes Scroll-Craft no preview do template.

---

### M6: OpenDesign & Figma Community Batch Importer
- **Compatibilidade**:
  - Suporte ao formato aberto de tokens W3C / Figma Tokens.
  - Leitura de múltiplos arquivos em lote (Batch Import de JSON/SVG).
  - Conversor de layouts da comunidade Figma para seções HTML/Tailwind editáveis.
- **Testes**:
  - [x] Upload simulado e extração em lote de templates.
  - [x] Aplicação instantânea dos templates importados no canvas do Smart Editor.

---

### M7: Integração na Aba Principal & Categorias
- **Nova Categoria no Studio Principal**:
  - `scroll-craft`: **Demonstrativos de Produto & Scroll Imersivo** (com 10 design systems e skills dedicadas).
- **Nova Aba "Criativos" na Barra Superior**:
  - Acesso direto via glyph `❖` ao lado de `Smart Editor`.

