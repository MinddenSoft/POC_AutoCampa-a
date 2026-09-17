import { FLUJOS } from '../lib/data'
import { fmtNum, fmtPct } from '../lib/format'
import { useCampaignStore } from '../store/useCampaignStore'
import { Card, PageHeader, Badge, Progress, PrimaryButton } from '../components/ui'

export function Automatizacion() {
  const flujoExtra = useCampaignStore((s) => s.flujoExtra)
  const flujoActivo = useCampaignStore((s) => s.flujoActivo)
  const simularEnvio = useCampaignStore((s) => s.simularEnvio)
  const toggleFlujo = useCampaignStore((s) => s.toggleFlujo)

  return (
    <div>
      <PageHeader titulo="Automatización y seguimiento" subtitulo="Flujos sobre WhatsApp, call center y formularios · contenido aprobado" />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {FLUJOS.map((f) => {
          const extra = flujoExtra[f.id] ?? 0
          const enviados = f.enviados + extra
          const activo = flujoActivo[f.id] ?? f.activo
          const conv = (f.respondidos / Math.max(1, enviados)) * 100
          return (
            <Card key={f.id} className={activo ? '' : 'opacity-80'}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{f.nombre}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{f.trigger} · {f.canal}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tono={activo ? 'pos' : 'neu'}>{activo ? 'Activo' : 'Pausado'}</Badge>
                  <button onClick={() => toggleFlujo(f.id, f.activo)} aria-label={`Activar ${f.nombre}`} className={`relative h-6 w-11 rounded-full transition-colors ${activo ? 'bg-brand-500' : 'bg-slate-900/10 dark:bg-white/10'}`}>
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${activo ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-slate-900/5 dark:bg-white/5 p-3"><p className="tabular text-lg font-semibold">{fmtNum(enviados)}</p><p className="text-[11px] text-slate-500">Enviados</p></div>
                <div className="rounded-xl bg-slate-900/5 dark:bg-white/5 p-3"><p className="tabular text-lg font-semibold">{fmtNum(f.leidos + extra * 0.8)}</p><p className="text-[11px] text-slate-500">Leídos</p></div>
                <div className="rounded-xl bg-slate-900/5 dark:bg-white/5 p-3"><p className="tabular text-lg font-semibold">{fmtNum(f.respondidos + extra * 0.3)}</p><p className="text-[11px] text-slate-500">Respuestas</p></div>
              </div>
              <div className="mt-3"><Progress valor={f.respondidos + extra * 0.3} max={enviados} /><p className="tabular mt-1 text-right text-xs text-slate-500">Conversión {fmtPct(conv)}</p></div>
              <div className="mt-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-ink-950/60 p-3">
                <p className="text-[11px] uppercase tracking-wider text-slate-500">Mensaje aprobado (solo lectura)</p>
                <p className="mt-1 text-sm text-slate-800 dark:text-slate-200">{f.mensaje}</p>
              </div>
              <ol className="mt-3 space-y-1.5">
                {f.pasos.map((p, i) => (
                  <li key={p} className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                    <span className="tabular flex h-6 w-6 items-center justify-center rounded-full bg-brand-500/15 text-xs font-semibold text-brand-400">{i + 1}</span>{p}
                  </li>
                ))}
              </ol>
              <div className="mt-4 flex justify-end"><PrimaryButton onClick={() => simularEnvio(f.id)}>Lanzar envío +120</PrimaryButton></div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
