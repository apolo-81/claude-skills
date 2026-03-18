---
name: form-handling
description: >
  Use when building forms, handling form validation, implementing form submission,
  or working with user input in Next.js/React. Trigger for: "form", "formulario",
  "React Hook Form", "RHF", "Zod", "form validation", "validación de formulario",
  "server action form", "useFormState", "useActionState", "form errors", "form submission",
  "multi-step form", "wizard form", "file upload form", "subir archivo",
  "formulario con validación", "validar campos", "formulario de registro",
  "formulario de contacto", "formulario con pasos", "checkbox", "select", "input mask",
  "react-hook-form", "zod schema", "form state", "pending state", "optimistic update".
---

# Form Handling — Next.js 15 App Router + RHF + Zod

Stack: Next.js 15 App Router · React · TypeScript · Tailwind CSS · Supabase

## 1. Decision Tree

```
¿Validación en tiempo real, multi-step, o UX compleja?
├── NO  → Server Action directo (progressive enhancement)
└── SÍ  → Client Component + RHF + Zod + Server Action
```

- **Server Action puro**: sin JS en cliente, `useActionState` para estado
- **RHF + Zod**: validación campo por campo, multi-step, formateo en tiempo real, lógica condicional
- **Regla**: si piden "validación en tiempo real" o "varios pasos" → RHF. Para todo lo demás → Server Action puro

```bash
npm install react-hook-form @hookform/resolvers zod
```

## 2. Patrón Base — RHF + Zod + Server Action

Schema compartido en archivo separado (cliente y servidor usan el mismo).

```typescript
// app/contact/schema.ts
import { z } from 'zod'
export const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email('Email inválido'),
  message: z.string().min(10).max(1000),
})
export type ContactFormData = z.infer<typeof contactSchema>
```

Ver `references/code-patterns.md` para Server Action completo (`ActionResult` type + `submitContact`) y Client Component completo (`ContactForm` con RHF + `useActionState`).

## 3. Multi-step Form

Schema por pasos, cada uno con su propio schema Zod. Validar antes de avanzar.

```typescript
export const step1Schema = z.object({ name: z.string().min(2), email: z.string().email() })
export const step2Schema = z.object({ company: z.string().min(2), role: z.enum(['admin', 'member', 'viewer']) })
export const fullSchema = step1Schema.merge(step2Schema)

const stepFields: (keyof FullFormData)[][] = [['name', 'email'], ['company', 'role']]
const nextStep = async () => {
  const valid = await trigger(stepFields[step])
  if (valid) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(getValues()))
    setStep((s) => s + 1)
  }
}
```

Ver `references/validation-patterns.md` para componente `MultiStepForm` completo.

## 4. Patrones de campos comunes

- **Textarea con contador**: `watch('bio')` + `{bio.length}/{MAX}`
- **Checkbox group con array**: `Controller` + `field.onChange([...field.value, opt])`
- **Combobox/autocomplete** (`react-select`): `Controller` (no expone `ref` nativo)
- **Input con máscara** (`react-input-mask`): `Controller` con `mask="(999) 9999-9999"`

```typescript
// Patrón Controller (aplica a combobox, mask, checkbox group)
<Controller
  name="fieldName"
  control={control}
  render={({ field }) => (
    <ThirdPartyInput {...field} onChange={(val) => field.onChange(val)} />
  )}
/>
```

Ver `references/validation-patterns.md` para ejemplos completos.

## 5. Optimistic Updates

Ver `references/code-patterns.md` para ejemplo completo con `useOptimistic` + `useTransition` + Server Action.

Patrón: `updateOptimistic()` inmediato dentro de `startTransition`, luego `await serverAction()`. React revierte automáticamente si falla.

## 6. Accesibilidad

- `aria-invalid={!!errors.field}` en el input
- `aria-describedby="field-error"` conecta input con mensaje de error
- `role="alert"` en mensajes de error para anuncio inmediato
- Focus management: en segundo argumento de `handleSubmit`, hacer `document.getElementById(Object.keys(errors)[0])?.focus()`

## 7. Referencias

- `references/validation-patterns.md` — Schemas Zod avanzados, validación condicional, .refine(), .transform(), async, mensajes en español
- `references/upload-patterns.md` — File upload con Controller, preview, Supabase Storage, validación MIME/tamaño, drag & drop
- `references/code-patterns.md` — Server Action, Client Component, Optimistic Updates (code completo)
