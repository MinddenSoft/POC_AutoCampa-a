# Plan POC – Plataforma Inteligencia y Automatización de Campaña
**PAN Tamaulipas 2027 | ThirdWish Systems**
**Ubicación:** `/home/franciscoalanzavesromero/POC_AutoCampaña/`
**Fecha:** Septiembre 2026
**Fuente base:** `doc/Oferta_Comercial_ThirdWish_PAN_Tamaulipas_2027.md`

---

## 1. Objetivo de la POC

Demostrar con datos 100% dummies y frontend-only (sin backend real) la propuesta de valor de la Oferta Comercial:

1. Visor territorial por sección electoral.
2. Escucha y clasificación de interacción digital.
3. CRM de campaña centralizado.
4. Automatización de comunicación y seguimiento.
5. Centro de control con dashboard + lenguaje natural simulado + briefings.

Meta: demo navegable de 10–12 min que permita a un no-técnico entender Opción B (Plataforma Integrada), con look & feel premium vendible.

No-objetivos explícitos:
- Sin mapa GIS real, sin INEGI real, sin APIs (WhatsApp, Meta, TikTok).
- Sin auth real, sin DB, sin IA real (simulación determinista en cliente).
- Sin datos personales reales (todo dummy mexicano plausible).

## 2. Stack técnico fijado

- **React 18 + Vite + TypeScript estricto** (named exports, funciones puras).
- **Tailwind CSS v3 + tailwind-merge + clsx** (no CDN, config local).
- **Recharts** para gráficos, **Leaflet + react-leaflet** opcional solo si hay tiempo; por defecto mapa SVG dummy de Tamaulipas por municipios (más rápido y controlable).
- **lucide-react** para iconos (no emojis), **tailwindcss-animate** para motion, `@fontsource/inter` para tipografía.
- **zustand** para store global ligero (territorio seleccionado, filtros, contactos).
- **Datos:** JSON locales en `src/data/*.json` + generador seeded (`src/lib/seed.ts` con mulberry32 para reproducibilidad).
- Calidad: `eslint + tsc --noEmit` verdes al final de cada fase.

Estructura inicial:
```
poc-autocampana/
  src/
    App.tsx (router por tabs, sin react-router en POC)
    main.tsx + index.css (tailwind)
    data/ tamaulipas.json municipios.json secciones.json contactos.json interacciones.json flujos.json metricas.json briefings.json
    lib/ seed.ts format.ts geo.ts filters.ts nlp-mock.ts
    store/ useCampaignStore.ts
    components/ ui/ (Card, Badge, Table, Tabs, KPI, SearchInput, Avatar, Progress, Alert) layout/ (Sidebar, Topbar, PageHeader) charts/ (TurnoutChart, TrendChart, SentimentDonut, FunnelChart) map/ (TamaulipasMap, SeccionDetail)
    features/ territorio/ escucha/ crm/ automatizacion/ control/
  doc/ (este plan + oferta)
```

## 3. Modelo de datos dummy

Volúmenes calibrados a la oferta (lista nominal 2.8M, objetivo 700–750k, padrón 9.786):

- `municipios.json`: 8–10 municipios representativos (Victoria, Tampico, Reynosa, Matamoros, Nuevo Laredo, Altamira, Madero, El Mante). Campos: id, nombre, distritoLocalId, distritoFederalId, listaNominal, participacion2021/2022/2024, votosPAN/PRI/Morena, nivelRiesgo, prioridad (Alta/Media/Baja), coordenadas SVG x,y.
- `secciones.json`: ~120 secciones generadas (10–15 por municipio). Campos: id (ej. 1204), municipioId, listaNominal (800–3500), participacion %, afinidadPAN (0–100 score), swing, temasTop[3], incidenciaSeguridad, ultimaVisita, responsable.
- `contactos.json`: ~250 contactos. Campos: id, nombre, tipo (militante/simpatizante/voluntario/lider), municipioId, seccionId, origen (formulario/web/callcenter/redes/evento), etiquetas[], estado (nuevo/contactado/comprometido/promotor), interacciones count, ultimaActividad, telefono/email dummy.
- `interacciones.json`: ~800 items. Campos: id, canal (FB/IG/TikTok/WhatsApp/web/callcenter), texto corto plausible, tema (seguridad/agua/empleo/salud/corrupción/infraestructura), sentimiento (pos/neu/neg), municipioId, seccionId, fecha (últimos 30 días), clasificadoAuto bool, requiereHumano bool.
- `flujos.json`: 4 flujos (Bienvenida WhatsApp, Seguimiento evento, Rescate indecisos, Alerta territorial). Campos: pasos[], trigger, enviados, leidos, respondidos, tasa.
- `metricas.json`: KPIs estatales agregados para dashboard.
- `briefings.json`: template por sección/municipio (situación, histórico, temas, riesgos, mensajes sugeridos, checklist visita).

