import { useMemo, useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { FLUJOS } from '../lib/data'
import { useCampaignStore } from '../store/useCampaignStore'
import { Card, PageHeader, Badge, SearchInput, FieldSelect } from '../components/ui'

interface Pieza {
  id: string
  titulo: string
  canal: string
  formato: string
  estado: 'Aprobado' | 'En revisión'
  texto: string
}

const PIEZAS: Pieza[] = [
  ...FLUJOS.map((f) => ({ id: f.id, titulo: f.nombre, canal: f.canal, formato: 'Plantilla', estado: 'Aprobado' as const, texto: f.mensaje })),
  { id: 'spot', titulo: 'Spot 30s — Agua y seguridad', canal: 'TikTok', formato: 'Video', estado: 'Aprobado', texto: 'Guion: vecina abre llave sin agua (0-8s) → candidato compromete pipas y fecha (8-22s) → cierre con propuesta verificable (22-30s).' },
  { id: 'volante', titulo: 'Volante seccional', canal: 'Territorio', formato: 'Impreso', estado: 'Aprobado', texto: 'Frente: 3 compromisos con fecha. Reverso: mapa de casilla + teléfono del promotor de sección.' },
  { id: 'post', titulo: 'Post Facebook — Brigada', canal: 'Facebook', formato: 'Post', estado: 'En revisión', texto: 'Este sábado brigada médica y de alumbrado en {municipio}. Registra a tu familia por WhatsApp. Cupo por sección.' },
  { id: 'guion', titulo: 'Guion call center rescate', canal: 'Call center', formato: 'Guion', estado: 'Aprobado', texto: 'Apertura empática 30s → escucha del tema → propuesta concreta → cierre con compromiso de voto y fecha de visita.' },
]

export function Contenidos() {
  const pushToast = useCampaignStore((s) => s.pushToast)
  const [q, setQ] = useState('')
  const [canal, setCanal] = useState('')
  const [copiada, setCopiada] = useState<string | null>(null)

  const lista = useMemo(() => PIEZAS.filter((p) => {
    if (canal && !p.canal.includes(canal)) return false
    if (q && !(p.titulo + p.texto).toLowerCase().includes(q.toLowerCase())) return false
    return true
  }), [q, canal])

  function copiar(p: Pieza) {
    try {
      void navigator.clipboard.writeText(p.texto)
      setCopiada(p.id)
      setTimeout(() => setCopiada(null), 1800)
    } catch {
      pushToast('Copiado al portapapeles', p.titulo)
    }
  }

  return (
    <div>
      <PageHeader titulo="Biblioteca de contenidos" subtitulo="Solo piezas aprobadas por estrategia · trazabilidad total" />
      <Card>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="w-64"><SearchInput valor={q} onChange={setQ} placeholder="Buscar piezas…" /></div>
          <FieldSelect valor={canal} onChange={setCanal} label="Filtro canal">
            <option value="">Todos los canales</option><option value="WhatsApp">WhatsApp</option><option value="Facebook">Facebook</option><option value="TikTok">TikTok</option><option value="Call">Call center</option><option value="Territorio">Territorio</option>
          </FieldSelect>
          <span className="tabular ml-auto text-xs text-slate-500">{lista.length} piezas</span>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {lista.map((p) => (
            <div key={p.id} className="rounded-2xl border border-slate-200 p-4 dark:border-white/10 dark:bg-ink-950/40">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-slate-900 dark:text-slate-100">{p.titulo}</p>
                <Badge tono={p.estado === 'Aprobado' ? 'pos' : 'Media'}>{p.estado}</Badge>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">{p.canal} · {p.formato}</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{p.texto}</p>
              <div className="mt-3 flex justify-end gap-2">
                <button onClick={() => copiar(p)} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-900/5 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10">
                  {copiada === p.id ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />} {copiada === p.id ? 'Copiado' : 'Copiar'}
                </button>
                <button onClick={() => pushToast('Pieza asignada', p.titulo + ' → flujo activo')} className="rounded-xl bg-brand-500/10 px-3 py-1.5 text-xs font-semibold text-brand-600 hover:bg-brand-500/20 dark:text-brand-400">Usar en flujo</button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
