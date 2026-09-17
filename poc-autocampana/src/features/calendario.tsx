import { useMemo, useState } from 'react'
import { Plus, LayoutList, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { MUNICIPIOS, MUNICIPIO_NOMBRE } from '../lib/data'
import { fmtNum } from '../lib/format'
import { useCampaignStore } from '../store/useCampaignStore'
import { Card, PageHeader, Badge, PrimaryButton, GhostButton, FieldSelect, KPI, cn } from '../components/ui'
import { mulberry32, pick, int } from '../lib/seed'

interface Evento {
  id: string
  titulo: string
  tipo: string
  fecha: string
  municipioId: string
  responsable: string
  asistentes: number
}

function generarEventos(): Evento[] {
  const rnd = mulberry32(99)
  const tipos = ['Recorrido', 'Brigada médica', 'Reunión seccional', 'Taller de promotores', 'Mitin', 'Brigada de alumbrado']
  const resp = ['E. Garza', 'M. Treviño', 'L. Cantú', 'R. Sáenz']
  const out: Evento[] = []
  const hoy = new Date()
  for (let d = 0; d < 45; d++) {
    const n = 1 + Math.floor(rnd() * 2)
    for (let k = 0; k < n; k++) {
      const m = pick(rnd, MUNICIPIOS)
      const tipo = pick(rnd, tipos)
      const f = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + d - 10, int(rnd, 9, 19), 0, 0)
      out.push({ id: `EV-${d}-${k}`, titulo: `${tipo} · ${m.nombre}`, tipo, fecha: f.toISOString(), municipioId: m.id, responsable: pick(rnd, resp), asistentes: int(rnd, 25, 400) })
    }
  }
  return out.sort((a, b) => +new Date(a.fecha) - +new Date(b.fecha))
}

const BASE = generarEventos()
const TIPOS = ['Recorrido', 'Brigada médica', 'Reunión seccional', 'Taller de promotores', 'Mitin', 'Brigada de alumbrado']

