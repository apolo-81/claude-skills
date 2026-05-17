---
name: pdf-generation
description: >
  Genera PDFs desde Node.js/Express o Next.js: HTML→PDF con Puppeteer,
  plantillas dinámicas, stream vs descarga, cotizaciones y reportes.
  Usar cuando: "generar PDF", "exportar PDF", "cotización en PDF", "reporte PDF",
  "Puppeteer PDF", "html-to-pdf", "descargar PDF", "PDF dinámico", "PDF desde template",
  "factura PDF", "invoice PDF", "puppeteer", "@react-pdf".
---

# PDF Generation

Stack principal: **Puppeteer** (server-side, Node.js/Express) · **@react-pdf/renderer** (React/Next.js client)

---

## 1. Decision Tree

```
¿Dónde se genera el PDF?
├── Server (Node.js/Express/API Route)
│   ├── ¿Diseño complejo con CSS/imágenes?  → Puppeteer
│   └── ¿Estructura simple/tablas?          → pdfkit o pdf-lib
└── Client (React/Next.js componente)
    └── @react-pdf/renderer (JSX → PDF)
```

---

## 2. Puppeteer — HTML → PDF (recomendado)

### Setup

```bash
npm install puppeteer
# Railway: agregar buildpack o usar puppeteer-core + chromium
npm install puppeteer-core @sparticuz/chromium  # para serverless/Railway
```

### API Route — Express

```javascript
// src/routes/pdf.js
import puppeteer from 'puppeteer'
import { Router } from 'express'

export const pdfRouter = Router()

pdfRouter.post('/cotizacion/:id', async (req, res, next) => {
  let browser
  try {
    const data = await getCotizacion(req.params.id)  // tu lógica de DB
    const html = renderTemplate(data)                 // ver sección 3

    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })

    const pdfBuffer = await page.pdf({
      format: 'Letter',
      margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
      printBackground: true,
    })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="cotizacion-${req.params.id}.pdf"`)
    res.send(pdfBuffer)
  } catch (err) {
    next(err)
  } finally {
    await browser?.close()
  }
})
```

### Railway — puppeteer-core + chromium

```javascript
// Para Railway / entornos sin Chrome instalado
import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'

