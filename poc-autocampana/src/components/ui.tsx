import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Area, AreaChart, ResponsiveContainer } from 'recharts'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Search, Inbox, ArrowUp, ArrowDown, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react'

export function cn(...v: Array<string | false | null | undefined>) {
  return twMerge(clsx(...v))
}

export function Card(props: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-ink-900/70 dark:shadow-panel dark:backdrop-blur', props.className)}>
      {props.children}
    </div>
  )
}

export function PageHeader(props: { titulo: string; subtitulo: string; accion?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-[28px] font-semibold leading-8 tracking-tight text-slate-900 dark:text-slate-100">{props.titulo}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{props.subtitulo}</p>
      </div>
      <div className="flex items-center gap-2">{props.accion}</div>
    </div>
  )
}

export function KPI(props: { label: string; valor: string; delta: string; up: boolean; spark: number[]; acento?: boolean }) {
  const data = props.spark.map((v, i) => ({ i, v }))
  return (
    <Card className={cn(props.acento && 'border-brand-500/40 dark:shadow-glow')}>
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">{props.label}</p>
      <div className="mt-1 flex items-end justify-between gap-3">
        <div>
          <p className="tabular text-[26px] font-semibold tracking-tight text-slate-900 dark:text-slate-50">{props.valor}</p>
          <p className={cn('tabular mt-1 text-xs font-medium', props.up ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>{props.delta}</p>
        </div>
        <div className="h-12 w-28">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 2, bottom: 2, left: 0, right: 0 }}>
              <defs>
                <linearGradient id={`g-${props.label}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2E7CF6" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#2E7CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke="#2E7CF6" strokeWidth={2.5} fill={`url(#g-${props.label})`} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  )
}

const BADGE_STYLES: Record<string, string> = {
  Alta: 'bg-rose-500/15 text-rose-700 border-rose-500/30 dark:text-rose-300',
  Media: 'bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-300',
  Baja: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-300',
  pos: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-300',
  neu: 'bg-slate-500/15 text-slate-600 border-slate-500/30 dark:text-slate-300',
  neg: 'bg-rose-500/15 text-rose-700 border-rose-500/30 dark:text-rose-300',
  default: 'bg-brand-500/15 text-brand-600 border-brand-500/30 dark:text-brand-400',
}

export function Badge(props: { children: ReactNode; tono?: string }) {
  const cls = BADGE_STYLES[props.tono ?? ''] ?? BADGE_STYLES.default
  return <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', cls)}>{props.children}</span>
}

export function EmptyState(props: { titulo: string; detalle: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 py-12 text-center dark:border-white/10">
      <Inbox className="h-8 w-8 text-slate-400 dark:text-slate-600" />
      <p className="mt-3 font-medium text-slate-700 dark:text-slate-200">{props.titulo}</p>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{props.detalle}</p>
    </div>
  )
}

export function Skeleton(props: { className?: string }) {
  return <div className={cn('animate-pulse rounded-xl bg-slate-200 dark:bg-white/5', props.className ?? 'h-20')} />
}

export function Progress(props: { valor: number; max: number; className?: string }) {
  const pct = Math.min(100, (props.valor / props.max) * 100)
  return (
    <div className={cn('h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10', props.className)}>
      <div className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400 transition-all duration-500" style={{ width: `${pct}%` }} />
    </div>
  )
}

export function SearchInput(props: { valor: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
      <input
        value={props.valor}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/30 dark:border-white/10 dark:bg-ink-800 dark:text-slate-100 dark:placeholder:text-slate-500"
      />
    </div>
  )
}

export function PrimaryButton(props: { children: ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={props.onClick}
      className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition-colors hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
    >
      {props.children}
    </button>
  )
}

export function GhostButton(props: { children: ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={props.onClick}
      className="rounded-xl border border-slate-200 bg-slate-900/5 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-900/10 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
    >
      {props.children}
    </button>
  )
}

export function ChipFiltro(props: { label: string; onClear: () => void }) {
  return (
    <button onClick={props.onClear} className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/40 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-600 hover:bg-brand-500/20 dark:text-brand-400">
      {props.label} <span aria-hidden="true">×</span>
    </button>
  )
}

export function Logo(props: { className?: string }) {
  return (
    <span className={cn('relative flex h-9 w-9 shrink-0 items-center justify-center', props.className)}>
      <span className="absolute inset-0 animate-ping rounded-xl bg-brand-400/30 [animation-duration:2.5s]" />
      <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-sky-300 via-brand-500 to-violet-600 shadow-glow" />
      <span className="absolute inset-0 overflow-hidden rounded-xl">
        <span className="animate-shimmer absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
      </span>
      <span className="relative text-sm font-bold text-white drop-shadow">T</span>
    </span>
  )
}

export function FieldSelect(props: { valor: string; onChange: (v: string) => void; label: string; children: ReactNode }) {
  return (
    <select
      value={props.valor}
      onChange={(e) => props.onChange(e.target.value)}
      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand-500/60 dark:border-white/10 dark:bg-ink-800 dark:text-slate-200"
      aria-label={props.label}
    >
      {props.children}
    </select>
  )
}

export interface Columna<T> {
  clave: string
  titulo: string
  render: (fila: T) => ReactNode
  ordenar?: (a: T, b: T) => number
}

export function DataTable<T>(props: {
  datos: T[]
  columnas: Columna<T>[]
  claveFila: (fila: T) => string
  textoBuscar: (fila: T) => string
  busquedaExterna?: string
  pageSizes?: number[]
  placeholder?: string
  onFila?: (fila: T) => void
  filaResaltada?: (fila: T) => boolean
}) {
  const sizes = props.pageSizes ?? [10, 25, 50]
  const [q, setQ] = useState('')
  const [porPagina, setPorPagina] = useState(sizes[1] ?? sizes[0])
  const [pagina, setPagina] = useState(1)
  const [orden, setOrden] = useState<{ clave: string; dir: 1 | -1 } | null>(null)

  const ext = (props.busquedaExterna ?? '').trim().toLowerCase()
  const filtrados = useMemo(() => {
    const qi = q.trim().toLowerCase()
    const base = props.datos.filter((f) => {
      const t = props.textoBuscar(f).toLowerCase()
      return (qi === '' || t.includes(qi)) && (ext === '' || t.includes(ext))
    })
    if (!orden) return base
    const cmp = props.columnas.find((c) => c.clave === orden.clave)?.ordenar
    if (!cmp) return base
    return [...base].sort((a, b) => cmp(a, b) * orden.dir)
  }, [props.datos, props.columnas, props.textoBuscar, q, ext, orden])

  const totalPag = Math.max(1, Math.ceil(filtrados.length / porPagina))
  const pagSegura = Math.min(pagina, totalPag)
  useEffect(() => {
    setPagina(1)
  }, [q, ext, porPagina, filtrados.length])

  const filas = filtrados.slice((pagSegura - 1) * porPagina, pagSegura * porPagina)
  const desde = filtrados.length === 0 ? 0 : (pagSegura - 1) * porPagina + 1
  const hasta = Math.min(filtrados.length, pagSegura * porPagina)

  const nums = useMemo(() => {
    if (totalPag <= 7) return Array.from({ length: totalPag }, (_, i) => i + 1)
    const s = new Set([1, 2, pagSegura - 1, pagSegura, pagSegura + 1, totalPag - 1, totalPag].filter((n) => n >= 1 && n <= totalPag))
    return [...s].sort((a, b) => a - b)
  }, [totalPag, pagSegura])

  function alternarOrden(col: Columna<T>) {
    if (!col.ordenar) return
    setOrden((o) => (o?.clave === col.clave ? { clave: col.clave, dir: o.dir === 1 ? -1 : 1 } : { clave: col.clave, dir: 1 }))
  }

  const btnPag = 'rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-900/5 disabled:opacity-40 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10'

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="w-64"><SearchInput valor={q} onChange={setQ} placeholder={props.placeholder ?? 'Buscar en la tabla…'} /></div>
        <select value={porPagina} onChange={(e) => setPorPagina(Number(e.target.value))} aria-label="Elementos por página" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand-500/60 dark:border-white/10 dark:bg-ink-800 dark:text-slate-200">
          {sizes.map((n) => <option key={n} value={n}>{n} por página</option>)}
        </select>
        <span className="tabular ml-auto text-xs text-slate-500">Mostrando {desde}–{hasta} de {filtrados.length}</span>
      </div>
      {filtrados.length === 0 ? (
        <EmptyState titulo="Sin resultados" detalle="Ajusta la búsqueda o los filtros para ver datos." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                {props.columnas.map((c) => (
                  <th key={c.clave} className="py-2 pr-3">
                    {c.ordenar ? (
                      <button onClick={() => alternarOrden(c)} className="inline-flex items-center gap-1 uppercase tracking-wider hover:text-slate-800 dark:hover:text-slate-200">
                        {c.titulo}
                        {orden?.clave === c.clave ? (orden.dir === 1 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-40" />}
                      </button>
                    ) : c.titulo}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filas.map((f) => (
                <tr
                  key={props.claveFila(f)}
                  onClick={() => props.onFila?.(f)}
                  className={cn('border-t border-slate-200 dark:border-white/5', props.onFila && 'cursor-pointer hover:bg-slate-900/5 dark:hover:bg-white/5', props.filaResaltada?.(f) && 'bg-brand-500/10')}
                >
                  {props.columnas.map((c) => (
                    <td key={c.clave} className="py-2.5 pr-3">{c.render(f)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {totalPag > 1 && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <span className="tabular text-xs text-slate-500">Página {pagSegura} de {totalPag}</span>
          <div className="flex items-center gap-1">
            <button className={btnPag} disabled={pagSegura <= 1} onClick={() => setPagina(pagSegura - 1)} aria-label="Página anterior"><ChevronLeft className="h-3.5 w-3.5" /></button>
            {nums.map((n) => (
              <button key={n} onClick={() => setPagina(n)} className={cn(btnPag, n === pagSegura && 'border-brand-500/60 bg-brand-500/10 text-brand-600 dark:text-brand-400')}>{n}</button>
            ))}
            <button className={btnPag} disabled={pagSegura >= totalPag} onClick={() => setPagina(pagSegura + 1)} aria-label="Página siguiente"><ChevronRight className="h-3.5 w-3.5" /></button>
          </div>
        </div>
      )}
    </div>
  )
}
