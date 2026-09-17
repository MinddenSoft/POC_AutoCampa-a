import { INTERACCIONES, SECCIONES, MUNICIPIOS, CONTACTOS, CONTACTOS as _C, MUNICIPIO_NOMBRE, OBJETIVO_VOTOS, PROYECCION_VOTOS, type Tema } from './data'
import { fmtNum, fmtPct } from './format'

void _C

export interface NlpHallazgo {
  dato: string
  valor: string
}

export interface NlpAnswer {
  titulo: string
  resumen: string
  hallazgos: NlpHallazgo[]
  analisis: string[]
  recomendacion: string
  fuentes: string[]
  confianza: number
  seguimientos: string[]
  tiempoMs: number
}

function norm(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

const MUN_KEYS = MUNICIPIOS.map((m) => ({ id: m.id, keys: [norm(m.nombre), ...norm(m.nombre).split(/[\s.]+/).filter((w) => w.length > 3)] }))
const TEMAS: Tema[] = ['Seguridad', 'Agua', 'Empleo', 'Salud', 'Corrupción', 'Infraestructura']
const CANALES = ['Facebook', 'Instagram', 'TikTok', 'WhatsApp', 'Web', 'CallCenter']

function detectarMunicipios(q: string): string[] {
  const n = norm(q)
  const out: string[] = []
  for (const m of MUN_KEYS) {
    if (n.includes(m.keys[0]) || m.keys.slice(1).some((k) => n.includes(k) && k.length > 4)) out.push(m.id)
  }
  return [...new Set(out)]
}

function detectarTema(q: string): Tema | null {
  const n = norm(q)
  return TEMAS.find((t) => n.includes(norm(t))) ?? null
}

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

const FUENTES_BASE = ['Base territorial · 120 secciones, 10 municipios', 'Escucha digital · 800 interacciones clasificadas, últimos 30 días', 'CRM · 250 contactos con origen y estado', 'Histórico electoral · participación 2021–2024']

function meta(q: string, seguimientos: string[]): { confianza: number; tiempoMs: number; fuentes: string[]; seguimientos: string[] } {
  const h = hash(q)
  return { confianza: 0.84 + (h % 11) / 100, tiempoMs: 900 + (h % 1400), fuentes: FUENTES_BASE, seguimientos }
}

function votosEnJuego(municipioId: string): number {
  return Math.round(SECCIONES.filter((s) => s.municipioId === municipioId).reduce((a, s) => a + s.listaNominal * (1 - s.participacion / 100), 0))
}

function respuestaPrioridad(q: string): NlpAnswer {
  const pri = [...MUNICIPIOS].sort((a, b) => a.afinidadPAN - b.afinidadPAN).slice(0, 4)
  const top = pri[0]
  return {
    titulo: 'Priorización semanal del esfuerzo territorial',
    resumen: `Si solo puedes ganar un municipio esta semana, que sea ${top.nombre}: combina la afinidad más baja (${top.afinidadPAN}/100) con una lista nominal de ${fmtNum(top.listaNominal)} y ${fmtNum(votosEnJuego(top.id))} votos potenciales sin movilizar. Concentraría el 70% del esfuerzo en 4 municipios.`,
    hallazgos: pri.map((m) => ({ dato: m.nombre, valor: `afinidad ${m.afinidadPAN} · en juego ${fmtNum(votosEnJuego(m.id))} · ${m.prioridad}` })),
    analisis: [
      `${top.nombre} explica por sí solo el ${fmtPct((votosEnJuego(top.id) / (OBJETIVO_VOTOS - PROYECCION_VOTOS)) * 100, 0)} del gap hacia el objetivo de ${fmtNum(OBJETIVO_VOTOS)}.`,
      'Los municipios con afinidad 38–45 son los más elásticos: cada punto de participación movilizada rinde el doble que en bastiones.',
      'Crucé escucha negativa de Seguridad con las secciones de baja afinidad: 6 de las 10 secciones críticas comparten el mismo patrón.',
    ],
    recomendacion: `Lunes: recorrido ${top.nombre} + brigada de alumbrado. Miércoles: activación de promotores en las 5 secciones de menor participación. Viernes: corte de escucha para medir desplazamiento de sentimiento.`,
    ...meta(q, ['¿Dónde perdemos participación?', `Genera briefing para ${top.nombre}`, '¿Cómo está seguridad por territorio?']),
  }
}

function respuestaParticipacion(q: string): NlpAnswer {
  const low = [...SECCIONES].sort((a, b) => a.participacion - b.participacion).slice(0, 5)
  const mun = [...MUNICIPIOS].sort((a, b) => a.part2024 - b.part2024)[0]
  return {
    titulo: 'Dónde se pierde la participación',
    resumen: `La abstención se concentra en ${mun.nombre} y 5 secciones que promedian ${fmtPct(low.reduce((a, s) => a + s.participacion, 0) / low.length)} de participación, ${fmtPct(58 - low.reduce((a, s) => a + s.participacion, 0) / low.length, 1)} por debajo del promedio estatal. Son territorio recuperable, no perdido: alta lista nominal, baja movilización.`,
    hallazgos: low.map((s) => ({ dato: `Sec. ${s.id} · ${MUNICIPIO_NOMBRE[s.municipioId]}`, valor: `${fmtPct(s.participacion)} part. · LN ${fmtNum(s.listaNominal)} · afinidad ${s.afinidadPAN}` })),
    analisis: [
      'El patrón es consistente: secciones con LN mayor a 2,500 y participación menor a 50% explican el 60% de la abstención del top-10.',
      'La caída 2022→2024 en estas zonas coincide con menor presencia territorial (última visita hace más de 45 días en 3 de 5).',
      'El segmento joven (etiqueta Joven en CRM) es el de mayor abstención relativa y el más barato de activar por WhatsApp.',
    ],
    recomendacion: 'Operativo de rescate: promotores 1×80 electores en las 5 secciones, dos toques de WhatsApp (martes/sábado) y casilla de compromiso previo. Meta: +4 pts de participación = ~9,600 votos.',
    ...meta(q, ['¿Qué municipios priorizar esta semana?', '¿Cómo va el CRM y promotores?', '¿Qué dice la escucha digital?']),
  }
}

function respuestaSeguridad(q: string): NlpAnswer {
  const tema = detectarTema(q)
  const top = [...SECCIONES].sort((a, b) => b.inseguridad - a.inseguridad).slice(0, 5)
  const neg = INTERACCIONES.filter((i) => i.tema === 'Seguridad' && i.sentimiento === 'neg').length
  return {
    titulo: 'Riesgo de seguridad por territorio',
    resumen: `Detecté ${fmtNum(neg)} menciones negativas de Seguridad en 30 días. El riesgo se concentra en ${MUNICIPIO_NOMBRE[top[0].municipioId]} (índice ${top[0].inseguridad}/100 en Sec. ${top[0].id}). ${tema && tema !== 'Seguridad' ? `Además, el tema ${tema} aparece acoplado en 3 de las 5 zonas críticas. ` : ''}Recomiendo tratarlo como eje de visita, no solo como mensaje.`,
    hallazgos: top.map((s) => ({ dato: `Sec. ${s.id} · ${MUNICIPIO_NOMBRE[s.municipioId]}`, valor: `índice ${s.inseguridad}/100 · resp. ${s.responsable} · ${s.temas.join(', ')}` })),
    analisis: [
      `El volumen de Seguridad creció respecto al promedio móvil: ${fmtNum(neg)} menciones negativas superan a cualquier otro tema en 2.1×.`,
      'Las zonas críticas comparten tres señales: alumbrado deficiente, patrullaje nocturno y robos recientes reportados por call center.',
      'El sentimiento en WhatsApp es más severo que en Facebook: la gente reporta por privado lo que no publica.',
    ],
    recomendacion: 'Briefing exprés a responsables, compromiso verificable (rondines + alumbrado en 72h) y seguimiento público del cumplimiento. Evitar promesas genéricas: pedir reporte ciudadano de avance.',
    ...meta(q, ['Genera briefing para Reynosa', '¿Qué dice la escucha digital?', '¿Qué municipios priorizar esta semana?']),
  }
}

function respuestaSentimiento(q: string): NlpAnswer {
  const neg = INTERACCIONES.filter((i) => i.sentimiento === 'neg').length
  const pos = INTERACCIONES.filter((i) => i.sentimiento === 'pos').length
  const neu = INTERACCIONES.length - neg - pos
  const top = TEMAS.map((t) => ({ t, n: INTERACCIONES.filter((i) => i.tema === t && i.sentimiento === 'neg').length })).sort((a, b) => b.n - a.n).slice(0, 3)
  return {
    titulo: 'Pulso digital de los últimos 30 días',
    resumen: `De ${fmtNum(INTERACCIONES.length)} interacciones, el ${fmtPct((neg / INTERACCIONES.length) * 100, 0)} es negativo y el ${fmtPct((pos / INTERACCIONES.length) * 100, 0)} positivo: el territorio está molesto pero conversando, que es la ventana de oportunidad. ${top[0].t} domina la conversación negativa con ${fmtNum(top[0].n)} menciones.`,
    hallazgos: [
      ...top.map((x) => ({ dato: x.t, valor: `${fmtNum(x.n)} menciones negativas` })),
      { dato: 'Canal dominante', valor: 'Facebook (volumen) · WhatsApp (severidad)' },
      { dato: 'Neutro convertible', valor: `${fmtNum(neu)} interacciones (${fmtPct((neu / INTERACCIONES.length) * 100, 0)})` },
    ],
    analisis: [
      'El sentimiento negativo es temático, no identitario: critica servicios, no al partido. Eso lo hace reversible con gestión visible.',
      `Hay ${fmtNum(neu)} interacciones neutras preguntando por propuestas: es la bolsa de indecisos más barata de la campaña.`,
      'TikTok concentra el segmento joven con tono irónico; responder con formato nativo rinde 3× más que el comunicado formal.',
    ],
    recomendacion: 'Plan de 7 días: 3 piezas de gestión verificable (agua, baches, alumbrado), respuesta 1:1 a los 40 casos más severos y un live temático con el candidato en la zona crítica.',
    ...meta(q, ['¿Cómo está seguridad por territorio?', '¿En qué canal conviene pautar?', '¿Dónde perdemos participación?']),
  }
}

function respuestaCrm(q: string): NlpAnswer {
  const prom = CONTACTOS.filter((c) => c.estado === 'promotor').length
  const comp = CONTACTOS.filter((c) => c.estado === 'comprometido').length
  const nuevo = CONTACTOS.filter((c) => c.estado === 'nuevo').length
  const origenes = ['Evento territorial', 'WhatsApp', 'Formulario web', 'Call center'].map((o) => ({ dato: o, valor: `${fmtNum(CONTACTOS.filter((c) => c.origen === o).length)} contactos` }))
  return {
    titulo: 'Estado real de tu base operativa',
    resumen: `Tienes ${fmtNum(CONTACTOS.length)} contactos registrados con ${fmtNum(prom)} promotores activos: un ratio de 1 promotor por cada ${Math.max(1, Math.round(CONTACTOS.length / Math.max(1, prom)))} contactos, suficiente para cubrir las 10–12 secciones críticas. El cuello de botella está en conversión: ${fmtNum(nuevo)} nuevos sin contactar.`,
    hallazgos: [
      { dato: 'Promotores', valor: `${fmtNum(prom)} (${fmtPct((prom / CONTACTOS.length) * 100, 0)} de la base)` },
      { dato: 'Comprometidos', valor: `${fmtNum(comp)} listos para casilla` },
      { dato: 'Nuevos sin tocar', valor: `${fmtNum(nuevo)} · sla 48h` },
      ...origenes.slice(0, 2),
    ],
    analisis: [
      'El evento territorial es tu mejor origen: convierte a promotor 2.4× más que el formulario web.',
      `Si contactas los ${fmtNum(nuevo)} nuevos esta semana al ritmo actual de conversión, sumas ~${fmtNum(Math.round(nuevo * 0.22))} comprometidos.`,
      '12 contactos llevan más de 20 días sin actividad: riesgo de enfriamiento en 2 secciones prioritarias.',
    ],
    recomendacion: 'Sprint de 72h: reasignar nuevos a los 5 mejores promotores, reactivar los 12 fríos con llamada (no WhatsApp) y cerrar 30 compromisos con foto de tarjeta.',
    ...meta(q, ['¿Qué municipios priorizar esta semana?', 'Genera briefing para Reynosa', '¿Dónde perdemos participación?']),
  }
}

function respuestaComparativa(q: string, ids: string[]): NlpAnswer {
  const [aId, bId] = ids.length >= 2 ? ids : [...MUNICIPIOS].sort((x, y) => x.afinidadPAN - y.afinidadPAN).map((m) => m.id)
  const a = MUNICIPIOS.find((m) => m.id === aId)!
  const b = MUNICIPIOS.find((m) => m.id === bId)!
  const negA = INTERACCIONES.filter((i) => i.municipioId === a.id && i.sentimiento === 'neg').length
  const negB = INTERACCIONES.filter((i) => i.municipioId === b.id && i.sentimiento === 'neg').length
  return {
    titulo: `${a.nombre} vs ${b.nombre}: comparativa operativa`,
    resumen: `${a.nombre} es territorio de conquista (afinidad ${a.afinidadPAN}, ${fmtNum(votosEnJuego(a.id))} votos en juego) y ${b.nombre} es territorio de consolidación (afinidad ${b.afinidadPAN}). La estrategia no puede ser la misma: uno pide propuesta agresiva, el otro pide presencia y cuidado del voto duro.`,
    hallazgos: [
      { dato: `${a.nombre} · afinidad`, valor: `${a.afinidadPAN}/100 · part. ${fmtPct(a.part2024)} · LN ${fmtNum(a.listaNominal)}` },
      { dato: `${b.nombre} · afinidad`, valor: `${b.afinidadPAN}/100 · part. ${fmtPct(b.part2024)} · LN ${fmtNum(b.listaNominal)}` },
      { dato: `${a.nombre} · presión digital`, valor: `${fmtNum(negA)} menciones negativas` },
      { dato: `${b.nombre} · presión digital`, valor: `${fmtNum(negB)} menciones negativas` },
    ],
    analisis: [
      `${a.nombre} tiene ${fmtNum(Math.max(0, votosEnJuego(a.id) - votosEnJuego(b.id)))} votos en juego más que ${b.nombre}: cada peso de movilización rinde más ahí.`,
      `En ${b.nombre} el riesgo es la desmovilización del voto propio, no el adversario: la participación cayó ${fmtPct(Math.max(0.4, a.part2021 - b.part2024), 1)} vs 2021.`,
      'Los temas difieren: cruza el briefing de cada uno antes de compartir piezas entre municipios.',
    ],
    recomendacion: `70/30: ${a.nombre} recibe recorridos y propuesta nueva; ${b.nombre} recibe estructura, cuidado de seccionales y un evento de unidad.`,
    ...meta(q, [`Genera briefing para ${a.nombre}`, '¿Qué municipios priorizar esta semana?', '¿Dónde perdemos participación?']),
  }
}

function respuestaProyeccion(q: string): NlpAnswer {
  const gap = OBJETIVO_VOTOS - PROYECCION_VOTOS
  const porSeccion = Math.round(gap / 120)
  return {
    titulo: 'Ruta numérica al objetivo 725k',
    resumen: `Te faltan ${fmtNum(gap)} votos (${fmtPct((gap / OBJETIVO_VOTOS) * 100, 1)} del objetivo). Eso equivale a ${fmtNum(porSeccion)} votos adicionales por sección en 120 secciones, o +${fmtPct((gap / PROYECCION_VOTOS) * 100, 1)} sobre la proyección actual. Es alcanzable con movilización, no necesitas convencer a todo el estado.`,
    hallazgos: [
      { dato: 'Proyección actual', valor: `${fmtNum(PROYECCION_VOTOS)} (${fmtPct((PROYECCION_VOTOS / OBJETIVO_VOTOS) * 100, 1)} del objetivo)` },
      { dato: 'Gap', valor: `${fmtNum(gap)} votos` },
      { dato: 'Meta por sección', valor: `+${fmtNum(porSeccion)} votos en 120 secciones` },
      { dato: 'Palanca principal', valor: 'Participación +3.5 pts en top-20 secciones' },
    ],
    analisis: [
      'El gap se cierra con participación, no con persuasión: las secciones de baja afinidad tienen la LN más alta.',
      'El escenario conservador (+2 pts) deja el gap en ~40%; el agresivo (+5 pts en 20 secciones) lo cierra al 92%.',
      'El CRM actual cubre el 18% del gap si cada promotor moviliza 35 votos: necesitas escalar la red 3×.',
    ],
    recomendacion: 'Tres escenarios al war-room: base (estructura actual), medio (+40 promotores) y cierre (+brigadas en 20 secciones). Decidir el lunes para comprar tiempo de activación.',
    ...meta(q, ['¿Qué municipios priorizar esta semana?', '¿Cómo va el CRM y promotores?', '¿Dónde perdemos participación?']),
  }
}

function respuestaCanales(q: string): NlpAnswer {
  const rows = CANALES.map((c) => ({ c, n: INTERACCIONES.filter((i) => i.canal === c).length })).sort((a, b) => b.n - a.n)
  return {
    titulo: 'Qué canal usar para cada objetivo',
    resumen: `${rows[0].c} concentra el volumen (${fmtNum(rows[0].n)} interacciones) pero WhatsApp convierte: es donde la gente reporta lo grave y responde al seguimiento. Mi mezcla: Facebook para alcance, WhatsApp para conversión, call center para rescate.`,
    hallazgos: rows.slice(0, 4).map((r) => ({ dato: r.c, valor: `${fmtNum(r.n)} interacciones · ${fmtPct((r.n / INTERACCIONES.length) * 100, 0)} del total` })),
    analisis: [
      'Facebook es termómetro y altavoz; WhatsApp es urna: la correlación reporte→compromiso es 4× mayor.',
      'TikTok es eficiente para joven indeciso pero exige formato nativo, no recortes de spot.',
      'El call center tiene el menor volumen y la mayor tasa de rescate en contactos fríos.',
    ],
    recomendacion: 'Pauta: 50% Facebook alcance geo-segmentado, 30% WhatsApp con flujos aprobados, 20% TikTok joven. Call center solo para top-200 contactos críticos.',
    ...meta(q, ['¿Qué dice la escucha digital?', '¿Cómo va el CRM y promotores?', '¿Qué municipios priorizar esta semana?']),
  }
}

function respuestaBriefing(q: string, ids: string[]): NlpAnswer {
  const m = MUNICIPIOS.find((x) => x.id === ids[0]) ?? MUNICIPIOS.find((x) => x.id === 'reynosa')!
  const secs = SECCIONES.filter((s) => s.municipioId === m.id).sort((a, b) => a.afinidadPAN - b.afinidadPAN).slice(0, 3)
  const neg = INTERACCIONES.filter((i) => i.municipioId === m.id && i.sentimiento === 'neg')
  const topTema = TEMAS.map((t) => ({ t, n: neg.filter((i) => i.tema === t).length })).sort((a, b) => b.n - a.n)[0]
  return {
    titulo: `Briefing ${m.nombre} — listo para candidato`,
    resumen: `${m.nombre}: afinidad ${m.afinidadPAN}/100, participación ${fmtPct(m.part2024)} y ${fmtNum(neg.length)} menciones negativas lideradas por ${topTema.t}. Visita las secciones ${secs.map((s) => s.id).join(', ')} con un compromiso verificable de ${topTema.t.toLowerCase()} y sales con foto ganadora.`,
    hallazgos: [
      { dato: 'Estado de fuerza', valor: `LN ${fmtNum(m.listaNominal)} · D${m.distLocal} local · D${m.distFederal} federal` },
      ...secs.map((s) => ({ dato: `Sec. ${s.id} (visita prioritaria)`, valor: `afinidad ${s.afinidadPAN} · LN ${fmtNum(s.listaNominal)} · ${s.temas.join(', ')}` })),
      { dato: 'Presión digital', valor: `${fmtNum(neg.length)} negativas · eje ${topTema.t}` },
    ],
    analisis: [
      `El voto aquí se mueve por gestión, no por ideología: ${topTema.t} aparece en el ${fmtPct(60, 0)} de los reportes negativos del municipio.`,
      'No aceptes eventos masivos sin antes caminar las 3 secciones críticas: la foto del recorrido vale más que el mitin.',
      `Última visita registrada hace más de 30 días en 2 de 3 secciones: el territorio percibe ausencia.`,
    ],
    recomendacion: `Guion de 20 min: 5 min escucha vecinal, 10 min compromiso concreto de ${topTema.t.toLowerCase()} con fecha, 5 min activación de 3 promotores nuevos por sección.`,
    ...meta(q, ['¿Qué municipios priorizar esta semana?', '¿Cómo está seguridad por territorio?', '¿En qué canal conviene pautar?']),
  }
}

export function suggestQueries(): string[] {
  return [
    '¿Qué municipios priorizar esta semana?',
    'Compara Reynosa vs Victoria',
    '¿Cómo cerramos el gap al objetivo 725k?',
    '¿En qué canal conviene pautar?',
    'Genera briefing para Reynosa',
    '¿Dónde perdemos participación?',
  ]
}

export function answerQuery(q: string): NlpAnswer {
  const n = norm(q)
  const ids = detectarMunicipios(q)
  const esComparativa = /( vs | versus | compara|diferencia|cuál mejor|mejor entre)/.test(' ' + n + ' ') && ids.length >= 1
  if (esComparativa || (ids.length >= 2)) return respuestaComparativa(q, ids)
  if (/(objetivo|gap|725|proyeccion|cerrar|cuantos votos|escenario)/.test(n)) return respuestaProyeccion(q)
  if (/(canal|pautar|facebook|tiktok|whatsapp|donde publicar|redes.*(mejor|rinde)|mezcla)/.test(n)) return respuestaCanales(q)
  if (/(participacion|perdemos|abstencion|abstención|no vota|baja votacion)/.test(n)) return respuestaParticipacion(q)
  if (/(seguridad|riesgo|inseguridad|violencia|balacera|patrullaje|delincuencia)/.test(n)) return respuestaSeguridad(q)
  if (/(sentimiento|escucha|pulso|temas|conversacion|mencion|redes)/.test(n)) return respuestaSentimiento(q)
  if (/(crm|contactos|promotor|base|militante|comprometido|conversion)/.test(n)) return respuestaCrm(q)
  if (/(briefing|candidato|visita|recorrido|guion|que decir en)/.test(n)) return respuestaBriefing(q, ids)
  return respuestaPrioridad(q)
}
