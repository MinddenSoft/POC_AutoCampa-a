export function fmtNum(n: number): string {
  return new Intl.NumberFormat('es-MX').format(Math.round(n))
}

export function fmtPct(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`
}

export function fmtFecha(iso: string): string {
  const d = new Date(iso)
  return new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }).format(d)
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return 'hace <1 h'
  if (h < 24) return `hace ${h} h`
  const d = Math.floor(h / 24)
  return d === 1 ? 'hace 1 día' : `hace ${d} días`
}
