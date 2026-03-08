---
name: dev-frontend
description: Frontend/mobile: React, Next.js App Router, React Native, TypeScript, Tailwind, design systems, responsive, accessibility, Node.js.
---

# dev-frontend

Skill consolidada para desarrollo frontend web y mobile.

## Cuándo usar

- Componentes React, hooks, estado global
- Next.js 14+ con App Router, Server Components, streaming
- React Native con Expo, navegación, animaciones
- TypeScript avanzado (generics, conditional types, mapped types)
- Tailwind CSS, design systems, design tokens
- Diseño responsive, mobile-first
- Accesibilidad WCAG 2.2
- Node.js APIs, Express/Fastify

## Sub-dominios cubiertos

### React & Next.js
- Server Components vs Client Components
- Streaming con Suspense, parallel routes
- State management: Zustand, Redux Toolkit, Jotai
- Server state: React Query / TanStack Query
- Next.js App Router: layouts, loading, error boundaries
- ISR, SSG, SSR trade-offs

### React Native & Mobile
- Expo workflow (managed vs bare)
- React Navigation (stack, tabs, drawer)
- Reanimated 3 para animaciones performantes
- Native modules y Expo modules
- Offline sync, AsyncStorage
- iOS HIG + SwiftUI patterns
- Material Design 3 + Jetpack Compose patterns

### TypeScript
- Generics avanzados y constraints
- Conditional types (`T extends U ? X : Y`)
- Mapped types y template literal types
- Utility types (Partial, Required, Pick, Omit, ReturnType)
- Discriminated unions para type narrowing
- Zod para runtime validation

### Diseño de UI
- Tailwind CSS v4, design tokens, CSS variables
- Component APIs: compound components, render props, headless
- CSS-in-JS (styled-components, vanilla-extract, Stitches)
- Responsive: container queries, fluid typography, CSS Grid
- Microinteractions, transitions, motion design

### Accesibilidad
- WCAG 2.2 AA compliance
- ARIA roles, labels, live regions
- Keyboard navigation patterns
- Screen reader testing (VoiceOver, TalkBack)

### Node.js
- Express/Fastify middleware patterns
- REST API con validación (Zod + OpenAPI)
- GraphQL con Apollo Server o Pothos
- WebSockets, SSE

### Testing
- Jest/Vitest + Testing Library
- Mocking con MSW (Mock Service Worker)
- E2E con Playwright y Cypress
- TDD/BDD workflows

## Guías rápidas

**Al crear un componente React:** Empieza como Server Component → añade `'use client'` solo si necesitas interactividad → extrae lógica a hooks → añade tipos TypeScript estrictos

**Al diseñar un design system:** Define tokens primero (color, spacing, typography) → crea primitivos (Button, Input) → compone en patterns (Form, Card) → documenta con Storybook

**Al optimizar Next.js:** Server Components para data fetching → Suspense para streaming → Image con `priority` para LCP → dynamic import para code splitting
