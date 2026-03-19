# Prompt Engineering para n8n AI Agents

## 1. Variables y Sintaxis en n8n

En n8n, las expresiones van dentro de `{{ }}`. Úsalas directamente en los campos de texto de los nodos de IA.

### Referencias comunes

```
{{ $json.campo }}          — campo del item actual
{{ $json.body }}           — body completo
{{ $('Webhook').first().json.mensaje }}  — dato de un nodo anterior por nombre
{{ $vars.company_name }}   — variable global del workflow
{{ $now.format('DD/MM/YYYY') }}  — fecha actual formateada
{{ $now.toISO() }}         — fecha en ISO 8601
{{ $env.OPENAI_API_KEY }}  — variable de entorno (solo en Code nodes)
```

### Concatenar en prompts

```
Analiza el email de {{ $json.from }} enviado el {{ $json.date }}.
Asunto: {{ $json.subject }}
Cuerpo: {{ $json.body }}
```

### Condicionales en el prompt (usar Code Node previo)

Si el prompt varía mucho según el tipo de input, preparar el texto en un Code Node y referenciarlo:

```javascript
// Code Node antes del AI
const type = $input.first().json.type
const instructions = {
  complaint: 'Responde con empatía, pide disculpas y ofrece solución concreta.',
  question: 'Responde de forma directa y concisa con los datos disponibles.',
  feedback: 'Agradece el feedback y confirma que será revisado por el equipo.'
}

return [{
  json: {
    ...$input.first().json,
    ai_instructions: instructions[type] || instructions.question
  }
}]
```

Luego en el prompt: `{{ $json.ai_instructions }}`

---

## 2. Principios Generales de Prompt para n8n

**1. Formato de output primero.** Especifica exactamente qué quieres que devuelva el modelo antes de dar el contexto. El modelo lee todo pero el formato al final se pierde con textos largos.

**2. Una instrucción, un nodo.** No encadenes múltiples tareas en un solo prompt. Mejor: clasificar → resumir → decidir acción, cada uno en su nodo. Es más mantenible y puedes depurar cada paso.

**3. Pide lo que vas a usar.** Si el siguiente nodo es un Switch con condiciones URGENTE/NORMAL, el prompt debe pedir exactamente esas palabras en mayúsculas. No "alta prioridad" cuando vas a comparar con "URGENTE".

**4. Temperatura baja para extracción.** En los nodos de IA de n8n, si tienes control sobre temperatura, usa 0 para clasificación y extracción, 0.7 para generación de texto creativo.

---

## 3. Caso de Uso 1 — Soporte al Cliente

### Prompt: Clasificar + Priorizar + Sugerir Respuesta

```
Analiza este ticket de soporte y devuelve EXACTAMENTE este JSON (sin markdown, sin explicaciones):

{
  "category": "BILLING|TECHNICAL|ACCOUNT|GENERAL",
  "priority": "HIGH|MEDIUM|LOW",
  "sentiment": "FRUSTRATED|NEUTRAL|SATISFIED",
  "suggested_response": "respuesta de 2-3 oraciones en el mismo idioma del usuario",
  "internal_note": "contexto para el agente de soporte (máx 50 palabras)"
}

Reglas de prioridad:
- HIGH: el usuario no puede usar el servicio, pérdida de datos, pago fallido
- MEDIUM: funcionalidad degradada, pregunta urgente de facturación
- LOW: consulta general, solicitud de feature, queja menor

Email del cliente:
De: {{ $json.from }}
Asunto: {{ $json.subject }}
Mensaje: {{ $json.body }}
```

### Por qué funciona:
- El formato JSON está especificado con todos los campos antes del input
- Los valores posibles son explícitos (pipe-separated)
- Las reglas de prioridad eliminan la ambigüedad del modelo
- El `suggested_response` en el mismo idioma evita respuestas en inglés a usuarios en español

---

## 4. Caso de Uso 2 — Calificación de Leads

### Prompt: Extraer señales + Score + Siguiente acción

