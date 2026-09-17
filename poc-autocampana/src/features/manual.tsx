import { useState } from 'react'
import { LayoutDashboard, Map, Radio, Users, Workflow, Megaphone, Library, CalendarDays, Settings, ChevronDown, Printer, Lightbulb, Keyboard } from 'lucide-react'
import { useCampaignStore } from '../store/useCampaignStore'
import { Card, PageHeader, Badge, PrimaryButton, cn } from '../components/ui'

const MODULOS = [
  { icon: LayoutDashboard, nombre: 'Centro de control', desc: 'Pulso de la campaña: avance al objetivo, ranking de municipios, alertas y el Analista IA. Pregúntale en lenguaje natural y genera briefings e informes.', pasos: ['Revisa el avance hacia los 725k votos', 'Atiende las alertas territoriales en rojo', 'Pregunta al Analista IA qué priorizar'] },
  { icon: Map, nombre: 'Inteligencia territorial', desc: 'Mapa por afinidad PAN con drill a 120 secciones. Clic en un municipio para filtrar todo el sistema y abre la ficha de cada sección.', pasos: ['Clic en un círculo del mapa para filtrar', 'Usa la datatable: busca, ordena y pagina', 'Genera briefing antes de cada visita'] },
  { icon: Radio, nombre: 'Escucha digital', desc: 'Interacciones clasificadas por tema, canal y sentimiento. Detecta picos y deriva casos sensibles a un operador humano.', pasos: ['Filtra por sentimiento negativo + Seguridad', 'Observa la tendencia de 14 días', 'Deriva a humano lo que requiera criterio'] },
  { icon: Users, nombre: 'CRM de campaña', desc: 'Base única de contactos con historial, etiquetas y estados. Busca, filtra, cambia estados y registra cada interacción.', pasos: ['Busca por nombre, teléfono o etiqueta', 'Abre la ficha y actualiza el estado', 'Importa nuevas bases desde el botón superior'] },
  { icon: Workflow, nombre: 'Automatización', desc: 'Flujos de WhatsApp, call center y formularios con mensajes aprobados. Activa, pausa y lanza envíos midiendo conversión.', pasos: ['Revisa el funnel enviado → leído → respuesta', 'Pausa el flujo de indecisos si satura', 'Lanza envíos en horarios de alta lectura'] },
  { icon: Megaphone, nombre: 'Audiencias', desc: 'Segmentos accionables sobre el CRM: combina tipo, estado y municipio, previsualiza el conteo y guarda la audiencia.', pasos: ['Define tipo + estado + municipio', 'Verifica el conteo en tiempo real', 'Guárdala y úsala en el CRM'] },
  { icon: Library, nombre: 'Contenidos', desc: 'Biblioteca de piezas aprobadas por estrategia. Nada sale sin aprobación: copia o asigna a un flujo.', pasos: ['Filtra por canal', 'Copia la pieza aprobada', 'Asígnela a un flujo activo'] },
  { icon: CalendarDays, nombre: 'Calendario', desc: 'Recorridos, brigadas y actos de 14 días con asistencia esperada. Crea eventos y filtra por municipio.', pasos: ['Filtra por tu municipio', 'Crea el evento con fecha y responsable', 'Cruza con las secciones críticas'] },
  { icon: Settings, nombre: 'Configuración', desc: 'Usuarios, canales, fuentes de datos y apariencia. Desde aquí cambias entre modo claro y oscuro.', pasos: ['Activa solo los canales autorizados', 'Revisa el estado de cada fuente', 'Cambia el tema según la sala de guerra'] },
]

const ATAJOS = [
  ['Clic en el mapa', 'Filtra Estado → municipio en toda la app'],
  ['Clic en una fila', 'Abre la ficha lateral con el detalle'],
  ['Enter en el Analista IA', 'Envía la pregunta'],
  ['Esc', 'Cierra drawers y modales'],
  ['Imprimir informe', 'Genera el reporte del día en PDF'],
]

const FAQS = [
  { q: '¿Por dónde empiezo cada mañana?', a: 'Centro de control: revisa el avance al objetivo, las 4 alertas territoriales y pregunta al Analista IA “¿qué priorizar hoy?”. En 5 minutos tienes la orden del día.' },
  { q: '¿Cómo preparo la visita de un candidato?', a: 'En Inteligencia territorial filtra su municipio, abre la ficha de la sección y pulsa Generar briefing. Lleva el checklist impreso y registra los compromisos al volver.' },
  { q: '¿Qué hago con una mención negativa grave?', a: 'En Escucha digital, filtra sentimiento negativo, abre el caso y pulsa “Requiere humano”. El operador lo toma con el guion de rescate aprobado.' },
  { q: '¿Cómo escalo la red de promotores?', a: 'En Audiencias crea el segmento “simpatizantes comprometidos”, expórtalo al CRM y asígnalos a los 5 mejores promotores desde la ficha de contacto.' },
  { q: '¿Los mensajes están aprobados?', a: 'Sí. Automatización y Contenidos solo operan piezas con estado Aprobado. Las “En revisión” no se pueden lanzar.' },
]

