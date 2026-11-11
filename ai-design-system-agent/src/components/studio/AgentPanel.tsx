"use client";

import { useMemo, useRef, useState } from "react";
import type { AgentResponse, Category, ChatMessage, DesignSystem, ProviderState } from "@/lib/types";

interface Props {
  categories: Category[];
  category: Category;
  designSystem: DesignSystem;
  providers: ProviderState[];
  onApply: (designSystemId: string, categoryId?: string) => void;
  onOpenTab: (tab: string) => void;
  onSeedGeneration: (prompt: string, kind: "image" | "animation" | "video") => void;
  onNotify: (message: string) => void;
}

function Inline({ text }: { text: string }) {
  const tokens = text.split(/(\*\*[^*]+\*\*|`[^`]+`|_[^_]+_)/g).filter(Boolean);
  return (
    <>
      {tokens.map((token, index) => {
        if (token.startsWith("**") && token.endsWith("**")) return <strong key={index}>{token.slice(2, -2)}</strong>;
        if (token.startsWith("`") && token.endsWith("`")) return <code key={index}>{token.slice(1, -1)}</code>;
        if (token.startsWith("_") && token.endsWith("_")) return <em key={index}>{token.slice(1, -1)}</em>;
        return <span key={index}>{token}</span>;
      })}
    </>
  );
}

function MessageBody({ text }: { text: string }) {
  return (
    <div className="agent-msg" style={{ fontSize: 12.5, lineHeight: 1.7 }}>
      {text.split("\n").map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={index} style={{ height: 7 }} />;
        if (trimmed.startsWith("- ")) {
          return (
            <p key={index} style={{ paddingLeft: 12, position: "relative" }}>
              <span style={{ position: "absolute", left: 0, color: "var(--accent)" }}>·</span>
              <Inline text={trimmed.slice(2)} />
            </p>
          );
        }
        if (/^\d+\.\s/.test(trimmed)) {
          return (
            <p key={index} style={{ paddingLeft: 12 }}>
              <Inline text={trimmed} />
            </p>
          );
        }
        return (
          <p key={index}>
            <Inline text={trimmed} />
          </p>
        );
      })}
    </div>
  );
}

const SUGGESTIONS = [
  "Preciso de um e-commerce de joias com ficha de certificado e concierge",
  "Landing de portfólio high-end com scroll storytelling e GSAP",
  "Loja de maquiagem com shade finder e prova de tom",
  "Relógios: comparador técnico de 4 modelos e specs",
  "Defina a stack e as skills para uma loja infantil",
  "Quero um formulário de checkout ligado ao banco do meu app",
];

export default function AgentPanel({
  categories,
  category,
  designSystem,
  providers,
  onApply,
  onOpenTab,
  onSeedGeneration,
  onNotify,
}: Props) {
  const sessionId = useRef(`session-${Math.random().toString(36).slice(2, 9)}`);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: `**Agente UI/UX · ${category.name}**\nEscolha uma categoria no dropdown ou descreva o produto no chat. Eu recupero design systems, skills, stack e MCPs do índice local e posso aplicar tudo no preview.\n\n- Contexto atual: **${designSystem.name}** (${category.short})\n- Recursos: RAG leve no Postgres, LangChain quando houver API key, imagens + Remotion na aba Gerações, formulários Drizzle na aba Formulários.\n\nComo posso ajudar?`,
      meta: { provider: "Local Skills Engine", model: "langindex-rag × skills" },
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [providerId, setProviderId] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const activeProvider = useMemo(
    () => providers.find((provider) => provider.id === providerId) ?? providers.find((provider) => provider.active && provider.hasKey) ?? providers.find((p) => p.hasKey),
    [providerId, providers],
  );

  async function send(text: string) {
    if (!text.trim() || loading) return;
    setInput("");
    setMessages((current) => [...current, { role: "user", content: text }]);
    setLoading(true);
    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          sessionId: sessionId.current,
          categoryId: category.id,
          designSystemId: designSystem.id,
          providerId: providerId || undefined,
        }),
      });
      const json = (await response.json()) as AgentResponse & { error?: string };
      if (!response.ok || json.error) {
        setMessages((current) => [
          ...current,
          { role: "assistant", content: `Falha ao executar o agente: ${json.error ?? response.statusText}. O motor local continua disponível.` },
        ]);
        return;
      }
      setMessages((current) => [...current, { role: "assistant", content: json.message, meta: json }]);
      if (json.categoryId && json.categoryId !== category.id) {
        const label = categories.find((item) => item.id === json.categoryId)?.short ?? json.categoryId;
        onNotify(`Agente carregou ${label} e o design system recomendado`);
        if (json.designSystemIds?.[0]) {
          onApply(json.designSystemIds[0], json.categoryId);
        }
      }
    } catch {
      setMessages((current) => [
        ...current,
        { role: "assistant", content: "Não consegui falar com o endpoint do agente. Verifique a conexão e tente novamente." },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 60);
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 308px", minHeight: "calc(100vh - 49px)" }}>
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div className="toolstrip">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="badge badge-accent">
              <span className="status-dot" /> agente
            </span>
            <span className="hint" style={{ fontSize: 11.5 }}>
              categoria de contexto: <strong style={{ color: "var(--ink)" }}>{category.name}</strong>
            </span>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <select className="select" style={{ width: 210 }} value={providerId} onChange={(event) => setProviderId(event.target.value)}>
              <option value="">Provedor ativo ({activeProvider?.label ?? "local"})</option>
              {providers.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.label} {provider.hasKey ? "· key ok" : "· sem key"}
                </option>
              ))}
            </select>
            <button type="button" className="btn btn-sm" onClick={() => onOpenTab("settings")}>
              configurar APIs
            </button>
          </div>
        </div>

        <div className="scroll-thin" style={{ flex: 1, overflowY: "auto", padding: "18px 20px", display: "grid", gap: 16, alignContent: "start" }}>
          {messages.map((message, index) => {
            const meta = message.meta as AgentResponse | undefined;
            const isUser = message.role === "user";
            return (
              <div key={index} style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}>
                <div
                  className="panel"
                  style={{
                    maxWidth: isUser ? 520 : 760,
                    padding: "12px 15px",
                    background: isUser ? "var(--panel-3)" : "var(--panel)",
                    borderRadius: 12,
                  }}
                >
                  {!isUser && (
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8, flexWrap: "wrap" }}>
                      <span className="badge badge-accent">{meta?.provider ?? "Atelier"}</span>
                      {meta?.model && <span className="badge">{meta.model}</span>}
                      {meta?.offline && <span className="badge badge-rose">offline engine</span>}
                      {meta?.categoryId && <span className="badge badge-blue">{meta.categoryId}</span>}
                    </div>
                  )}
                  <MessageBody text={message.content} />
                  {meta && (
                    <div style={{ marginTop: 12, display: "grid", gap: 9 }}>
                      {meta.designSystemIds?.length ? (
                        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                          {meta.designSystemIds.map((id) => {
                            const systems = categories.flatMap((item) => item.designSystems);
                            const system = systems.find((item) => item.id === id);
                            if (!system) return null;
                            return (
                              <button
                                key={id}
                                type="button"
                                className="chip chip-key"
                                style={{ cursor: "pointer" }}
                                onClick={() => onApply(system.id, system.categoryId)}
                              >
                                ⤷ aplicar {system.name}
                              </button>
                            );
                          })}
                        </div>
                      ) : null}
                      {meta.skills?.length ? (
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {meta.skills.slice(0, 6).map((skill, skillIndex) => (
                            <span key={`${skill.name}-${skillIndex}`} className="chip" style={{ fontSize: 10 }}>
                              ✦ {skill.name}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      {meta.stack ? (
                        <div className="panel-soft" style={{ padding: "8px 10px" }}>
                          <span className="label">Stack recomendada</span>
                          <div className="hint" style={{ fontSize: 10.5, marginTop: 3 }}>
                            {meta.stack.primary}
                          </div>
                          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 5 }}>
                            {[...meta.stack.core.slice(0, 3), ...meta.stack.ui.slice(0, 3)].map((item) => (
                              <span key={item} className="chip" style={{ fontSize: 9, padding: "1px 6px" }}>
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : null}
                      {meta.mcp?.length ? (
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          <span className="label" style={{ alignSelf: "center" }}>
                            MCP
                          </span>
                          {meta.mcp.map((mcp) => (
                            <span key={mcp} className="chip" style={{ fontSize: 9.5 }}>
                              {mcp}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                        <button type="button" className="btn btn-sm" onClick={() => onSeedGeneration(message.content.slice(0, 140) || "campanha", "image")}>
                          gerar imagem
                        </button>
                        <button type="button" className="btn btn-sm" onClick={() => onSeedGeneration(message.content.slice(0, 140) || "campanha", "animation")}>
                          gerar animação
                        </button>
                        <button type="button" className="btn btn-sm" onClick={() => onOpenTab("forms")}>
                          gerar formulário
                        </button>
                        <button type="button" className="btn btn-sm" onClick={() => onOpenTab("gitnexus")}>
                          analisar repo
                        </button>
                      </div>
                      {meta.citations?.length ? (
                        <details>
                          <summary className="hint" style={{ cursor: "pointer", fontSize: 10.5 }}>
                            RAG · {meta.citations.length} citações · trace {meta.trace?.length ?? 0} passos
                          </summary>
                          <div style={{ display: "grid", gap: 4, marginTop: 6 }}>
                            {meta.citations.map((citation) => (
                              <div key={citation.id} className="hint" style={{ fontSize: 10, display: "flex", gap: 6 }}>
                                <span className="mono" style={{ color: "var(--accent)" }}>
                                  {citation.score.toFixed(3)}
                                </span>
                                <span style={{ color: "var(--muted)" }}>{citation.title}</span>
                              </div>
                            ))}
                            {meta.trace?.map((step) => (
                              <div key={step} className="mono" style={{ fontSize: 9.5, color: "var(--faint)" }}>
                                → {step}
                              </div>
                            ))}
                          </div>
                        </details>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {loading && (
            <div className="panel" style={{ padding: "11px 14px", maxWidth: 220 }}>
              <span className="typing">
                <span />
                <span />
                <span />
              </span>
              <span className="hint" style={{ marginLeft: 8, fontSize: 11 }}>
                recuperando skills…
              </span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div style={{ borderTop: "1px solid var(--line)", padding: "12px 16px", background: "var(--panel)" }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 9 }}>
            {SUGGESTIONS.slice(0, 3).map((suggestion) => (
              <button key={suggestion} type="button" className="chip" style={{ cursor: "pointer" }} onClick={() => send(suggestion)}>
                {suggestion.length > 62 ? `${suggestion.slice(0, 60)}…` : suggestion}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <textarea
              className="textarea"
              rows={2}
              placeholder={`Descreva o produto ou peça uma stack. Ex: “quero uma loja de relógios com comparador técnico e formulário de agendamento”.`}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  send(input);
                }
              }}
            />
            <button type="button" className="btn btn-primary" disabled={loading || !input.trim()} onClick={() => send(input)}>
              Enviar ↵
            </button>
          </div>
          <div className="hint" style={{ fontSize: 10, marginTop: 7 }}>
            LangChain + LangIndex RAG · {providers.filter((p) => p.hasKey).length} provedor(es) com chave ·{" "}
            {activeProvider ? `modelo ${activeProvider.model}` : "motor local de skills ativo"}
          </div>
        </div>
      </div>

      <aside className="scroll-thin" style={{ borderLeft: "1px solid var(--line)", padding: 15, overflowY: "auto", maxHeight: "calc(100vh - 49px)", background: "var(--panel)" }}>
        <span className="label">Sugestões de prompt</span>
        <div style={{ display: "grid", gap: 6, marginTop: 8 }}>
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className="panel-soft"
              style={{ textAlign: "left", padding: "8px 10px", fontSize: 11, color: "var(--muted)", cursor: "pointer", lineHeight: 1.5 }}
              onClick={() => send(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 18 }}>
          <span className="label">Skills carregadas neste DS</span>
          <div className="skills-list" style={{ marginTop: 8 }}>
            {designSystem.skills.map((skill, index) => (
              <div key={skill.id} className="skill-row">
                <span className="skill-index">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <div style={{ fontSize: 11 }}>{skill.name}</div>
                  <div className="hint" style={{ fontSize: 9.5, marginTop: 2 }}>
                    {skill.level}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 18 }} className="panel-soft">
          <div style={{ padding: "10px 11px" }}>
            <span className="label">Integrações do agente</span>
            <div style={{ display: "grid", gap: 5, marginTop: 7, fontSize: 10.5, color: "var(--muted)" }}>
              <span>· RAG local (hash embeddings + cosseno)</span>
              <span>· LangChain ChatOpenAI multi-provider</span>
              <span>· MCP 21st.dev, shadcn, Figma, Context7</span>
              <span>· GitNexus para ler endpoints do app alvo</span>
              <span>· Remotion para animações geradas</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
