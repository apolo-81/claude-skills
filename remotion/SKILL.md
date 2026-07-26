---
name: remotion
description: >
  Creación de videos programáticos con Remotion + React. Composición, rendering,
  animaciones, Studio, Player, captions, efectos, y render en Lambda/Node/Vercel.
  Usar cuando: "Remotion", "video programático", "render video", "composición",
  "animación con React", "generar video con código", "remotion studio",
  "remotion render", "efectos de video", "subtítulos", "captions",
  "remotion lambda", "remotion player", "codehike", "código en video",
  "crear video con código".
---
Stack: **Remotion 4.x + React 19 + TypeScript + Code Hike**

## 1. Estructura de proyecto

```
my-video/
├── src/
│   ├── index.ts              # registerRoot
│   ├── Root.tsx              # Composition definitions
│   ├── Main.tsx              # Componente principal del video
│   ├── CodeTransition.tsx    # Transiciones entre bloques de código
│   ├── ProgressBar.tsx       # Barra de progreso
│   ├── ReloadOnCodeChange.tsx
│   ├── font.ts               # Config de tipografía
│   ├── utils.ts
│   ├── calculate-metadata/   # Metadata dinámica (duración, props)
│   └── annotations/          # Anotaciones de código
├── public/                   # Assets estáticos
├── remotion.config.ts        # Configuración global
├── package.json
└── tsconfig.json
```

## 2. Inicio rápido

```bash
# Crear proyecto nuevo
npx create-video@latest --yes --blank --no-tailwind my-video
cd my-video && npm i

# Iniciar Studio
npx remotion studio src/index.ts

# Renderizar video
npx remotion render src/index.ts Main out/video.mp4

# Renderizar un frame (still)
npx remotion still src/index.ts Main out/frame.png --frame=30

# Ver composiciones disponibles
npx remotion compositions src/index.ts
```

## 3. Composición base

```tsx
// src/Root.tsx
import { Composition } from "remotion";
import { Main } from "./Main";

export const RemotionRoot = () => {
  return (
    <Composition
      id="Main"
      component={Main}
      fps={30}
      height={1080}
      width={1920}
      durationInFrames={360}
    />
  );
};

// src/index.ts
import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";
registerRoot(RemotionRoot);
```

## 4. Animaciones

Usar `useCurrentFrame()` + `interpolate()` — NO usar CSS transitions/animations.

```tsx
import { useCurrentFrame, interpolate, Easing } from "remotion";

const MyComp = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return <div style={{ opacity }}>Hello</div>;
};
```

## 5. Sequencing con `<Series>` y `<Sequence>`

```tsx
import { AbsoluteFill, Sequence, Series } from "remotion";

// Series: secuencias una tras otra
<Series>
  <Series.Sequence durationInFrames={90}>
    <Scene1 />
  </Series.Sequence>
  <Series.Sequence durationInFrames={90}>
    <Scene2 />
  </Series.Sequence>
</Series>

// Sequence: contenido con delay/duración controlada
<Sequence from={30} durationInFrames={60} layout="none">
  <DelayedContent />
</Sequence>
```

## 6. Assets y multimedia

```tsx
import { Audio, Video, Img, staticFile } from "remotion";

// Archivos locales en public/
<Video src={staticFile("video.mp4")} />
<Audio src={staticFile("audio.mp3")} />
<Img src={staticFile("logo.png")} />

// URLs remotas
<Video src="https://example.com/video.mp4" />
```

## 7. Metadata dinámica

```tsx
// calculate-metadata/calculate-metadata.ts
export const calculateMetadata = ({ props }) => {
  const durationInFrames = props.steps.length * 30;
  return { durationInFrames, fps: 30 };
};
```

## 8. Skills oficiales de Remotion

El CLI de Remotion incluye skills para Claude Code:

```bash
npx remotion skills add    # Instalar skills interactivamente
npx remotion skills add --yes --global  # Sin prompts
```

Skills disponibles: `remotion-best-practices`, `remotion-markup`, `remotion-create`, `remotion-render`, `remotion-interactivity`, `remotion-captions`, `remotion-saas`, `mediabunny`.

## 9. Comandos útiles

| Comando | Descripción |
|---------|------------|
| `npx remotion studio` | Abrir Studio interactivo |
| `npx remotion render` | Renderizar video completo |
| `npx remotion still` | Renderizar frame individual |
| `npx remotion compositions` | Listar composiciones |
| `npx remotion bundle` | Crear bundle para web |
| `npx remotion add <pkg>` | Agregar paquete @remotion/* |
| `npx remotion upgrade` | Actualizar Remotion |
| `npx remotion versions` | Validar versiones de paquetes |

## 10. Referencias

- `references/*.md` — patrones avanzados, Code Hike, captions, efectos, rendering en Lambda, Player