export function Manual() {
  const setModulo = useCampaignStore((s) => s.setModulo)
  const [abierto, setAbierto] = useState<number | null>(0)
  const [paso, setPaso] = useState(0)

  const tour = [
    { t: 'Mira el todo', d: 'Entra al Centro de control y localiza objetivo, ranking y alertas.' },
    { t: 'Baja al territorio', d: 'En el mapa, haz clic en Reynosa y observa cómo todo se filtra.' },
    { t: 'Escucha', d: 'Filtra menciones negativas de Seguridad en Escucha digital.' },
    { t: 'Actúa', d: 'En el CRM convierte un contacto a comprometido y lanza un flujo.' },
    { t: 'Pregunta a la IA', d: 'Pide al Analista “¿qué municipios priorizar esta semana?”.' },
  ]

  return (
    <div>
      <PageHeader
        titulo="Manual de uso"
        subtitulo="Guía visual para operar la plataforma de campaña de principio a fin"
        accion={<PrimaryButton onClick={() => window.print()}>Imprimir manual</PrimaryButton>}
      />

      <Card className="border-brand-500/30">
        <p className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100"><Lightbulb className="h-4 w-4 text-brand-500" /> Primeros 10 minutos: recorrido guiado</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {tour.map((s, i) => (
            <button key={s.t} onClick={() => setPaso(i)} className={cn('rounded-xl border px-3 py-2 text-xs font-medium', paso === i ? 'border-brand-500/60 bg-brand-500/10 text-brand-600 dark:text-brand-400' : 'border-slate-200 text-slate-500 hover:bg-slate-900/5 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5')}>
              {i + 1}. {s.t}
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300"><strong className="text-slate-900 dark:text-slate-100">Paso {paso + 1}:</strong> {tour[paso].d}</p>
      </Card>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {MODULOS.map((m) => {
          const Icon = m.icon
          return (
            <Card key={m.nombre}>
              <p className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100"><Icon className="h-4 w-4 text-brand-500" />{m.nombre}</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">{m.desc}</p>
              <ol className="mt-2.5 space-y-1">
                {m.pasos.map((p, i) => <li key={p} className="text-xs text-slate-600 dark:text-slate-300"><span className="tabular mr-1.5 font-bold text-brand-500">{i + 1}.</span>{p}</li>)}
              </ol>
            </Card>
          )
        })}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100"><Keyboard className="h-4 w-4 text-slate-400" /> Atajos y gestos</p>
          <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
            {ATAJOS.map(([a, d], i) => (
              <div key={a} className={cn('flex gap-3 px-3 py-2 text-xs', i % 2 === 0 && 'bg-slate-900/[0.03] dark:bg-white/[0.03]')}>
                <span className="w-36 shrink-0 font-semibold text-slate-700 dark:text-slate-200">{a}</span>
                <span className="text-slate-500 dark:text-slate-400">{d}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <p className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">Preguntas frecuentes</p>
          <div className="space-y-2">
            {FAQS.map((f, i) => (
              <div key={f.q} className="rounded-xl border border-slate-200 dark:border-white/10">
                <button onClick={() => setAbierto(abierto === i ? null : i)} className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm font-medium text-slate-800 dark:text-slate-100">
                  {f.q}<ChevronDown className={cn('h-4 w-4 shrink-0 transition-transform', abierto === i && 'rotate-180')} />
                </button>
                {abierto === i && <p className="px-3 pb-3 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">{f.a}</p>}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-4 flex flex-wrap items-center gap-3">
        <Badge tono="default">¿Listo para operar?</Badge>
        <p className="flex-1 text-sm text-slate-500 dark:text-slate-400">Vuelve al Centro de control y ejecuta el recorrido guiado sobre datos reales de la campaña.</p>
        <div className="flex items-center gap-2 text-xs text-slate-400"><Printer className="h-3.5 w-3.5" /> Imprimible</div>
        <button onClick={() => setModulo('control')} className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-glow hover:bg-brand-600">Ir al Centro de control</button>
      </Card>
    </div>
  )
}
