"use client";

import { useMemo, useState } from "react";
import type { McpServer } from "@/lib/types";

interface Props {
  mcp: McpServer[];
  onNotify: (message: string) => void;
}

export default function McpPanel({ mcp, onNotify }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [connected, setConnected] = useState<string[]>([]);

  const categories = useMemo(() => Array.from(new Set(mcp.map((server) => server.category))), [mcp]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return mcp.filter((server) => {
      const matchesCategory = category === "all" || server.category === category;
      const matchesQuery =
        !q || [server.name, server.vendor, server.description, ...server.envKeys].join(" ").toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [category, mcp, query]);

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      onNotify("Comando copiado");
    } catch {
      onNotify("Não foi possível copiar");
    }
  }

  return (
    <div style={{ padding: 20, display: "grid", gap: 16 }}>
      <header style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <span className="label">Model Context Protocol</span>
          <h1 className="display" style={{ fontSize: 32, margin: "6px 0 4px" }}>
            Ferramentas de design para o agente
          </h1>
          <p className="hint" style={{ maxWidth: 720 }}>
            Lista pré-carregada com os principais MCPs de UI/UX, design source, dados e motion. Copie o comando, conecte e o agente passa a
            consultar o servidor durante a geração. O 21st.dev Magic vem habilitado como primeira sugestão.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input className="input" style={{ width: 260 }} placeholder="Buscar MCP, vendor, env…" value={query} onChange={(event) => setQuery(event.target.value)} />
          <select className="select" style={{ width: 190 }} value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="all">Todas as categorias</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="card-grid">
        {filtered.map((server) => {
          const isConnected = connected.includes(server.id);
          return (
            <div key={server.id} className="panel" style={{ padding: 14, display: "grid", gap: 9, alignContent: "start" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{server.name}</span>
                    {server.featured && <span className="badge badge-accent">featured</span>}
                    {server.id === "21st-dev-magic" && <span className="badge badge-blue">recomendado</span>}
                  </div>
                  <div className="hint" style={{ fontSize: 10.5 }}>
                    {server.vendor} · {server.transport} · {server.category}
                  </div>
                </div>
                <span className={`badge ${isConnected ? "badge-accent" : ""}`}>{isConnected ? "conectado" : "pronto"}</span>
              </div>
              <p style={{ fontSize: 11.5, color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>{server.description}</p>
              <div className="codeblock" style={{ fontSize: 10, padding: "7px 9px" }}>
                {server.install}
              </div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                <span className="chip" style={{ fontSize: 9.5 }}>
                  {server.endpoint.length > 38 ? `${server.endpoint.slice(0, 36)}…` : server.endpoint}
                </span>
                {server.envKeys.map((key) => (
                  <span key={key} className="chip" style={{ fontSize: 9.5 }}>
                    {key}
                  </span>
                ))}
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
                <button type="button" className="btn btn-sm" onClick={() => copy(server.install)}>
                  copiar comando
                </button>
                <a className="btn btn-sm btn-ghost" href={server.docs} target="_blank" rel="noreferrer">
                  docs ↗
                </a>
                <button
                  type="button"
                  className={`btn btn-sm ${isConnected ? "" : "btn-primary"}`}
                  style={{ marginLeft: "auto" }}
                  onClick={() => {
                    setConnected((current) => (current.includes(server.id) ? current.filter((id) => id !== server.id) : [...current, server.id]));
                    onNotify(isConnected ? `${server.name} desconectado` : `${server.name} conectado ao agente`);
                  }}
                >
                  {isConnected ? "desconectar" : "conectar"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="panel" style={{ padding: 16 }}>
        <span className="label">Como o agente usa MCPs</span>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12, marginTop: 10 }}>
          {[
            ["Design source", "Figma MCP lê tokens e frames; o agente converte em componentes Tailwind + shadcn."],
            ["UI generation", "Magic 21st.dev e registries shadcn/magic-ui entregam variações prontas para o preview."],
            ["Docs & QA", "Context7 evita API inventada; Playwright valida visualmente cada alteração."],
            ["Dados", "Postgres/Supabase/Neon MCPs alimentam a geração de formulários já ligados ao banco."],
            ["Contexto de código", "GitHub + GitNexus mapeiam endpoints e schemas do app que receberá o frontend."],
            ["Motion", "Toolkit Remotion gera e renderiza composições de loading e vídeo."],
          ].map(([title, description]) => (
            <div key={title} className="panel-soft" style={{ padding: "10px 12px" }}>
              <div style={{ fontSize: 12, fontWeight: 500 }}>{title}</div>
              <div className="hint" style={{ fontSize: 10.5, marginTop: 4 }}>
                {description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
