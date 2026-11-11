# 🚀 ANTIGRAVITY TASK SPECIFICATION: OpenHiggsfield Character Generator (DB + RAG + Multi-TTS + Multi-Style Archetype Skills)

> **Modo de Execução no Antigravity:** Este documento funciona como o **Master Task Prompt** e especificação arquitetural para evolução do repositório local do **Open Higgsfield** (`Autom8AI/Open-Higgsfield-AI` ou `wide-trace/open-higgsfield`). O agente do Antigravity deve executar as fases de implementação sequencialmente, criando também os pacotes de skills modulares em `.agents/skills/`.

---

## 1. Visão Geral do Objetivo (System Prompt para o Agente)

Você é um Engenheiro de Software Full-Stack Sênior e Arquiteto de IA Generativa operando no **Google Antigravity**. Sua missão é expandir o código-fonte existente do **Open Higgsfield** para implementar um **Módulo Gerador e Gerenciador de Personagens com Consistência Absoluta (Character Studio)** integrado aos estúdios existentes (*Image Studio, Video Studio, Cinema Studio e Lip Sync Studio*).

O sistema deve armazenar toda a **Ficha do Personagem (Character Sheet)** em um **Banco de Dados Relacional (SQLite/Prisma)** acoplado a um motor de **RAG Vetorial Local (LanceDB ou ChromaDB)** para recuperar características **físicas, materiais/têxteis, emocionais e vocais**, injetando automaticamente os parâmetros e imagens de referência nos pipelines de geração e sincronização labial.

### Requisitos Inegociáveis da Implementação:

1. **Persistência Completa da Ficha do Personagem (BD + RAG):** Armazenar traços físicos/materiais imutáveis, até 14 imagens de referência multi-ângulo, perfil psicológico/emocional vetorizado e configurações vocais completas.
2. **Dropdown Principal de Estilo/Arquétipo (`Character Style & Archetype Dropdown`) + Sub-Dropdowns Condicionais:**
   * **Estilo Disney 3D / Pixar**
   * **Avatares de Venda (Feminino e Masculino)** nas faixas `[14 aos 18[`, `[18 aos 26]`, `[27 a 55]` e `[+ de 55]`
   * **Cartoon (2D / 3D Stylized)**
   * **Anime (Cinematográfico Makoto Shinkai / Ghibli / Ufotable Cel-Shaded)**
   * **Crochê Realista / Amigurumi Macro** (com seletor de tipo de fio e ponto)
   * **Filhotes de Animais Fofos (Baby Animals)** com sub-dropdown para as **10 espécies**: *Urso, Panda, Guaxinim, Gatos, Cachorros, Cabras, Morcegos, Panda Vermelho, Furão e Sugar Glider (Petauro-do-açúcar)*
   * **Frutas Falantes Antropomórficas (Talking Fruits)** com sub-dropdown de fruta e personalidade viral
   * **Estilos Virais em Alta na Internet (Trending Search Styles):** *Claymation Stop-Motion (Massinha)*, *Feltro Artesanal (Needle Felted Wool)*, *Pop Mart Blind Box (Vinyl Toy 3D)*, *Fantoche de Pelúcia/Feltro (Estilo Muppet)* e *Unreal Engine 5 MetaHuman (Dark Fantasy / Sci-Fi)*
3. **Dropdown de Provedor de Voz (`Voice Provider Dropdown`):** Seleção entre **Voice Studio (Local/Custom)**, **ElevenLabs**, **Gemini TTS** e **Fish Audio**, com roteamento unificado de síntese de áudio direto para o **Lip Sync Studio**.
4. **Gerenciamento de Chaves de API no `.env` via Aba de Configurações Existente:** Expandir a aba/modal de configurações (`Settings`) já existente no Open Higgsfield, mantendo **100% do padrão visual, componentes, tipografia e UX originais**, mas adicionando persistência bidirecional no arquivo `.env` local (via endpoint interno `/api/settings/env`) além do cache em `localStorage`.

---

## 2. Pesquisa e Especificação das Skills por Estilo de Personagem (Dropdown do Editor)

Quando o usuário seleciona um estilo de personagem na caixa de dropdown (`archetype_skill_id`) e, quando aplicável, sua variante (`sub_type_id`), o motor RAG + Prompt Compiler deve carregar automaticamente o pacote de diretrizes (*Skill Payload*) correspondente. Abaixo está a matriz técnica pesquisada na web e calibrada para cada estilo:

---

### 2.1. `disney_pixar_3d` — Personagem Estilo Disney 3D / Pixar

* **Engenharia Física e Visual (Prompt & Render Skill):**
  * **Tokens Obrigatórios (`Style Lock`):** `Disney Pixar 3D animation style, RenderMan subsurface scattering, appealing character proportions, expressive oversized eyes with dual specular catchlights, soft rounded facial geometry, clumped groomed hair strands, tactile fabric micro-weave`.
  * **Shading e Texturas:** *Subsurface Scattering (SSS)* suave e quente na pele (aspecto translúcido nas orelhas, ponta do nariz e bochechas), ausência de poros crus hiper-realistas, texturas de roupa com microfibras visíveis em close-up.
  * **Câmera e Iluminação (Cinema Studio Preset):** Lente `50mm` ou `35mm`, abertura `f/2.8` com *bokeh* circular cremoso, iluminação *Three-Point Rim Light* quente e saturada, *global illumination* cinematográfica.
* **Estado Emocional e Corporal (RAG Behavior Skill):**
  * Expressões faciais baseadas nos **12 Princípios da Animação** (*squash and stretch* elástico mas sutil nas bochechas, sobrancelhas hiper-articuladas que lideram a emoção, antecipação clara antes da fala, arcos fluidos nos gestos de mão).
* **Diretriz Vocal e Prosódia (TTS Skill):**
  * Entonação teatral e expressiva, dinâmica de *pitch* ampla, pausas dramáticas curtas, articulação cristalina e calorosa.

---

### 2.2. Avatares de Venda — Feminino e Masculino (Por Faixa Etária)

