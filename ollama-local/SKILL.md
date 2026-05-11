---
name: ollama-local
description: >
  Ollama para correr LLMs locales (qwen, llama, mistral): instalación, modelos,
  API HTTP, streaming, embeddings, prompt engineering local y deploy en servidor
  propio. Usar cuando: "Ollama", "LLM local", "qwen2.5", "qwen3", "llama3",
  "mistral", "self-hosted LLM", "Ollama API", "ollama run", "modelfile",
  "ollama embeddings", "ollama serve", "GPU local", "modelo cuantizado", "GGUF".
  Do NOT use for: apps que solo usan Claude/OpenAI cloud (usar claude-api o llm-streaming-app),
  fine-tuning serio (usar Modal/Replicate).
---

# Ollama Local

Stack confirmado: ProspectorLocal (Sofía bot qwen3:8b), AstroLectura (qwen2.5).

## Instalación

```bash
# Linux
curl -fsSL https://ollama.com/install.sh | sh

# macOS
brew install ollama
```

Inicia daemon: `ollama serve` (default port 11434). Linux: `systemctl start ollama`.

## Modelos recomendados por uso

| Uso | Modelo | Tamaño | Notas |
|-----|--------|--------|-------|
| Chat general español | `qwen2.5:7b` | 4.4 GB | Buen balance calidad/RAM |
| Razonamiento + tool use | `qwen3:8b` | 5.1 GB | Mejor que qwen2.5 en cadenas multi-paso |
| Código | `qwen2.5-coder:7b` | 4.4 GB | Especializado |
| Embeddings | `nomic-embed-text` | 274 MB | 768 dims |
| Ultra ligero | `qwen2.5:3b` | 1.9 GB | Para edge / Raspberry |

```bash
ollama pull qwen3:8b
ollama list                 # ver modelos descargados
ollama rm qwen2.5:7b        # liberar espacio
```

## API HTTP — generate (one-shot)

```bash
curl http://localhost:11434/api/generate -d '{
  "model": "qwen3:8b",
  "prompt": "Hola, ¿cómo estás?",
  "stream": false
}'
```

Response: `{ "response": "...", "done": true, "total_duration": 1234567 }`.

## API HTTP — streaming

```bash
curl -N http://localhost:11434/api/generate -d '{
  "model": "qwen3:8b",
  "prompt": "Cuenta hasta 5",
  "stream": true
}'
```

Cada chunk: `{ "response": "1", "done": false }\n` (NDJSON, no SSE).

Node.js:
```js
const res = await fetch('http://localhost:11434/api/generate', {
  method: 'POST',
  body: JSON.stringify({ model: 'qwen3:8b', prompt, stream: true }),
});
const reader = res.body.getReader();
const decoder = new TextDecoder();
let buffer = '';
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  buffer += decoder.decode(value, { stream: true });
  const lines = buffer.split('\n');
  buffer = lines.pop(); // incomplete chunk
  for (const line of lines.filter(Boolean)) {
    const { response, done: end } = JSON.parse(line);
    process.stdout.write(response);
    if (end) return;
  }
}
```

Si necesitas convertir a SSE para frontend Next.js, ver skill `llm-streaming-app`.

## API HTTP — chat (multi-turn)

```bash
curl http://localhost:11434/api/chat -d '{
  "model": "qwen3:8b",
  "messages": [
    { "role": "system", "content": "Eres Sofía, asistente de prospección WhatsApp." },
    { "role": "user", "content": "Hola, vi tu negocio en Google" }
  ],
  "stream": false
}'
```

Estructura idéntica a OpenAI chat completions.

## Embeddings

```bash
curl http://localhost:11434/api/embed -d '{
  "model": "nomic-embed-text",
  "input": "texto a vectorizar"
}'
```

Response: `{ "embeddings": [[0.1, 0.2, ...]] }`.

Útil para búsqueda semántica local (combinar con pgvector / sqlite-vec).

## Modelfile — system prompt persistente

```dockerfile
# Sofia.Modelfile
FROM qwen3:8b

SYSTEM """
Eres Sofía, asistente de prospección por WhatsApp para [empresa].
Tono: cercano, mexicano, profesional. Nunca presiones.
Si el lead pregunta por precio, deriva a humano.
"""

PARAMETER temperature 0.7
PARAMETER num_ctx 4096
```

```bash
ollama create sofia -f Sofia.Modelfile
ollama run sofia
```

## Tool calling (modelos compatibles)

qwen3 y llama3.1+ soportan tools:
```json
{
  "model": "qwen3:8b",
  "messages": [{"role": "user", "content": "¿clima en CDMX?"}],
  "tools": [{
    "type": "function",
    "function": {
      "name": "get_weather",
      "parameters": { "type": "object", "properties": { "city": { "type": "string" } } }
    }
  }]
}
```

Response incluye `tool_calls` cuando el modelo decide invocar.

## Performance — GPU vs CPU

- Sin GPU: qwen2.5:3b corre a ~10 tok/s en laptop modern.
- Con GPU NVIDIA 8GB+: qwen2.5:7b a 40-80 tok/s.
- Apple Silicon M1+: aceleración Metal automática, qwen2.5:7b a 30-50 tok/s.

Verificar uso GPU: `ollama ps` muestra `SIZE/PROCESSOR`.

## Deploy en servidor (Railway/VPS)

```dockerfile
FROM ollama/ollama
EXPOSE 11434
CMD ["serve"]
```

**Crítico**: exponer `OLLAMA_HOST=0.0.0.0:11434` y proteger con reverse proxy + auth. Por defecto Ollama no tiene auth.

Mejor pattern: Ollama en localhost, app Express/Next como proxy con auth, que llama a Ollama internamente.

## Errores comunes

| Error | Causa | Fix |
|-------|-------|-----|
| `connection refused` | daemon no corriendo | `ollama serve` o `systemctl start ollama` |
| `model not found` | no se hizo pull | `ollama pull <modelo>` |
| OOM al cargar modelo | RAM insuficiente | usar tamaño menor (3b en lugar de 7b) o cuantización Q4 |
| Respuestas truncadas | `num_ctx` bajo | aumentar en Modelfile o parámetro request |
| Lento aunque hay GPU | modelo cargado en CPU | `ollama ps` para verificar, reinstalar drivers CUDA |
| Timeout HTTP en Next.js | edge runtime limit | usar Node runtime + `maxDuration` |

## Environment

```bash
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen3:8b
OLLAMA_KEEP_ALIVE=5m              # mantener modelo cargado
OLLAMA_NUM_PARALLEL=2             # peticiones simultáneas
```

## Verificación

```bash
ollama list                                        # modelos disponibles
curl http://localhost:11434/api/tags               # API responde
echo '{"model":"qwen3:8b","prompt":"hola"}' | \
  curl -s http://localhost:11434/api/generate -d @- | jq .response
```

## Referencias

- Ollama docs: https://github.com/ollama/ollama/blob/main/docs/api.md
- Modelfile spec: https://github.com/ollama/ollama/blob/main/docs/modelfile.md
- ProspectorLocal: `tools/prospector-local` (Sofía bot)
