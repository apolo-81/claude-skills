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

## 1. Overview — Cuándo usar cada patrón

### Decision Tree

```
¿El formulario necesita validación en tiempo real, multi-step, o UX compleja?
├── NO  → Server Action directo (sin JS requerido, progresive enhancement)
│         Ideal: formulario de contacto simple, búsqueda, suscripción
└── SÍ  → Client Component + RHF + Zod + Server Action
          Ideal: registro, checkout, wizard, upload de archivos
```

**Server Action puro**: Funciona sin JS en el cliente. Usa `useActionState` para estado. Menos código, más resiliente.

**RHF + Zod**: Validación campo por campo mientras el usuario escribe. Necesario para multi-step (validar cada paso antes de avanzar), formateo de inputs en tiempo real, y formularios con lógica condicional compleja.

**Regla práctica**: Si el PM pide "validación en tiempo real" o "formulario de varios pasos", usa RHF. Para todo lo demás, empieza con Server Action puro y agrega RHF solo si la UX lo requiere.

### Instalación

```bash
npm install react-hook-form @hookform/resolvers zod
```

---

## 2. Patrón Base — RHF + Zod + Server Action

### Schema compartido (schema.ts)

El schema vive en un archivo separado para compartirlo entre cliente y servidor. WHY: evita duplicar validaciones y garantiza que el servidor rechaza exactamente lo que el cliente permite.

```typescript
// app/contact/schema.ts
import { z } from 'zod'

export const contactSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(100, 'Máximo 100 caracteres'),
  email: z.string().email('Email inválido'),
  message: z.string().min(10, 'Mínimo 10 caracteres').max(1000, 'Máximo 1000 caracteres'),
})

export type ContactFormData = z.infer<typeof contactSchema>
```

### Server Action (actions.ts)

```typescript
// app/contact/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { contactSchema } from './schema'

export type ActionResult =
  | { success: true; message: string }
  | { success: false; errors: Record<string, string[]>; message?: string }

export async function submitContact(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
  }

  const parsed = contactSchema.safeParse(raw)

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    // Lógica de negocio: guardar en Supabase, enviar email, etc.
    // await supabase.from('contacts').insert(parsed.data)

    revalidatePath('/contact')
    return { success: true, message: 'Mensaje enviado correctamente.' }
  } catch (error) {
    console.error('submitContact error:', error)
    return {
      success: false,
      errors: {},
      message: 'Error al enviar. Intenta de nuevo.',
    }
  }
}
```

### Client Component con RHF (ContactForm.tsx)

```typescript
// app/contact/ContactForm.tsx
'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { contactSchema, type ContactFormData } from './schema'
import { submitContact, type ActionResult } from './actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? 'Enviando...' : 'Enviar'}
    </button>
  )
}

export function ContactForm() {
  const [serverState, formAction] = useActionState<ActionResult | null, FormData>(
    submitContact,
    null
  )

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  // WHY handleSubmit: valida en cliente antes de llamar al server action,
  // evitando un round-trip innecesario si hay errores obvios.
  const onSubmit = handleSubmit((data) => {
    const formData = new FormData()
    Object.entries(data).forEach(([k, v]) => formData.set(k, v))
    formAction(formData)
    reset()
  })

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {/* Mensaje de éxito/error global */}
      {serverState?.success === true && (
        <p role="alert" className="rounded-md bg-green-50 p-3 text-green-700">
          {serverState.message}
        </p>
      )}
      {serverState?.success === false && serverState.message && (
        <p role="alert" className="rounded-md bg-red-50 p-3 text-red-700">
          {serverState.message}
        </p>
      )}

      {/* Campo: Nombre */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Nombre
        </label>
        <input
          id="name"
          type="text"
          {...register('name')}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none aria-[invalid=true]:border-red-500"
        />
        {errors.name && (
          <p id="name-error" role="alert" className="mt-1 text-sm text-red-600">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Campo: Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          {...register('email')}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none aria-[invalid=true]:border-red-500"
        />
        {errors.email && (
          <p id="email-error" role="alert" className="mt-1 text-sm text-red-600">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Campo: Mensaje */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700">
          Mensaje
        </label>
        <textarea
          id="message"
          rows={4}
          {...register('message')}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'message-error' : undefined}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none aria-[invalid=true]:border-red-500"
        />
        {errors.message && (
          <p id="message-error" role="alert" className="mt-1 text-sm text-red-600">
            {errors.message.message}
          </p>
        )}
      </div>

      <SubmitButton />
    </form>
  )
}
```

---

## 3. Multi-step Form

