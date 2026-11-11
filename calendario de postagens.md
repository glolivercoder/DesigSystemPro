# ROLE & OBJECTIVE
Você é um Engenheiro de Software Sênior e Arquiteto de Sistemas de Automação de Marketing. 
Sua missão é desenvolver e integrar um módulo completo de **Automação de Criativos Sazonais, Vídeo/GIF Engine e Agendamento Inteligente Multi-Rede (Instagram, Facebook, TikTok e YouTube Shorts)** integrado ao Google Calendar e à API do Postiz (open-source social scheduler).

---

# ARQUITETURA DO MÓDULO (`social_campaign_scheduler`)

O sistema deve operar em arquitetura modular (Python FastAPI + SQLite/PostgreSQL + Filas Assíncronas) dividida em 4 sub-motores:

1. **`CalendarIntelligenceEngine` (Gatilhos Comerciais e CRM):**
   - Monitora feriados e datas comemorativas brasileiras: Dia das Mães (2º domingo de maio), Dia dos Namorados (12/06), Dia dos Avós (26/07), Dia dos Pais (2º domingo de agosto), Semana do Consumidor, Black Friday e Natal.
   - **Gatilho Tático de Liquidez (Payday Spike):** Ativa campanhas agressivas de conversão nos dias **04 e 05 de cada mês** (foco em alto poder de compra pós-salário para lojas físicas e e-commerce), iniciando o aquecimento (teaser) no dia 03.
   - **Gatilho de Aniversariantes (CRM Birthday):** Consulta diariamente a tabela `contacts_clients` buscando aniversariantes do dia (ou com D-1 de antecedência) para gerar posts/mensagens personalizadas ou ofertas exclusivas.

2. **`CreativeMediaGenerator` (Fábrica de Vídeos, GIFs e Imagens):**
   - Recebe o contexto do gatilho (ex: "Oferta de Dia 05 - Salário na Conta" ou "Feliz Dia das Avós") e gera automaticamente:
     - **Vídeos Curtos (9:16 - 1080x1920)** para Reels, TikTok e YouTube Shorts via pipeline FFmpeg / Remotion.
     - **GIFs Animados Promocionais** otimizados (loop infinito, paleta otimizada via FFmpeg `palettegen`/`paletteuse`) para anúncios, WhatsApp e feeds.
     - **Copywriting & Hashtags:** Geração de legenda persuasiva adaptada ao tom de cada rede social com CTA claro.

3. **`PeakTimeOptimizer` (Motor de Melhores Horários):**
   - Calcula automaticamente o `scheduled_at` ideal baseado na rede de destino e no dia da semana, evitando postagens em horários mortos:
     - **Instagram (Reels/Feed):** 11:30 - 13:00 | 18:00 - 20:30
     - **TikTok:** 12:00 - 13:30 | 19:00 - 21:30
     - **YouTube Shorts:** 12:00 - 14:00 | 18:30 - 21:00
     - **Facebook:** 11:00 - 13:00 | 17:30 - 19:30
   - Permite sobrescrever a heurística padrão com métricas reais de engajamento histórico salvas no banco.

4. **`OmnichannelDispatcher` (Integração Postiz API + Google Calendar):**
   - Conecta via REST API a uma instância local/self-hosted do **Postiz** (ou adaptador direto para Meta Graph API, TikTok Content Posting API e YouTube Data API).
   - Sincroniza todos os disparos agendados com o **Google Calendar API**, criando eventos visuais com cores distintas por categoria (Sazonal, Pico Dia 4/5, Aniversário, Promoção Geral) e link para o preview do criativo.

---

# TASKS DE DESENVOLVIMENTO (STEP-BY-STEP)

Execute a implementação seguindo rigorosamente a ordem das tasks abaixo:

### [TASK 1] Modelagem de Dados e Banco (SQLite / PostgreSQL)
- [ ] Criar tabela `clients_birthdays` (`id`, `name`, `phone`, `email`, `birth_date`, `relationship_type` [client/friend/vip], `custom_discount_code`, `last_greeted_year`).
- [ ] Criar tabela `commercial_dates` (`id`, `title`, `rule_type` [fixed_date/nth_weekday/monthly_payday], `month`, `day`, `advance_days_notice`, `campaign_theme`, `active`).
- [ ] Popular `commercial_dates` com o seed inicial: Dias 4 e 5 de todo mês (Pico de Consumo), Dia das Mães, Dia dos Pais, Dia dos Avós (26/07), Dia dos Namorados (12/06).
- [ ] Criar tabela `scheduled_posts` (`id`, `campaign_type`, `media_path`, `media_type` [video/gif/image], `caption`, `platforms` [JSON], `scheduled_for`, `google_calendar_event_id`, `postiz_job_id`, `status` [pending/rendered/scheduled/published/failed]).

