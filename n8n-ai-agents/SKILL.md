---
name: n8n-ai-agents
description: >
  AI agents in n8n with Claude, OpenAI, or LangChain. Triggers: "n8n AI",
  "n8n agent", "n8n Claude", "n8n OpenAI", "n8n LangChain", "AI agent n8n",
  "automatización con IA", "n8n tools agent", "n8n + GPT", "RAG en n8n",
  "n8n vector store", "n8n memory", "n8n AI workflow", "n8n summarize",
  "n8n extract data", "n8n classify", "n8n prompt".
---

# n8n AI Agents — Guía de Implementación

## 1. Overview — Capas de IA en n8n

n8n tiene 4 nodos principales de IA (basados en LangChain):

| Nodo | Uso | Cuándo |
|------|-----|--------|
| **AI Transform** | Input → prompt → output simple | Clasificar, resumir, traducir |
| **Information Extractor** | Texto libre → JSON estructurado | Extraer campos de emails/docs |
| **Basic LLM Chain** | Prompt template + modelo | Transformaciones controladas |
| **AI Agent** | Agente con tools + memoria | Tareas multi-paso, decisiones |

**Cuándo usar AI Agent vs los demás:**
- AI Transform / Extractor: una sola operación determinista
- AI Agent: necesitas que el modelo decida qué tool usar, loop de razonamiento, o memoria

**Modelos recomendados:**
- `claude-haiku-4-5`: tareas simples (clasificar, extraer) — 70% más barato
- `claude-sonnet-4-6`: agentes complejos con múltiples pasos — mejor razonamiento
- `gpt-4o-mini`: alternativa económica para volumen alto

---

## 2. Configurar Credenciales en n8n

**Anthropic (Claude):**
1. Settings → Credentials → New → Anthropic
2. API Key: desde console.anthropic.com
3. En nodos de IA: Chat Model → Anthropic Chat Model

**OpenAI:**
1. Settings → Credentials → New → OpenAI
2. API Key: desde platform.openai.com

---

## 3. AI Transform — Transformaciones Simples

Para clasificar, resumir, extraer o traducir en un nodo:

**Configuración del nodo:**
- Node: `AI Transform`
- Prompt: instrucción directa con `{{ $json.campo }}`

**Prompt para clasificar emails de soporte:**
```
Clasifica este email en UNA de estas categorías:
- BILLING: pagos, facturas, cobros
- TECHNICAL: bugs, errores, no funciona
- GENERAL: preguntas, información

Responde SOLO con la categoría (una palabra, mayúsculas).

Email: {{ $json.body }}
```

**Por qué formato estricto:** El output va a un nodo Switch o IF que necesita parsear el texto. Pide exactamente lo que vas a comparar.

**Otros prompts útiles:**
- Sentimiento: `Analiza el sentimiento. Responde: POSITIVO, NEGATIVO, o NEUTRO`
- Idioma: `Detecta el idioma. Responde con el código ISO 639-1 (ej: es, en, fr)`
- Urgencia: `¿Es urgente? Responde: URGENTE o NORMAL. Urgente = problema que impide trabajar`

---

## 4. Information Extractor — Datos Estructurados

Extrae campos específicos de texto libre y devuelve JSON:

**Schema de ejemplo para leads:**
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

**Por qué usar este nodo vs prompt manual:** Maneja automáticamente el retry si el LLM no devuelve JSON válido. El resultado está disponible directamente como `$json.company`, `$json.budget_usd`, etc.

**Casos de uso:**
- Email de lead → datos para CRM
- Feedback de usuario → campos para Supabase
- Factura/recibo → campos para contabilidad
- CV/resume → datos para ATS

---

## 5. Basic LLM Chain — Control de Prompt

Para más control sobre el prompt que AI Transform:

```
System Message:
Eres el asistente de soporte de {{ $vars.company_name }}.
Responde siempre en el mismo idioma que el usuario.
Fecha actual: {{ $now.format('DD/MM/YYYY') }}
Sé conciso y profesional.

User Message:
{{ $json.message }}
```

**Cuándo usar sobre AI Transform:**
- Necesitas System Message separado
- El prompt varía dinámicamente según el input
- Quieres reutilizar el mismo nodo para múltiples tipos de input

---

## 6. AI Agent — Agentes con Tools

