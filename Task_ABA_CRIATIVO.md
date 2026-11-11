# Task ABA CRIATIVO: Canva Clone Studio, Redes Sociais, Figma & Penpot Converter

Este documento detalha o planejamento, arquitetura técnica, status de implementação e testes do **Criativo Studio (Clone Canva)**, com suporte completo a posts e carrosséis para Instagram e Facebook, thumbnails para YouTube, vídeos verticais para YouTube Shorts e TikTok, conversor de formatos Figma/Penpot e integrações com [`humanizer`](https://github.com/blader/humanizer) e [`scroll-craft`](https://github.com/nateherkai/scroll-craft).

---

## 📊 Progresso Geral do Desenvolvimento

| Módulo | Escopo & Responsabilidade | Progresso | Status |
| :--- | :--- | :---: | :---: |
| **M1: Canva Clone Studio UI** | Interface idêntica ao Canva: Header superior com gradiente roxo, dock lateral de ícones (72px), bandeja retrátil de ferramentas (350px), prancha central com zoom e régua inferior | 100% | ✅ Concluído |
| **M2: Formatos Multi-Plataforma** | Instagram Post (1080×1080), Carrossel multi-slides, Story/Reels (1080×1920), Facebook (1200×630), YouTube Thumbnail (1280×720), YouTube Shorts (1080×1920), TikTok (1080×1920) | 100% | ✅ Concluído |
| **M3: Templates Ricos Pré-Carregados** | Template idêntico ao print do Canva ("Somos Pet Friendly"), Carrossel viral de 4 slides, YouTube Thumbnails de tecnologia, Shorts/TikTok com gancho viral, Luxo/Joias | 100% | ✅ Concluído |
| **M4: Conversor Figma & Penpot** | Importador e conversor de pranchas vetoriais SVG e JSON do Penpot e Figma Community para elementos nativos, e exportador para `.svg` Penpot e tokens W3C | 100% | ✅ Concluído |
| **M5: Gestão de Carrossel & Slides** | Linha do tempo de slides (Capa, Dica 1, Dica 2, Fechamento), botão "+ Adicionar página", duplicação e ordenação de páginas | 100% | ✅ Concluído |
| **M6: Humanizer IA no Canvas** | Botão mágico de 1 clique para retirar clichês e termos artificiais de IA em todos os títulos, textos e badges da arte usando `blader/humanizer` | 100% | ✅ Concluído |
| **M7: Kit de Marca & Design System Sync** | Sincronização automática com a paleta, tipografia e tokens do Design System ativo no estúdio principal | 100% | ✅ Concluído |
| **M8: Agenda & Picos de Engajamento** | Heatmap e agendador com horários nobres de postagem calculados por vertical de público | 100% | ✅ Concluído |
| **M9: HyperFrames Video Engine** | Animação dinâmica procedural de layouts, timeline de 8s, presets cinemáticos e pipeline exportador FFmpeg 8.0 / WebM | 100% | ✅ Concluído |
| **M10: Agendamento 📅 Omnichannel** | Sub-aba dedicada com seletor de redes por dropdown, horários nobres dinâmicos, gatilhos de liquidez (Dias 03, 04, 05 e 20), aniversários CRM com cupons/brindes, datas comerciais brasileiras, exportação Google Calendar (.ics RFC 5545) e Postiz API | 100% | ✅ Concluído |

**Status Geral**: **100% dos Módulos Desenvolvidos, Testados e Operacionais** 🚀

---

## 🧱 Arquitetura e Especificações Técnicas

### 1. Interface Clone Canva
- **Header Superior**:
  - Logo gradiente Canva C, seletor de formato ativo com ícone e dimensões, título editável do documento, status de salvamento em nuvem (`☁️ Salvo automaticamente`), botão "✦ Humanizar Cópias" e botão primário "Compartilhar / Baixar".
- **Dock Lateral (72px)**:
  - `Modelos` (🎨), `Elementos` (🧩), `Texto` (🔤), `Marca` (💎), `Uploads` (📤), `Carrossel` (📑), `Formatos` (📐), `Figma/Penpot` (🌐), `IA Redes` (⚡).
- **Bandeja Secundária Retrátil (350px)**:
  - Busca inteligente, chips de filtro rápido (Pet Friendly, Carrossel, YouTube, Shorts, Figma, Penpot), cartões visuais dos modelos, paletas de marca, área de upload e conversor de código.
- **Prancha Central (Desk)**:
  - Fundo cinza suave `#181a20`, prancha com sombra profunda `box-shadow: 0 20px 50px rgba(0,0,0,0.6)`, handles de seleção nos 4 cantos, barra flutuante de ações de página (Duplicar, Excluir) e botão centralizado `+ Adicionar página`.
- **Régua Inferior**:
  - Atalhos para notas e temporizador, controle deslizante de zoom (20% a 120%) com botão "Ajustar" (48%), indicador de páginas (`Páginas 1/N`), modo grade e tela cheia.

---

### 2. Formatos Pré-Configurados

| Formato | Plataforma | Resolução Base | Proporção | Caso de Uso |
| :--- | :--- | :--- | :--- | :--- |
| **Instagram Post** | Instagram / FB | 1080 × 1080 px | 1:1 | Feed quadrado tradicional |
| **Instagram Carrossel** | Instagram | 1080 × 1080 px | 1:1 | Sequência de 2 a 10 slides contínuos |
| **Instagram Story & Reels** | Instagram | 1080 × 1920 px | 9:16 | Conteúdo vertical imersivo |
| **Facebook Post** | Facebook | 1200 × 630 px | 1.91:1 | Anúncios e links patrocinados |
| **YouTube Thumbnail** | YouTube | 1280 × 720 px | 16:9 | Capa de vídeo com alto contraste e CTR |
| **YouTube Shorts** | YouTube | 1080 × 1920 px | 9:16 | Capa e visualização de Shorts |
| **TikTok Vídeo / Capa** | TikTok | 1080 × 1920 px | 9:16 | Formato vertical dinâmico com estética neon |

---

### 3. Conversor de Formatos: Figma & Penpot Community

- **Entrada suportada**:
  - Arquivos SVG do Penpot (`<svg xmlns:penpot="https://penpot.app">`) contendo formas, círculos, pranchas e textos.
  - JSON de pranchas e nós da comunidade Figma e Penpot.
  - W3C Design Tokens JSON.
- **Saída gerada**:
  - Exportação direta para SVG compatível com pranchas e camadas do Penpot via download (`.svg`).
  - Exportação de tokens de cores e superfícies no formato W3C para Figma (`.json`).
  - Renderização direta no HTML5 Canvas para exportação em PNG de alta resolução (`1080x1080`, `1280x720`, `1080x1920`).

---

### 4. HyperFrames & Motion Engine (Vídeos e Animações)
- **Presets de Movimento**: Gancho Viral (TikTok/Reels), Elegância Suave, Pulso de Oferta (E-Commerce) e Typo Slide.
- **Exportação Multi-Formato**: Geração de timeline procedural de 8s e exportação para WebM e pipeline FFmpeg 8.0 H.264 / AAC 9:16 vertical.
- **Player Integrado**: Pré-visualização instantânea no drawer com controles de reprodução e reinício de animação.

---

### 5. Agendamento 📅 Omnichannel & Automação Sazonal
- **Sub-Aba Primária no Topo de Criativos**: Acesso com 1 clique a `[ 🎨 Canva Studio ]` e `[ Agendamento 📅 ]`.
- **Seletor de Redes Sociais por Dropdown**: Multi-Disparo Simultâneo, Instagram, Facebook, TikTok e YouTube Shorts com cálculo automático de horário nobre de pico e score de audiência.
- **Gatilhos de Pagamento (Payday Spikes)**:
  - Dia 03: Aquecimento Tático (Teaser / Wishlist)
  - Dia 04: Salário Servidores & Executivos (15% OFF PIX)
  - Dia 05: 5º Dia Útil Nacional CLT (Maior pico de compras, Frete Grátis + Cupom `SALARIO05`)
  - Dia 20: Vale Quinzenal / Adiantamento Salarial 40% (Oferta Relâmpago 24h)
- **CRM de Aniversários de Clientes**: Cupons nominais (ex: `NIVER-MARI25`, `VIP-CAMILA30`) e brindes personalizados.
- **Aniversário de Relacionamento (Fidelidade)**: Mimos de 1, 2 e 3 anos de casa com cashback em dobro no PIX.
- **Datas Comerciais Brasileiras**: Dia das Mães, Dia dos Namorados, Dia dos Avós (26/07), Dia dos Pais, Semana do Consumidor, Dia do Cliente, Black Friday Brasil e Natal.
- **Integração com 1 Clique com o Canvas**: Botão "🎨 Carregar no Canva Studio" que injeta a campanha no editor visual e abre a arte instantaneamente.
- **Sincronização Google Calendar (.ics)**: Geração e download de arquivo RFC 5545 para importação direta no Google Calendar, Outlook e Apple Calendar.
- **Despacho Postiz API**: Disparo automatizado multi-canal via endpoint REST `/api/campaigns`.

---

### 6. Checklist de Testes

- [x] Renderização pixel-perfect do template "Somos Pet Friendly" com faixa laranja, título azul, badge estrela de preço, lista de comodidades e foto.
- [x] Alternância dinâmica entre todos os 7 formatos com reajuste automático de proporção.
- [x] Adição, duplicação e exclusão de slides no Carrossel.
- [x] Arrastar e soltar (drag & drop) de elementos na prancha com seleção e redimensionamento visual.
- [x] Botão de 1 clique "Humanizar Cópias" aplicando as regras do `blader/humanizer` aos textos da arte.
- [x] Aplicação instantânea da paleta do Design System selecionado via aba "Marca".
- [x] Conversão de SVG/JSON de templates Penpot/Figma para elementos nativos editáveis.
- [x] Download da arte gerada em PNG de alta definição e SVG Penpot.
- [x] Integração e renderização do player HyperFrames com animações procedurais.
- [x] Sub-aba `Agendamento 📅` ativa com favicon rigorosamente posicionado à direita da palavra.
- [x] Dropdown de seleção de redes sociais com cálculo dinâmico de horário nobre de pico.
- [x] Injeção de campanhas de Payday, Aniversários e Feriados no Canva Studio em 1 clique.
- [x] Exportação de arquivo `.ics` RFC 5545 para sincronização com Google Calendar.
- [x] Endpoint REST `/api/campaigns` atendendo requisições GET e POST.
- [x] Compilação TypeScript com 0 erros (`npm run typecheck`).
- [x] Build de produção Next.js Turbopack com 0 erros (`npm run build`).