```
Eres un especialista en ventas B2B SaaS. Analiza esta conversación/formulario de un lead potencial.

Extrae la información y devuelve este JSON exacto (sin markdown):

{
  "company": "nombre de la empresa o null",
  "company_size": "startup|smb|enterprise|unknown",
  "budget_signal": "high|medium|low|unknown",
  "timeline": "immediate|1-3months|3-6months|exploring|unknown",
  "pain_points": ["pain point 1", "pain point 2"],
  "buying_signals": ["señal positiva 1", "señal positiva 2"],
  "red_flags": ["objeción o señal negativa 1"],
  "score": 7,
  "score_reasoning": "explicación breve de por qué este score",
  "next_action": "DEMO|NURTURE|DISQUALIFY|CALL",
  "next_action_reason": "por qué esta acción"
}

Reglas de scoring (1-10):
- 9-10: Fit perfecto, presupuesto confirmado, urgencia alta
- 7-8: Buen fit, señales positivas, timeline definido
- 5-6: Fit parcial, explorando opciones, sin urgencia clara
- 3-4: Fit dudoso, sin presupuesto claro, solo curiosidad
- 1-2: Mal fit, competidor, estudiante, sin presupuesto

Próxima acción:
- DEMO: score >= 7 y tiene timeline definido
- NURTURE: score 4-6 o timeline > 3 meses
- CALL: score >= 7 pero falta información clave
- DISQUALIFY: score < 4

Lead:
{{ $json.form_data }}
```

---

## 5. Caso de Uso 3 — Generación de Contenido

### Prompt: Email de seguimiento personalizado

```
Escribe un email de seguimiento de ventas personalizado basado en estos datos del CRM.

Datos del contacto:
- Nombre: {{ $json.first_name }}
- Empresa: {{ $json.company }}
- Cargo: {{ $json.title }}
- Sector: {{ $json.industry }}
- Última interacción: {{ $json.last_activity }} ({{ $json.days_since_last_contact }} días)
- Notas del CRM: {{ $json.notes }}
- Producto de interés: {{ $json.interested_in }}

Contexto adicional:
- Empresa del vendedor: {{ $vars.company_name }}
- Nombre del vendedor: {{ $json.rep_name }}

Instrucciones:
1. Asunto: personalizado, sin spam words (NO usar "seguimiento", "Solo quería", "¿Pudiste ver?")
2. Apertura: referencia específica a algo de las notas del CRM
3. Valor: una sola propuesta de valor relevante para su sector e industria
4. CTA: una sola acción, específica y de bajo compromiso (15 min call, no "agenda una demo")
5. Longitud: máximo 120 palabras en el cuerpo
6. Tono: profesional pero humano, sin jerga de ventas

Devuelve este JSON:
{
  "subject": "asunto del email",
  "body_text": "cuerpo en texto plano",
  "body_html": "cuerpo en HTML básico con <p> y <br>"
}
```

---

## 6. Caso de Uso 4 — Moderación de Contenido

### Prompt: Detectar spam/abuso en formularios

```
Analiza este contenido enviado por un usuario y determina si debe ser moderado.

Contenido:
{{ $json.content }}

Metadatos:
- Email: {{ $json.email }}
- IP: {{ $json.ip }}
- Tiempo en página: {{ $json.time_on_page }}s
- Enviados anteriores: {{ $json.previous_submissions }}

Devuelve este JSON exacto:

{
  "decision": "APPROVE|REVIEW|REJECT",
  "confidence": 0.95,
  "flags": ["spam", "offensive", "pii_exposure", "competitor_mention", "gibberish"],
  "reason": "explicación breve para el moderador"
}

Criterios:
- REJECT (automático): spam evidente, contenido ofensivo, links de phishing, datos personales de terceros
- REVIEW (moderación humana): contenido borderline, queja seria, mención de competidores, lenguaje fuerte sin ser abusivo
- APPROVE: contenido legítimo, preguntas válidas, feedback constructivo

Señales de spam adicionales:
- tiempo_en_página < 5s → sospechoso
- previous_submissions > 3 en 1 hora → posible abuso
- email con dominio temporal (mailinator, guerrilla, etc.) → señal de alerta

Los flags solo incluye los que aplican. El array puede estar vacío si es legítimo.
```

---

## 7. Caso de Uso 5 — Resumen de Meetings

### Prompt: Transcripción → Acción Items + Decisiones