#### A) `sales_female_teen_14_18` — Avatar de Venda: Mulher Adolescente `[14 aos 18[`
* **Engenharia Física e Dermatológica:** Pele jovem com textura natural fresca (*dewy skin*), poros quase imperceptíveis, bochechas mais cheias, cabelo com movimento moderno (*Gen-Z aesthetic*), vestuário casual autêntico (*streetwear*, moletom oversized, casual tendência). Enquadramento estilo *creator* (`9:16` ou `16:9` quarto/estúdio iluminado com LED e luz natural).
* **Câmera Preset:** Lente `24mm` ou `35mm` (estética câmera frontal iPhone Pro / Sony ZV-E1), `f/2.0`, iluminação *Ring Light* suave + luz ambiente colorida sutil.
* **Perfil Emocional e Corporal (RAG):** Energia alta, espontaneidade, microexpressões rápidas de descoberta/surpresa, inclinação de cabeça dinâmica, contato visual estilo conversa com melhor amiga (*FaceTime vibe*).
* **Skill de Venda e Voz (TTS & Copywriting):** Gatilhos de descoberta viral, *unboxing* e tendência ("você precisa ver isso"). Ritmo acelerado (`160–175 WPM`), timbre brilhante e juvenil, inflexões ascendentes de entusiasmo.

#### B) `sales_female_young_18_26` — Avatar de Venda: Mulher Jovem `[18 aos 26]`
* **Engenharia Física e Dermatológica:** Fotorrealismo extremo (*hyper-realistic skin micro-texture*, *subsurface scattering*, *vellus hair*/penugem facial sutil contra a luz), maquiagem *clean girl* ou *glow* comercial, micro-assimetrias humanas naturais para evitar o *Uncanny Valley*.
* **Câmera Preset:** Lente `35mm` (UGC Creator) ou `50mm` (Estúdio Comercial), `f/1.8`, iluminação *Softbox Key Light* a $45^\circ$ + luz natural dourada.
* **Perfil Emocional e Corporal (RAG):** Confiança magnética, *Hook facial* empático nos primeiros 3 segundos, gesticulação fluida na altura do peito/queixo apontando ou segurando produto.
* **Skill de Venda e Voz (TTS & Copywriting):** *High-Converting UGC*, Prova Social, Transformação Antes/Depois. Ritmo dinâmico (`150–165 WPM`), tom conversacional íntimo e persuasivo.

#### C) `sales_female_mature_27_55` — Avatar de Venda: Mulher Madura `[27 a 55]`
* **Engenharia Física e Dermatológica:** Textura de pele realista calibrada à idade exata da ficha (linhas de expressão finas e elegantes ao redor dos olhos quando sorri, estrutura zigomática definida, pele bem cuidada). Vestuário *smart casual*, executivo moderno ou especialista.
* **Câmera Preset:** Lente `50mm` ou `85mm Cinema Prime`, `f/2.2`, iluminação editorial *Butterfly/Paramount Lighting* suave.
* **Perfil Emocional e Corporal (RAG):** Postura ereta e segura, autoridade calma, acenos de cabeça afirmativos lentos, olhar firme e empático que transmite domínio técnico.
* **Skill de Venda e Voz (TTS & Copywriting):** Venda Consultiva, Quebra de Objeções Racionais, Autoridade Profissional. Cadência moderada (`135–150 WPM`), timbre médio-aveludado, ênfase tônica em palavras de garantia.

#### D) `sales_female_senior_55_plus` — Avatar de Venda: Mulher Idosa `[+ de 55]`
* **Engenharia Física e Dermatológica:** Fotorrealismo digno e autêntico: rugas naturais de expressão, textura epidérmica madura detalhada, cabelos grisalhos/prateados luminosos ou tingidos com volume natural, olhar sereno e vívido.
* **Câmera Preset:** Lente `85mm Portrait` com filtro *Halation Diffusion* suave, `f/2.8`, iluminação quente *Warm Key Light* (`3200K–4000K`).
* **Perfil Emocional e Corporal (RAG):** Acolhimento maternal/experiente, serenidade, sorriso calmo com os olhos (*Duchenne smile*), movimentos pausados que transmitem honestidade absoluta.
* **Skill de Venda e Voz (TTS & Copywriting):** Confiança, Bem-Estar, Saúde, Família e Recomendação Sincera. Ritmo calmo (`115–130 WPM`), tom quente e reconfortante.

#### E) `sales_male_teen_14_18` — Avatar de Venda: Homem Adolescente `[14 aos 18[`
* **Engenharia Física e Dermatológica:** Pele jovem com textura real (poros leves na zona T), estrutura mandibular em desenvolvimento, corte de cabelo atual (*textured crop*, *curly*, *fade* suave), vestuário casual jovem (camiseta premium, hoodie, setup gamer/estudo).
* **Câmera Preset:** Lente `24mm` ou `35mm`, `f/2.0`, iluminação Key Light neutra + backlight LED sutil.
* **Perfil Emocional e Corporal (RAG):** Expressão autêntica e direta, reação genuína de *review* prático (*hands-on*), linguagem corporal descontraída.
* **Skill de Venda e Voz (TTS & Copywriting):** Curiosidade rápida, demonstração prática, autenticidade sem filtro corporativo. Timbre jovem, ritmo ágil (`155–170 WPM`).

#### F) `sales_male_young_18_26` — Avatar de Venda: Homem Jovem `[18 aos 26]`
* **Engenharia Física e Dermatológica:** Pele fotorrealista com poros visíveis, barba cerrada (*stubble*) ou rosto limpo com folículos sutis, mandíbula definida, ambiente minimalista ou estúdio moderno.
* **Câmera Preset:** Lente `35mm Anamorphic` ou `50mm Prime`, `f/1.8`, iluminação *Rembrandt* suave.
* **Perfil Emocional e Corporal (RAG):** Foco intenso nos olhos, postura proativa inclinada levemente para a câmera, gestos precisos destacando pontos-chave.
* **Skill de Venda e Voz (TTS & Copywriting):** Performance, Produtividade, Resultado Rápido, *Direct-Response Hook*. Ritmo firme e energético (`150–160 WPM`).

