import { useMemo, useState } from 'react'
import { X, Upload } from 'lucide-react'
import { CONTACTOS, INTERACCIONES, MUNICIPIO_NOMBRE, type Contacto, type EstadoContacto } from '../lib/data'
import { fmtNum, timeAgo } from '../lib/format'
import { useCampaignStore } from '../store/useCampaignStore'
import { Card, PageHeader, Badge, PrimaryButton, GhostButton, FieldSelect, DataTable, type Columna } from '../components/ui'

const ESTADOS: EstadoContacto[] = ['nuevo', 'contactado', 'comprometido', 'promotor']

export function Crm() {
  const municipioId = useCampaignStore((s) => s.municipioId)
  const busquedaGlobal = useCampaignStore((s) => s.busqueda)
  const contactoEstado = useCampaignStore((s) => s.contactoEstado)
  const cambiarEstadoContacto = useCampaignStore((s) => s.cambiarEstadoContacto)
  const pushToast = useCampaignStore((s) => s.pushToast)
  const [filtroEstado, setFiltroEstado] = useState<string>('')
  const [detalleId, setDetalleId] = useState<string | null>(null)
  const [showImport, setShowImport] = useState(false)

  const lista = useMemo(() => {
    return CONTACTOS.filter((c) => {
      if (municipioId && c.municipioId !== municipioId) return false
      if (filtroEstado && (contactoEstado[c.id] ?? c.estado) !== filtroEstado) return false
      return true
    })
  }, [municipioId, filtroEstado, contactoEstado])

  const columnas: Columna<Contacto>[] = [
    {
      clave: 'nombre', titulo: 'Contacto', ordenar: (a, b) => a.nombre.localeCompare(b.nombre),
      render: (c) => <><p className="font-medium text-slate-900 dark:text-slate-100">{c.nombre}</p><p className="tabular text-[11px] text-slate-500">{c.id} · {c.telefono}</p></>,
    },
    { clave: 'tipo', titulo: 'Tipo', render: (c) => <Badge tono="default">{c.tipo}</Badge> },
    {
      clave: 'terr', titulo: 'Territorio',
      render: (c) => <span className="text-xs text-slate-600 dark:text-slate-300">{MUNICIPIO_NOMBRE[c.municipioId]} · {c.seccionId}</span>,
    },
    { clave: 'origen', titulo: 'Origen', render: (c) => <span className="text-xs text-slate-500 dark:text-slate-400">{c.origen}</span> },
    {
      clave: 'estado', titulo: 'Estado', ordenar: (a, b) => (contactoEstado[a.id] ?? a.estado).localeCompare(contactoEstado[b.id] ?? b.estado),
      render: (c) => {
        const est = contactoEstado[c.id] ?? c.estado
        return <Badge tono={est === 'promotor' ? 'pos' : est === 'nuevo' ? 'neg' : 'default'}>{est}</Badge>
      },
    },
    {
      clave: 'act', titulo: 'Actividad', ordenar: (a, b) => +new Date(a.ultimaActividad) - +new Date(b.ultimaActividad),
      render: (c) => <span className="tabular text-xs text-slate-500 dark:text-slate-400">{timeAgo(c.ultimaActividad)}</span>,
    },
  ]

  const detalle = CONTACTOS.find((c) => c.id === detalleId)
  const hist = useMemo(() => INTERACCIONES.filter((i) => i.contactoId === detalleId).slice(0, 8), [detalleId])

  return (
    <div>
      <PageHeader
        titulo="CRM de campaña"
        subtitulo="Base única de militantes, simpatizantes y contactos autorizados"
        accion={<PrimaryButton onClick={() => setShowImport(true)}><span className="inline-flex items-center gap-2"><Upload className="h-4 w-4" /> Importar base</span></PrimaryButton>}
      />
      <Card>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <FieldSelect valor={filtroEstado} onChange={setFiltroEstado} label="Filtro estado">
            <option value="">Todos los estados</option>{ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
          </FieldSelect>
          <span className="tabular ml-auto text-xs text-slate-500">{fmtNum(lista.length)} contactos · padrón real 9,786</span>
        </div>
        <DataTable<Contacto>
          datos={lista}
          columnas={columnas}
          claveFila={(c) => c.id}
          textoBuscar={(c) => `${c.nombre} ${c.id} ${c.telefono} ${c.origen} ${c.etiquetas.join(' ')} ${MUNICIPIO_NOMBRE[c.municipioId]}`}
          busquedaExterna={busquedaGlobal}
          placeholder="Buscar por nombre, ID, teléfono…"
          onFila={(c) => setDetalleId(c.id)}
          filaResaltada={(c) => c.id === detalleId}
        />
      </Card>

      {detalle && (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/60" onClick={() => setDetalleId(null)}>
          <div onClick={(e) => e.stopPropagation()} className="animate-in slide-in-from-right-4 fade-in w-full max-w-[420px] overflow-y-auto border-l border-slate-200 dark:border-white/10 bg-white dark:bg-ink-900 p-6 duration-200">
            <div className="flex items-start justify-between">
              <div><p className="text-xs uppercase text-slate-500">{detalle.id}</p><h2 className="text-xl font-semibold">{detalle.nombre}</h2></div>
              <button onClick={() => setDetalleId(null)} aria-label="Cerrar" className="rounded-lg bg-slate-900/5 dark:bg-white/5 p-2 hover:bg-slate-900/10 dark:hover:bg-white/10"><X className="h-4 w-4" /></button>
            </div>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{MUNICIPIO_NOMBRE[detalle.municipioId]} · Sec. {detalle.seccionId} · {detalle.origen}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">{detalle.etiquetas.map((t) => <Badge key={t} tono="default">{t}</Badge>)}</div>
            <p className="mb-2 mt-5 text-sm font-semibold">Cambiar estado</p>
            <div className="flex flex-wrap gap-2">
              {ESTADOS.map((e) => (
                <button key={e} onClick={() => cambiarEstadoContacto(detalle.id, e)} className={`rounded-full border px-3 py-1.5 text-xs font-medium ${(contactoEstado[detalle.id] ?? detalle.estado) === e ? 'border-brand-500/60 bg-brand-500/15 text-white' : 'border-slate-200 dark:border-white/10 bg-slate-900/5 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-900/10 dark:hover:bg-white/10'}`}>{e}</button>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <GhostButton onClick={() => pushToast('WhatsApp', 'Plantilla aprobada lista para enviar')}>Enviar WhatsApp</GhostButton>
              <GhostButton onClick={() => pushToast('Asignado', detalle.nombre + ' → promotor zona')}>Asignar</GhostButton>
            </div>
            <p className="mb-2 mt-5 text-sm font-semibold">Historial ({hist.length || detalle.interacciones})</p>
            <div className="space-y-2">
              {hist.length === 0 ? <p className="text-sm text-slate-500">Sin interacciones vinculadas. {detalle.interacciones} eventos agregados.</p> :
                hist.map((h) => <div key={h.id} className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-ink-800 p-3 text-sm"><p className="text-slate-800 dark:text-slate-200">{h.texto}</p><p className="tabular mt-1 text-[11px] text-slate-500">{h.canal} · {h.tema} · {timeAgo(h.fecha)}</p></div>)}
            </div>
          </div>
        </div>
      )}

      {showImport && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowImport(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-ink-900 p-6">
            <h3 className="text-lg font-semibold">Importar base</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Mapeo padrón 9,786 → CRM. En producción: validación jurídica + normalización.</p>
            <div className="mt-4 space-y-2 text-sm">
              {['nombre → nombre_completo', 'teléfono → telefono_e164', 'sección → seccion_id', 'origen → fuente'].map((m) => <div key={m} className="tabular rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-ink-800 px-3 py-2 text-slate-600 dark:text-slate-300">{m}</div>)}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <GhostButton onClick={() => setShowImport(false)}>Cancelar</GhostButton>
              <PrimaryButton onClick={() => { setShowImport(false); pushToast('Importación completada', '2,400 filas normalizadas sin errores') }}>Validar y importar</PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
