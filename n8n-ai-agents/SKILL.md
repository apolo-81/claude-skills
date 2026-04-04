---
name: n8n-ai-agents
description: >
  Construye agentes IA en n8n con Claude, OpenAI o LangChain.
  Usar cuando: "n8n AI", "n8n agent", "n8n Claude", "agente n8n",
  "automatización con IA", "RAG en n8n", "n8n vector store",
  "n8n memory", "clasificar con IA", "extraer datos con IA", "n8n + GPT".
---

# n8n AI Agents

## 1. Nodos de IA en n8n

| Nodo | Uso | Cuando |
|------|-----|--------|
| **AI Transform** | Input > prompt > output simple | Clasificar, resumir, traducir |
| **Information Extractor** | Texto libre > JSON estructurado | Extraer campos de emails/docs |
| **Basic LLM Chain** | Prompt template + modelo | Transformaciones controladas |
| **AI Agent** | Agente con tools + memoria | Tareas multi-paso, decisiones |

AI Transform/Extractor: operacion determinista unica. AI Agent: cuando el modelo decide que tool usar, loop de razonamiento, o memoria.

**Modelos recomendados:**
- `claude-haiku-4-5`: tareas simples — 70% mas barato
- `claude-sonnet-4-6`: agentes complejos multi-paso
- `gpt-4o-mini`: alternativa economica para volumen alto

---

## 2. AI Transform — Transformaciones Simples

Prompt para clasificar emails:
```
Clasifica este email en UNA de estas categorias:
- BILLING: pagos, facturas, cobros
- TECHNICAL: bugs, errores, no funciona
- GENERAL: preguntas, informacion

Responde SOLO con la categoria (una palabra, mayusculas).

Email: {{ $json.body }}
```

Formato estricto porque el output va a nodo Switch/IF.

Otros: sentimiento (POSITIVO/NEGATIVO/NEUTRO), idioma (ISO 639-1), urgencia (URGENTE/NORMAL).

---

## 3. Information Extractor — Datos Estructurados

Schema de ejemplo para leads:
```json
{
  "company": { "type": "string" },
  "contact_name": { "type": "string" },
  "budget_usd": { "type": "number" },
  "timeline": { "type": "string" },
  "pain_points": { "type": "array", "items": { "type": "string" } },
  "urgency": { "type": "string", "enum": ["low", "medium", "high"] }
}
```

Maneja retry automatico si el LLM no devuelve JSON valido. Resultado accesible como `$json.company`, etc.

Casos: email lead > CRM, feedback > Supabase, factura > contabilidad, CV > ATS.

---

## 4. Basic LLM Chain

Usar sobre AI Transform cuando necesitas System Message separado o prompt dinamico.

```
System: Eres el asistente de soporte de {{ $vars.company_name }}.
Responde en el mismo idioma que el usuario. Fecha: {{ $now.format('DD/MM/YYYY') }}

User: {{ $json.message }}
```

---

## 5. AI Agent — Agentes con Tools

**Chat Model:** `claude-sonnet-4-6` (necesita tool use)

**Tools disponibles:** HTTP Request Tool, Code Tool, Supabase/PostgreSQL Tool, Calculator, Custom HTTP APIs.

**Memory:** `Window Buffer Memory` para multi-turn (default 10 msgs). Para produccion: Postgres Chat Memory con `sessionId`.

Ver `references/agent-patterns.md` para ejemplo completo de agente de investigacion y setup de memoria.

---

## 6. RAG en n8n

Setup: Document Loader (PDF/texto/URL) > Embeddings > Vector Store (Supabase pgvector) > Retriever como tool del Agent.

Nodos: `Default Data Loader`/`PDF Loader`, `Embeddings OpenAI`/`Anthropic`, `Supabase Vector Store`, `Vector Store Retriever`.

Ver `references/agent-patterns.md` para setup SQL pgvector completo y workflow paso a paso.

---

## 7. Memoria y Sesiones

| Tipo | Pros | Contras |
|------|------|---------|
| Window Buffer Memory | Simple, sin setup | Se pierde al reiniciar |
| Postgres Chat Memory | Persiste, sesiones paralelas | Requiere tabla SQL |

```
Session ID: {{ $json.user_id }}_{{ $json.conversation_id }}
Table Name: n8n_chat_memory
```

Ver `references/agent-patterns.md` para schema SQL de `n8n_chat_memory`.

---

## 8. Integracion con Next.js

```
Usuario escribe > POST /api/chat > n8n Webhook > AI Agent (memoria Postgres) > Respond to Webhook > streaming response
```

Para los 4 patrones de comunicación Next.js ↔ n8n, ver skill `n8n-to-api`.

---

## 9. Costos

| Operacion | Modelo | Costo aprox |
|-----------|--------|-------------|
| Clasificar email | haiku | ~$0.0001 |
| Extraer datos doc | sonnet | ~$0.005 |
| Agent 5 tool calls | sonnet | ~$0.05 |

Control: nodo IF antes de AI para filtrar, haiku para clasificacion inicial + sonnet solo para complejos, loguear tokens.

---

## Referencias

- `references/agent-patterns.md` — Agentes, RAG pgvector, integracion Next.js
- `references/prompt-engineering.md` — Prompts por caso: soporte, ventas, extraccion, moderacion