#### G) `sales_male_mature_27_55` — Avatar de Venda: Homem Maduro `[27 a 55]`
* **Engenharia Física e Dermatológica:** Microtextura de pele masculina realista, linhas de expressão naturais na testa e cantos dos olhos, barba bem aparada (fios grisalhos opcionais nas têmporas) ou rosto barbeado. Traje executivo, camisa social sem gravata ou polo estruturada.
* **Câmera Preset:** Lente `50mm` ou `85mm Classic Prime`, `f/2.4`, iluminação *High-Contrast Soft Key* com *hair light*.
* **Perfil Emocional e Corporal (RAG):** Presença executiva e consultiva, microexpressões de certeza e segurança, gestos contidos e assertivos (palma aberta demonstrando transparência).
* **Skill de Venda e Voz (TTS & Copywriting):** ROI, Liderança, Segurança Financeira/Técnica, Prova Lógica. Timbre barítono encorpado, estabilidade alta (`0.75`), ritmo controlado (`135–145 WPM`), queda de inflexão ao final das frases (padrão de autoridade).

#### H) `sales_male_senior_55_plus` — Avatar de Venda: Homem Idoso `[+ de 55]`
* **Engenharia Física e Dermatológica:** Textura dérmica madura de alta fidelidade (rugas profundas naturais, barba/cabelos grisalhos ou brancos com fios individuais detalhados), óculos opcionais com antirreflexo realista.
* **Câmera Preset:** Lente `85mm Tight Portrait`, `f/2.8`, iluminação *Warm Softbox* lateral suave estilo documentário cinematográfico.
* **Perfil Emocional e Corporal (RAG):** Sabedoria, paciência, olhar benevolente e firme, postura estável (arquétipo do Mentor/Especialista Sênior).
* **Skill de Venda e Voz (TTS & Copywriting):** Experiência de Vida, Credibilidade Histórica, Proteção Familiar, Conselho de Especialista. Voz grave e ressonante, ritmo pausado (`115–130 WPM`).

---

### 2.3. `western_cartoon_style` — Personagem Estilo Cartoon (2D / 3D)

* **Fórmula Estrutural de Consistência (`Style Lock Formula`):**
  $$\text{Prompt}_{\text{Cartoon}} = \text{Subject} + \text{Style Lock} + \text{Linework} + \text{Shading} + \text{Color Palette} + \text{Composition}$$
* **Sub-Estilos Selecionáveis no Editor (`cartoonSubStyle`):**
  1. **`flat_2d_vector` (Cartoon 2D Moderno / CalArts / TV Animation):** `clean bold outer linework, flat cel color blocking, expressive noodle limbs or rounded geometric silhouette, vibrant saturated palette, 2D hand-drawn frame animation look`.
  2. **`rubber_hose_1930s` (Retro 1930s Rubber Hose / Estilo Cuphead):** `1930s vintage ink-and-paint cartoon, pie-cut eyes, white cartoon gloves, rubber-hose curving limbs, film grain, subtle sepia/monochrome or muted technicolor watercolor background`.
  3. **`stylized_3d_mascot` (3D Cartoon Mascot / Illumination & Sony Animation Style):** `3D stylized cartoon render, exaggerated silhouette, snappy pose-to-pose animation, vibrant subsurface shader, clean color blocking, soft studio rim light`.
* **Restrições Negativas (`Negative Prompt Lock`):**
  * Para 2D: `avoid photorealistic skin pores, 3D plastic render, uncanny valley, blurry gradients`.
  * Para 3D: `avoid flat 2D paper cutout, sketchy pencil lines`.
* **Estado Emocional e Corporal (RAG):**
  * Reações hiperbólicas (*jaw drop*, olhos saltados de surpresa, *smear frames* rápidos em transições de movimento, silhueta 100% legível mesmo em preto total).
* **Diretriz Vocal (TTS Skill):**
  * Voz caricata e ultra-expressiva, variações rápidas de *pitch* e velocidade, ênfase cômica em sílabas tônicas.

---

### 2.4. `anime_cinematic_style` — Personagem Estilo Anime (Japão)

* **Sub-Estilos de Estúdio Selecionáveis (`animeSubStyle`):**
  1. **`makoto_shinkai` (Anime Cinematográfico / Makoto Shinkai Style):**
     * **Tokens Visuais:** `Makoto Shinkai cinematic anime style, masterpiece anime film still, hyper-detailed photorealistic background environment, volumetric god rays, golden hour blue-orange color contrast, lens flare, atmospheric floating dust/rain particles, emotional expressive anime eyes with intricate iris reflections, crisp clean character linework`.
  2. **`studio_ghibli` (Nostálgico Pintado à Mão / Miyazaki Style):**
     * **Tokens Visuais:** `Studio Ghibli hand-drawn cel animation style, lush painterly gouache and watercolor background, warm nostalgic color palette, soft organic linework, wind-swept hair and clothes movement, gentle natural sunlight`.
  3. **`ufotable_modern_shonen` (Action & High-Contrast / Ufotable & MAPPA Style):**
     * **Tokens Visuais:** `Ufotable high-budget anime production, razor-sharp digital linework, multi-layered cel-shading with ambient occlusion, dramatic rim lighting, dynamic foreshortening, glowing particle VFX, 24fps animated on twos cadence`.
* **Consistência de Personagem Anime:**
  * Travamento obrigatório de `hair silhouette + bangs structure (ahoge, hime cut, spiked layers)`, `exact eye shape (tsurime vs tareme)` e `consistent outfit color hex codes`.
* **Estado Emocional e Corporal (RAG):**
  * Microexpressões clássicas de direção de anime: olhar melancólico contra o vento, brilho ocular (*eye sparkle*) de determinação, sombras dramáticas cobrindo a metade superior do rosto em momentos sérios, movimento constante de cabelo/roupa (*secondary motion*).
