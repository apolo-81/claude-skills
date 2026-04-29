---
name: drawio-diagram
description: This skill should be used when the user asks to "create a diagram", "generate a drawio diagram", "make a flowchart", "draw an architecture diagram", "export a diagram to PNG", or when producing any plan, report, or documentation that would benefit from a visual diagram (process flows, system architecture, entity relations, step sequences). Generate the .drawio file and export to PNG automatically.
---

# Draw.io Diagram Generator

Generate `.drawio` diagrams and export to PNG using `cli-anything-drawio`.

## Setup

Binario permanente en `~/.local/opt/drawio/drawio`, wrapper en `~/.local/bin/drawio`.

Verificar: `drawio --version` debe retornar `29.6.6`.

## Workflow

### 1. Create project

```bash
cli-anything-drawio --json project new -o /path/to/output.drawio
```

### 2. Add shapes

```bash
# Shapes disponibles: rectangle, rounded, ellipse, diamond, cylinder, cloud, hexagon, triangle, text
cli-anything-drawio --json --project FILE shape add rounded \
  --label "Texto&#xa;Segunda línea" --x 50 --y 80 --width 180 --height 120

# Capturar el ID del shape:
ID=$(cli-anything-drawio --json --project FILE shape add rectangle \
  --label "Paso 1" --x 50 --y 50 --width 160 --height 80 | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
```

- Usar `&#xa;` para saltos de línea dentro de labels
- Posiciones en píxeles desde esquina superior izquierda
- IDs se usan para conectar shapes

### 3. Conectar shapes

```bash
cli-anything-drawio --json --project FILE connect add $ID1 $ID2

# Estilos: straight, orthogonal, curved, entity-relation
cli-anything-drawio --json --project FILE connect add $ID1 $ID2 \
  --style orthogonal --label "sí"
```

### 4. Exportar a PNG

```bash
cli-anything-drawio --json --project FILE export render /path/output.png -f png
# También soporta: svg, pdf, xml
```

## Tipos de diagrama comunes

| Diagrama | Shapes recomendados |
|----------|-------------------|
| Proceso / flujo | `rounded` para pasos, `diamond` para decisiones |
| Arquitectura | `rectangle` para servicios, `cylinder` para DBs |
| Secuencia de pasos | `rounded` + `ellipse` para números encima |
| Entidad-relación | `rectangle` + `connect` con `entity-relation` |

## Cuándo generar automáticamente

Generar diagrama `.drawio` + PNG cuando se produzca:
- Plan de implementación con fases o pasos secuenciales
- Arquitectura de sistema (backend, frontend, servicios, DBs)
- Reporte con proceso o flujo de trabajo
- Documentación técnica con dependencias entre componentes

Guardar siempre ambos archivos en el mismo directorio que el documento relacionado.
