import { useMemo, useState } from 'react'
import { Map, Radio, Users, Workflow, LayoutDashboard, ChevronLeft, Bell, Sun, Moon, LogOut, Megaphone, CalendarDays, Library, Settings, BookOpen, AlertTriangle, X } from 'lucide-react'
import { useCampaignStore, type Modulo } from '../store/useCampaignStore'
import { MUNICIPIOS, SECCIONES, INTERACCIONES, MUNICIPIO_NOMBRE } from '../lib/data'
import { timeAgo } from '../lib/format'
import { cn, Logo } from './ui'

const NAV: Array<{ id: Modulo; label: string; icon: typeof Map; count?: string; grupo: string }> = [
  { id: 'control', label: 'Centro de control', icon: LayoutDashboard, grupo: 'Operación' },
  { id: 'territorio', label: 'Inteligencia territorial', icon: Map, count: '10 mun', grupo: 'Operación' },
  { id: 'escucha', label: 'Escucha digital', icon: Radio, count: '800', grupo: 'Operación' },
  { id: 'crm', label: 'CRM campaña', icon: Users, count: '250', grupo: 'Operación' },
  { id: 'automatizacion', label: 'Automatización', icon: Workflow, count: '4 flujos', grupo: 'Operación' },
  { id: 'audiencias', label: 'Audiencias', icon: Megaphone, grupo: 'Crecimiento' },
  { id: 'contenidos', label: 'Contenidos', icon: Library, grupo: 'Crecimiento' },
  { id: 'calendario', label: 'Calendario', icon: CalendarDays, grupo: 'Crecimiento' },
  { id: 'config', label: 'Configuración', icon: Settings, grupo: 'Sistema' },
  { id: 'manual', label: 'Manual de uso', icon: BookOpen, grupo: 'Sistema' },
]

