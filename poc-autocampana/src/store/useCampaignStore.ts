import { create } from 'zustand'

export type Modulo = 'control' | 'territorio' | 'escucha' | 'crm' | 'automatizacion' | 'audiencias' | 'contenidos' | 'calendario' | 'config' | 'manual'
export type Theme = 'dark' | 'light'
export type Rol = 'Estrategia' | 'Operador' | 'Candidato'

export interface Usuario {
  nombre: string
  email: string
  rol: Rol
}

interface Toast {
  id: number
  titulo: string
  detalle: string
}

interface CampaignState {
  modulo: Modulo
  municipioId: string | null
  seccionId: string | null
  busqueda: string
  sidebarOpen: boolean
  theme: Theme
  usuario: Usuario | null
  toasts: Toast[]
  flujoExtra: Record<string, number>
  flujoActivo: Record<string, boolean>
  contactoEstado: Record<string, string>
  setModulo: (m: Modulo) => void
  seleccionarMunicipio: (id: string | null) => void
  seleccionarSeccion: (id: string | null) => void
  setBusqueda: (q: string) => void
  toggleSidebar: () => void
  toggleTheme: () => void
  login: (u: Usuario) => void
  logout: () => void
  pushToast: (titulo: string, detalle: string) => void
  dismissToast: (id: number) => void
  simularEnvio: (flujoId: string) => void
  toggleFlujo: (flujoId: string, base: boolean) => void
  cambiarEstadoContacto: (id: string, estado: string) => void
  irABriefing: (seccionId: string) => void
}

let toastId = 1

function initialTheme(): Theme {
  try {
    return (localStorage.getItem('tw-theme') as Theme) || 'light'
  } catch {
    return 'dark'
  }
}

function initialUser(): Usuario | null {
  try {
    const raw = localStorage.getItem('tw-user')
    return raw ? (JSON.parse(raw) as Usuario) : null
  } catch {
    return null
  }
}

export const useCampaignStore = create<CampaignState>((set, get) => ({
  modulo: 'control',
  municipioId: null,
  seccionId: null,
  busqueda: '',
  sidebarOpen: true,
  theme: initialTheme(),
  usuario: initialUser(),
  toasts: [],
  flujoExtra: {},
  flujoActivo: {},
  contactoEstado: {},
  setModulo: (modulo) => set({ modulo }),
  seleccionarMunicipio: (municipioId) => set({ municipioId, seccionId: null }),
  seleccionarSeccion: (seccionId) => set({ seccionId }),
  setBusqueda: (busqueda) => set({ busqueda }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark'
    try {
      localStorage.setItem('tw-theme', next)
    } catch {
      /* noop */
    }
    set({ theme: next })
  },
  login: (usuario) => {
    try {
      localStorage.setItem('tw-user', JSON.stringify(usuario))
    } catch {
      /* noop */
    }
    set({ usuario, modulo: 'control' })
  },
  logout: () => {
    try {
      localStorage.removeItem('tw-user')
    } catch {
      /* noop */
    }
    set({ usuario: null })
  },
  pushToast: (titulo, detalle) => {
    const id = toastId++
    set((s) => ({ toasts: [...s.toasts, { id, titulo, detalle }] }))
    setTimeout(() => get().dismissToast(id), 3800)
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  simularEnvio: (flujoId) => {
    set((s) => ({ flujoExtra: { ...s.flujoExtra, [flujoId]: (s.flujoExtra[flujoId] ?? 0) + 120 } }))
    get().pushToast('Envío lanzado', '+120 mensajes enviados en flujo ' + flujoId)
  },
  toggleFlujo: (flujoId, base) => {
    const actual = get().flujoActivo[flujoId] ?? base
    set((s) => ({ flujoActivo: { ...s.flujoActivo, [flujoId]: !actual } }))
  },
  cambiarEstadoContacto: (id, estado) => {
    set((s) => ({ contactoEstado: { ...s.contactoEstado, [id]: estado } }))
    get().pushToast('CRM actualizado', `${id} → ${estado}`)
  },
  irABriefing: (seccionId) => set({ seccionId, modulo: 'control' }),
}))