El agente decide qué tools usar y en qué orden. Configuración:

**Chat Model:** Anthropic Claude claude-sonnet-4-6 (necesita tool use)

**Tools disponibles:**
- `HTTP Request Tool`: llama a APIs externas
- `Code Tool`: ejecuta JavaScript/Python
- `Supabase Tool` / `PostgreSQL Tool`: consultas SQL
- `Calculator`: operaciones matemáticas
- **Custom Tools via HTTP Request**: cualquier API que expones como tool

**Ejemplo — Agente de Investigación de Empresas:**
```
System Prompt:
Eres un investigador especializado en análisis de empresas.
Dado un nombre de empresa, tu objetivo es:
1. Buscar información pública de la empresa
2. Estimar el tamaño y sector
3. Identificar si es un buen prospecto para [producto]
4. Devolver un JSON con: { company, size, sector, score (1-10), reasoning }

Usa las tools disponibles para buscar información.
```

Tools del agente:
- HTTP Request Tool → SerpAPI para búsqueda web
- HTTP Request Tool → API de LinkedIn / Apollo
- Code Tool → limpiar y estructurar datos

**Memory:** Para conversaciones multi-turn, conectar `Window Buffer Memory` al agente. Define cuántos mensajes anteriores incluir (por defecto 10).

---

## 7. RAG en n8n — Documentos como Contexto

Para responder preguntas sobre tus propios documentos:

**Setup básico:**
1. Cargar documentos → Document Loader (PDF, texto, URL) → Vector Store (Supabase pgvector o Pinecone)
2. En el workflow de respuesta: Query → Embeddings → Vector Store Retrieval → Inject en prompt

**Nodos involucrados:**
- `Default Data Loader` o `PDF Loader`
- `Embeddings OpenAI` o `Embeddings Anthropic`
- `Supabase Vector Store` (usa tu DB existente)
- `Vector Store Retriever` → conectado al AI Agent como tool

**Por qué Supabase Vector Store:** Ya tienes Supabase en tu stack. La extensión pgvector evita agregar otra base de datos.

Ver `references/agent-patterns.md` para el setup SQL completo y workflow paso a paso.

---

## 8. Memoria y Sesiones de Chat

**Window Buffer Memory:** Los últimos N mensajes en memoria RAM del nodo
- Ventaja: simple, sin setup
- Desventaja: se pierde si el workflow se reinicia

**Postgres Chat Memory (recomendado para producción):**
- Persiste conversaciones en Supabase
- Permite múltiples sesiones paralelas con `sessionId`
- El `sessionId` puede ser el `userId` o `conversationId` del usuario

```
Session ID: {{ $json.user_id }}_{{ $json.conversation_id }}
Table Name: n8n_chat_memory
```

SQL para crear la tabla en Supabase:
```sql
create table n8n_chat_memory (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  message jsonb not null,
  created_at timestamptz default now()
);
create index on n8n_chat_memory (session_id, created_at);
```

---

## 9. Patterns de Integración con Next.js

**Chatbot en Next.js → n8n como backend:**
```
Usuario escribe → POST /api/chat → n8n Webhook
  → AI Agent (con memoria Postgres)
  → Respond to Webhook
  → Streaming response al usuario
```

Ver `references/agent-patterns.md` para los 4 patterns de integración Next.js ↔ n8n con código TypeScript.

---

## 10. Límites y Costos

**Rate limits de modelos:**
- Claude: 50 RPM (Tier 1), 1000 RPM (Tier 4)
- OpenAI: varía por tier

**Estimación de costo por operación:**
- Clasificar email (haiku): ~$0.0001
- Extraer datos de doc (sonnet): ~$0.005
- Agent con 5 tool calls (sonnet): ~$0.05

**Control de costos en n8n:**
- Agregar nodo IF antes del AI para filtrar casos que no necesitan IA
- Usar haiku para clasificación inicial, sonnet solo para los casos complejos
- Loguear tokens usados: `{{ $json.usage.input_tokens }}` + `{{ $json.usage.output_tokens }}`

---

## Referencias

- `references/agent-patterns.md` — Configuración detallada de agentes, RAG con pgvector, integración Next.js ↔ n8n
- `references/prompt-engineering.md` — Prompts efectivos por caso de uso: soporte, ventas, extracción, moderación