* **Diretriz Vocal (TTS Skill):**
  * Cadência inspirada em *Seiyuu* (dublagem japonesa adaptada ao idioma alvo): respiração emotiva perceptível, dicção nítida e dramática, transições claras entre sussurro introspectivo e projeção heroica.

---

### 2.5. `realistic_crochet_amigurumi` — Crochê Realista / Amigurumi Macro

* **Engenharia Têxtil e de Construção (Baseada nas Melhores Práticas de Prompting 2026):**
  * A palavra "crochet" sozinha gera texturas plásticas falsas. O compilador deve injetar obrigatoriamente **Tokens de Construção Têxtil Real**:
  * **Pontos e Estrutura:** `authentic handcrafted amigurumi doll, tight single crochet stitches (sc), clearly defined visible stitch rows and spiral rounds, tight crochet gauge with tiny realistic gaps showing soft white fiberfill stuffing beneath, separate crocheted limbs and ears attached with subtle handmade yarn seams, slight endearing handmade asymmetry`.
  * **Olhos e Boca (Compatíveis com Lip Sync):** `glossy black dome safety eyes with studio catchlights (or embroidered yarn eyes), articulated embroidered yarn mouth and eyebrows that deform naturally stitch-by-stitch when speaking`.
* **Sub-Dropdown de Fio (`yarnMaterialType`):**
  1. **`cotton_yarn` (Algodão Mercerizado):** Pontos super nítidos, definidos e estruturados, excelente para close-ups macro.
  2. **`chenille_plush_yarn` (Fio Chenille / Pelúcia Aveludada):** Aspecto grosso, macio e aveludado (*chunky velvety plush*), super aconchegante.
  3. **`wool_fuzz_yarn` (Lã Natural com Halo de Fibras):** Textura orgânica com micro-fiapos translúcidos (*stray microscopic wool fibers glowing against the rim light*).
* **Câmera e Iluminação (Cinema Studio Preset):**
  * Lente `100mm Extreme Macro`, abertura `f/2.8` a `f/4.0` (*shallow depth of field* com fundo suavemente desfocado), iluminação lateral de janela difusa (*soft side-window diffused light*), sombras de contato físicas sobre superfície de madeira quente ou linho.
* **Restrições Negativas (`Negative Prompt Lock`):**
  * `avoid smooth plastic, shiny vinyl, flat printed yarn patterns, melted stitches, CGI glossy skin, floating object without contact shadow`.
* **Estado Emocional e Corporal (RAG) + Voz (TTS):**
  * Movimentos em cadência *stop-motion* sutil (`12fps–18fps feel`), inclinação fofa da cabeça inteira (já que o pescoço de amigurumi é costurado), bracinhos curtos gesticulando. Voz doce, acolhedora, levemente abafada/íntima (estética *cozy ASMR storytelling*).

---

### 2.6. `cute_baby_animals` — Filhotes de Animais Fofos (10 Espécies Mapeadas)

* **Núcleo Biológico Universal de Fofura (*Kindchenschema / Baby Schema Lock*):**
  * Todas as 10 espécies compartilham a base física: ` disproportionately adorable baby proportions (oversized head relative to tiny chubby body, large round dewy eyes with dual studio catchlights, tiny nose, rounded ears and paws), physically accurate micro-fur simulation with individual guard hairs and soft undercoat, warm Subsurface Scattering (SSS) through thin ear cartilage and paw pads, macro wildlife/studio portrait photography, 85mm f/2.0 lens`.
* **Sub-Dropdown de Espécie (`animalSpeciesSubType`) — Skills Específicas por Animal:**

| ID da Espécie | Nome no Dropdown | Engenharia Visual e Pelagem (Prompt Skill) | Comportamento, Emoção (RAG) e Voz (TTS) |
| :--- | :--- | :--- | :--- |
| `baby_bear` | **Filhote de Urso (Bear Cub)** | Pelagem densa e fofa (marrom, polar branco-creme ou pardo), orelhas redondas felpudas, focinho úmido com brilho especular, patinhas gorduchas com almofadas macias. | Andar desengonçado (*playful clumsy waddle*), esfregar os olhos com a pata quando sonolento, curiosidade inocente. Voz infantil, rouquinha e calorosa. |
| `baby_panda` | **Filhote de Panda (Giant Panda Cub)** | Pelagem preta e branca ultra-macia de alto contraste, corpo roliço estilo pelúcia viva, segurando broto de bambu, micro-pelos brancos iluminados por *rim light*. | Rolamentos desajeitados (*roly-poly tumble*), mastigação fofa, tombos cômicos suaves. Voz doce, pausada e bem-humorada. |
| `baby_raccoon` | **Filhote de Guaxinim (Raccoon Kit)** | Máscara facial escura simétrica estilo "bandido fofo", focinho pontudo delicado, cauda anelada felpuda, patinhas dianteiras hiper-articuladas como mãozinhas humanas. | Esfregar as mãozinhas com expectativa, espiar por trás de objetos, expressão travessa e super inteligente. Voz ágil, curiosa e sapeca. |
| `baby_cat` | **Filhote de Gato (Cute Kitten)** | Pelagem sedosa com halo de penugem de filhote (*kitten fuzz*), bigodes translúcidos perfeitos (*whisker physics*), pupilas enormes dilatadas e brilhantes, narizinho rosa. | Amassar pãozinho com as patas (*kneading paws*), inclinar a cabeça, piscar lento de carinho. Voz suave, aguda-aveludada e melódica. |
| `baby_dog` | **Filhote de Cachorro (Cute Puppy)** | Orelhas caídas levemente maiores que a cabeça (*oversized floppy ears*), olhos expressivos com reflexo úmido na pálpebra inferior (*puppy-dog eyes*), patinhas grandes. | Inclinação clássica de cabeça a $30^\circ$ (*curious head tilt*), abanar de cauda energético, sorriso ofegante feliz. Voz entusiasmada, leal e alegre. |
| `baby_goat` | **Filhote de Cabra (Baby Goat Kid)** | Pelagem macia (branca, caramelo ou malhada), orelhas longas e expressivas, início minúsculo de chifrinhos arredondados, olhos quentes e expressivos, opção de mini suéter tricotado. | Saltinhos laterais alegres (*bouncy zoomies*), subir em troncos/almofadas, expressão extrovertida e cômica. Voz vibrante, saltitante e divertida. |
| `baby_bat` | **Filhote de Morcego (Cute Baby Bat / Sky Puppy)** | Estética *"Sky Puppy"* (Morcego-branco-de-honduras tipo algodão ou *Flying Fox* filhote): olhos negros gigantes e brilhantes como jabuticabas, orelhas aveludadas translúcidas com forte *Subsurface Scattering* rosado contra a luz, pelagem redonda e felpuda. | Enrolado em mini cobertorzinho macio ou segurando pedacinho de banana/melancia, mexendo as orelhinhas como radar. Voz baixinha, tímida e super meiga. |
| `baby_red_panda` | **Filhote de Panda Vermelho (Red Panda Cub)** | Pelagem vermelho-ferrugem vibrante, marcações brancas nas bochechas e acima dos olhos, orelhas brancas felpudas, cauda longa e grossa com anéis claros e escuros. | Ficar em pé nas duas patinhas traseiras com os braços abertos para parecer "grande" (pose viral clássica), abraçar galho com musgo. Voz fofa, expressiva e teatral. |
| `baby_ferret` | **Filhote de Furão (Baby Ferret Kit)** | Corpo longo, flexível e felpudo (pelagem *sable* com máscara, pastel ou branco-neve), narizinho rosa perolado, orelhinhas curtas arredondadas, olhos vivos e brilhantes. | Dança de alegria saltitante (*weasel war dance*), espiar de dentro de canecas/mangas de blusa, hiper-curiosidade. Voz rápida, falante e elétrica. |
| `baby_sugar_glider` | **Sugar Glider (Petauro-do-açúcar Filhote)** | Marsupial de bolso minúsculo, olhos noturnos gigantes de obsidiana brilhante, pelagem cinza-prateada aveludada com faixa dorsal escura, membrana planar (*patagium*) dobrada suavemente nas laterais, mãozinhas delicadas rosas. | Agarrado a um dedo humano ou galho florido, lambendo gota de néctar/fruta doce, olhos arregalados de encantamento. Voz cristalina, delicada e sussurrada. |

