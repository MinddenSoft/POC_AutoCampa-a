import { mulberry32, pick, int } from './seed'

export type Prioridad = 'Alta' | 'Media' | 'Baja'
export type Sentimiento = 'pos' | 'neu' | 'neg'
export type Canal = 'Facebook' | 'Instagram' | 'TikTok' | 'WhatsApp' | 'Web' | 'CallCenter'
export type Tema = 'Seguridad' | 'Agua' | 'Empleo' | 'Salud' | 'Corrupción' | 'Infraestructura'
export type TipoContacto = 'militante' | 'simpatizante' | 'voluntario' | 'lider'
export type EstadoContacto = 'nuevo' | 'contactado' | 'comprometido' | 'promotor'

export interface Municipio {
  id: string
  nombre: string
  distLocal: number
  distFederal: number
  listaNominal: number
  part2021: number
  part2022: number
  part2024: number
  afinidadPAN: number
  prioridad: Prioridad
  riesgo: number
  x: number
  y: number
  w: number
  h: number
  lat: number
  lng: number
}

export interface Seccion {
  id: string
  municipioId: string
  listaNominal: number
  participacion: number
  afinidadPAN: number
  swing: number
  temas: Tema[]
  inseguridad: number
  ultimaVisita: string
  responsable: string
}

export interface Contacto {
  id: string
  nombre: string
  tipo: TipoContacto
  municipioId: string
  seccionId: string
  origen: string
  etiquetas: string[]
  estado: EstadoContacto
  interacciones: number
  ultimaActividad: string
  telefono: string
}

export interface Interaccion {
  id: string
  canal: Canal
  texto: string
  tema: Tema
  sentimiento: Sentimiento
  municipioId: string
  seccionId: string
  contactoId: string | null
  fecha: string
  requiereHumano: boolean
}

export interface Flujo {
  id: string
  nombre: string
  trigger: string
  canal: string
  pasos: string[]
  mensaje: string
  enviados: number
  leidos: number
  respondidos: number
  activo: boolean
}

const rnd = mulberry32(42)

const MUN_BASE: Array<Omit<Municipio, 'listaNominal' | 'part2021' | 'part2022' | 'part2024' | 'afinidadPAN' | 'prioridad' | 'riesgo'>> = [
  { id: 'victoria', nombre: 'Cd. Victoria', distLocal: 14, distFederal: 5, x: 430, y: 280, w: 120, h: 90, lat: 23.736, lng: -99.14 },
  { id: 'tampico', nombre: 'Tampico', distLocal: 21, distFederal: 8, x: 560, y: 420, w: 100, h: 70, lat: 22.23, lng: -97.86 },
  { id: 'reynosa', nombre: 'Reynosa', distLocal: 4, distFederal: 2, x: 300, y: 80, w: 130, h: 80, lat: 26.05, lng: -98.28 },
  { id: 'matamoros', nombre: 'Matamoros', distLocal: 10, distFederal: 3, x: 460, y: 70, w: 120, h: 80, lat: 25.87, lng: -97.5 },
  { id: 'laredo', nombre: 'Nuevo Laredo', distLocal: 1, distFederal: 1, x: 120, y: 110, w: 110, h: 100, lat: 27.47, lng: -99.51 },
  { id: 'altamira', nombre: 'Altamira', distLocal: 19, distFederal: 7, x: 540, y: 350, w: 90, h: 60, lat: 22.39, lng: -97.93 },
  { id: 'madero', nombre: 'Cd. Madero', distLocal: 20, distFederal: 8, x: 570, y: 470, w: 80, h: 55, lat: 22.25, lng: -97.83 },
  { id: 'mante', nombre: 'El Mante', distLocal: 17, distFederal: 6, x: 380, y: 380, w: 110, h: 80, lat: 22.74, lng: -98.97 },
  { id: 'valle', nombre: 'Valle Hermoso', distLocal: 9, distFederal: 3, x: 380, y: 150, w: 95, h: 65, lat: 25.67, lng: -97.82 },
  { id: 'soto', nombre: 'Soto la Marina', distLocal: 15, distFederal: 5, x: 480, y: 220, w: 105, h: 70, lat: 23.77, lng: -98.21 },
]

const LN: Record<string, number> = {
  reynosa: 512000, matamoros: 398000, laredo: 318000, victoria: 268000, tampico: 248000,
  altamira: 178000, madero: 165000, mante: 92000, valle: 48000, soto: 38000,
}

