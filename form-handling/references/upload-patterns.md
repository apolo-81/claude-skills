# Upload Patterns — File Uploads con Supabase Storage

Stack: Next.js 15 App Router · React · TypeScript · Tailwind CSS · Supabase Storage · React Hook Form

---

## Validación de archivos con Zod

WHY: validar tipo MIME y tamaño en el schema garantiza que la validación ocurre tanto en el cliente (feedback inmediato) como en el servidor (seguridad). No confiar solo en el atributo `accept` del input HTML, que el usuario puede saltarse.

```typescript
// lib/validations/file.ts
import { z } from 'zod'

const MAX_SIZE_MB = 5
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const ACCEPTED_DOCUMENT_TYPES = ['application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document']

export const imageFileSchema = z
  .instanceof(File, { message: 'Selecciona un archivo' })
  .refine((f) => f.size <= MAX_SIZE_BYTES, `Máximo ${MAX_SIZE_MB}MB`)
  .refine(
    (f) => ACCEPTED_IMAGE_TYPES.includes(f.type),
    'Solo se permiten imágenes JPG, PNG o WebP'
  )

export const optionalImageFileSchema = z.union([
  z.instanceof(File).refine((f) => f.size <= MAX_SIZE_BYTES, `Máximo ${MAX_SIZE_MB}MB`)
    .refine((f) => ACCEPTED_IMAGE_TYPES.includes(f.type), 'Formato inválido'),
  z.undefined(),
])

export const documentFileSchema = z
  .instanceof(File, { message: 'Selecciona un documento' })
  .refine((f) => f.size <= 10 * 1024 * 1024, 'Máximo 10MB')
  .refine((f) => ACCEPTED_DOCUMENT_TYPES.includes(f.type), 'Solo PDF o Word')

// Schema para formulario con avatar
export const profileWithAvatarSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  bio: z.string().max(500).optional(),
  avatar: optionalImageFileSchema,
})

export type ProfileWithAvatarData = z.infer<typeof profileWithAvatarSchema>
```

---

## Input file con Controller y preview de imagen

WHY: se usa `Controller` en vez de `register` porque el input type="file" es un controlled component problemático — su valor es de solo lectura en el DOM. `Controller` permite manejar el estado del archivo en RHF correctamente.

```typescript
// components/AvatarUpload.tsx
'use client'

import { useCallback, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { profileWithAvatarSchema, type ProfileWithAvatarData } from '@/lib/validations/file'
import { updateProfile } from '@/app/profile/actions'

export function AvatarUpload({ currentAvatarUrl }: { currentAvatarUrl?: string }) {
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl ?? null)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<ProfileWithAvatarData>({
    resolver: zodResolver(profileWithAvatarSchema),
  })

  const handleFileChange = useCallback(
    (file: File | undefined, onChange: (f: File | undefined) => void) => {
      onChange(file)
      if (file) {
        // WHY createObjectURL: genera URL temporal local, sin upload ni server round-trip.
        // Revocar al desmontar evita memory leaks.
        const objectUrl = URL.createObjectURL(file)
        setPreview(objectUrl)
        return () => URL.revokeObjectURL(objectUrl)
      } else {
        setPreview(currentAvatarUrl ?? null)
      }
    },
    [currentAvatarUrl]
  )

  const onSubmit = handleSubmit(async (data) => {
    const formData = new FormData()
    formData.set('name', data.name)
    if (data.bio) formData.set('bio', data.bio)
    if (data.avatar) formData.set('avatar', data.avatar)
    await updateProfile(formData)
  })

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Preview */}
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 overflow-hidden rounded-full bg-gray-100">
          {preview ? (
            <img src={preview} alt="Avatar preview" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-400">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
        </div>

        <Controller
          name="avatar"
          control={control}
          render={({ field: { onChange, ref, ...field } }) => (
            <div>
              <label
                htmlFor="avatar"
                className="cursor-pointer rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
              >
                Cambiar foto
              </label>
              <input
                id="avatar"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                ref={ref}
                onChange={(e) => handleFileChange(e.target.files?.[0], onChange)}
              />
              {preview && (
                <button
                  type="button"
                  onClick={() => handleFileChange(undefined, onChange)}
                  className="ml-2 text-sm text-red-500 hover:underline"
                >
                  Quitar
                </button>
              )}
            </div>
          )}
        />
      </div>
      {errors.avatar && (
        <p role="alert" className="text-sm text-red-600">{errors.avatar.message as string}</p>
      )}

      {/* Resto de campos */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium">Nombre</label>
        <input
          id="name"
          {...register('name')}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
        />
        {errors.name && <p role="alert" className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  )
}
```

