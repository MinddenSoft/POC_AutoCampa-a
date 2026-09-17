import { useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet'
import { MUNICIPIOS } from '../lib/data'
import { useCampaignStore } from '../store/useCampaignStore'
import { fmtNum } from '../lib/format'

function colorPorAfinidad(a: number): string {
  if (a >= 55) return '#10B981'
  if (a >= 45) return '#A3E635'
  if (a >= 38) return '#F59E0B'
  if (a >= 30) return '#F97316'
  return '#F43F5E'
}

function VolarASeleccion() {
  const municipioId = useCampaignStore((s) => s.municipioId)
  const map = useMap()
  useEffect(() => {
    const m = MUNICIPIOS.find((x) => x.id === municipioId)
    if (m) map.flyTo([m.lat, m.lng], 9, { duration: 0.8 })
  }, [municipioId, map])
  return null
}

export function TamaulipasMap() {
  const municipioId = useCampaignStore((s) => s.municipioId)
  const seleccionarMunicipio = useCampaignStore((s) => s.seleccionarMunicipio)
  const theme = useCampaignStore((s) => s.theme)
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-gradient-to-b dark:from-ink-800 dark:to-ink-900">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">Mapa real por afinidad PAN</p>
        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: '#F43F5E' }} /> Baja
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: '#F59E0B' }} /> Media
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: '#10B981' }} /> Alta
        </div>
      </div>
      <MapContainer center={[24.2, -98.4]} zoom={7} scrollWheelZoom={false} className="h-[420px] w-full rounded-xl" style={{ background: theme === 'dark' ? '#0C1322' : '#E8EEF5' }}>
        <TileLayer
          url={theme === 'dark' ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
        />
        <VolarASeleccion />
        {MUNICIPIOS.map((m) => (
          <CircleMarker
            key={m.id}
            center={[m.lat, m.lng]}
            radius={10 + Math.sqrt(m.listaNominal / 10000)}
            pathOptions={{
              color: municipioId === m.id ? '#FFFFFF' : colorPorAfinidad(m.afinidadPAN),
              weight: municipioId === m.id ? 3 : 2,
              fillColor: colorPorAfinidad(m.afinidadPAN),
              fillOpacity: 0.75,
            }}
            eventHandlers={{ click: () => seleccionarMunicipio(municipioId === m.id ? null : m.id) }}
          >
            <Tooltip direction="top" offset={[0, -8]} opacity={1}>
              <strong>{m.nombre}</strong><br />LN {fmtNum(m.listaNominal)} · afinidad {m.afinidadPAN} · {m.prioridad}
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
      <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">Círculos proporcionales a lista nominal · clic para filtrar todo el sistema · mapa © OpenStreetMap</p>
    </div>
  )
}

export function ChartTooltip(props: { active?: boolean; payload?: Array<{ name: string; value: number; color?: string }>; label?: string }) {
  if (!props.active || !props.payload?.length) return null
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-panel dark:border-white/10 dark:bg-ink-800">
      {props.label && <p className="mb-1 font-semibold text-slate-800 dark:text-slate-200">{props.label}</p>}
      {props.payload.map((p) => (
        <p key={p.name} className="tabular text-slate-600 dark:text-slate-300">{p.name}: {fmtNum(p.value)}</p>
      ))}
    </div>
  )
}