---

### 2.7. `talking_fruits_viral` — Frutas Falantes Antropomórficas (Viral TikTok / Shorts)

* **Engenharia Visual e Integração Facial Orgânica (`Organic Pericarp Face Fusion`):**
  * O segredo dos vídeos virais de frutas falantes de maior retenção não é colar uma boca 2D por cima, mas esculpir o rosto **na própria matéria orgânica da casca e polpa da fruta**:
  * **Tokens Obrigatórios:** `anthropomorphic talking [FRUIT], seamless organic facial features formed directly from the natural fruit peel texture, expressive lips made of the fruit's own skin with microscopic pores and fresh water/juice droplets, inner mouth cavity revealing realistic juicy fruit pulp and seeds when speaking, expressive eyes nestled naturally into the fruit surface, macro studio food photography lighting, 85mm lens, shallow depth of field on kitchen marble countertop or supermarket shelf`.
* **Sub-Dropdown de Fruta e Arquétipo de Personalidade (`fruitPersonaSubType`):**
  1. **`sassy_strawberry` (Morango Debochado / Roast):** Textura vermelha brilhante com aquênios (sementinhas) dourados que acompanham a deformação das bochechas, folhas verdes no topo funcionando como "cabelo/sobrancelha" expressiva, óculos escuros opcionais. Tom de voz: irônico, rápido e cheio de atitude.
  2. **`motivational_mango` (Manga Motivacional / Coach):** Casca amarelo-avermelhada suculenta e brilhante, expressão confiante e inspiradora. Tom de voz: energético, profundo e motivador.
  3. **`gossip_grape` (Uva Fofoqueira):** Cacho de uvas roxas ou verdes translúcidas com *Subsurface Scattering* intenso na polpa, olhos inquietos olhando para os lados, sussurrando segredos. Tom de voz: sussurrado conspiratório ("menina, você não sabe o que aconteceu na geladeira").
  4. **`nutrition_avocado` (Abacate Especialista em Saúde):** Cortado ao meio mostrando a polpa verde cremosa e o caroço redondo (como barriga ou segurando o caroço), óculos de leitura, explicando benefícios nutricionais ("por que me comer antes de dormir"). Tom de voz: calmo, inteligente e didático.
  5. **`grumpy_lemon` (Limão Ácido / Sincericida):** Casca amarela cítrica porosa com gotículas ácidas espirrando levemente quando reclama com raiva cômica. Tom de voz: ranzinza e engraçado.
  6. **`opera_banana` (Banana Cantora / Dramática):** Casca amarela parcialmente aberta como um smoking ou capa, expressão dramática de cantor.

---

### 2.8. Estilos em Alta com Maior Interesse de Busca na Internet (Trending Viral Styles)

Além das categorias acima, o Editor de Personagens inclui os **5 estilos de maior crescimento de busca e engajamento** em plataformas de vídeo curto e animação por IA:

#### 1. `claymation_stop_motion` — Claymation / Massinha Stop-Motion (Estilo Aardman & Laika)
* **Tokens de Engenharia Visual:** `authentic stop-motion plasticine claymation character, visible sculptor thumbprints and subtle fingerprint textures on matte clay surface, handcrafted miniature diorama set with shallow depth of field, replacement-animation mouth shapes for lip-sync, 12fps stepped motion cadence, warm practical studio lighting`.
* **Comportamento e Voz:** Movimentos táteis levemente angulares, charme artesanal britânico/indie, voz carismática e expressiva.

#### 2. `needle_felted_wool` — Feltro Artesanal / Lã Feltrada com Agulha (Needle Felting Trend)
* **Tokens de Engenharia Visual:** `handcrafted needle-felted merino wool character, soft matted fuzzy wool fibers with glowing backlit stray fibers halo, tiny needle-punched surface dimples, glossy bead eyes, cozy miniature crafted felt environment, macro tilt-shift photography, 85mm f/2.8`.
* **Comportamento e Voz:** Estética ultra-aconchegante (*cozy core*), movimentos suaves e delicados, voz calma e reconfortante.

