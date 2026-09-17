import { useMemo, useState } from 'react'
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, BarChart } from 'recharts'
import { INTERACCIONES, MUNICIPIO_NOMBRE, type Canal, type Tema, type Sentimiento } from '../lib/data'
import { fmtNum, timeAgo } from '../lib/format'
import { useCampaignStore } from '../store/useCampaignStore'
import { Card, PageHeader, Badge, EmptyState, KPI } from '../components/ui'
import { ChartTooltip } from '../components/map'

const CANALES: Canal[] = ['Facebook', 'Instagram', 'TikTok', 'WhatsApp', 'Web', 'CallCenter']
const TEMAS: Tema[] = ['Seguridad', 'Agua', 'Empleo', 'Salud', 'Corrupción', 'Infraestructura']

export function Escucha() {
  const municipioId = useCampaignStore((s) => s.municipioId)
  const pushToast = useCampaignStore((s) => s.pushToast)
  const [canal, setCanal] = useState<Canal | ''>('')
  const [tema, setTema] = useState<Tema | ''>('')
  const [sent, setSent] = useState<Sentimiento | ''>('')

  const items = useMemo(() => {
    return INTERACCIONES.filter((i) => {
      if (municipioId && i.municipioId !== municipioId) return false
      if (canal && i.canal !== canal) return false
      if (tema && i.tema !== tema) return false
      if (sent && i.sentimiento !== sent) return false
      return true
    }).sort((a, b) => +new Date(b.fecha) - +new Date(a.fecha)).slice(0, 80)
  }, [municipioId, canal, tema, sent])

  const neg = INTERACCIONES.filter((i) => i.sentimiento === 'neg').length
  const alertas = INTERACCIONES.filter((i) => i.requiereHumano).length

  const serie = useMemo(() => {
    const days = Array.from({ length: 14 }, (_, k) => {
      const d = new Date(Date.now() - (13 - k) * 86400000)
      const key = d.toISOString().slice(0, 10)
      const vol = INTERACCIONES.filter((i) => i.fecha.slice(0, 10) === key).length * 3 + 28 + k
      return { d: `${d.getDate()}/${d.getMonth() + 1}`, vol }
    })
    return days
  }, [])

  const porTema = TEMAS.map((t) => ({ t, n: INTERACCIONES.filter((i) => i.tema === t).length }))

  return (
    <div>
      <PageHeader titulo="Escucha y organización digital" subtitulo="Clasificación automática por tema, territorio, canal y fecha" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KPI label="Volumen 30d" valor={fmtNum(INTERACCIONES.length * 14)} delta="+12.4% vs previo" up spark={[20, 28, 26, 34, 40, 38, 52]} />
        <KPI label="Sentimiento negativo" valor={fmtNum(neg)} delta="42% del total" up={false} spark={[30, 32, 38, 35, 42, 44, 41]} />
        <KPI label="Requieren humano" valor={fmtNum(alertas)} delta="Derivar a operador" up={false} spark={[4, 6, 5, 9, 8, 12, 10]} />
        <KPI label="Canales activos" valor="7" delta="FB + WA dominan" up spark={[5, 6, 6, 7, 7, 7, 7]} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <p className="mb-2 text-sm font-semibold">Volumen e intensidad</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={serie}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="d" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="vol" name="Interacciones" stroke="#2E7CF6" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <p className="mb-2 text-sm font-semibold">Temas recurrentes</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={porTema} layout="vertical" margin={{ left: 90 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="t" tickLine={false} axisLine={false} width={85} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="n" name="Menciones" fill="#2E7CF6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <div className="mb-3 flex flex-wrap gap-2">
          <select value={canal} onChange={(e) => setCanal(e.target.value as Canal | '')} className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-ink-800 px-3 py-2 text-sm" aria-label="Filtro canal">
            <option value="">Todos los canales</option>{CANALES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={tema} onChange={(e) => setTema(e.target.value as Tema | '')} className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-ink-800 px-3 py-2 text-sm" aria-label="Filtro tema">
            <option value="">Todos los temas</option>{TEMAS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={sent} onChange={(e) => setSent(e.target.value as Sentimiento | '')} className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-ink-800 px-3 py-2 text-sm" aria-label="Filtro sentimiento">
            <option value="">Todo sentimiento</option><option value="neg">Negativo</option><option value="neu">Neutro</option><option value="pos">Positivo</option>
          </select>
          {(canal || tema || sent) && <button onClick={() => { setCanal(''); setTema(''); setSent('') }} className="text-xs text-slate-500 dark:text-slate-400 hover:text-white">Limpiar ×</button>}
          <span className="tabular ml-auto text-xs text-slate-500">{items.length} resultados</span>
        </div>
        {items.length === 0 ? <EmptyState titulo="Sin interacciones" detalle="Prueba con filtros más amplios." /> : (
          <div className="divide-y divide-slate-200 dark:divide-white/5">
            {items.map((i) => (
              <div key={i.id} className="flex flex-wrap items-start gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-900 dark:text-slate-100">{i.texto}</p>
                  <p className="tabular mt-1 text-[11px] text-slate-500">{i.canal} · {MUNICIPIO_NOMBRE[i.municipioId]} · Sec. {i.seccionId} · {timeAgo(i.fecha)}</p>
                </div>
                <Badge tono="default">{i.tema}</Badge>
                <Badge tono={i.sentimiento}>{i.sentimiento === 'neg' ? 'Negativo' : i.sentimiento === 'pos' ? 'Positivo' : 'Neutro'}</Badge>
                {i.requiereHumano && <button onClick={() => pushToast('Derivado a humano', i.id + ' asignado a operador')} className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-xs text-amber-300 hover:bg-amber-500/20">Requiere humano</button>}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
