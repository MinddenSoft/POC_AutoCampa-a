import { useMemo, useState } from 'react'
import { CONTACTOS, MUNICIPIOS, MUNICIPIO_NOMBRE } from '../lib/data'
import { fmtNum } from '../lib/format'
import { useCampaignStore } from '../store/useCampaignStore'
import { Card, PageHeader, Badge, PrimaryButton, GhostButton, FieldSelect } from '../components/ui'

interface Segmento {
  id: string
  nombre: string
  regla: string
  count: number
}

function contar(f: (c: (typeof CONTACTOS)[number]) => boolean): number {
  return CONTACTOS.filter(f).length
}

const BASE: Segmento[] = [
  { id: 's1', nombre: 'Jóvenes indecisos zona prioritaria', regla: 'Etiqueta Joven o Indeciso · cualquier municipio', count: contar((c) => c.etiquetas.includes('Joven') || c.etiquetas.includes('Indeciso')) },
  { id: 's2', nombre: 'Mujeres líderes', regla: 'Etiqueta Mujer líder', count: contar((c) => c.etiquetas.includes('Mujer líder')) },
  { id: 's3', nombre: 'Requieren visita', regla: 'Etiqueta Requiere visita', count: contar((c) => c.etiquetas.includes('Requiere visita')) },
  { id: 's4', nombre: 'Promotores activos', regla: 'Estado promotor', count: contar((c) => c.estado === 'promotor') },
  { id: 's5', nombre: 'Nuevos sin contactar', regla: 'Estado nuevo', count: contar((c) => c.estado === 'nuevo') },
  { id: 's6', nombre: 'Base Reynosa', regla: 'Municipio Reynosa', count: contar((c) => c.municipioId === 'reynosa') },
]

export function Audiencias() {
  const pushToast = useCampaignStore((s) => s.pushToast)
  const setModulo = useCampaignStore((s) => s.setModulo)
  const [tipo, setTipo] = useState('')
  const [estado, setEstado] = useState('')
  const [mun, setMun] = useState('')
  const [custom, setCustom] = useState<Segmento[]>([])

  const preview = useMemo(() => contar((c) => {
    if (tipo && c.tipo !== tipo) return false
    if (estado && c.estado !== estado) return false
    if (mun && c.municipioId !== mun) return false
    return true
  }), [tipo, estado, mun])

  function guardar() {
    const nombre = [tipo || 'Todos', estado || 'todos', mun ? MUNICIPIO_NOMBRE[mun] : 'estado'].join(' · ')
    setCustom((c) => [{ id: `c-${Date.now()}`, nombre, regla: 'Segmento personalizado', count: preview }, ...c])
    pushToast('Audiencia guardada', `${nombre}: ${fmtNum(preview)} contactos`)
  }

  return (
    <div>
      <PageHeader titulo="Audiencias y segmentos" subtitulo="Construye públicos accionables sobre el CRM sin SQL" accion={<PrimaryButton onClick={guardar}>Guardar audiencia ({fmtNum(preview)})</PrimaryButton>} />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Constructor</p>
          <div className="mt-3 space-y-3">
            <FieldSelect valor={tipo} onChange={setTipo} label="Tipo de contacto">
              <option value="">Todos los tipos</option><option value="militante">Militante</option><option value="simpatizante">Simpatizante</option><option value="voluntario">Voluntario</option><option value="lider">Líder</option>
            </FieldSelect>
            <FieldSelect valor={estado} onChange={setEstado} label="Estado">
              <option value="">Todos los estados</option><option value="nuevo">Nuevo</option><option value="contactado">Contactado</option><option value="comprometido">Comprometido</option><option value="promotor">Promotor</option>
            </FieldSelect>
            <FieldSelect valor={mun} onChange={setMun} label="Municipio">
              <option value="">Todo el estado</option>{MUNICIPIOS.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </FieldSelect>
            <div className="rounded-xl bg-brand-500/10 p-4 text-center">
              <p className="tabular text-3xl font-semibold text-slate-900 dark:text-white">{fmtNum(preview)}</p>
              <p className="text-xs text-slate-500">contactos coinciden</p>
            </div>
            <GhostButton onClick={() => { setTipo(''); setEstado(''); setMun('') }}>Limpiar</GhostButton>
          </div>
        </Card>
        <div className="space-y-3 xl:col-span-2">
          {[...custom, ...BASE].map((s) => (
            <Card key={s.id} className="flex items-center gap-4">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-slate-900 dark:text-slate-100">{s.nombre}</p>
                <p className="text-xs text-slate-500">{s.regla}</p>
              </div>
              <Badge tono="default">{fmtNum(s.count)}</Badge>
              <GhostButton onClick={() => { setModulo('crm'); pushToast('Audiencia aplicada', s.nombre) }}>Ver en CRM</GhostButton>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