Regla: todo generador con seed fija `42` para que la demo sea determinista.

## 4. Sistema visual premium + UX/UI (obligatorio)

Objetivo: parecer producto enterprise de 100k USD, no admin genérico. Referencias: Linear, Vercel Analytics, Palantir Gotham, Stripe Dashboard.

### 4.1 Tokens de diseño (fijar en `tailwind.config` + `index.css`)
- Paleta dark-first: `bg: #060A14 (slate-950 custom)`, `panel: #0C1322 / white/[0.03]`, `border: white/8`, `text-1: #F1F5F9`, `text-2: #94A3B8`, `text-3: #64748B`.
- Acento primario PAN: `#2E7CF6`, hover `#1E6AE8`, glow `shadow-[0_0_24px_rgba(46,124,246,0.35)]` solo en CTA primario.
- Semánticos: éxito `#22C55E`, alerta `#F59E0B`, riesgo `#EF4444`, info `#38BDF8`.
- Mapas calor: escala 5 pasos `emerald→lime→amber→orange→rose` por afinidad/riesgo, siempre con leyenda.
- Tipografía: Inter vía `fontsource` o system-stack, `tracking-tight` en H, `tabular-nums` en toda cifra, escalas: H1 28/32, H2 18/24, body 14/20, caption 12/16.
- Radius: cards `rounded-2xl`, inputs `rounded-xl`, pills `rounded-full`. Sombras: `shadow-xl shadow-black/30` en drawers/modales, resto sutil.
- Espaciado: layout max `1600px`, gutter `24px`, cards `p-5`, gaps `16px`. Densidad cómoda, nunca tablas apretadas.

### 4.2 Shell aplicativo
- Sidebar 264px colapsable a 72px: logo ThirdWish + badge `POC · Datos ficticios`, nav 5 módulos con icono lucide + label + count badge, footer con selector entorno `Demo` + usuario operador.
- Topbar 64px sticky con blur `backdrop-blur bg-[#060A14]/80 border-b border-white/8`: breadcrumb territorio (Estado › Municipio › Sección), Search global con `⌘K` mock, selector municipio, botón `Generar briefing` primario.
- Navegación por tabs con estado en store + deep-link por `?m=territorio&mun=reynosa&sec=1204` para demo reproducible. Transición entre módulos `fade+slide 180ms`.
- Banner fino superior ámbar: `Entorno POC — todos los datos son ficticios`.

### 4.3 Patrones UX obligatorios en las 5 vistas
- Todo KPI en componente `KPI`: label, valor grande tabular, delta vs periodo con flecha, sparkline, tooltip `title`.
- Toda lista vacía usa `EmptyState` con icono, texto y CTA (prohibido tabla vacía muda).
- Toda carga usa `Skeleton` 300ms simulada, nunca spinner fullscreen salvo boot.
- Filtros siempre visibles + chips activos removibles + botón `Limpiar` + contador `X de Y`.
- Drawers laterales 420px para ficha sección/contacto con overlay, cierre con `Esc`, foco atrapado.
- Tablas: header sticky, zebra sutil, row hover, paginación 25/página, orden por columna en Territorio y CRM.
- Formularios mock: labels flotantes, validación inline, botones con estados disabled claros.

### 4.4 Interacción y motion
- `transition-colors duration-150` en hovers, `animate-in fade-in slide-in-from-right-4 duration-200` en drawers (vía `tailwindcss-animate`).
- Mapa SVG: hover eleva (`brightness-125 + stroke-white/40`), seleccionado con ring, tooltip rico (nombre, lista nominal, afinidad, prioridad).
- Charts Recharts con theme custom: grid `rgba(255,255,255,0.06)`, tooltip dark custom, curvas `strokeWidth 2.5`, áreas con gradiente.
- Toasts (sonner o custom) para cada acción mock: `Flujo simulado · +120 enviados`.
- `⌘K` abre palette con acciones (ir a módulo, buscar sección/contacto, generar briefing).

### 4.5 Accesibilidad y responsive
- Contraste AA en textos, foco visible `ring-2 ring-[#2E7CF6]`, iconos siempre con `aria-label`.
- Responsive: ≥1280 full war-room, 768–1279 sidebar colapsada + grids 2col, <768 single col + mapa arriba + tabla abajo. Demo target desktop, móvil solo no roto.
- Print CSS para briefing: fondo blanco, texto negro al imprimir.

### 4.6 Checklist visual de aceptación (bloqueante para dar por hecha la POC)
- Sin Tailwind default azul/púrpura, sin Times/Arial, sin emojis en UI.
- Cero `console.error`, cero layout shift, `npm run build` OK.
- Mismo lenguaje en toda la app (es-MX), fechas `dd MMM yyyy`, miles con `,`.
- Cada vista tiene header con título, subtítulo y 1 acción primaria máxima.