async function getBrowser() {
  if (process.env.NODE_ENV === 'production') {
    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    })
  }
  // Desarrollo local — usar Chrome instalado
  const { default: puppeteerFull } = await import('puppeteer')
  return puppeteerFull.launch({ headless: 'new' })
}
```

---

## 3. Template HTML

```javascript
// src/lib/pdf-templates.js
export function renderCotizacion(data) {
  const { cliente, items, subtotal, iva, total, fecha, folio } = data

  const itemsHTML = items.map(item => `
    <tr>
      <td>${item.descripcion}</td>
      <td class="num">${item.cantidad}</td>
      <td class="num">$${item.precioUnitario.toLocaleString('es-MX')}</td>
      <td class="num">$${item.importe.toLocaleString('es-MX')}</td>
    </tr>
  `).join('')

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 12px; color: #333; }
    .header { display: flex; justify-content: space-between; padding: 20px 0; border-bottom: 2px solid #e5e7eb; }
    .logo { font-size: 24px; font-weight: bold; color: #1e3a5f; }
    .folio { text-align: right; }
    .folio h2 { color: #1e3a5f; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background: #1e3a5f; color: white; padding: 8px; text-align: left; }
    td { padding: 8px; border-bottom: 1px solid #e5e7eb; }
    .num { text-align: right; }
    .totales { margin-top: 20px; text-align: right; }
    .totales table { width: 250px; margin-left: auto; }
    .total-final { font-size: 16px; font-weight: bold; color: #1e3a5f; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">Tu Empresa</div>
    <div class="folio">
      <h2>COTIZACIÓN</h2>
      <p>Folio: ${folio}</p>
      <p>Fecha: ${fecha}</p>
    </div>
  </div>

  <div style="margin-top: 20px;">
    <strong>Cliente:</strong> ${cliente.nombre}<br>
    <strong>Email:</strong> ${cliente.email}
  </div>

  <table>
    <thead>
      <tr><th>Descripción</th><th>Cant.</th><th>P. Unit.</th><th>Importe</th></tr>
    </thead>
    <tbody>${itemsHTML}</tbody>
  </table>

  <div class="totales">
    <table>
      <tr><td>Subtotal</td><td class="num">$${subtotal.toLocaleString('es-MX')}</td></tr>
      <tr><td>IVA (16%)</td><td class="num">$${iva.toLocaleString('es-MX')}</td></tr>
      <tr class="total-final"><td>Total</td><td class="num">$${total.toLocaleString('es-MX')}</td></tr>
    </table>
  </div>
</body>
</html>`
}
```

---

## 4. Next.js — API Route

```typescript
// app/api/pdf/cotizacion/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'
import { renderCotizacion } from '@/lib/pdf-templates'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const cotizacion = await prisma.cotizacion.findUnique({
    where: { id: params.id },
    include: { cliente: true, items: true },
  })
  if (!cotizacion) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const html = renderCotizacion(cotizacion)

  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  })
  const page = await browser.newPage()
  await page.setContent(html, { waitUntil: 'networkidle0' })
  const pdf = await page.pdf({ format: 'Letter', printBackground: true })
  await browser.close()

  return new NextResponse(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="cotizacion-${params.id}.pdf"`,
    },
  })
}
```

---

## 5. @react-pdf/renderer (cliente React)

```bash
npm install @react-pdf/renderer
```

```tsx
// components/CotizacionPDF.tsx
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontSize: 20, color: '#1e3a5f', fontWeight: 'bold' },
  table: { marginTop: 10 },
  row: { flexDirection: 'row', borderBottom: '1px solid #e5e7eb', padding: '6 0' },
  cell: { flex: 1, fontSize: 10 },
  total: { fontSize: 14, fontWeight: 'bold', textAlign: 'right', marginTop: 10 },
})

function CotizacionDocument({ data }) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>COTIZACIÓN</Text>
          <Text style={{ fontSize: 10 }}>Folio: {data.folio}</Text>
        </View>
        <View style={styles.table}>
          {data.items.map((item, i) => (
            <View key={i} style={styles.row}>
              <Text style={[styles.cell, { flex: 3 }]}>{item.descripcion}</Text>
              <Text style={styles.cell}>{item.cantidad}</Text>
              <Text style={styles.cell}>${item.importe.toLocaleString()}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.total}>Total: ${data.total.toLocaleString()}</Text>
      </Page>
    </Document>
  )
}

// Botón de descarga
export function DescargarCotizacion({ data }) {
  return (
    <PDFDownloadLink document={<CotizacionDocument data={data} />} fileName={`cotizacion-${data.folio}.pdf`}>
      {({ loading }) => loading ? 'Generando...' : 'Descargar PDF'}
    </PDFDownloadLink>
  )
}
```

---

## 6. Variables de entorno

```env
# No hay vars específicas para Puppeteer local
# Railway: el buildpack de Chromium se configura automáticamente con @sparticuz/chromium
PUPPETEER_SKIP_DOWNLOAD=true  # si usas puppeteer-core
```

---

## 7. Errores comunes

| Error | Causa | Fix |
|---|---|---|
| `Could not find Chrome` | Puppeteer no instaló Chromium | Usar `puppeteer-core` + `@sparticuz/chromium` |
| PDF en blanco | Contenido JS no cargó | `waitUntil: 'networkidle0'` o `waitUntil: 'load'` |
| Imágenes no aparecen | Rutas relativas | Usar base64 o URLs absolutas en el HTML |
| Crash en Railway | Sin `--no-sandbox` | Agregar args: `['--no-sandbox', '--disable-setuid-sandbox']` |
| `@react-pdf` fuente faltante | No soporta todas las fuentes | Registrar fuente custom con `Font.register()` |