### [TASK 2] Motor de Regras Sazonais e Horários de Pico (`scheduler_brain.py`)
- [ ] Implementar worker diário (`check_upcoming_triggers()`) que roda às 06:00 AM verificando:
  1. Se hoje é D-2 ou D-0 de datas comemorativas.
  2. Se hoje é dia 03 (aquecimento) ou dias 04 e 05 (pico de compras do mês).
  3. Quais clientes/amigos fazem aniversário hoje.
- [ ] Implementar a classe `PeakTimeCalculator` que recebe a lista de plataformas (`['instagram', 'tiktok', 'youtube_shorts', 'facebook']`) e retorna o timestamp exato da próxima janela de pico de audiência de cada plataforma.

### [TASK 3] Pipeline Gerador de Vídeos e GIFs Promocionais (`media_factory.py`)
- [ ] Criar função `generate_promo_gif(template_data, output_path)` usando FFmpeg/Pillow para gerar GIFs animados leves com texto dinâmico (preço, urgência "Dia 5: Frete Grátis", ou nome do aniversariante).
- [ ] Criar função `generate_vertical_video(template_data, audio_track, output_path)` em formato 9:16 (1080x1920, 30fps, H.264) pronta para Reels, TikTok e Shorts, aplicando transições dinâmicas e overlay de oferta.
- [ ] Garantir validação de metadados e proporção exigida pelas APIs do TikTok, Instagram e YouTube Shorts (duração menor que 60s, codec AAC/H.264).

### [TASK 4] Conector Google Calendar & Postiz API (`integrations_client.py`)
- [ ] Implementar `GoogleCalendarSync`: autenticar via OAuth2/Service Account e criar/atualizar eventos no Google Calendar com título `[POST] {Plataforma} - {Campanha}`, horário exato de pico e descrição contendo a copy e link do criativo.
- [ ] Implementar `PostizAPIClient`: wrapper assíncrono (`httpx`) para fazer upload do arquivo de mídia (`/api/media`) e agendar a postagem multi-canal (`/api/posts`) passando os IDs dos canais do Instagram, Facebook, TikTok e YouTube Shorts.
- [ ] Criar fallback de Webhook para disparo via n8n caso uma plataforma específica não esteja conectada no Postiz.

### [TASK 5] Endpoints FastAPI e Painel de Controle (`routes/campaigns.py`)
- [ ] `POST /api/campaigns/trigger-scan`: Força a varredura manual de datas do mês, picos dos dias 4/5 e aniversários, gerando os rascunhos de criativos.
- [ ] `POST /api/campaigns/generate-preview`: Gera o vídeo curto ou GIF promocional sob demanda e retorna o preview.
- [ ] `POST /api/campaigns/approve-and-schedule/{post_id}`: Aprova o criativo gerado, agenda no melhor horário de pico no Postiz e sincroniza com o Google Calendar.
- [ ] `GET /api/campaigns/calendar-view`: Retorna a fila unificada de postagens da semana/mês com status em tempo real.

---

# REGRAS DE QUALIDADE E RESTRIÇÕES TÉCNICAS
1. **Zero Hardcoding de Credenciais:** Todas as chaves (`POSTIZ_API_KEY`, `POSTIZ_BASE_URL`, `GOOGLE_CALENDAR_CREDENTIALS`, `META_ACCESS_TOKEN`, `TIKTOK_CLIENT_KEY`) devem ser lidas do arquivo `.env`.
2. **Resiliência e Fila:** Se a renderização de vídeo/GIF ou o envio para a API falhar, implemente retentativa exponencial e salve o log detalhado do erro no banco de dados sem travar a fila principal.
3. **Código Modular e Testável:** Entregue cada módulo com tipagem estrita (`Pydantic v2`), código limpo e um script de teste (`test_campaign_flow.py`) que simule o disparo completo de uma campanha do "Dia 5 - Pico de Consumo" e de um "Aniversário de Cliente".