```
Eres un asistente ejecutivo experto. Analiza esta transcripción de reunión.

Reunión:
- Título: {{ $json.meeting_title }}
- Fecha: {{ $json.date }}
- Participantes: {{ $json.participants }}

Transcripción:
{{ $json.transcript }}

Devuelve este JSON:

{
  "executive_summary": "resumen ejecutivo de 3-4 oraciones",
  "decisions": [
    {
      "decision": "qué se decidió",
      "owner": "quién es responsable o null si no se asignó"
    }
  ],
  "action_items": [
    {
      "task": "tarea específica y accionable",
      "owner": "nombre del responsable",
      "due_date": "fecha mencionada o null",
      "priority": "high|medium|low"
    }
  ],
  "next_meeting": {
    "proposed_date": "fecha propuesta o null",
    "agenda_items": ["tema 1", "tema 2"]
  },
  "open_questions": ["pregunta sin resolver 1", "pregunta sin resolver 2"],
  "mood": "productive|tense|unclear|positive"
}

Reglas:
- Solo incluye action items que tienen un responsable claro o que se discutieron como tareas concretas
- Si una decisión fue debatida pero no cerrada, va en open_questions
- El summary debe poder leerse en 30 segundos y capturar el "para qué" de la reunión
```

---

## 8. Caso de Uso 6 — Análisis de Reviews

### Prompt: Sentimiento + Temas + Respuesta

```
Analiza esta reseña de cliente y genera una respuesta pública apropiada.

Plataforma: {{ $json.platform }}
Rating: {{ $json.rating }}/5
Reseña: {{ $json.review_text }}
Nombre del cliente: {{ $json.reviewer_name }}
Nombre del negocio: {{ $vars.business_name }}

Devuelve este JSON:

{
  "sentiment": "very_positive|positive|neutral|negative|very_negative",
  "topics": ["servicio", "precio", "calidad", "envío", "atención_al_cliente"],
  "key_praise": ["qué elogió específicamente"],
  "key_complaints": ["qué criticó específicamente"],
  "suggested_response": "respuesta pública de 2-4 oraciones",
  "internal_alert": true/false,
  "alert_reason": "razón del alerta si aplica, null si no"
}

Reglas para la respuesta:
- Empieza por el nombre del cliente
- Agradece siempre, incluso en reviews negativas
- Si hay queja específica: reconoce y explica brevemente (no te excuses en exceso)
- Si rating <= 2: incluir invitación a contacto directo (email o teléfono de {{ $vars.support_contact }})
- Máximo 80 palabras
- Mismo idioma que la reseña

internal_alert = true si: rating <= 2, mención de problemas legales, amenaza de escalada pública, mención de salud/seguridad.
```

---

## 9. Few-Shot Prompting en n8n

Para outputs más consistentes, incluye ejemplos directamente en el prompt:

```
Clasifica el intent del mensaje del usuario.

Ejemplos:
Input: "¿Cómo cancelo mi suscripción?"
Output: CANCEL

Input: "Quiero actualizar mi plan a Pro"
Output: UPGRADE

Input: "No me funciona el login"
Output: SUPPORT

Input: "¿Cuánto cuesta el plan Enterprise?"
Output: PRICING

Input: "Quiero una factura del mes pasado"
Output: BILLING

Ahora clasifica este mensaje. Responde SOLO con el intent (una palabra):
Input: {{ $json.message }}
Output:
```

**Cuándo usar few-shot:** Cuando el modelo sigue eligiendo categorías incorrectas con un prompt directo. Los ejemplos son especialmente útiles para formatos no convencionales o dominios específicos de tu negocio.

---

## 10. Chain-of-Thought para Razonamiento Complejo

Para decisiones que requieren razonamiento, pide explícitamente que piense antes de responder:

```
Eres un especialista en detección de fraude. Analiza esta transacción.

Transacción:
{{ $json.transaction }}

Historial del usuario:
{{ $json.user_history }}

Piensa paso a paso ANTES de dar tu decisión:
1. ¿Hay algo inusual en el monto, horario o ubicación?
2. ¿El patrón coincide con el historial del usuario?
3. ¿Hay señales de cuenta comprometida?
4. ¿Cuál es el riesgo real vs falso positivo?

Después de razonar, devuelve SOLO este JSON (sin incluir tu razonamiento):
{
  "decision": "APPROVE|REVIEW|BLOCK",
  "risk_score": 0.85,
  "primary_reason": "razón principal en una frase"
}
```