export function Sidebar() {
  const modulo = useCampaignStore((s) => s.modulo)
  const setModulo = useCampaignStore((s) => s.setModulo)
  const open = useCampaignStore((s) => s.sidebarOpen)
  const usuario = useCampaignStore((s) => s.usuario)
  const logout = useCampaignStore((s) => s.logout)
  let grupoActual = ''
  return (
    <aside className={cn('no-print flex flex-col border-r border-slate-200 bg-white transition-all duration-200 dark:border-white/10 dark:bg-ink-900/80 dark:backdrop-blur', open ? 'w-[264px]' : 'w-[72px]')}>
      <div className="flex items-center gap-3 px-4 py-5">
        <Logo />
        {open && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">ThirdWish Systems</p>
            <p className="text-[11px] text-slate-500">PAN Tamaulipas · 2027</p>
          </div>
        )}
      </div>
      {open && (
        <div className="mx-4 mb-3 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300">Sincronizado · 43 municipios al día</p>
        </div>
      )}
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 pb-2">
        {NAV.map((n) => {
          const Icon = n.icon
          const active = modulo === n.id
          const header = n.grupo !== grupoActual ? n.grupo : null
          grupoActual = n.grupo
          return (
            <div key={n.id}>
              {header && open && <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">{header}</p>}
              <button
                onClick={() => setModulo(n.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
                  active ? 'bg-brand-500/15 text-slate-900 shadow-[inset_0_0_0_1px_rgba(46,124,246,0.4)] dark:text-white' : 'text-slate-500 hover:bg-slate-900/5 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-100',
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {open && <span className="flex-1 truncate font-medium">{n.label}</span>}
                {open && n.count && <span className="tabular rounded-full bg-slate-900/5 px-2 py-0.5 text-[11px] text-slate-500 dark:bg-white/5 dark:text-slate-400">{n.count}</span>}
              </button>
            </div>
          )
        })}
      </nav>
      {open && usuario && (
        <div className="m-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-ink-800">
          <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">{usuario.nombre}</p>
          <p className="text-[11px] text-slate-500">{usuario.rol} · {usuario.email}</p>
          <button onClick={logout} className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium text-rose-600 hover:text-rose-500 dark:text-rose-400">
            <LogOut className="h-3 w-3" /> Cerrar sesión
          </button>
        </div>
      )}
    </aside>
  )
}

export function Topbar() {
  const municipioId = useCampaignStore((s) => s.municipioId)
  const seleccionarMunicipio = useCampaignStore((s) => s.seleccionarMunicipio)
  const busqueda = useCampaignStore((s) => s.busqueda)
  const setBusqueda = useCampaignStore((s) => s.setBusqueda)
  const toggleSidebar = useCampaignStore((s) => s.toggleSidebar)
  const toasts = useCampaignStore((s) => s.toasts)
  const dismissToast = useCampaignStore((s) => s.dismissToast)
  const setModulo = useCampaignStore((s) => s.setModulo)
  const theme = useCampaignStore((s) => s.theme)
  const toggleTheme = useCampaignStore((s) => s.toggleTheme)
  const seleccionarSeccion = useCampaignStore((s) => s.seleccionarSeccion)
  const [panel, setPanel] = useState(false)
  const [leidas, setLeidas] = useState(0)
  const muni = MUNICIPIOS.find((m) => m.id === municipioId)

  const alertas = useMemo(() => {
    const criticas = [...SECCIONES].sort((a, b) => b.inseguridad - a.inseguridad).slice(0, 3).map((s) => ({
      id: `sec-${s.id}`,
      titulo: `Riesgo alto · Sec. ${s.id} ${MUNICIPIO_NOMBRE[s.municipioId]}`,
      detalle: `Inseguridad ${s.inseguridad}/100 · ${s.temas.join(', ')} · resp. ${s.responsable}`,
      modulo: 'territorio' as Modulo,
      seccionId: s.id,
    }))
    const humanas = INTERACCIONES.filter((i) => i.requiereHumano).slice(0, 3).map((i) => ({
      id: i.id,
      titulo: `Caso sensible · ${i.tema} en ${MUNICIPIO_NOMBRE[i.municipioId]}`,
      detalle: `${i.texto.slice(0, 60)}… · ${timeAgo(i.fecha)}`,
      modulo: 'escucha' as Modulo,
      seccionId: null as string | null,
    }))
    return [...criticas, ...humanas]
  }, [])
  const sinLeer = Math.max(0, alertas.length - leidas)
  return (
    <header className="no-print sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-ink-950/80">
      <div className="flex h-16 items-center gap-3 px-6">
        <button onClick={toggleSidebar} aria-label="Colapsar menú" className="rounded-lg border border-slate-200 bg-slate-900/5 p-2 text-slate-600 hover:bg-slate-900/10 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <nav className="hidden items-center gap-1.5 text-sm md:flex" aria-label="Territorio">
          <button onClick={() => seleccionarMunicipio(null)} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">Tamaulipas</button>
          {muni && (
            <>
              <span className="text-slate-400 dark:text-slate-600">›</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">{muni.nombre}</span>
            </>
          )}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden w-64 lg:block">
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar sección, contacto…"
              onFocus={() => setModulo('crm')}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-brand-500/60 dark:border-white/10 dark:bg-ink-800 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>
          <select
            value={municipioId ?? ''}
            onChange={(e) => seleccionarMunicipio(e.target.value || null)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand-500/60 dark:border-white/10 dark:bg-ink-800 dark:text-slate-200"
            aria-label="Selector municipio"
          >
            <option value="">Todo el estado</option>
            {MUNICIPIOS.map((m) => (
              <option key={m.id} value={m.id}>{m.nombre}</option>
            ))}
          </select>
          <button onClick={toggleTheme} aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'} className="rounded-xl border border-slate-200 bg-slate-900/5 p-2.5 text-slate-600 hover:bg-slate-900/10 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10">
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <div className="relative">
            <button onClick={() => setPanel(!panel)} className="relative rounded-xl border border-slate-200 bg-slate-900/5 p-2.5 text-slate-600 hover:bg-slate-900/10 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10" aria-label="Alertas">
              <Bell className="h-4 w-4" />
              {sinLeer > 0 && <span className="tabular absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">{sinLeer}</span>}
            </button>
            {panel && (
              <div className="absolute right-0 top-full z-50 mt-2 w-96 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-panel dark:border-white/10 dark:bg-ink-900">
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-white/10">
                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100"><AlertTriangle className="h-4 w-4 text-amber-500" /> Alertas ({sinLeer} sin leer)</p>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setLeidas(alertas.length)} className="rounded-lg px-2 py-1 text-[11px] font-medium text-brand-600 hover:bg-brand-500/10 dark:text-brand-400">Marcar leídas</button>
                    <button onClick={() => setPanel(false)} aria-label="Cerrar alertas" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-900/5 dark:hover:bg-white/10"><X className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {alertas.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => { if (a.seccionId) seleccionarSeccion(a.seccionId); setModulo(a.modulo); setPanel(false) }}
                      className="flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left last:border-0 hover:bg-slate-900/[0.03] dark:border-white/5 dark:hover:bg-white/5"
                    >
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-rose-500" />
                      <span><span className="block text-[13px] font-medium text-slate-800 dark:text-slate-100">{a.titulo}</span><span className="mt-0.5 block text-xs text-slate-500">{a.detalle}</span></span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => { setModulo('control'); setPanel(false) }}
                  className="w-full bg-slate-900/[0.03] px-4 py-2.5 text-xs font-semibold text-brand-600 hover:bg-brand-500/10 dark:bg-white/[0.03] dark:text-brand-400"
                >
                  Ver todas en Centro de control →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {toasts.length > 0 && (
        <div className="absolute right-4 top-full mt-2 w-80 space-y-2">
          {toasts.map((t) => (
            <button key={t.id} onClick={() => dismissToast(t.id)} className="w-full rounded-xl border border-slate-200 bg-white p-3 text-left shadow-panel dark:border-white/10 dark:bg-ink-800">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t.titulo}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t.detalle}</p>
            </button>
          ))}
        </div>
      )}
    </header>
  )
}