#### 3. `pop_mart_blind_box` — Toy Art 3D / Pop Mart & Mofusand Blind Box Collectible
* **Tokens de Engenharia Visual:** `designer vinyl art toy character, Pop Mart blind-box collectible aesthetic, chibi proportions (1:2 head-to-body ratio), smooth PVC and matte soft-touch vinyl material contrast with selective glossy UV highlights on eyes and accessories, clean pastel/vibrant color blocking, Octane Render studio lighting on circular display pedestal`.
* **Comportamento e Voz:** Poses colecionáveis fofas e estilizadas, micro-movimentos de cabeça e mãos curtas, voz *kawaii*/moderna.

#### 4. `muppet_felt_puppet` — Fantoche de Feltro e Pelúcia (Estilo Muppet / TV Show)
* **Tokens de Engenharia Visual:** `professional television hand-and-rod puppet character, Antron fleece and plush faux-fur skin texture, expressive hinged felt mouth with red/pink fabric inner palate, hemispherical white plastic eyes with black flocked pupils, visible tactile fabric seams, bright studio TV stage lighting`.
* **Comportamento e Voz:** Sincronização labial de abertura ampla de mandíbula (típica de fantoches), balanço expressivo de cabeça e braços ao falar, voz energética de apresentador/comediante.

#### 5. `ue5_metahuman_cinematic` — Unreal Engine 5 MetaHuman (Dark Fantasy / Sci-Fi / Game Trailer)
* **Tokens de Engenharia Visual:** `Unreal Engine 5.5 MetaHuman hyper-realistic cinematic character, path-traced skin shader with micro-pores, sweat/rain droplets and peach fuzz, intricate armor/costume fabric physics, anamorphic lens flare, dramatic chiaroscuro volumetric fog lighting, 8K movie trailer frame`.
* **Comportamento e Voz:** Atuação dramática contida (*screen acting*), micro-contrações musculares faciais realistas, voz cinematográfica grave/épica com *reverb* sutil de ambiente.

---

## 3. Arquitetura de Dados: Banco de Dados Relacional + RAG

### 3.1. Schema do Banco de Dados (`prisma/schema.prisma` ou SQLite local)

O agente deve criar a camada de persistência local em SQLite (`data/characters.db`) contemplando todos os estilos e subtipos:

```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./characters.db"
}

generator client {
  provider = "prisma-client-js"
}

model Character {
  id                   String   @id @default(uuid())
  name                 String   @unique
  handle               String   @unique // Ex: @MayaVendas, @PandaBambu, @MorangoSincero
  
  // Seleção Principal e Subtipo Condicional do Editor
  archetypeSkillId     String   // ID principal do Dropdown (ex: "cute_baby_animals", "realistic_crochet_amigurumi", "sales_female_young_18_26")
  subTypeId            String?  // Sub-dropdown condicional (ex: "baby_sugar_glider", "chenille_plush_yarn", "makoto_shinkai", "sassy_strawberry")
  gender               String   // "female" | "male" | "neutral" | "creature" | "anthropomorphic"
  ageBracket           String   // "14-18" | "18-26" | "27-55" | "55+" | "baby_cub" | "timeless"
  exactAge             Int?

  // Características Físicas e Materiais (Consistência Visual)
  baseSeed             Int      @default(42)
  physicalTraitsJson   String   // JSON adaptável ao estilo: { faceShape, skinOrFurOrYarnTexture, eyeColor, hairOrPlumage, distinguishingMarks, defaultWardrobeOrProps, negativeConstraints }
  immutablePromptCore  String   // Prompt físico/material compilado + Style Lock injetado em todas as gerações
  preferredLens        String   @default("50mm")
  preferredLighting    String   @default("Softbox Key 45deg")
  referenceImagesJson  String   // Array JSON de até 14 URLs/paths ordenados (Front, 3/4, Side, FullBody, Expressions)

  // Características Emocionais (Base + Ponteiro RAG)
  emotionalProfileJson String   // JSON: { baselineMood, temper, persuasionOrComedyStyle, gestureIntensity, eyeContactLevel, microExpressionsMap }
  ragCollectionId      String   // ID da coleção vetorial no LanceDB/ChromaDB

  // Características Vocais (Multi-TTS)
  voiceProvider        String   // "voicestudio" | "elevenlabs" | "gemini_tts" | "fishaudio"
  voiceId              String   // ID da voz ou modelo no provedor selecionado
  voiceSettingsJson    String   // JSON: { stability, similarityBoost, styleExaggeration, speedWpm, pitchShift, geminiStylePrompt, fishReferenceId }
  voiceSampleUrl       String?  // Áudio de referência da voz do personagem

  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
  memories             CharacterMemory[]
}

model CharacterMemory {
  id             String    @id @default(uuid())
  characterId    String
  character      Character @relation(fields: [characterId], references: [id], onDelete: Cascade)
  category       String    // "emotional_reaction" | "sales_objection" | "visual_posture" | "voice_inflection" | "scene_history"
  triggerContext String    // Ex: "quando apresenta garantia" ou "quando o filhote de panda vermelho leva um susto"
  content        String    // Descrição detalhada da expressão facial, física de pelos/crochê, postura e tom de voz
  embedding      Bytes?    // Vetor de embedding para busca semântica local
  createdAt      DateTime  @default(now())
}
```

### 3.2. Pipeline RAG de Consistência (`src/services/characterRagService.ts`)

1. **Indexação da Ficha e da Skill:** Sempre que um personagem é salvo ou seu `archetypeSkillId` + `subTypeId` são selecionados no dropdown, o serviço indexa:
   * Os documentos da *Skill* correspondente (Seção 2 deste documento), incluindo os **Negative Constraints** automáticos daquele estilo.
   * As reações emocionais e memórias de cena do personagem (`CharacterMemory`).