---

## Server Action — Upload a Supabase Storage

WHY: el upload ocurre en el servidor para evitar exponer las credenciales de Supabase en el cliente, y para poder revalidar el cache después de la mutación.

```typescript
// app/profile/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { profileWithAvatarSchema } from '@/lib/validations/file'

export type UpdateProfileResult =
  | { success: true; avatarUrl?: string }
  | { success: false; errors: Record<string, string[]>; message?: string }

export async function updateProfile(formData: FormData): Promise<UpdateProfileResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, errors: {}, message: 'No autenticado' }
  }

  const raw = {
    name: formData.get('name'),
    bio: formData.get('bio') || undefined,
    avatar: formData.get('avatar') instanceof File
      ? formData.get('avatar') as File
      : undefined,
  }

  const parsed = profileWithAvatarSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    }
  }

  let avatarUrl: string | undefined

  // Subir imagen si viene nueva
  if (parsed.data.avatar) {
    const file = parsed.data.avatar
    const ext = file.name.split('.').pop()
    // WHY timestamp en el nombre: invalida cache del CDN automáticamente
    const path = `avatars/${user.id}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('uploads') // nombre del bucket en Supabase
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return { success: false, errors: {}, message: 'Error al subir la imagen' }
    }

    const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(path)
    avatarUrl = urlData.publicUrl
  }

  // Actualizar perfil en la BD
  const { error: dbError } = await supabase
    .from('profiles')
    .update({
      name: parsed.data.name,
      bio: parsed.data.bio,
      ...(avatarUrl && { avatar_url: avatarUrl }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (dbError) {
    return { success: false, errors: {}, message: 'Error al guardar el perfil' }
  }

  revalidatePath('/profile')
  return { success: true, avatarUrl }
}

// Eliminar archivo de Supabase Storage
export async function deleteFile(filePath: string): Promise<{ success: boolean; message?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'No autenticado' }

  // WHY verificar ownership: nunca confiar en el path que viene del cliente
  if (!filePath.startsWith(`avatars/${user.id}/`)) {
    return { success: false, message: 'Sin permiso para eliminar este archivo' }
  }

  const { error } = await supabase.storage.from('uploads').remove([filePath])

  if (error) {
    return { success: false, message: 'Error al eliminar el archivo' }
  }

  // Limpiar referencia en BD
  await supabase.from('profiles').update({ avatar_url: null }).eq('id', user.id)
  revalidatePath('/profile')

  return { success: true }
}
```

---

## Upload múltiple con array

```typescript
// components/MultipleFileUpload.tsx
'use client'

import { useState } from 'react'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const multiUploadSchema = z.object({
  title: z.string().min(1),
  documents: z
    .array(z.instanceof(File, { message: 'Archivo inválido' }))
    .min(1, 'Sube al menos un archivo')
    .max(5, 'Máximo 5 archivos')
    .refine(
      (files) => files.every((f) => f.size <= 10 * 1024 * 1024),
      'Cada archivo debe pesar menos de 10MB'
    ),
})

type MultiUploadData = z.infer<typeof multiUploadSchema>

export function MultipleFileUpload() {
  const [filePreviews, setFilePreviews] = useState<{ name: string; size: number }[]>([])

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MultiUploadData>({ resolver: zodResolver(multiUploadSchema) })

  const handleFilesChange = (files: FileList | null) => {
    if (!files) return
    const arr = Array.from(files)
    const existing = watch('documents') ?? []
    const combined = [...existing, ...arr].slice(0, 5) // max 5
    setValue('documents', combined, { shouldValidate: true })
    setFilePreviews(combined.map((f) => ({ name: f.name, size: f.size })))
  }

  const removeFile = (index: number) => {
    const current = watch('documents') ?? []
    const updated = current.filter((_, i) => i !== index)
    setValue('documents', updated, { shouldValidate: true })
    setFilePreviews(updated.map((f) => ({ name: f.name, size: f.size })))
  }

  const onSubmit = handleSubmit(async (data) => {
    const formData = new FormData()
    formData.set('title', data.title)
    data.documents.forEach((file) => formData.append('documents', file))
    // await uploadDocuments(formData)
  })

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium">Título</label>
        <input id="title" {...register('title')} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" />
      </div>

      <div>
        <label className="block text-sm font-medium">Documentos (máx. 5)</label>
        <input
          type="file"
          multiple
          accept=".pdf,.doc,.docx"
          onChange={(e) => handleFilesChange(e.target.files)}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:text-blue-700 hover:file:bg-blue-100"
        />
        {errors.documents && (
          <p role="alert" className="mt-1 text-sm text-red-600">
            {errors.documents.message as string}
          </p>
        )}
      </div>

      {/* Lista de archivos seleccionados */}
      {filePreviews.length > 0 && (
        <ul className="space-y-2">
          {filePreviews.map((file, i) => (
            <li key={i} className="flex items-center justify-between rounded border border-gray-200 px-3 py-2 text-sm">
              <span className="truncate">{file.name}</span>
              <span className="ml-2 text-gray-400">{(file.size / 1024).toFixed(0)}KB</span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="ml-3 text-red-500 hover:text-red-700"
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>
      )}

      <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
        Subir archivos
      </button>
    </form>
  )
}
```

---

## Progress bar durante upload

WHY: los uploads grandes pueden tardar varios segundos. Mostrar progreso real (no un spinner indeterminado) mejora significativamente la percepción de velocidad.

```typescript
// hooks/useUploadWithProgress.ts
'use client'

import { useState, useCallback } from 'react'

type UploadState =
  | { status: 'idle' }
  | { status: 'uploading'; progress: number }
  | { status: 'success'; url: string }
  | { status: 'error'; message: string }

export function useUploadWithProgress(bucket: string) {
  const [state, setState] = useState<UploadState>({ status: 'idle' })

  const upload = useCallback(async (file: File, path: string): Promise<string | null> => {
    setState({ status: 'uploading', progress: 0 })

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      // WHY XMLHttpRequest: fetch API no expone progreso de upload.
      // XHR es la única forma estándar de obtener progreso real.
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100)
          setState({ status: 'uploading', progress })
        }
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText)
          const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`
          setState({ status: 'success', url: publicUrl })
          resolve(publicUrl)
        } else {
          const message = 'Error al subir el archivo'
          setState({ status: 'error', message })
          reject(new Error(message))
        }
      }

      xhr.onerror = () => {
        const message = 'Error de conexión'
        setState({ status: 'error', message })
        reject(new Error(message))
      }

      // Usar el endpoint de Supabase Storage directamente
      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${bucket}/${path}`
      xhr.open('POST', url)
      xhr.setRequestHeader('Authorization', `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`)
      xhr.setRequestHeader('x-upsert', 'true')

      const formData = new FormData()
      formData.append('', file)
      xhr.send(formData)
    })
  }, [bucket])

  const reset = useCallback(() => setState({ status: 'idle' }), [])

  return { state, upload, reset }
}

