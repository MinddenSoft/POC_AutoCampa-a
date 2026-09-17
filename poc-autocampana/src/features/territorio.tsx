import { useMemo, useState } from 'react'
import { X, FileText } from 'lucide-react'
import { MUNICIPIOS, SECCIONES, MUNICIPIO_NOMBRE } from '../lib/data'
import { fmtNum, fmtPct, fmtFecha } from '../lib/format'
import { useCampaignStore } from '../store/useCampaignStore'
import { Card, PageHeader, Badge, PrimaryButton, GhostButton, ChipFiltro, Progress, DataTable, type Columna } from '../components/ui'
import { TamaulipasMap } from '../components/map'
import type { Seccion } from '../lib/data'

export function Territorio() {
  const municipioId = useCampaignStore((s) => s.municipioId)
  const seccionId = useCampaignStore((s) => s.seccionId)
  const seleccionarMunicipio = useCampaignStore((s) => s.seleccionarMunicipio)
  const seleccionarSeccion = useCampaignStore((s) => s.seleccionarSeccion)
  const irABriefing = useCampaignStore((s) => s.irABriefing)
  const [soloAlta, setSoloAlta] = useState(false)
  const [briefingId, setBriefingId] = useState<string | null>(null)

  const secciones = useMemo(() => {
    return SECCIONES.filter((s) => {
      if (municipioId && s.municipioId !== municipioId) return false
      if (soloAlta && s.afinidadPAN >= 38) return false
      return true
    })
  }, [municipioId, soloAlta])

  const columnas: Columna<Seccion>[] = [
    { clave: 'id', titulo: 'Sección', ordenar: (a, b) => Number(a.id) - Number(b.id), render: (s) => <span className="tabular font-semibold text-slate-900 dark:text-slate-100">{s.id}</span> },
    { clave: 'mun', titulo: 'Municipio', ordenar: (a, b) => MUNICIPIO_NOMBRE[a.municipioId].localeCompare(MUNICIPIO_NOMBRE[b.municipioId]), render: (s) => <span className="text-slate-600 dark:text-slate-300">{MUNICIPIO_NOMBRE[s.municipioId]}</span> },
    { clave: 'ln', titulo: 'LN', ordenar: (a, b) => a.listaNominal - b.listaNominal, render: (s) => <span className="tabular text-slate-600 dark:text-slate-300">{fmtNum(s.listaNominal)}</span> },
    { clave: 'part', titulo: 'Part.', ordenar: (a, b) => a.participacion - b.participacion, render: (s) => <span className="tabular text-slate-600 dark:text-slate-300">{fmtPct(s.participacion, 1)}</span> },
    { clave: 'afin', titulo: 'Afinidad', ordenar: (a, b) => a.afinidadPAN - b.afinidadPAN, render: (s) => <Badge tono={s.afinidadPAN < 38 ? 'Alta' : s.afinidadPAN > 50 ? 'Baja' : 'Media'}>{s.afinidadPAN}</Badge> },
    { clave: 'temas', titulo: 'Temas', render: (s) => <span className="text-xs text-slate-500 dark:text-slate-400">{s.temas.join(' · ')}</span> },
    { clave: 'accion', titulo: '', render: () => <span className="text-xs font-medium text-brand-600 dark:text-brand-400">Ver ficha →</span> },
  ]

  const muni = MUNICIPIOS.find((m) => m.id === municipioId)
  const ficha = SECCIONES.find((s) => s.id === seccionId)
  const critica = useMemo(() => [...SECCIONES].sort((a, b) => b.inseguridad - a.inseguridad)[0], [])
  const briefing = SECCIONES.find((s) => s.id === briefingId)

  function generarBriefing() {
    setBriefingId(ficha?.id ?? critica.id)
  }

  return (
    <div>
      <PageHeader
        titulo="Inteligencia territorial"
        subtitulo="Ficha viva por sección electoral · resultados, afinidad, seguridad y comparativa"
        accion={<>{municipioId && <GhostButton onClick={() => seleccionarMunicipio(null)}>Limpiar territorio</GhostButton>}<PrimaryButton onClick={generarBriefing}>Generar briefing</PrimaryButton></>}
      />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <div className="xl:col-span-3"><TamaulipasMap /></div>
        <div className="space-y-4 xl:col-span-2">
          <Card>
            <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Territorio seleccionado</p>
            <p className="mt-1 text-xl font-semibold">{muni ? muni.nombre : 'Todo Tamaulipas'}</p>
            <p className="tabular mt-1 text-sm text-slate-500 dark:text-slate-400">
              {muni ? `LN ${fmtNum(muni.listaNominal)} · Afinidad ${muni.afinidadPAN} · Part. 2024 ${fmtPct(muni.part2024, 1)}` : `LN ${fmtNum(MUNICIPIOS.reduce((a, m) => a + m.listaNominal, 0))} · 10 municipios · 120 secciones`}
            </p>
            {muni && <div className="mt-3"><Progress valor={muni.afinidadPAN} max={100} /></div>}
          </Card>
          <Card>
            <p className="mb-3 text-sm font-semibold">Comparativa participación 2021–2024</p>
            <div className="space-y-2">
              {(muni ? [muni] : MUNICIPIOS.slice(0, 5)).map((m) => (
                <div key={m.id} className="flex items-center gap-3 text-sm">
                  <span className="w-28 truncate text-slate-600 dark:text-slate-300">{m.nombre}</span>
                  <Progress valor={m.part2024} max={70} className="flex-1" />
                  <span className="tabular w-14 text-right text-slate-500 dark:text-slate-400">{fmtPct(m.part2024, 1)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Card className="mt-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <button onClick={() => setSoloAlta(!soloAlta)} className={`rounded-full border px-3 py-1.5 text-xs font-medium ${soloAlta ? 'border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-300' : 'border-slate-200 dark:border-white/10 bg-slate-900/5 dark:bg-white/5 text-slate-600 dark:text-slate-300'}`}>
            Solo prioridad alta
          </button>
          {municipioId && <ChipFiltro label={MUNICIPIO_NOMBRE[municipioId]} onClear={() => seleccionarMunicipio(null)} />}
          <span className="tabular ml-auto text-xs text-slate-500">{secciones.length} de {SECCIONES.length} secciones</span>
        </div>
        <DataTable<Seccion>
          datos={secciones}
          columnas={columnas}
          claveFila={(s) => s.id}
          textoBuscar={(s) => `${s.id} ${MUNICIPIO_NOMBRE[s.municipioId]} ${s.temas.join(' ')} ${s.responsable}`}
          placeholder="Buscar sección, municipio, tema…"
          onFila={(s) => seleccionarSeccion(s.id)}
          filaResaltada={(s) => s.id === seccionId}
        />
      </Card>

      {ficha && (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/60" onClick={() => seleccionarSeccion(null)}>
          <div onClick={(e) => e.stopPropagation()} className="animate-in slide-in-from-right-4 fade-in w-full max-w-[420px] overflow-y-auto border-l border-slate-200 dark:border-white/10 bg-white dark:bg-ink-900 p-6 duration-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">Ficha por sección</p>
                <h2 className="text-xl font-semibold">Sec. {ficha.id} · {MUNICIPIO_NOMBRE[ficha.municipioId]}</h2>
              </div>
              <button onClick={() => seleccionarSeccion(null)} aria-label="Cerrar ficha" className="rounded-lg bg-slate-900/5 dark:bg-white/5 p-2 hover:bg-slate-900/10 dark:hover:bg-white/10"><X className="h-4 w-4" /></button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Card><p className="text-xs text-slate-500">Lista nominal</p><p className="tabular text-lg font-semibold">{fmtNum(ficha.listaNominal)}</p></Card>
              <Card><p className="text-xs text-slate-500">Participación</p><p className="tabular text-lg font-semibold">{fmtPct(ficha.participacion)}</p></Card>
              <Card><p className="text-xs text-slate-500">Afinidad PAN</p><p className="tabular text-lg font-semibold">{ficha.afinidadPAN}/100</p></Card>
              <Card><p className="text-xs text-slate-500">Inseguridad</p><p className="tabular text-lg font-semibold">{ficha.inseguridad}/100</p></Card>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <p className="text-slate-600 dark:text-slate-300">Swing: <span className="tabular font-semibold">{ficha.swing > 0 ? '+' : ''}{ficha.swing} pts</span></p>
              <p className="text-slate-600 dark:text-slate-300">Temas: {ficha.temas.join(', ')}</p>
              <p className="text-slate-600 dark:text-slate-300">Última visita: {fmtFecha(ficha.ultimaVisita)} · {ficha.responsable}</p>
            </div>
            <div className="mt-5 flex gap-2">
              <PrimaryButton onClick={() => irABriefing(ficha.id)}><span className="inline-flex items-center gap-2"><FileText className="h-4 w-4" /> Generar briefing</span></PrimaryButton>
              <GhostButton onClick={() => seleccionarSeccion(null)}>Cerrar</GhostButton>
            </div>
          </div>
        </div>
      )}
      {briefing && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4" onClick={() => setBriefingId(null)}>
          <div onClick={(e) => e.stopPropagation()} className="print-white max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-ink-900">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">Briefing para candidato</p>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Sec. {briefing.id} · {MUNICIPIO_NOMBRE[briefing.municipioId]}</h2>
              </div>
              <button onClick={() => setBriefingId(null)} aria-label="Cerrar briefing" className="rounded-lg bg-slate-900/5 p-2 hover:bg-slate-900/10 dark:bg-white/5 dark:hover:bg-white/10"><X className="h-4 w-4" /></button>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div><p className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">Situación</p><p className="text-slate-700 dark:text-slate-200">LN {fmtNum(briefing.listaNominal)} · participación {fmtPct(briefing.participacion)} · afinidad {briefing.afinidadPAN}/100 · swing {briefing.swing > 0 ? '+' : ''}{briefing.swing} pts</p></div>
              <div><p className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">Temas relevantes</p><p className="text-slate-700 dark:text-slate-200">{briefing.temas.join(' · ')} · inseguridad {briefing.inseguridad}/100</p></div>
              <div><p className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">Mensajes sugeridos</p><p className="text-slate-700 dark:text-slate-200">1. Compromiso de rondines y alumbrado. 2. Agua: pipas + presión. 3. Empleo joven y microcréditos.</p></div>
              <div><p className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">Checklist visita</p><p className="text-slate-700 dark:text-slate-200">Reunión con {briefing.responsable} · última visita {fmtFecha(briefing.ultimaVisita)} · llevar ficha impresa · registrar compromisos.</p></div>
            </div>
            <div className="no-print mt-5 flex flex-wrap justify-end gap-2">
              <GhostButton onClick={() => window.print()}>Imprimir</GhostButton>
              <PrimaryButton onClick={() => { setBriefingId(null); irABriefing(briefing.id) }}>Abrir en Centro de control</PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