export const MUNICIPIOS: Municipio[] = MUN_BASE.map((m, i) => {
  const afinidadPAN = int(rnd, 28, 62)
  const prioridad: Prioridad = afinidadPAN < 38 || m.id === 'reynosa' || m.id === 'victoria' ? 'Alta' : afinidadPAN > 50 ? 'Baja' : 'Media'
  return {
    ...m,
    listaNominal: LN[m.id] ?? 60000,
    part2021: 48 + rnd() * 8 + (i % 3),
    part2022: 46 + rnd() * 9,
    part2024: 52 + rnd() * 9,
    afinidadPAN,
    prioridad,
    riesgo: int(rnd, 15, 92),
  }
})

const TEMAS: Tema[] = ['Seguridad', 'Agua', 'Empleo', 'Salud', 'Corrupción', 'Infraestructura']
const NOMBRES = ['María', 'José', 'Carmen', 'Juan', 'Rosa', 'Miguel', 'Lucía', 'Pedro', 'Ana', 'Jorge', 'Elena', 'Carlos', 'Sofía', 'Raúl', 'Patricia', 'Fernando', 'Alejandra', 'Ricardo', 'Gabriela', 'Andrés']
const APELLIDOS = ['Hernández', 'García', 'Martínez', 'López', 'González', 'Treviño', 'Cantú', 'Sáenz', 'Leal', 'Longoria', 'Garza', 'Maldonado', 'Reyes', 'Cavazos', 'De León']
const RESPONSABLES = ['E. Garza', 'M. Treviño', 'L. Cantú', 'R. Sáenz', 'A. Longoria', 'P. Reyes']
const ORIGENES = ['Formulario web', 'Evento territorial', 'Call center', 'WhatsApp', 'Redes sociales', 'Padrón PAN']

export const SECCIONES: Seccion[] = MUNICIPIOS.flatMap((m, mi) =>
  Array.from({ length: 12 }, (_, k) => {
    const afinidadPAN = Math.max(8, Math.min(88, Math.round(m.afinidadPAN + (rnd() - 0.5) * 30)))
    const temas = [pick(rnd, TEMAS), pick(rnd, TEMAS)].filter((v, idx, a) => a.indexOf(v) === idx).slice(0, 2) as Tema[]
    if (temas.length === 0) temas.push('Seguridad')
    return {
      id: `${mi + 1}${String(101 + k)}`,
      municipioId: m.id,
      listaNominal: int(rnd, 900, 3400),
      participacion: Math.round((44 + rnd() * 22) * 10) / 10,
      afinidadPAN,
      swing: Math.round((rnd() - 0.5) * 14 * 10) / 10,
      temas,
      inseguridad: int(rnd, 5, 98),
      ultimaVisita: new Date(Date.now() - int(rnd, 2, 90) * 86400000).toISOString(),
      responsable: pick(rnd, RESPONSABLES),
    }
  }),
)

export const CONTACTOS: Contacto[] = Array.from({ length: 250 }, (_, i) => {
  const m = pick(rnd, MUNICIPIOS)
  const secs = SECCIONES.filter((s) => s.municipioId === m.id)
  const sec = pick(rnd, secs)
  const tipo = pick(rnd, ['militante', 'simpatizante', 'simpatizante', 'voluntario', 'lider'] as TipoContacto[])
  const estado = pick(rnd, ['nuevo', 'contactado', 'contactado', 'comprometido', 'promotor'] as EstadoContacto[])
  return {
    id: `CT-${1000 + i}`,
    nombre: `${pick(rnd, NOMBRES)} ${pick(rnd, APELLIDOS)} ${pick(rnd, APELLIDOS)}`,
    tipo,
    municipioId: m.id,
    seccionId: sec.id,
    origen: tipo === 'militante' ? 'Padrón PAN' : pick(rnd, ORIGENES),
    etiquetas: [
      ...(rnd() > 0.6 ? [pick(rnd, ['Indeciso', 'Promotor', 'Joven', 'Mujer líder', 'Colonia prioritaria'])] : []),
      ...(rnd() > 0.8 ? ['Requiere visita'] : []),
    ],
    estado,
    interacciones: int(rnd, 0, 18),
    ultimaActividad: new Date(Date.now() - int(rnd, 0, 30) * 86400000 - int(rnd, 0, 12) * 3600000).toISOString(),
    telefono: `+52 1 834 ${int(rnd, 100, 999)} ${int(rnd, 1000, 9999)}`,
  }
})