## 5. Las 5 vistas (mapeo 1:1 con Módulos oferta §3)

### V1. Inteligencia Territorial (Módulo 1)
- Mapa SVG Tamaulipas clicable por municipio → drill a tabla de secciones.
- Filtros: municipio, prioridad, afinidadPAN, participación.
- Ficha única por sección (drawer lateral): KPIs, histórico mini-chart, temas, seguridad, comparativa vs promedio municipal.
- Botón "Generar briefing" → salta a V5 con briefing precargado.

### V2. Escucha Digital (Módulo 2)
- KPIs: volumen 30d, % por canal, sentimiento split, nº alertas.
- Feed filtrable por canal/tema/sentimiento/territorio/fecha + búsqueda texto.
- Clasificación automática visible como badges + botón "Requiere humano".
- Panel tendencias: top temas, wordbars simples, serie temporal Recharts.

### V3. CRM (Módulo 3)
- Tabla 250 contactos con búsqueda, filtros tipo/estado/origen/municipio, etiquetas.
- Drawer contacto: histórico interacciones (join con interacciones.json por contactoId), timeline, botones mock "Enviar WhatsApp / Asignar / Cambiar estado".
- Barra importación mock ("Importar base" abre modal con mapeo de campos, no real).

### V4. Automatización (Módulo 4)
- Kanban/listado 4 flujos con funnel (enviados→leídos→respondidos) + toggle activo/pausado (solo estado local).
- Detalle flujo: pasos numerados, template mensaje aprobado (read-only), métricas, log respuestas recientes.
- Botón "Simular envío" que incrementa contadores en store (efecto demo).

### V5. Centro de Control (Módulo 5)
- Dashboard estatal: 4 KPIs hero (proyección votos vs objetivo 725k, cobertura 43 municipios, contactos activos, sentimiento neto), mapa calor resumido, ranking municipios prioritarios, alertas.
- "Pregunta en lenguaje natural" (mock): input con 6 queries precargadas ("¿Dónde perdemos participación?", etc.) → respuestas templadas que filtran datos reales del JSON (búsqueda por keywords, sin LLM).
- Informes: briefing candidato imprimible (layout limpio) + informe diario mock descargable (window.print / export JSON).

## 6. Plan de ejecución para próxima sesión (4 bloques)

**Bloque A – Scaffold (30 min):** `npm create vite@latest poc-autocampana -- --template react-ts`, instalar `tailwindcss postcss autoprefixer recharts zustand lucide-react clsx tailwind-merge`, init tailwind config dark, crear `ui/` + `layout/` + store + router por tabs. Verificación: `tsc --noEmit` + app arranca con shell vacío.

**Bloque B – Datos + Territorio + Control (núcleo demo, 60–90 min):** crear `lib/seed.ts` + 3 JSON base (municipios, secciones, metricas), implementar V1 mapa SVG + ficha + V5 dashboard básico. Verificación: click municipio filtra secciones, KPIs cuadran con JSON.

**Bloque C – Escucha + CRM (60 min):** generar interacciones + contactos, implementar V2 feed + V3 tabla + drawers. Verificación: filtros combinados funcionan, drawer muestra timeline.

**Bloque D – Automatización + NL mock + Pulido premium (60 min):** V4 flujos + simulación, NL con 6 intents en `nlp-mock.ts`, briefings, skeletons, responsive, `eslint` + build. Verificación: `npm run build` OK, demo script 10 min sin errores consola.

Orden estricto A→B→C→D. No empezar C sin B verde.

## 7. Demo script (para validar al final)

1. Topbar: seleccionar Reynosa → todo filtra (0:00–1:30).
2. V1: click sección prioritaria → ficha + briefing (1:30–4:00).
3. V2: filtrar tema Seguridad sentimiento negativo → mostrar alerta (4:00–6:00).
4. V3: buscar líder → ver historial → cambiar estado (6:00–7:30).
5. V4: abrir flujo Bienvenida → simular envío → sube funnel (7:30–9:00).
6. V5: preguntar "¿Qué municipios priorizar esta semana?" → ranking + informe (9:00–11:00).

Criterio de éxito: completar script sin recargar, sin datos vacíos, sin console.error.

## 8. Comandos de arranque (próxima sesión)

```bash
npm create vite@latest poc-autocampana -- --template react-ts
cd poc-autocampana
npm i recharts zustand lucide-react clsx tailwind-merge
npm i -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm run dev
```

## 9. Riesgos y decisiones ya tomadas

- Mapa: SVG simplificado, no GeoJSON real → más rápido, suficiente para POC.
- Sin react-router: tabs controladas por store (`activeModule`) para reducir fricción.
- Todo dummy en cliente: advertir con banner "Datos ficticios – POC".
- No tocar oferta original. Este plan es derivado, no la modifica.