WHY: Dividir formularios largos reduce abandono. Validar cada paso antes de avanzar evita errores tardíos.

### Concepto clave

```typescript
// Schema por pasos — cada paso tiene su propio schema
export const step1Schema = z.object({ name: z.string().min(2), email: z.string().email() })
export const step2Schema = z.object({ company: z.string().min(2), role: z.enum(['admin', 'member', 'viewer']) })
export const fullSchema = step1Schema.merge(step2Schema)
export type FullFormData = z.infer<typeof fullSchema>

// Lógica de navegación core
const stepFields: (keyof FullFormData)[][] = [['name', 'email'], ['company', 'role']]

const nextStep = async () => {
  const valid = await trigger(stepFields[step] as (keyof FullFormData)[])
  if (valid) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(getValues())) // persistir draft
    setStep((s) => s + 1)
  }
}
```

Ver `references/validation-patterns.md` para el componente `MultiStepForm` completo con progress bar, navegación, y persistencia en localStorage.

---

## 4. Patrones de campos comunes

Campos frecuentes y cuándo usarlos:

- **Textarea con contador**: `watch('bio')` + `{bio.length}/{MAX}` en `<p>` — feedback antes de submitir
- **Checkbox group con array**: usar `Controller` + `field.onChange([...field.value, opt])` para manejar arrays
- **Combobox/autocomplete** (`react-select`): usar `Controller` — `register()` no funciona cuando el componente no expone un `ref` nativo
- **Input con máscara** (`react-input-mask`): usar `Controller` con `mask="(999) 9999-9999"` + validación por `pattern`

```typescript
// Patrón Controller (aplica a combobox, mask, y checkbox group)
<Controller
  name="fieldName"
  control={control}
  render={({ field }) => (
    <ThirdPartyInput {...field} onChange={(val) => field.onChange(val)} />
  )}
/>
```

Ver `references/validation-patterns.md` para ejemplos completos de cada campo (textarea, checkbox group, combobox, input mask).

---

## 5. Optimistic Updates

WHY: el usuario ve el resultado inmediatamente. Si el server action falla, React revierte el estado optimista automáticamente.

```typescript
'use client'
import { useOptimistic, useTransition } from 'react'
import { toggleTodo } from './actions'

type Todo = { id: string; text: string; completed: boolean }

export function TodoList({ initialTodos }: { initialTodos: Todo[] }) {
  const [isPending, startTransition] = useTransition()
  const [optimisticTodos, updateOptimistic] = useOptimistic(
    initialTodos,
    (state: Todo[], { id, completed }: { id: string; completed: boolean }) =>
      state.map((t) => (t.id === id ? { ...t, completed } : t))
  )

  const handleToggle = (todo: Todo) => {
    startTransition(async () => {
      updateOptimistic({ id: todo.id, completed: !todo.completed }) // inmediato
      await toggleTodo(todo.id, !todo.completed)                    // real (revierte si falla)
    })
  }

  return (
    <ul>
      {optimisticTodos.map((todo) => (
        <li key={todo.id}>
          <input type="checkbox" checked={todo.completed} onChange={() => handleToggle(todo)} disabled={isPending} />
          <span className={todo.completed ? 'line-through text-gray-400' : ''}>{todo.text}</span>
        </li>
      ))}
    </ul>
  )
}
```

---

## 6. Accesibilidad básica

Checklist mínimo para formularios accesibles:

- **`aria-invalid={!!errors.field}`**: siempre en el input cuando hay error, no solo en el mensaje
- **`aria-describedby="field-error"`**: conecta el input con su `<p id="field-error">` — los lectores de pantalla anuncian el error al enfocar
- **`role="alert"`**: en mensajes de error para anunciarlos inmediatamente al aparecer
- **Focus management**: en el segundo argumento de `handleSubmit`, llamar `document.getElementById(Object.keys(errors)[0])?.focus()`

---

## 7. Referencias

```
Ver references/validation-patterns.md para schemas Zod avanzados:
  - Validación condicional (campo requerido según otro campo)
  - .refine() para contraseñas coincidentes
  - .transform() para limpiar inputs
  - URLs opcionales, teléfonos, arrays con mínimo
  - Reutilizar schemas con .extend() y .pick()
  - Validación asíncrona (email único en Supabase)
  - Mensajes de error centralizados en español

Ver references/upload-patterns.md para file uploads:
  - Input type="file" con Controller
  - Preview de imagen antes de subir
  - Upload a Supabase Storage desde Server Action
  - Validación MIME y tamaño con Zod
  - Progress bar durante upload
  - Upload múltiple y drag & drop
  - Eliminar archivo existente
```
