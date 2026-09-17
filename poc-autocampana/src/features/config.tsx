import { useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { useCampaignStore } from '../store/useCampaignStore'
import { Card, PageHeader, Badge, PrimaryButton, DataTable } from '../components/ui'

const USUARIOS = [
  { nombre: 'Mariana Treviño', email: 'estrategia@pan-tam.mx', rol: 'Estrategia', estado: 'Activo' },
  { nombre: 'Ricardo Sáenz', email: 'operacion@pan-tam.mx', rol: 'Operador', estado: 'Activo' },
]

const FUENTES = [
  { nombre: 'Padrón PAN Tamaulipas', detalle: '9,786 militantes · muestra pendiente', estado: 'Pendiente' },
  { nombre: 'INEGI / fuentes públicas', detalle: 'Variables sociodemográficas por sección', estado: 'Conectada' },
  { nombre: 'GeoDataLab (referencia)', detalle: 'Licencia anual MXN 760,000 · en evaluación', estado: 'Evaluación' },
  { nombre: 'WhatsApp Business API', detalle: 'Flujos 1–3 · coste variable por mensaje', estado: 'Conectada' },
  { nombre: 'Meta / Instagram / TikTok', detalle: 'Escucha vía accesos autorizados', estado: 'Parcial' },
]

export function Config() {
  const pushToast = useCampaignStore((s) => s.pushToast)
  const theme = useCampaignStore((s) => s.theme)
  const toggleTheme = useCampaignStore((s) => s.toggleTheme)
  const [canales, setCanales] = useState<Record<string, boolean>>({ WhatsApp: true, 'Call center': true, Facebook: true, Instagram: true, TikTok: false, SMS: false })

  return (
    <div>
      <PageHeader titulo="Configuración" subtitulo="Usuarios, canales, fuentes y apariencia de la plataforma" />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Usuarios (2 accesos directos)</p>
            <PrimaryButton onClick={() => pushToast('Invitación enviada', 'Correo de invitación generado')}>Invitar</PrimaryButton>
          </div>
          <DataTable<{ nombre: string; email: string; rol: string; estado: string }>
            datos={USUARIOS}
            claveFila={(u) => u.email}
            textoBuscar={(u) => `${u.nombre} ${u.email} ${u.rol}`}
            pageSizes={[5, 10]}
            placeholder="Buscar usuarios…"
            columnas={[
              {
                clave: 'u', titulo: 'Usuario',
                render: (u) => (
                  <span className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500/15 font-semibold text-brand-600 dark:text-brand-400">{u.nombre[0]}</span>
                    <span><p className="font-medium text-slate-900 dark:text-slate-100">{u.nombre}</p><p className="text-xs text-slate-500">{u.email} · {u.rol}</p></span>
                  </span>
                ),
              },
              { clave: 'e', titulo: 'Estado', render: (u) => <Badge tono="pos">{u.estado}</Badge> },
            ]}
          />
        </Card>
        <Card>
          <p className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Canales operativos</p>
          {Object.entries(canales).map(([c, on]) => (
            <div key={c} className="flex items-center justify-between border-t border-slate-200 py-2.5 text-sm first:border-0 dark:border-white/5">
              <span className="text-slate-700 dark:text-slate-200">{c}</span>
              <button onClick={() => { setCanales((x) => ({ ...x, [c]: !x[c] })); pushToast('Canal ' + (!on ? 'activado' : 'pausado'), c) }} aria-label={`Activar ${c}`} className={`relative h-6 w-11 rounded-full ${on ? 'bg-brand-500' : 'bg-slate-300 dark:bg-white/10'}`}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${on ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
        </Card>
        <Card>
          <p className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Fuentes de datos</p>
          <DataTable<{ nombre: string; detalle: string; estado: string }>
            datos={FUENTES}
            claveFila={(f) => f.nombre}
            textoBuscar={(f) => `${f.nombre} ${f.detalle} ${f.estado}`}
            pageSizes={[5, 10]}
            placeholder="Buscar fuentes…"
            columnas={[
              {
                clave: 'f', titulo: 'Fuente',
                render: (f) => <><p className="font-medium text-slate-900 dark:text-slate-100">{f.nombre}</p><p className="text-xs text-slate-500">{f.detalle}</p></>,
              },
              {
                clave: 'e', titulo: 'Estado',
                render: (f) => <Badge tono={f.estado === 'Conectada' ? 'pos' : f.estado === 'Pendiente' ? 'Media' : 'default'}>{f.estado}</Badge>,
              },
            ]}
          />
        </Card>
        <Card>
          <p className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Apariencia y entorno</p>
          <button onClick={toggleTheme} className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm hover:bg-slate-900/5 dark:border-white/10 dark:hover:bg-white/5">
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-brand-500" />}
            <span className="text-slate-700 dark:text-slate-200">Cambiar a modo {theme === 'dark' ? 'claro' : 'oscuro'}</span>
          </button>
          <p className="mt-3 rounded-xl bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">Cualquier tratamiento de datos queda condicionado a validación jurídica y reglas de cada canal.</p>
        </Card>
      </div>
    </div>
  )
}
