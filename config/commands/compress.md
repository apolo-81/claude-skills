# /compress

Comprime la sesión actual y persiste el conocimiento en Obsidian.

1. Extrae de la conversación: decisiones clave, insights y tareas pendientes
2. Determina `domain` (`project`/`area`/`resource`) → carpeta PARA (`01_Projects`/`02_Areas`/`03_Resources`)
3. Guarda la nota en el vault usando Write tool con el formato:

```
---
title: "Session - <fecha>"
tags: [trabajo, todo/prio2]
created: <fecha>
status: active
domain: <project|area|resource>
---

## Resumen
...

## Insights
...

## Tareas
- [ ] ...

## Links
...
```

Vault: `/home/apolo/Documents/55. Archive/apolo/`

4. Al terminar, muestra este recordatorio exacto como última línea de tu respuesta:

> Sesión guardada. Si terminaste de trabajar, ejecuta `/compact` para liberar contexto.