**Nota importante:** El razonamiento paso a paso mejora la calidad de la decisión final. Pide el JSON al final para que el model termine con el output estructurado, no con el razonamiento.

---

## 11. Output JSON Confiable

### Técnica 1: Especificar "sin markdown"

```
Devuelve SOLO el JSON. Sin bloques de código, sin explicaciones, sin texto antes o después.
```

### Técnica 2: Usar Information Extractor

Para extracción de datos, el nodo Information Extractor maneja el retry automático si el JSON no es válido. Úsalo en lugar de pedir JSON con Basic LLM Chain.

### Técnica 3: Validar y limpiar en Code Node

```javascript
// Después de cualquier nodo que devuelva JSON
const output = $input.first().json.output || $input.first().json.text || ''

// Limpiar markdown si viene envuelto
const clean = output
  .replace(/^```json\n?/, '')
  .replace(/^```\n?/, '')
  .replace(/\n?```$/, '')
  .trim()

try {
  const parsed = JSON.parse(clean)
  return [{ json: parsed }]
} catch (e) {
  // Fallback: devolver con flag de error para manejar en el workflow
  return [{
    json: {
      _parse_error: true,
      _raw_output: output,
      _error: e.message
    }
  }]
}
```

### Técnica 4: Forzar con el cierre del JSON

Iniciar el JSON en el prompt:

```
Responde con este JSON (continúa desde la llave de apertura):
{
```

Esto funciona en algunos modelos porque el model completion "completa" el JSON.

---

## 12. Manejo de Edge Cases

### Cuando el modelo no tiene suficiente información

```
Si no tienes suficiente información para responder con certeza, devuelve:
{
  "confident": false,
  "response": null,
  "clarification_needed": "pregunta específica para obtener la información faltante"
}

Solo devuelve la respuesta normal si tienes certeza razonable:
{
  "confident": true,
  "response": "tu respuesta aquí",
  "clarification_needed": null
}
```

### Cuando el input puede estar vacío o ser inválido

```
Si el email está vacío, es spam sin sentido, o no es texto legible,
devuelve: { "valid": false, "category": null, "reason": "input inválido" }

Solo procesa si hay texto meaningful:
```

### Manejo en n8n con IF node

Después del AI, agregar un nodo IF:
```
Condición: {{ $json.valid }} === false
Si true → nodo de error/skip
Si false → continuar workflow normal
```

---

## 13. Testing de Prompts en n8n

### Proceso de iteración rápida

1. **Usar el botón "Test" del nodo** — ejecuta solo ese nodo con el item actual. No re-ejecuta todo el workflow.

2. **Fijar un item de prueba:** Click derecho en el nodo anterior → "Pin data". El nodo siempre usará ese dato para testing aunque el trigger no se dispare.

3. **Probar casos edge primero:**
   - Email vacío
   - Email en otro idioma
   - Email muy largo (> 2000 palabras)
   - Input con caracteres especiales o código

4. **Medir consistencia:** Ejecuta el mismo input 5 veces. Si el output varía significativamente entre ejecuciones, el prompt necesita más restricciones o ejemplos.

5. **Log de outputs:** Agregar un nodo Supabase Insert al final del AI durante desarrollo para guardar input/output y analizar patrones de fallo:

```sql
create table ai_prompt_tests (
  id uuid primary key default gen_random_uuid(),
  prompt_name text,
  input jsonb,
  output jsonb,
  model text,
  tokens_used int,
  created_at timestamptz default now()
);
```

```javascript
// Code Node para loguear
return [{
  json: {
    prompt_name: 'email-classifier-v3',
    input: { body: $('Webhook').first().json.body },
    output: $input.first().json,
    model: 'claude-haiku-4-5',
    tokens_used: $input.first().json.usage?.total_tokens || 0
  }
}]
```

Este log te permite hacer análisis después: qué categorías falla más, qué tipo de emails confunden al modelo, cuándo vale la pena cambiar de haiku a sonnet.