2. **Interceptação e Enriquecimento na Barra de Prompt (`Prompt Hydrator`):**
   * Quando o usuário seleciona um personagem no seletor ativo ou digita `@HandleDoPersonagem` na barra de comando:
   * O RAG faz uma busca semântica entre a ação descrita no prompt do usuário e o banco vetorial do personagem.
   * **Equação de Compilação do Prompt Final:**
     $$P_{\text{final}} = P_{\text{StyleLock\_Skill}} + P_{\text{SubType\_Material\_Or\_Species}} + P_{\text{PhysicalCore}} + P_{\text{RAG\_Emotional\_MicroExpression}} + P_{\text{Cinema\_Lens}} + P_{\text{UserScene}} - P_{\text{NegativeConstraints}}$$
   * **Injeção Automática de Multi-Image Reference:** O array `referenceImagesJson` (até 14 fotos do personagem) é automaticamente injetado no payload `images_list` / `image_urls` enviado à API de geração.

---

## 4. Integração do Dropdown de Provedor de Voz (Multi-TTS Router)

Crie o módulo `src/services/ttsRouter.ts` e o componente de UI `VoiceProviderDropdown`. O dropdown deve listar exatamente as 4 opções solicitadas e adaptar os subcontroles da ficha do personagem, aplicando também ajustes de *pitch/prosódia* sugeridos pela *Skill* do estilo (ex.: voz infantil/fofa para filhotes de animais ou amigurumi, voz consultiva para avatares de venda):

| Opção no Dropdown | `voiceProvider` ID | Parâmetros Específicos Renderizados na Ficha | Endpoint / SDK Utilizado |
| :--- | :--- | :--- | :--- |
| **Voice Studio (Local / Custom)** | `voicestudio` | `Endpoint URL`, `Speaker/Model ID`, `Emotion Preset`, `Pitch Shift (-12 a +12 semitons)`, `Speed` | `POST {VOICESTUDIO_API_URL}/v1/tts` (com suporte a RVC/XTTS/StyleTTS2 local) |
| **ElevenLabs** | `elevenlabs` | `Voice ID`, `Model (eleven_multilingual_v2 / eleven_v3)`, `Stability (0-1)`, `Similarity Boost (0-1)`, `Style Exaggeration (0-1)` | `POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}` |
| **Gemini TTS** | `gemini_tts` | `Voice Name (Kore, Puck, Aoede, Charon, Fenrir, Zephyr)`, `Director Style Prompt` (instrução natural de emoção, personagem e sotaque pt-BR) | `POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent` (`responseModalities: ["AUDIO"]`) |
| **Fish Audio** | `fishaudio` | `Reference ID (Model ID)`, `Temperature (0.1-1.0)`, `Top P (0.1-1.0)`, `Chunk Length`, `Prosody Speed` | `POST https://api.fish.audio/v1/tts` |

### Fluxo Automático $\text{TTS} \rightarrow \text{Lip Sync Studio}$:
* Dentro do **Character Studio** ou **Lip Sync Studio**, o usuário digita o roteiro/fala do personagem.
* Ao clicar em **"Gerar Voz do Personagem"**, o `ttsRouter` consulta a `voiceConfig` e o estado emocional recuperado pelo RAG, gera o arquivo `.wav`/`.mp3`, anexa automaticamente no slot `audio_url` do **Lip Sync Studio** e carrega o retrato/vídeo base do personagem no slot `image_url`/`video_url` pronto para o *InfiniteTalk* ou *MuseTalk*.

---

## 5. Armazenamento de Chaves no `.env` via Aba de Configurações Existente

### Regra de Ouro de UI/UX:
**NÃO crie uma tela de configurações paralela e NÃO quebre o design system existente.** Localize o componente da aba/modal de configurações já existente no projeto (`SettingsModal` / aba de `Settings`) e estenda-o seguindo exatamente a mesma estrutura de classes CSS/Tailwind, ícones, espaçamento, badges de status e máscara de senha (`type="password"` com toggle de visualização).

### Novas Chaves de API a incluir na Aba de Configurações Existente:
1. `HIGGSFIELD_PRIMARY_API_KEY` (Chave original já existente — manter no topo)
2. `ELEVENLABS_API_KEY` (Provedor ElevenLabs)
3. `GEMINI_API_KEY` (Provedor Gemini TTS + Embeddings/RAG)
4. `FISHAUDIO_API_KEY` (Provedor Fish Audio)
5. `VOICESTUDIO_API_URL` e `VOICESTUDIO_API_KEY` (Provedor Voice Studio Local/Remoto)

### Arquitetura de Persistência no `.env` (`src/api/settings/env`):
1. **`GET /api/settings/env`:** Lê o arquivo `.env` na raiz do projeto e retorna para a aba de configurações o status de cada chave (`configured: true/false` e versão mascarada ou valor local em `localhost`).
2. **`POST /api/settings/env`:** Quando o usuário salva qualquer chave na **Aba de Configurações existente**, o sistema atualiza simultaneamente o `localStorage` **E** grava no arquivo `.env` na raiz do projeto via `fs.writeFileSync('.env', updatedEnvContent, 'utf-8')`, preservando comentários e outras variáveis existentes.

---

## 6. Estrutura de Skills do Antigravity (`.agents/skills/`)

Crie a pasta `.agents/skills/openhiggsfield-character-studio/SKILL.md` seguindo a especificação oficial do Antigravity:

```yaml
---
name: openhiggsfield-character-studio
description: Cria, gerencia e aplica fichas de personagens consistentes (físico/material, emocional via RAG e vocal via Voice Studio, ElevenLabs, Gemini TTS ou Fish Audio) cobrindo Disney 3D/Pixar, Avatares de Venda por faixa etária, Cartoon, Anime, Crochê Realista/Amigurumi, Filhotes de Animais Fofos (10 espécies), Frutas Falantes e estilos virais (Claymation, Feltro, Blind Box, Muppet, UE5) no Open Higgsfield.
---
```

---

## 7. Plano de Execução Passo a Passo (Checklist para o Antigravity)