function diaKey(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function hoyKey(): string {
  return diaKey(new Date().toISOString())
}

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export function Calendario() {
  const pushToast = useCampaignStore((s) => s.pushToast)
  const [vista, setVista] = useState<'mes' | 'lista'>('mes')
  const [mun, setMun] = useState('')
  const [extra, setExtra] = useState<Evento[]>([])
  const [offset, setOffset] = useState(0)
  const [diaSel, setDiaSel] = useState<string | null>(null)
  const [form, setForm] = useState(false)
  const [titulo, setTitulo] = useState('Recorrido · Colonia prioritaria')
  const [tipo, setTipo] = useState(TIPOS[0])
  const [fecha, setFecha] = useState(hoyKey())
  const [hora, setHora] = useState('10:00')
  const [munNuevo, setMunNuevo] = useState('reynosa')

  const eventos = useMemo(() => [...extra, ...BASE].filter((e) => !mun || e.municipioId === mun), [extra, mun])
  const porDia = useMemo(() => {
    const m = new Map<string, Evento[]>()
    for (const e of eventos) {
      const k = diaKey(e.fecha)
      if (!m.has(k)) m.set(k, [])
      m.get(k)!.push(e)
    }
    return m
  }, [eventos])

  const mesRef = useMemo(() => {
    const h = new Date()
    return new Date(h.getFullYear(), h.getMonth() + offset, 1)
  }, [offset])
  const celdas = useMemo(() => {
    const primero = (mesRef.getDay() + 6) % 7
    const diasMes = new Date(mesRef.getFullYear(), mesRef.getMonth() + 1, 0).getDate()
    const arr: Array<{ dia: number; key: string } | null> = []
    for (let i = 0; i < primero; i++) arr.push(null)
    for (let d = 1; d <= diasMes; d++) {
      const key = `${mesRef.getFullYear()}-${String(mesRef.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      arr.push({ dia: d, key })
    }
    while (arr.length % 7 !== 0) arr.push(null)
    return arr
  }, [mesRef])

  const nombreMes = mesRef.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
  const eventosDia = diaSel ? porDia.get(diaSel) ?? [] : []
  const estaSemana = eventos.filter((e) => +new Date(e.fecha) < Date.now() + 7 * 86400000).length

  function abrirForm(key?: string) {
    if (key) setFecha(key)
    setForm(true)
  }

  function agregar() {
    const [y, mo, d] = fecha.split('-').map(Number)
    const [h, mi] = hora.split(':').map(Number)
    const f = new Date(y, mo - 1, d, h, mi, 0)
    setExtra((x) => [{ id: `EV-manual-${Date.now()}`, titulo: `${tipo} · ${MUNICIPIO_NOMBRE[munNuevo]}`, tipo, fecha: f.toISOString(), municipioId: munNuevo, responsable: 'Por asignar', asistentes: 0 }, ...x])
    setForm(false)
    setDiaSel(diaKey(f.toISOString()))
    pushToast('Evento creado', `${titulo} · ${f.toLocaleDateString('es-MX')}`)
  }

  return (
    <div>
      <PageHeader
        titulo="Calendario de campaña"
        subtitulo="Recorridos, brigadas y actos · vista mensual y lista"
        accion={
          <>
            <div className="flex rounded-xl border border-slate-200 p-1 dark:border-white/10">
              <button onClick={() => setVista('mes')} aria-label="Vista calendario" className={cn('rounded-lg p-2', vista === 'mes' ? 'bg-brand-500/15 text-brand-600 dark:text-brand-400' : 'text-slate-400')}><CalendarDays className="h-4 w-4" /></button>
              <button onClick={() => setVista('lista')} aria-label="Vista lista" className={cn('rounded-lg p-2', vista === 'lista' ? 'bg-brand-500/15 text-brand-600 dark:text-brand-400' : 'text-slate-400')}><LayoutList className="h-4 w-4" /></button>
            </div>
            <PrimaryButton onClick={() => abrirForm(diaSel ?? undefined)}><span className="inline-flex items-center gap-2"><Plus className="h-4 w-4" /> Nuevo evento</span></PrimaryButton>
          </>
        }
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <KPI label="Eventos visibles" valor={fmtNum(eventos.length)} delta="Territorio + estructura" up spark={[2, 3, 2, 4, 3, 5, 4]} />
        <KPI label="Esta semana" valor={fmtNum(estaSemana)} delta="Ventana crítica" up spark={[1, 2, 3, 3, 4, 5, 6]} />
        <KPI label="Asistencia esperada" valor={fmtNum(eventos.reduce((a, e) => a + e.asistentes, 0))} delta="Suma de convocatorias" up spark={[50, 120, 200, 320, 410, 520, 600]} />
      </div>

      {form && (
        <Card className="mt-4">
          <p className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Nuevo evento · pulsa la fecha para elegirla en el calendario</p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-6">
            <input value={titulo} onChange={(e) => setTitulo(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-ink-800 dark:text-slate-100 xl:col-span-2" aria-label="Título del evento" />
            <FieldSelect valor={tipo} onChange={setTipo} label="Tipo de evento">{TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}</FieldSelect>
            <input value={fecha} onChange={(e) => setFecha(e.target.value)} type="date" className="rounded-xl border border-brand-500/40 bg-white px-3 py-2 text-sm dark:border-brand-500/40 dark:bg-ink-800 dark:text-slate-100" aria-label="Fecha del evento (pulsa para elegir)" />
            <input value={hora} onChange={(e) => setHora(e.target.value)} type="time" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-ink-800 dark:text-slate-100" aria-label="Hora del evento" />
            <FieldSelect valor={munNuevo} onChange={setMunNuevo} label="Municipio del evento">{MUNICIPIOS.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}</FieldSelect>
          </div>
          <div className="mt-3 flex gap-2"><PrimaryButton onClick={agregar}>Guardar evento</PrimaryButton><GhostButton onClick={() => setForm(false)}>Cancelar</GhostButton></div>
        </Card>
      )}

      {vista === 'mes' ? (
        <Card className="mt-4">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <button onClick={() => setOffset(offset - 1)} aria-label="Mes anterior" className="rounded-xl border border-slate-200 p-2 hover:bg-slate-900/5 dark:border-white/10 dark:hover:bg-white/10"><ChevronLeft className="h-4 w-4" /></button>
            <p className="min-w-44 text-center text-sm font-semibold capitalize text-slate-900 dark:text-slate-100">{nombreMes}</p>
            <button onClick={() => setOffset(offset + 1)} aria-label="Mes siguiente" className="rounded-xl border border-slate-200 p-2 hover:bg-slate-900/5 dark:border-white/10 dark:hover:bg-white/10"><ChevronRight className="h-4 w-4" /></button>
            <button onClick={() => { setOffset(0); setDiaSel(hoyKey()) }} className="rounded-xl px-3 py-2 text-xs font-medium text-brand-600 hover:bg-brand-500/10 dark:text-brand-400">Hoy</button>
            <div className="ml-auto"><FieldSelect valor={mun} onChange={setMun} label="Filtro municipio"><option value="">Todos los municipios</option>{MUNICIPIOS.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}</FieldSelect></div>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {DIAS.map((d) => <p key={d} className="pb-1 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-400">{d}</p>)}
            {celdas.map((c, i) => {
              if (!c) return <div key={`v-${i}`} className="min-h-20 rounded-xl" />
              const evs = porDia.get(c.key) ?? []
              const esHoy = c.key === hoyKey()
              const sel = c.key === diaSel
              return (
                <button
                  key={c.key}
                  onClick={() => setDiaSel(c.key)}
                  onDoubleClick={() => abrirForm(c.key)}
                  className={cn('min-h-20 rounded-xl border p-1.5 text-left transition-colors', sel ? 'border-brand-500/60 bg-brand-500/10' : 'border-slate-200 hover:border-brand-500/40 dark:border-white/10 dark:hover:border-brand-500/40')}
                >
                  <span className={cn('tabular inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold', esHoy ? 'bg-brand-500 text-white' : 'text-slate-500 dark:text-slate-400')}>{c.dia}</span>
                  <div className="mt-1 space-y-1">
                    {evs.slice(0, 2).map((e) => (
                      <p key={e.id} className="truncate rounded-md bg-brand-500/15 px-1.5 py-0.5 text-[10px] font-medium text-brand-700 dark:text-brand-300">{e.tipo}</p>
                    ))}
                    {evs.length > 2 && <p className="tabular px-1 text-[10px] text-slate-400">+{evs.length - 2} más</p>}
                  </div>
                </button>
              )
            })}
          </div>
          <div className="mt-3 rounded-xl bg-slate-900/[0.03] p-3 dark:bg-white/[0.03]">
            {diaSel ? (
              <>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {new Date(diaSel + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })} · {eventosDia.length} eventos
                  </p>
                  <button onClick={() => abrirForm(diaSel)} className="rounded-xl bg-brand-500/10 px-3 py-1.5 text-xs font-semibold text-brand-600 hover:bg-brand-500/20 dark:text-brand-400">+ Añadir aquí</button>
                </div>
                {eventosDia.length === 0 ? <p className="text-xs text-slate-500">Día libre. Doble clic en el día o usa “Añadir aquí”.</p> : (
                  <div className="space-y-1.5">
                    {eventosDia.map((e) => (
                      <div key={e.id} className="flex items-center gap-3 text-sm">
                        <span className="tabular w-12 text-xs text-slate-500">{new Date(e.fecha).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="flex-1 truncate text-slate-700 dark:text-slate-200">{e.titulo}</span>
                        <Badge tono="default">{e.tipo}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : <p className="text-xs text-slate-500">Pulsa un día para ver sus eventos. Doble clic para crear uno en esa fecha.</p>}
          </div>
        </Card>
      ) : (
        <Card className="mt-4">
          <div className="mb-3 flex items-center gap-2">
            <FieldSelect valor={mun} onChange={setMun} label="Filtro municipio"><option value="">Todos los municipios</option>{MUNICIPIOS.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}</FieldSelect>
            <span className="tabular ml-auto text-xs text-slate-500">{eventos.length} eventos</span>
          </div>
          <div className="space-y-2">
            {eventos.slice(0, 40).map((e) => (
              <div key={e.id} className="flex flex-wrap items-center gap-3 rounded-xl bg-slate-900/[0.03] px-3 py-2.5 text-sm dark:bg-white/[0.03]">
                <div className="w-14 text-center">
                  <p className="tabular text-lg font-bold text-slate-900 dark:text-slate-100">{new Date(e.fecha).getDate()}</p>
                  <p className="text-[10px] uppercase text-slate-500">{new Date(e.fecha).toLocaleDateString('es-MX', { month: 'short' })}</p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-900 dark:text-slate-100">{e.titulo}</p>
                  <p className="text-xs text-slate-500">{new Date(e.fecha).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} · {MUNICIPIO_NOMBRE[e.municipioId]} · {e.responsable}</p>
                </div>
                <Badge tono="default">{e.tipo}</Badge>
                <span className="tabular text-xs text-slate-500">{e.asistentes > 0 ? `${fmtNum(e.asistentes)} esp.` : 'por convocar'}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
