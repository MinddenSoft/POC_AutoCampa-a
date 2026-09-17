import { useEffect, useMemo, useRef, useState } from 'react'
import { Send, Sparkles, Bot, User, Copy, Check } from 'lucide-react'
import { MUNICIPIOS, SECCIONES, INTERACCIONES, CONTACTOS, OBJETIVO_VOTOS, PROYECCION_VOTOS, MUNICIPIO_NOMBRE } from '../lib/data'
import { fmtNum, fmtPct, fmtFecha } from '../lib/format'
import { answerQuery, suggestQueries, type NlpAnswer } from '../lib/nlp-mock'
import { useCampaignStore } from '../store/useCampaignStore'
import { Card, PageHeader, Badge, KPI, PrimaryButton, GhostButton, Progress, cn } from '../components/ui'

interface Mensaje {
  id: number
  rol: 'user' | 'ia'
  texto: string
  respuesta?: NlpAnswer
  visible?: number
  fase?: number
}

const FASES = ['Conectando base territorial…', 'Cruzando escucha digital y CRM…', 'Redactando recomendación…']
let msgId = 1

function BurbujaIA(props: { m: Mensaje; onSeguir: (q: string) => void }) {
  const { m, onSeguir } = props
  const [copiado, setCopiado] = useState(false)
  if (m.fase !== undefined && !m.respuesta) {
    return (
      <div className="rounded-2xl rounded-tl-md border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-ink-950/60">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 animate-pulse text-brand-500" />
          <p className="text-sm text-slate-500 dark:text-slate-400">{FASES[Math.min(m.fase, FASES.length - 1)]}</p>
        </div>
        <div className="mt-3 flex gap-1.5">
          {[0, 1, 2].map((i) => <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-brand-500" style={{ animationDelay: `${i * 150}ms` }} />)}
        </div>
      </div>
    )
  }
  const r = m.respuesta!
  const resumen = r.resumen.slice(0, m.visible ?? r.resumen.length)
  const completo = (m.visible ?? r.resumen.length) >= r.resumen.length
  function copiar() {
    const txt = `${r.titulo}\n${r.resumen}\n\n${r.analisis.map((a) => '• ' + a).join('\n')}\n\nRecomendación: ${r.recomendacion}`
    try {
      void navigator.clipboard.writeText(txt)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      /* noop */
    }
  }
  return (
    <div className="rounded-2xl rounded-tl-md border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-ink-950/60">
      <div className="flex items-start justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100"><Bot className="h-4 w-4 text-brand-500" />{r.titulo}</p>
        <button onClick={copiar} aria-label="Copiar análisis" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-900/5 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-slate-200">
          {copiado ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">{resumen}{!completo && <span className="animate-pulse text-brand-500">▍</span>}</p>
      {completo && (
        <div className="animate-in fade-in mt-3 space-y-3">
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
            {r.hallazgos.map((h, i) => (
              <div key={h.dato} className={cn('flex items-center justify-between gap-3 px-3 py-2 text-xs', i % 2 === 0 && 'bg-white dark:bg-white/[0.03]')}>
                <span className="font-medium text-slate-700 dark:text-slate-200">{h.dato}</span>
                <span className="tabular text-right text-slate-500 dark:text-slate-400">{h.valor}</span>
              </div>
            ))}
          </div>
          <ul className="space-y-1.5">
            {r.analisis.map((a) => <li key={a} className="text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">▸ {a}</li>)}
          </ul>
          <div className="rounded-xl border border-brand-500/30 bg-brand-500/5 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">Recomendación operativa</p>
            <p className="mt-1 text-[13px] text-slate-700 dark:text-slate-200">{r.recomendacion}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {r.seguimientos.map((s) => (
              <button key={s} onClick={() => onSeguir(s)} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-600 hover:border-brand-500/50 hover:text-brand-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:text-brand-400">{s}</button>
            ))}
          </div>
          <p className="tabular text-[10px] text-slate-400 dark:text-slate-600">Fuentes: {r.fuentes.join(' · ')} · confianza {fmtPct(r.confianza * 100, 0)} · {(r.tiempoMs / 1000).toFixed(1)}s</p>
        </div>
      )}
    </div>
  )
}

export function Control() {
  const seccionId = useCampaignStore((s) => s.seccionId)
  const seleccionarSeccion = useCampaignStore((s) => s.seleccionarSeccion)
  const pushToast = useCampaignStore((s) => s.pushToast)
  const [pregunta, setPregunta] = useState('')
  const [mensajes, setMensajes] = useState<Mensaje[]>(() => {
    const r = answerQuery('¿Qué municipios priorizar esta semana?')
    return [
      { id: msgId++, rol: 'user', texto: '¿Qué municipios priorizar esta semana?' },
      { id: msgId++, rol: 'ia', texto: '', respuesta: r, visible: r.resumen.length },
    ]
  })
  const timers = useRef<number[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), [])
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [mensajes])

  function preguntar(q: string) {
    const qq = q.trim()
    if (!qq) return
    const idUser = msgId++
    const idIa = msgId++
    const respuesta = answerQuery(qq)
    setMensajes((m) => [...m, { id: idUser, rol: 'user', texto: qq }, { id: idIa, rol: 'ia', texto: '', respuesta, visible: 0, fase: 0 }])
    setPregunta('')
    FASES.forEach((_, i) => {
      timers.current.push(window.setTimeout(() => {
        setMensajes((m) => m.map((x) => (x.id === idIa ? { ...x, fase: i + 1 } : x)))
      }, 450 * (i + 1)))
    })
    timers.current.push(window.setTimeout(() => {
      const total = respuesta.resumen.length
      const t0 = Date.now()
      const tick = window.setInterval(() => {
        const p = Math.min(1, (Date.now() - t0) / 1400)
        const n = Math.floor(total * (p < 1 ? 0.15 + 0.85 * p : 1))
        setMensajes((m) => m.map((x) => (x.id === idIa ? { ...x, visible: n, fase: undefined } : x)))
        if (p >= 1) window.clearInterval(tick)
      }, 40)
    }, 450 * FASES.length + 150))
  }

  const alertas = useMemo(() => [...SECCIONES].sort((a, b) => b.inseguridad - a.inseguridad).slice(0, 4), [])
  const ranking = useMemo(() => [...MUNICIPIOS].sort((a, b) => a.afinidadPAN - b.afinidadPAN).slice(0, 5), [])
  const ficha = SECCIONES.find((s) => s.id === seccionId) ?? alertas[0]
  const esSugerido = ficha.id !== seccionId
  const avance = (PROYECCION_VOTOS / OBJETIVO_VOTOS) * 100

  return (
    <div>
      <PageHeader
        titulo="Centro de control de campaña"
        subtitulo="Estado, distrito, municipio y sección · informes y analista IA"
        accion={<><GhostButton onClick={() => window.print()}>Imprimir informe</GhostButton><PrimaryButton onClick={() => pushToast('Informe diario', 'PDF generado con KPIs del día')}>Informe diario</PrimaryButton></>}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KPI label="Proyección vs objetivo" valor={fmtNum(PROYECCION_VOTOS)} delta={`${fmtPct(avance)} de ${fmtNum(OBJETIVO_VOTOS)}`} up={false} spark={[60, 62, 61, 64, 63, 66, 65]} acento />
        <KPI label="Cobertura territorial" valor="43 / 43" delta="10 municipios monitoreados" up spark={[7, 8, 9, 9, 10, 10, 10]} />
        <KPI label="Contactos activos" valor={fmtNum(CONTACTOS.length)} delta="+18 esta semana" up spark={[10, 14, 18, 22, 30, 36, 42]} />
        <KPI label="Interacciones 30d" valor={fmtNum(INTERACCIONES.length)} delta="42% negativas" up={false} spark={[20, 30, 28, 40, 38, 50, 46]} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <p className="mb-1 text-sm font-semibold text-slate-900 dark:text-slate-100">Avance hacia objetivo electoral 725k</p>
          <Progress valor={PROYECCION_VOTOS} max={OBJETIVO_VOTOS} />
          <div className="tabular mt-1 flex justify-between text-xs text-slate-500"><span>{fmtNum(PROYECCION_VOTOS)} proyectados</span><span>Faltan {fmtNum(OBJETIVO_VOTOS - PROYECCION_VOTOS)}</span></div>
          <p className="mb-2 mt-5 text-sm font-semibold text-slate-900 dark:text-slate-100">Ranking prioridad municipal</p>
          <div className="space-y-2">
            {ranking.map((m, i) => (
              <div key={m.id} className="flex items-center gap-3 rounded-xl bg-slate-900/[0.03] px-3 py-2.5 text-sm dark:bg-white/[0.03]">
                <span className="tabular w-6 font-bold text-slate-400 dark:text-slate-500">{i + 1}</span>
                <span className="flex-1 font-medium text-slate-900 dark:text-slate-100">{m.nombre}</span>
                <Badge tono={m.prioridad}>{m.prioridad}</Badge>
                <span className="tabular w-24 text-right text-xs text-slate-500 dark:text-slate-400">afin {m.afinidadPAN} · LN {fmtNum(m.listaNominal)}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <p className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Alertas territoriales</p>
          <div className="space-y-2.5">
            {alertas.map((s) => (
              <button key={s.id} onClick={() => seleccionarSeccion(s.id)} className="w-full rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-left hover:bg-rose-500/10">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Sec. {s.id} · {MUNICIPIO_NOMBRE[s.municipioId]}</p>
                <p className="tabular mt-0.5 text-xs text-rose-600 dark:text-rose-300">Inseguridad {s.inseguridad}/100 · {s.temas.join(', ')}</p>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
            <Sparkles className="h-4 w-4 text-brand-500" /> Analista IA de campaña
            <span className="rounded-full bg-brand-500/10 px-2 py-0.5 text-[10px] font-medium text-brand-600 dark:text-brand-400">IA activa</span>
          </p>
          <div ref={scrollRef} className="mt-3 max-h-[460px] space-y-3 overflow-y-auto pr-1">
            {mensajes.map((m) =>
              m.rol === 'user' ? (
                <div key={m.id} className="ml-10 flex items-start justify-end gap-2">
                  <p className="rounded-2xl rounded-tr-md bg-brand-500 px-3.5 py-2.5 text-sm text-white">{m.texto}</p>
                  <User className="mt-2 h-4 w-4 shrink-0 text-slate-400" />
                </div>
              ) : (
                <div key={m.id} className="mr-6"><BurbujaIA m={m} onSeguir={preguntar} /></div>
              ),
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {suggestQueries().slice(0, 4).map((q) => <button key={q} onClick={() => preguntar(q)} className="rounded-full bg-slate-900/5 px-2.5 py-1 text-[11px] text-slate-500 hover:bg-slate-900/10 hover:text-slate-800 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-100">{q}</button>)}
          </div>
          <div className="mt-2 flex gap-2">
            <input value={pregunta} onChange={(e) => setPregunta(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && preguntar(pregunta)} placeholder="Pregunta como a un analista real…" className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-brand-500/60 dark:border-white/10 dark:bg-ink-800 dark:text-slate-100 dark:placeholder:text-slate-500" />
            <PrimaryButton onClick={() => preguntar(pregunta)}><span className="inline-flex items-center gap-2"><Send className="h-4 w-4" /> Enviar</span></PrimaryButton>
          </div>
        </Card>

        <Card className="print-white">
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
            Briefing para candidato · Sec. {ficha.id}
            {esSugerido && <span className="rounded-full bg-brand-500/10 px-2 py-0.5 text-[10px] font-medium text-brand-600 dark:text-brand-400">sugerido</span>}
          </p>
          {esSugerido && <p className="mt-1 text-[11px] text-slate-500">Sección crítica preseleccionada (mayor índice de inseguridad). Elige otra en Territorio o desde una alerta para cambiarlo.</p>
          }
          <div className="mt-3 space-y-3 text-sm">
              <div><p className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">Situación</p><p className="text-slate-700 dark:text-slate-200">{MUNICIPIO_NOMBRE[ficha.municipioId]} Sec. {ficha.id} · LN {fmtNum(ficha.listaNominal)} · participación {fmtPct(ficha.participacion)} · afinidad {ficha.afinidadPAN}/100</p></div>
              <div><p className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">Temas relevantes</p><p className="text-slate-700 dark:text-slate-200">{ficha.temas.join(' · ')} · inseguridad {ficha.inseguridad}/100</p></div>
              <div><p className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">Mensajes sugeridos</p><p className="text-slate-700 dark:text-slate-200">1. Compromiso de rondines y alumbrado. 2. Agua: pipas + presión. 3. Empleo joven y microcréditos.</p></div>
              <div><p className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">Checklist visita</p><p className="text-slate-700 dark:text-slate-200">Reunión con {ficha.responsable} · última visita {fmtFecha(ficha.ultimaVisita)} · llevar ficha impresa · registrar compromisos.</p></div>
          </div>
        </Card>
      </div>
    </div>
  )
}
