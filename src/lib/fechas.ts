const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
] as const

/** Devuelve la fecha de hoy en formato YYYY-MM-DD (hora local). */
export function hoy(): string {
  return claveFecha(new Date())
}

/** Convierte un Date a YYYY-MM-DD usando la hora local del dispositivo. */
export function claveFecha(fecha: Date): string {
  const y = fecha.getFullYear()
  const m = String(fecha.getMonth() + 1).padStart(2, '0')
  const d = String(fecha.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Nombre del mes en minúsculas (enero, febrero…). */
export function nombreMes(mes: number): string {
  return MESES[mes] ?? ''
}

/** Nombre del mes con primera letra en mayúscula. */
export function nombreMesTitulo(mes: number): string {
  const n = nombreMes(mes)
  return n ? n[0].toUpperCase() + n.slice(1) : ''
}

/** Rango de la semana que contiene la fecha dada (lunes–domingo). */
export function rangoSemana(fecha: Date = new Date()): { desde: string; hasta: string } {
  const dia = fecha.getDay() // 0=dom, 1=lun…
  const lunes = new Date(fecha)
  lunes.setDate(fecha.getDate() - ((dia + 6) % 7))
  const domingo = new Date(lunes)
  domingo.setDate(lunes.getDate() + 6)
  return { desde: claveFecha(lunes), hasta: claveFecha(domingo) }
}

/** Rango del mes que contiene la fecha dada. */
export function rangoMes(fecha: Date = new Date()): { desde: string; hasta: string } {
  const y = fecha.getFullYear()
  const m = fecha.getMonth()
  return {
    desde: claveFecha(new Date(y, m, 1)),
    hasta: claveFecha(new Date(y, m + 1, 0)),
  }
}

/**
 * Formatea una fecha YYYY-MM-DD o ISO para mostrar en UI.
 * Ejemplo: "27 junio 2026"
 */
export function formatearFecha(fechaStr: string): string {
  // Agregar T12:00:00 evita desfases por zona horaria al parsear YYYY-MM-DD
  const fecha = new Date(fechaStr.includes('T') ? fechaStr : `${fechaStr}T12:00:00`)
  return `${fecha.getDate()} ${nombreMes(fecha.getMonth())} ${fecha.getFullYear()}`
}

/**
 * Formatea una fecha ISO completa a hora corta local.
 * Ejemplo: "8:15 a. m."
 */
export function formatearHora(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-MX', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Días transcurridos desde una fecha ISO hasta hoy.
 * Útil para la regla de respaldo de 7 días.
 */
export function diasDesde(iso: string): number {
  const ms = Date.now() - new Date(iso).getTime()
  return Math.floor(ms / (1000 * 60 * 60 * 24))
}
