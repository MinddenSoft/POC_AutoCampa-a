import { useEffect } from 'react'
import { useCampaignStore } from './store/useCampaignStore'
import { Sidebar, Topbar } from './components/layout'
import { Territorio } from './features/territorio'
import { Escucha } from './features/escucha'
import { Crm } from './features/crm'
import { Automatizacion } from './features/automatizacion'
import { Control } from './features/control'
import { Audiencias } from './features/audiencias'
import { Contenidos } from './features/contenidos'
import { Calendario } from './features/calendario'
import { Config } from './features/config'
import { Login } from './features/login'
import { Manual } from './features/manual'

export function App() {
  const modulo = useCampaignStore((s) => s.modulo)
  const theme = useCampaignStore((s) => s.theme)
  const usuario = useCampaignStore((s) => s.usuario)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  if (!usuario) return <Login />

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900 dark:bg-ink-950 dark:text-slate-100">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="mx-auto w-full max-w-[1600px] flex-1 px-6 py-6">
          {modulo === 'control' && <Control />}
          {modulo === 'territorio' && <Territorio />}
          {modulo === 'escucha' && <Escucha />}
          {modulo === 'crm' && <Crm />}
          {modulo === 'automatizacion' && <Automatizacion />}
          {modulo === 'audiencias' && <Audiencias />}
          {modulo === 'contenidos' && <Contenidos />}
          {modulo === 'calendario' && <Calendario />}
          {modulo === 'config' && <Config />}
          {modulo === 'manual' && <Manual />}
        </main>
        <footer className="no-print border-t border-slate-200 px-6 py-3 text-[11px] text-slate-400 dark:border-white/10 dark:text-slate-600">
          ThirdWish Systems · PAN Tamaulipas 2027 · Plataforma operativa
        </footer>
      </div>
    </div>
  )
}