const TEXTOS: Record<Tema, string[]> = {
  Seguridad: ['Hay balaceras cerca de la colonia, pedimos más rondines', 'Los vecinos piden alumbrado y vigilancia nocturna', 'Se robaron dos carros esta semana en el sector'],
  Agua: ['Llevamos 4 días sin agua en la colonia', 'La presión del agua no llega al segundo piso', 'Piden pipas urgentes para el ejido'],
  Empleo: ['Cuando habrá bolsa de trabajo para jóvenes', 'La maquila recortó turnos, preocupa el empleo', 'Piden apoyo para microemprendimientos'],
  Salud: ['El centro de salud no tiene medicamentos', 'Piden brigada médica para adultos mayores', 'Falta pediatra en la clínica local'],
  Corrupción: ['Denuncian cobros indebidos en trámites', 'Piden transparencia en obra pública', 'Cuestionan asignación de apoyos'],
  Infraestructura: ['La calle principal está llena de baches', 'Piden pavimentación y banquetas', 'El drenaje colapsó con la lluvia'],
}

export const INTERACCIONES: Interaccion[] = Array.from({ length: 800 }, (_, i) => {
  const m = pick(rnd, MUNICIPIOS)
  const secs = SECCIONES.filter((s) => s.municipioId === m.id)
  const sec = pick(rnd, secs)
  const tema = pick(rnd, TEMAS)
  const sentimiento = (rnd() < 0.42 ? 'neg' : rnd() < 0.62 ? 'neu' : 'pos') as Sentimiento
  const canal = pick(rnd, ['Facebook', 'Facebook', 'Instagram', 'TikTok', 'WhatsApp', 'Web', 'CallCenter'] as Canal[])
  return {
    id: `IN-${5000 + i}`,
    canal,
    texto: pick(rnd, TEXTOS[tema]),
    tema,
    sentimiento,
    municipioId: m.id,
    seccionId: sec.id,
    contactoId: rnd() > 0.55 ? pick(rnd, CONTACTOS).id : null,
    fecha: new Date(Date.now() - int(rnd, 0, 30) * 86400000 - int(rnd, 0, 1440) * 60000).toISOString(),
    requiereHumano: sentimiento === 'neg' && rnd() > 0.72,
  }
})

export const FLUJOS: Flujo[] = [
  {
    id: 'bienvenida', nombre: 'Bienvenida WhatsApp', trigger: 'Nuevo registro web / formulario',
    canal: 'WhatsApp', pasos: ['Mensaje bienvenida', 'Confirmar sección', 'Invitar a evento', 'Asignar promotor'],
    mensaje: 'Hola {nombre}, soy del equipo PAN Tamaulipas. Gracias por registrarte en {municipio}. ¿Te invitamos a la reunión de tu sección {seccion}?',
    enviados: 4820, leidos: 3910, respondidos: 1480, activo: true,
  },
  {
    id: 'evento', nombre: 'Seguimiento de evento', trigger: 'Asistencia a recorrido',
    canal: 'WhatsApp + Call center', pasos: ['Agradecimiento 2h', 'Encuesta 24h', 'Compromiso voto', 'Recordatorio'],
    mensaje: 'Gracias por acompañarnos hoy en {municipio}. ¿Contamos contigo este 2027? Responde SÍ para registrar tu compromiso.',
    enviados: 3150, leidos: 2680, respondidos: 1210, activo: true,
  },
  {
    id: 'indecisos', nombre: 'Rescate indecisos', trigger: 'Sentimiento negativo / neutro',
    canal: 'WhatsApp', pasos: ['Escucha', 'Propuesta temática', 'Testimonio local', 'Derivar a humano'],
    mensaje: 'Te escuchamos. En {municipio} el tema {tema} es prioridad. Este es nuestro compromiso concreto… ¿Platicamos 5 min?',
    enviados: 1940, leidos: 1520, respondidos: 480, activo: false,
  },
  {
    id: 'alerta', nombre: 'Alerta territorial', trigger: 'Pico de incidencias',
    canal: 'Interno + SMS', pasos: ['Detectar pico', 'Briefing exprés', 'Notificar responsable', 'Escalar'],
    mensaje: 'ALERTA {municipio} Sec.{seccion}: pico de {tema} ({n} reportes 48h). Responsable {responsable}. Acción sugerida: visita + brigada.',
    enviados: 320, leidos: 310, respondidos: 240, activo: true,
  },
]

export const MUNICIPIO_NOMBRE: Record<string, string> = Object.fromEntries(MUNICIPIOS.map((m) => [m.id, m.nombre]))

export const OBJETIVO_VOTOS = 725000
export const PROYECCION_VOTOS = 612400
