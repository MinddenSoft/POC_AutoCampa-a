import { useState } from 'react'
import { ShieldCheck, Loader2 } from 'lucide-react'
import { useCampaignStore, type Rol } from '../store/useCampaignStore'
import { Card, Logo } from '../components/ui'

const ROLES: Rol[] = ['Estrategia', 'Operador', 'Candidato']
const INPUT = 'mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-ink-800 dark:text-slate-100 dark:placeholder:text-slate-500'

export function Login() {
  const login = useCampaignStore((s) => s.login)
  const [nombre, setNombre] = useState('Mariana Treviño')
  const [email, setEmail] = useState('estrategia@pan-tam.mx')
  const [password, setPassword] = useState('tam2027*')
  const [rol, setRol] = useState<Rol>('Estrategia')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  function entrar() {
    if (!nombre.trim() || !email.includes('@') || password.length < 4) {
      setError('Revisa nombre, correo y contraseña (mínimo 4 caracteres).')
      return
    }
    setError('')
    setCargando(true)
    window.setTimeout(() => {
      login({ nombre: nombre.trim(), email: email.trim(), rol })
    }, 800)
  }

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900 dark:bg-ink-950 dark:text-slate-100">
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-gradient-to-br from-white via-blue-50 to-brand-500/20 p-10 dark:from-ink-900 dark:via-ink-950 dark:to-[#0A1B3D] lg:flex [&>*]:relative [&>*]:z-10">
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
          <div className="animate-drift-a absolute -left-20 top-1/4 h-96 w-96 rounded-full bg-brand-500/25 blur-3xl" />
          <div className="animate-drift-b absolute -right-24 top-10 h-80 w-80 rounded-full bg-sky-400/25 blur-3xl dark:bg-sky-400/15" />
          <div className="animate-drift-a absolute bottom-10 left-1/3 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl [animation-delay:-6s]" />
        </div>
        <div className="flex items-center gap-3">
          <Logo className="h-10 w-10" />
          <p className="font-semibold">ThirdWish Systems</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">PAN Tamaulipas · Elección 2027</p>
          <h1 className="mt-3 max-w-md text-4xl font-semibold leading-tight tracking-tight">Inteligencia y automatización de campaña en una sola plataforma.</h1>
          <div className="mt-6 grid max-w-lg grid-cols-3 gap-3">
            {[['725k', 'objetivo electoral'], ['43 + 22 + 8', 'campañas coordinadas'], ['10', 'módulos integrados']].map(([v, l]) => (
              <div key={l} className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none">
                <p className="tabular text-xl font-semibold">{v}</p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{l}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-slate-500">Plataforma operativa · Tamaulipas 2027.</p>
      </div>
      <div className="flex flex-1 items-center justify-center bg-white p-6 dark:bg-transparent">
        <Card className="w-full max-w-md">
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100"><ShieldCheck className="h-5 w-5 text-brand-500" /> Acceso operativo</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Introduce tus credenciales corporativas.</p>
          <label className="mt-5 block text-xs font-medium text-slate-600 dark:text-slate-300">Nombre
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} className={INPUT} />
          </label>
          <label className="mt-3 block text-xs font-medium text-slate-600 dark:text-slate-300">Correo
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className={INPUT} />
          </label>
          <label className="mt-3 block text-xs font-medium text-slate-600 dark:text-slate-300">Contraseña
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" onKeyDown={(e) => e.key === 'Enter' && entrar()} className={INPUT} />
          </label>
          <p className="mt-3 text-xs font-medium text-slate-600 dark:text-slate-300">Rol</p>
          <div className="mt-1.5 flex gap-2">
            {ROLES.map((r) => (
              <button key={r} onClick={() => setRol(r)} className={`flex-1 rounded-xl border px-3 py-2 text-xs font-medium ${rol === r ? 'border-brand-500/60 bg-brand-500/15 text-slate-900 dark:text-white' : 'border-slate-200 bg-slate-900/5 text-slate-500 hover:bg-slate-900/10 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10'}`}>{r}</button>
            ))}
          </div>
          {error && <p className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-600 dark:text-rose-300">{error}</p>}
          <button onClick={entrar} disabled={cargando} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white shadow-glow hover:bg-brand-600 disabled:opacity-60">
            {cargando && <Loader2 className="h-4 w-4 animate-spin" />} {cargando ? 'Verificando…' : 'Entrar a la plataforma'}
          </button>
        </Card>
      </div>
    </div>
  )
}
