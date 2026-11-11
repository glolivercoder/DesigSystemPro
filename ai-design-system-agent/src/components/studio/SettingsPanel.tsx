"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { providerDefinitions } from "@/lib/integrations-data";
import type { ProviderState } from "@/lib/types";

interface Props {
  providers: ProviderState[];
  onProvidersChange: (providers: ProviderState[]) => void;
  onNotify: (message: string) => void;
  freeMode: boolean;
}

function fallbackStates(): ProviderState[] {
  return providerDefinitions.map((definition, index) => ({
    id: definition.id,
    label: definition.label,
    baseUrl: definition.baseUrl,
    model: definition.textModels[0] ?? "",
    imageModel: definition.imageModels[0] ?? "",
    enabled: index === 0,
    active: index === 0,
    freeOnly: true,
    supportsImage: definition.supportsImage,
    hasKey: false,
    keyPreview: "",
    envKey: definition.envKey,
    freeModels: definition.freeModels,
    textModels: definition.textModels,
    imageModels: definition.imageModels,
    docs: definition.docs,
    lastTest: null,
  }));
}

export default function SettingsPanel({ providers, onProvidersChange, onNotify, freeMode }: Props) {
  const states = providers.length ? providers : fallbackStates();
  const [local, setLocal] = useState<ProviderState[]>(states);
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [reveal, setReveal] = useState<Record<string, boolean>>({});
  const [saveState, setSaveState] = useState<Record<string, "idle" | "saving" | "saved">>({});
  const [testing, setTesting] = useState<string | null>(null);
  const [free, setFree] = useState(freeMode);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    if (providers.length) setLocal(providers);
  }, [providers]);

  const providerList = local.length ? local : fallbackStates();

  const save = useMemo(
    () =>
      async (id: string, patch: Record<string, unknown>, keyValue?: string) => {
        setSaveState((current) => ({ ...current, [id]: "saving" }));
        try {
          const response = await fetch("/api/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ provider: { id, ...patch, ...(keyValue ? { apiKey: keyValue } : {}) } }),
          });
          const json = (await response.json()) as { ok?: boolean; providers?: ProviderState[]; error?: string };
          if (json.providers) {
            setLocal(json.providers);
            onProvidersChange(json.providers);
          }
          setSaveState((current) => ({ ...current, [id]: json.ok ? "saved" : "idle" }));
          if (!json.ok) onNotify(json.error ?? "Falha ao salvar provedor");
        } catch {
          setSaveState((current) => ({ ...current, [id]: "idle" }));
          onNotify("Falha de rede ao salvar configuração");
        }
      },
    [onNotify, onProvidersChange],
  );

  function patch(id: string, value: Partial<ProviderState>, keyValue?: string) {
    setLocal((current) => current.map((provider) => (provider.id === id ? { ...provider, ...value } : provider)));
    setSaveState((current) => ({ ...current, [id]: "saving" }));
    if (timers.current[id]) clearTimeout(timers.current[id]);
    timers.current[id] = setTimeout(() => {
      const provider = providerList.find((item) => item.id === id);
      if (!provider) return;
      void save(
        id,
        {
          baseUrl: provider.baseUrl,
          model: provider.model,
          imageModel: provider.imageModel,
          enabled: provider.enabled,
          active: provider.active,
          freeOnly: provider.freeOnly,
          ...value,
        },
        keyValue,
      );
    }, 750);
  }

  function saveKey(id: string, value: string) {
    setKeys((current) => ({ ...current, [id]: value }));
    if (timers.current[`${id}-key`]) clearTimeout(timers.current[`${id}-key`]);
    timers.current[`${id}-key`] = setTimeout(() => {
      void save(id, {}, value);
    }, 1000);
  }

  async function test(id: string) {
    setTesting(id);
    try {
      const response = await fetch("/api/settings/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = (await response.json()) as { ok: boolean; message: string; latencyMs?: number };
      setLocal((current) =>
        current.map((provider) =>
          provider.id === id
            ? { ...provider, lastTest: { ok: json.ok, message: json.message, at: new Date().toISOString(), latencyMs: json.latencyMs } }
            : provider,
        ),
      );
      onNotify(json.ok ? `API validada em ${json.latencyMs ?? "?"}ms` : json.message.slice(0, 120));
    } catch {
      onNotify("Falha ao testar a API");
    } finally {
      setTesting(null);
    }
  }

  async function toggleFreeMode(value: boolean) {
    setFree(value);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: { freeMode: { enabled: value } } }),
      });
      for (const provider of providerList) {
        await save(provider.id, { freeOnly: value });
      }
      onNotify(value ? "Modo gratuito ativado: modelos :free priorizados" : "Modo gratuito desativado");
    } catch {
      onNotify("Falha ao salvar modo gratuito");
    }
  }

  return (
    <div style={{ padding: 20, display: "grid", gap: 16 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
        <div>
          <span className="label">Configurações · LLMs e chaves</span>
          <h1 className="display" style={{ fontSize: 32, margin: "6px 0 4px" }}>
            Provedores de IA
          </h1>
          <p className="hint" style={{ maxWidth: 720 }}>
            Cada alteração é salva automaticamente no Postgres e espelhada no <span className="mono">.env</span> do projeto (chaves ficam
            mascaradas na interface). Sem chave, o estúdio usa o motor local de RAG + skills, imagem SVG e Remotion.
          </p>
        </div>
        <div className="panel" style={{ padding: "10px 13px", display: "flex", gap: 12, alignItems: "center" }}>
          <div>
            <div className="label">Somente LLMs gratuitas</div>
            <div className="hint" style={{ fontSize: 10.5 }}>
              Prioriza modelos <span className="mono">:free</span> nos roteadores
            </div>
          </div>
          <button type="button" className="switch" data-on={free} onClick={() => toggleFreeMode(!free)} role="switch" aria-checked={free} aria-label="Modelos gratuitos" />
        </div>
      </header>

      <div className="card-grid">
        {providerList.map((provider) => {
          const state = saveState[provider.id] ?? "idle";
          const models = [...provider.textModels, ...provider.freeModels.filter((model) => !provider.textModels.includes(model))];
          return (
            <div key={provider.id} className="panel" style={{ padding: 14, display: "grid", gap: 10, alignContent: "start" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13.5, fontWeight: 500 }}>{provider.label}</span>
                    {provider.active && <span className="badge badge-accent">ativa</span>}
                    {provider.hasKey ? <span className="badge badge-blue">key ok</span> : <span className="badge badge-rose">sem key</span>}
                  </div>
                  <a href={provider.docs} target="_blank" rel="noreferrer" className="hint" style={{ fontSize: 10, textDecoration: "underline" }}>
                    documentação ↗
                  </a>
                </div>
                <button
                  type="button"
                  className="switch"
                  data-on={provider.enabled}
                  onClick={() => patch(provider.id, { enabled: !provider.enabled })}
                  aria-label={`Ativar ${provider.label}`}
                />
              </div>

              <label style={{ display: "grid", gap: 4 }}>
                <span className="label">API key · {provider.envKey}</span>
                <div style={{ display: "flex", gap: 5 }}>
                  <input
                    className="input"
                    type={reveal[provider.id] ? "text" : "password"}
                    placeholder={provider.hasKey ? provider.keyPreview : "cole a chave e o salvamento é automático"}
                    value={keys[provider.id] ?? ""}
                    onChange={(event) => saveKey(provider.id, event.target.value)}
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <button type="button" className="iconbtn" onClick={() => setReveal((current) => ({ ...current, [provider.id]: !current[provider.id] }))}>
                    {reveal[provider.id] ? "◡" : "◠"}
                  </button>
                </div>
              </label>

              <label style={{ display: "grid", gap: 4 }}>
                <span className="label">Base URL</span>
                <input className="input mono" style={{ fontSize: 10.5 }} value={provider.baseUrl} onChange={(event) => patch(provider.id, { baseUrl: event.target.value })} />
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                <label style={{ display: "grid", gap: 4 }}>
                  <span className="label">Modelo de texto</span>
                  <select className="select" value={provider.model} onChange={(event) => patch(provider.id, { model: event.target.value })}>
                    {models.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </label>
                <label style={{ display: "grid", gap: 4 }}>
                  <span className="label">Modelo de imagem</span>
                  <select className="select" value={provider.imageModel} onChange={(event) => patch(provider.id, { imageModel: event.target.value })}>
                    {provider.imageModels.length === 0 && <option value="">—</option>}
                    {provider.imageModels.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <label className="hint" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10.5 }}>
                  <span className="switch" data-on={provider.freeOnly} onClick={() => patch(provider.id, { freeOnly: !provider.freeOnly })} role="switch" aria-checked={provider.freeOnly} />
                  gratuitas
                </label>
                <span className="mono" style={{ fontSize: 9.5, color: "var(--faint)", marginLeft: "auto" }}>
                  {state === "saving" ? "salvando…" : state === "saved" ? "salvo ✓" : "auto-save"}
                </span>
              </div>

              <div style={{ display: "flex", gap: 6 }}>
                <button type="button" className="btn btn-sm" onClick={() => test(provider.id)} disabled={testing === provider.id}>
                  {testing === provider.id ? "testando…" : "testar API"}
                </button>
                <button type="button" className={`btn btn-sm ${provider.active ? "" : "btn-primary"}`} onClick={() => patch(provider.id, { active: true, enabled: true })}>
                  {provider.active ? "em uso" : "usar esta"}
                </button>
              </div>

              {provider.lastTest && (
                <div className={`panel-soft`} style={{ padding: "7px 9px", borderColor: provider.lastTest.ok ? "rgba(215,247,107,0.3)" : "rgba(255,128,128,0.3)" }}>
                  <span className="mono" style={{ fontSize: 9.5, color: provider.lastTest.ok ? "var(--accent)" : "var(--danger)" }}>
                    {provider.lastTest.ok ? "OK" : "ERRO"} · {provider.lastTest.latencyMs ?? 0}ms
                  </span>
                  <div className="hint" style={{ fontSize: 9.5, marginTop: 2 }}>
                    {provider.lastTest.message}
                  </div>
                </div>
              )}

              {!provider.supportsImage && <span className="badge badge-off">sem imagem</span>}
            </div>
          );
        })}
      </div>

      <div className="panel" style={{ padding: 15 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <span className="label">Persistência</span>
          <span className="badge badge-blue">.env + postgres</span>
        </div>
        <pre className="codeblock" style={{ marginTop: 9 }}>{`# .env (gerado automaticamente; valores mascarados na UI)
${providerList.map((provider) => `${provider.envKey}=${provider.hasKey ? provider.keyPreview : ""}`).join("\n")}
ACTIVE_LLM_PROVIDER=${providerList.find((provider) => provider.active)?.id ?? "openrouter"}

# tabela llm_providers guarda api_key, base_url, model, image_model,
# enabled, active, free_only e o último teste (jsonb last_test).`}</pre>
        <p className="hint" style={{ marginTop: 9 }}>
          O agente usa LangChain <span className="mono">ChatOpenAI</span> com baseURL por provedor, o que cobre OpenRouter, Gemini (endpoint
          compatível), OpenAI, 9Router e OmniRoute. A geração de imagem tenta Gemini nativo, OpenAI Images ou OpenRouter multimodal e faz fallback
          para o renderer SVG local.
        </p>
      </div>
    </div>
  );
}
