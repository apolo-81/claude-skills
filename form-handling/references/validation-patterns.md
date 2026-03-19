# Validation Patterns — Zod Schemas Avanzados

Stack: Zod · TypeScript · Next.js 15 App Router · Supabase

---

## Mensajes de error centralizados en español

WHY: centralizar mensajes evita inconsistencias (un lugar dice "requerido", otro dice "obligatorio") y facilita cambios globales o internacionalización futura.

```typescript
// lib/zod-messages.ts
import { z } from 'zod'

export const zodMessages = {
  required: 'Este campo es obligatorio',
  email: 'Ingresa un email válido',
  minLength: (n: number) => `Mínimo ${n} caracteres`,
  maxLength: (n: number) => `Máximo ${n} caracteres`,
  url: 'Ingresa una URL válida (ej: https://ejemplo.com)',
  phone: 'Ingresa un teléfono válido (10 dígitos)',
  passwordMatch: 'Las contraseñas no coinciden',
  positiveNumber: 'Debe ser un número positivo',
  invalidOption: 'Selecciona una opción válida',
  minItems: (n: number) => `Selecciona al menos ${n} elemento${n > 1 ? 's' : ''}`,
}

// Configurar mensajes globales de Zod (opcional, afecta todos los schemas)
z.setErrorMap((issue, ctx) => {
  if (issue.code === 'invalid_type' && issue.received === 'undefined') {
    return { message: zodMessages.required }
  }
  if (issue.code === 'too_small' && issue.type === 'string' && issue.minimum === 1) {
    return { message: zodMessages.required }
  }
  return { message: ctx.defaultError }
})
```

---

## Schema condicional — campo requerido según otro campo

WHY: Zod no tiene "required_if" nativo, pero `.superRefine()` permite validación cruzada con acceso al contexto completo del objeto.

```typescript
import { z } from 'zod'

// Caso: si type === 'company', entonces taxId es obligatorio
export const registrationSchema = z.object({
  type: z.enum(['personal', 'company'], { message: 'Selecciona un tipo' }),
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  taxId: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.type === 'company') {
    if (!data.taxId || data.taxId.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El RFC es obligatorio para empresas',
        path: ['taxId'],
      })
    } else if (!/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/.test(data.taxId.toUpperCase())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'RFC inválido (formato: XAXX010101000)',
        path: ['taxId'],
      })
    }
  }
})

export type RegistrationData = z.infer<typeof registrationSchema>
```

---

## `.refine()` — contraseñas que coincidan

```typescript
export const passwordSchema = z.object({
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe tener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe tener al menos un número'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'], // indica en qué campo mostrar el error
})

export type PasswordData = z.infer<typeof passwordSchema>
```

---

## `.transform()` — limpiar strings antes de guardar

WHY: los usuarios pegan texto con espacios extra o mayúsculas innecesarias. Transformar en el schema garantiza que la BD siempre recibe datos limpios, sin depender de que el frontend lo haga manualmente.

```typescript
export const profileSchema = z.object({
  // trim + normalización de espacios internos
  name: z.string()
    .min(2)
    .transform((val) => val.trim().replace(/\s+/g, ' ')),

  // email siempre en minúsculas
  email: z.string()
    .email('Email inválido')
    .transform((val) => val.toLowerCase().trim()),

  // slug: lowercase, sin espacios, sin caracteres especiales
  username: z.string()
    .min(3, 'Mínimo 3 caracteres')
    .max(30, 'Máximo 30 caracteres')
    .transform((val) => val.toLowerCase().trim().replace(/\s+/g, '_'))
    .pipe(z.string().regex(/^[a-z0-9_]+$/, 'Solo letras, números y guion bajo')),

  // Número desde string (input HTML siempre devuelve string)
  age: z.string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(18, 'Debes ser mayor de edad').max(120)),
})
```

---

## URLs opcionales — vacío o URL válida

WHY: el usuario puede dejar el campo de website en blanco. Zod trata `""` como string vacío, no como undefined, por lo que necesitamos manejar ambos casos.

```typescript
export const urlOptionalSchema = z.object({
  website: z.union([
    z.literal(''),        // permite campo vacío
    z.string().url('Ingresa una URL válida (ej: https://ejemplo.com)'),
  ]).optional().transform((val) => val === '' ? undefined : val),

  // Alternativa con preprocess
  portfolio: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.string().url('URL inválida').optional()
  ),
})
```

---

## Schema de teléfono con regex

```typescript
// Regex para teléfonos mexicanos (10 dígitos, con o sin código de país)
const PHONE_REGEX_MX = /^(\+52\s?)?(\d{2,3}[\s.-]?)?\d{4}[\s.-]?\d{4}$/

// Regex más permisivo (internacional)
const PHONE_REGEX_INTL = /^\+?[\d\s\-().]{7,20}$/

export const phoneSchema = z.object({
  phone: z
    .string()
    .min(1, 'Teléfono requerido')
    .transform((val) => val.replace(/[\s\-().]/g, '')) // limpiar antes de validar
    .pipe(
      z.string()
        .regex(/^\+?\d{10,15}$/, 'Teléfono inválido (10-15 dígitos)')
    ),
})
```

