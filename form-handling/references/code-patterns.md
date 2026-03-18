# Form Handling — Code Patterns

## Server Action (actions.ts)

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
    // Logica de negocio: guardar en Supabase, enviar email, etc.
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

## Client Component con RHF (ContactForm.tsx)

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
    <button type="submit" disabled={pending}
      className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
      {pending ? 'Enviando...' : 'Enviar'}
    </button>
  )
}

export function ContactForm() {
  const [serverState, formAction] = useActionState<ActionResult | null, FormData>(submitContact, null)
  const {
    register, formState: { errors }, handleSubmit, reset,
  } = useForm<ContactFormData>({ resolver: zodResolver(contactSchema) })

  const onSubmit = handleSubmit((data) => {
    const formData = new FormData()
    Object.entries(data).forEach(([k, v]) => formData.set(k, v))
    formAction(formData)
    reset()
  })

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {serverState?.success === true && (
        <p role="alert" className="rounded-md bg-green-50 p-3 text-green-700">{serverState.message}</p>
      )}
      {serverState?.success === false && serverState.message && (
        <p role="alert" className="rounded-md bg-red-50 p-3 text-red-700">{serverState.message}</p>
      )}

      {/* Per-field pattern: label + input with register + aria-invalid + error message */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre</label>
        <input id="name" type="text" {...register('name')}
          aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-error' : undefined}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none aria-[invalid=true]:border-red-500" />
        {errors.name && <p id="name-error" role="alert" className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
      </div>

      {/* Repeat pattern for email, message fields */}
      <SubmitButton />
    </form>
  )
}
```

## Optimistic Updates

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
      updateOptimistic({ id: todo.id, completed: !todo.completed })
      await toggleTodo(todo.id, !todo.completed)
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