// Componente de uso con progress bar
function UploadWithProgressBar() {
  const { state, upload } = useUploadWithProgress('uploads')

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const path = `documents/${Date.now()}-${file.name}`
    await upload(file, path)
  }

  return (
    <div className="space-y-2">
      <input type="file" onChange={handleFile} disabled={state.status === 'uploading'} />

      {state.status === 'uploading' && (
        <div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subiendo...</span>
            <span>{state.progress}%</span>
          </div>
          <div className="mt-1 h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-blue-600 transition-all duration-150"
              style={{ width: `${state.progress}%` }}
            />
          </div>
        </div>
      )}

      {state.status === 'success' && (
        <p className="text-sm text-green-600">Archivo subido correctamente</p>
      )}

      {state.status === 'error' && (
        <p role="alert" className="text-sm text-red-600">{state.message}</p>
      )}
    </div>
  )
}
```

---

## Drag & Drop con react-dropzone

```bash
npm install react-dropzone
```

```typescript
// components/DropZone.tsx
'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Controller, useFormContext } from 'react-hook-form'

type DropZoneProps = {
  name: string
  maxFiles?: number
  maxSizeMB?: number
  accept?: Record<string, string[]>
}

export function DropZone({
  name,
  maxFiles = 1,
  maxSizeMB = 5,
  accept = { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
}: DropZoneProps) {
  const { control, formState: { errors } } = useFormContext()

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value } }) => {
        const onDrop = useCallback(
          (acceptedFiles: File[]) => {
            onChange(maxFiles === 1 ? acceptedFiles[0] : acceptedFiles)
          },
          [onChange]
        )

        const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
          onDrop,
          maxFiles,
          maxSize: maxSizeMB * 1024 * 1024,
          accept,
        })

        const files: File[] = value
          ? Array.isArray(value) ? value : [value]
          : []

        return (
          <div>
            <div
              {...getRootProps()}
              className={`
                cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors
                ${isDragActive && !isDragReject ? 'border-blue-400 bg-blue-50' : ''}
                ${isDragReject ? 'border-red-400 bg-red-50' : ''}
                ${!isDragActive ? 'border-gray-300 hover:border-gray-400' : ''}
              `}
            >
              <input {...getInputProps()} />

              {isDragReject ? (
                <p className="text-red-500">Archivo no permitido</p>
              ) : isDragActive ? (
                <p className="text-blue-500">Suelta aquí para subir</p>
              ) : (
                <div>
                  <p className="text-gray-600">
                    Arrastra archivos aquí o{' '}
                    <span className="text-blue-600 hover:underline">haz clic para seleccionar</span>
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Máximo {maxFiles} archivo{maxFiles > 1 ? 's' : ''}, {maxSizeMB}MB c/u
                  </p>
                </div>
              )}
            </div>

            {/* Preview de archivos */}
            {files.length > 0 && (
              <ul className="mt-2 space-y-1">
                {files.map((file, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    {file.type.startsWith('image/') && (
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="h-8 w-8 rounded object-cover"
                      />
                    )}
                    <span className="truncate">{file.name}</span>
                    <span className="text-gray-400">({(file.size / 1024).toFixed(0)}KB)</span>
                  </li>
                ))}
              </ul>
            )}

            {errors[name] && (
              <p role="alert" className="mt-1 text-sm text-red-600">
                {(errors[name] as any)?.message}
              </p>
            )}
          </div>
        )
      }}
    />
  )
}
```

**Uso con FormProvider:**

```typescript
import { FormProvider, useForm } from 'react-hook-form'
import { DropZone } from '@/components/DropZone'

function MyForm() {
  const methods = useForm()
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(console.log)}>
        <DropZone name="avatar" maxFiles={1} maxSizeMB={2} />
        <DropZone
          name="documents"
          maxFiles={3}
          maxSizeMB={10}
          accept={{ 'application/pdf': ['.pdf'] }}
        />
        <button type="submit">Subir</button>
      </form>
    </FormProvider>
  )
}
```

---

## Configuración de Supabase Storage (referencia)

```sql
-- En el dashboard de Supabase o mediante migraciones

-- Crear bucket (también se puede desde el dashboard)
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true);

-- Policy: usuarios autenticados pueden subir a su propia carpeta
create policy "Users upload own files"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'uploads'
  and (storage.foldername(name))[1] = 'avatars'
  and (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy: usuarios pueden eliminar sus propios archivos
create policy "Users delete own files"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'uploads'
  and owner = auth.uid()
);

-- Policy: cualquiera puede ver archivos públicos
create policy "Public read"
on storage.objects for select
to public
using (bucket_id = 'uploads');
```