Execute as seguintes etapas em ordem, validando a compilação (`npm run build` / `npm run dev`) ao final de cada fase:

* [ ] **Fase 1 — Inspeção e Mapeamento do Repositório Base:**
  1. Identificar a estrutura exata do repositório local (`Vite + React/JS` no `Autom8AI` ou `Next.js + Zustand` no `wide-trace`).
  2. Localizar o componente da **Aba/Modal de Configurações** existente e o serviço de submissão de geração (`muapi.ts` ou `src/generation/`).

* [ ] **Fase 2 — Ponte `.env` e Extensão da Aba de Configurações:**
  1. Atualizar `.env.example` e `.env` com `ELEVENLABS_API_KEY`, `GEMINI_API_KEY`, `FISHAUDIO_API_KEY`, `VOICESTUDIO_API_URL` e `VOICESTUDIO_API_KEY`.
  2. Criar o endpoint/middleware `/api/settings/env` para leitura e escrita atômica no arquivo `.env`.
  3. Adicionar os novos campos de API Key dentro da **aba de configurações existente**, preservando rigorosamente o layout e estilo atuais.

* [ ] **Fase 3 — Banco de Dados (SQLite), Motor RAG e Catálogo de Skills Multi-Estilo:**
  1. Configurar SQLite (`better-sqlite3` ou `Prisma`) para armazenar as tabelas `Character` e `CharacterMemory`.
  2. Implementar o motor RAG (`characterRagService.ts`) para recuperar traços emocionais, linguagem corporal e histórico de cenas.
  3. Cadastrar o catálogo completo de **Skills de Estilos e Subtipos** (`src/catalog/characterArchetypeSkills.ts`) contendo todas as regras visuais, têxteis, biológicas, de câmera, emocionais e de persuasão detalhadas na Seção 2.

* [ ] **Fase 4 — Roteador Multi-TTS (`Voice Studio`, `ElevenLabs`, `Gemini TTS`, `Fish Audio`):**
  1. Implementar os 4 adaptadores de API em `src/services/ttsRouter.ts` lendo as chaves diretamente do `.env` / configuração ativa.
  2. Garantir que o áudio gerado retorne uma URL local/Blob pronta para consumo imediato no `processLipSync()`.

* [ ] **Fase 5 — Interface Completa do Editor de Personagens (Character Studio UI):**
  1. Construir o painel/modal **Character Sheet (Ficha do Personagem)** com:
     * **Dropdown 1 — Categoria / Estilo do Personagem (`archetypeSkillId`):**
       * *Grupo 1: Animação & Estilizados*
         * `Personagem Estilo Disney 3D / Pixar`
         * `Personagem Estilo Cartoon (2D / 3D)` *(abre Sub-Dropdown: Flat 2D Vector, Retro 1930s Rubber Hose, 3D Mascot)*
         * `Personagem Estilo Anime` *(abre Sub-Dropdown: Makoto Shinkai Cinematográfico, Studio Ghibli Pintado à Mão, Ufotable Action Cel-Shaded)*
       * *Grupo 2: Avatares de Venda Fotorrealistas (Feminino & Masculino)*
         * `Avatar de Venda - Mulher Adolescente [14 aos 18[`
         * `Avatar de Venda - Mulher Jovem [18 aos 26]`
         * `Avatar de Venda - Mulher Madura [27 a 55]`
         * `Avatar de Venda - Mulher Idosa [+ de 55]`
         * `Avatar de Venda - Homem Adolescente [14 aos 18[`
         * `Avatar de Venda - Homem Jovem [18 aos 26]`
         * `Avatar de Venda - Homem Maduro [27 a 55]`
         * `Avatar de Venda - Homem Idoso [+ de 55]`
       * *Grupo 3: Artesanal, Criaturas Fofas & Virais*
         * `Crochê Realista / Amigurumi Macro` *(abre Sub-Dropdown de Fio: Algodão Mercerizado, Chenille Pelúcia, Lã Natural com Halo)*
         * `Filhotes de Animais Fofos (Baby Animals)` *(abre Sub-Dropdown de Espécie: Urso, Panda, Guaxinim, Gato, Cachorro, Cabra, Morcego, Panda Vermelho, Furão, Sugar Glider)*
         * `Frutas Falantes Antropomórficas` *(abre Sub-Dropdown: Morango Debochado, Manga Motivacional, Uva Fofoqueira, Abacate Nutricionista, Limão Ácido, Banana Cantora)*
       * *Grupo 4: Top Trending Search Styles (Mais Buscados na Internet)*
         * `Claymation / Massinha Stop-Motion (Estilo Aardman/Laika)`
         * `Feltro Artesanal / Lã Feltrada (Needle Felting Macro)`
         * `Pop Mart Blind Box / Vinyl Toy Colecionável 3D`
         * `Fantoche de Pelúcia e Feltro (Estilo Muppet / TV)`
         * `Unreal Engine 5 MetaHuman (Dark Fantasy / Sci-Fi Cinematográfico)`
     * **Dropdown 2 — Provedor de Voz (`voiceProvider`):**
       * `Voice Studio` | `ElevenLabs` | `Gemini TTS` | `Fish Audio`
     * **Gerenciador de 14 Imagens de Referência** integrado ao *Asset Picker* existente.
     * **Editor Dinâmico de Atributos Físicos/Materiais, Emocionais (RAG) e Vocais** (com botão de "Testar Voz" e "Aplicar Preset de Câmera no Cinema Studio").
  2. Adicionar o seletor rápido de personagem (`@Personagem`) na barra de prompt principal de todos os estúdios (*Image, Video, Cinema e Lip Sync*).

* [ ] **Fase 6 — Testes End-to-End e Validação:**
  1. Testar o salvamento das chaves na aba de configurações e verificar a atualização em tempo real do arquivo `.env`.
  2. Testar a criação de personagens em cada grupo (ex.: um *Sugar Glider* fofo, um boneco em *Crochê Realista*, um *Morango Falante* e uma *Avatar de Venda*) validando a injeção automática do *Style Lock*, lentes macro/retrato e Lip Sync.