---

## Schema de array con mínimo 1 elemento

```typescript
export const tagsSchema = z.object({
  // Al menos 1 tag, máximo 5
  tags: z
    .array(z.string().min(1).max(30))
    .min(1, 'Selecciona al menos 1 etiqueta')
    .max(5, 'Máximo 5 etiquetas'),

  // Checkbox group: al menos una opción seleccionada
  permissions: z
    .array(z.enum(['read', 'write', 'delete']))
    .min(1, 'Selecciona al menos un permiso'),

  // Items únicos (sin duplicados)
  categories: z
    .array(z.string())
    .min(1, 'Selecciona al menos una categoría')
    .refine(
      (items) => new Set(items).size === items.length,
      'No se permiten categorías duplicadas'
    ),
})
```

---

## Reutilizar schemas con `.extend()` y `.pick()`

WHY: DRY en schemas. El schema base para la BD puede tener campos que no se exponen en formularios públicos (como `id`, `createdAt`). `.pick()` y `.omit()` crean sub-schemas sin duplicar la definición.

```typescript
// Schema base (podría venir de la definición de la tabla Supabase)
const userBaseSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(['admin', 'member', 'viewer']),
  createdAt: z.string().datetime(),
  avatarUrl: z.string().url().optional(),
})

// Formulario de registro: solo los campos del usuario, sin id/createdAt/role
export const registerSchema = userBaseSchema.pick({
  name: true,
  email: true,
}).extend({
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

// Formulario de edición de perfil: sin email ni password
export const editProfileSchema = userBaseSchema.pick({
  name: true,
  avatarUrl: true,
})

// Schema para admin: puede cambiar rol
export const adminEditUserSchema = userBaseSchema.omit({
  id: true,
  createdAt: true,
  password: true,
} as any)

export type RegisterData = z.infer<typeof registerSchema>
export type EditProfileData = z.infer<typeof editProfileSchema>
```

---

## Validación asíncrona — email único en Supabase

WHY: la unicidad de email solo puede verificarse en el servidor. Usar `.refine()` async permite integrar esta validación dentro del schema de Zod, manteniendo consistencia con el resto de la validación.

**IMPORTANTE**: la validación asíncrona solo funciona en el servidor (Server Action). En el cliente, usar `setError` de RHF después de recibir el error del servidor.

```typescript
// app/register/schema.ts
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

// Schema para uso en Server Action (puede ser async)
export async function createRegisterSchemaWithEmailCheck() {
  const supabase = await createClient()

  return z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
  }).refine(
    async (data) => {
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('email', data.email)
        .maybeSingle()
      return !existing // true = válido (no existe)
    },
    {
      message: 'Este email ya está registrado',
      path: ['email'],
    }
  )
}

// Server Action que usa el schema async
export async function registerUser(
  _prev: unknown,
  formData: FormData
) {
  'use server'
  const schema = await createRegisterSchemaWithEmailCheck()

  const parsed = await schema.safeParseAsync({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return {
      success: false as const,
      errors: parsed.error.flatten().fieldErrors,
    }
  }

  // Crear usuario...
  return { success: true as const }
}
```

**En el cliente con RHF**, propagar el error del servidor al campo correspondiente:

```typescript
// Después de recibir el resultado del server action:
const result = await registerUser(null, formData)
if (!result.success && result.errors.email) {
  setError('email', {
    type: 'server',
    message: result.errors.email[0],
  })
}
```

---

## Schema completo de ejemplo — Formulario de producto

```typescript
import { z } from 'zod'

export const productSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(200, 'Máximo 200 caracteres')
    .transform((v) => v.trim()),

  description: z.string().max(5000, 'Máximo 5000 caracteres').optional()
    .transform((v) => v?.trim()),

  price: z.preprocess(
    (v) => parseFloat(String(v)),
    z.number({ message: 'Precio inválido' }).positive('El precio debe ser positivo').max(999999)
  ),

  currency: z.enum(['MXN', 'USD', 'EUR'], { message: 'Moneda inválida' }),

  category: z.string().min(1, 'Selecciona una categoría'),

  tags: z.array(z.string()).max(10, 'Máximo 10 etiquetas').default([]),

  website: z.union([z.literal(''), z.string().url('URL inválida')])
    .optional()
    .transform((v) => v === '' ? undefined : v),

  isActive: z.boolean().default(true),

  stock: z.preprocess(
    (v) => parseInt(String(v), 10),
    z.number().int('Debe ser número entero').min(0, 'No puede ser negativo')
  ),
}).superRefine((data, ctx) => {
  // Si el precio está en USD, el stock mínimo es 1
  if (data.currency === 'USD' && data.stock < 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Productos en USD deben tener stock mínimo de 1',
      path: ['stock'],
    })
  }
})

export type ProductData = z.infer<typeof productSchema>
```
