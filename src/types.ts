// ── Tipos de dominio ──────────────────────────────────────────────────────────

export type EstadoGeneral = 'bien' | 'regular' | 'molestia' | 'mucho_dolor'

export type Lado = 'derecho' | 'izquierdo' | 'ambos' | 'no_aplica'

export type RigidezDuracion = 'nada' | '<15' | '15-30' | '30-60' | '>60'

export type Inflamacion = 'no' | 'poco' | 'si' | 'no_segura'

export type CalorEnrojecimiento = 'si' | 'no' | 'no_segura'

export type AlMoverse = 'mejoro' | 'empeoro' | 'igual'

export interface Registro {
  id: string              // crypto.randomUUID()
  fecha: string           // YYYY-MM-DD (único por día)
  estado_general: EstadoGeneral
  dolor_nivel?: number    // 0–10, solo si no fue "bien"
  zonas?: string[]
  lado?: Lado
  rigidez_duracion?: RigidezDuracion
  inflamacion?: Inflamacion
  calor_enrojecimiento?: CalorEnrojecimiento
  al_moverse?: AlMoverse
  factores?: string[]
  nota?: string
  creado_en: string       // ISO
  actualizado_en: string  // ISO
}

export interface Config {
  id: 'config'
  pin?: string                     // hash cosmético, no cifra
  onboarding_visto: boolean
  storage_persistido: boolean
  ultimo_respaldo?: string         // ISO
  primer_respaldo_ofrecido: boolean
  version_datos: number
}

// ── Constantes ────────────────────────────────────────────────────────────────

export const ZONAS = [
  'manos',
  'muñecas',
  'codos',
  'hombros',
  'cuello',
  'espalda',
  'cadera',
  'rodillas',
  'tobillos',
  'pies',
] as const

export type Zona = (typeof ZONAS)[number]

export const FACTORES = [
  'caminé mucho',
  'cargué cosas',
  'limpié',
  'ejercicio',
  'dormí mal',
  'estrés',
  'frío',
  'comí pesado o grasoso',
  'tomé alcohol',
  'comí mucha azúcar o dulces',
  'no sé',
] as const

export type Factor = (typeof FACTORES)[number]

// ── Labels de UI ──────────────────────────────────────────────────────────────

export const LABELS_ESTADO: Record<EstadoGeneral, string> = {
  bien: 'Bien',
  regular: 'Regular',
  molestia: 'Con molestia',
  mucho_dolor: 'Con mucho dolor',
}

export const LABELS_LADO: Record<Lado, string> = {
  derecho: 'Lado derecho',
  izquierdo: 'Lado izquierdo',
  ambos: 'Ambos lados',
  no_aplica: 'No aplica',
}

export const LABELS_RIGIDEZ: Record<RigidezDuracion, string> = {
  nada: 'Sin rigidez',
  '<15': 'Menos de 15 min',
  '15-30': '15 a 30 min',
  '30-60': '30 min a 1 hora',
  '>60': 'Más de 1 hora',
}

export const LABELS_INFLAMACION: Record<Inflamacion, string> = {
  no: 'No',
  poco: 'Un poco',
  si: 'Sí',
  no_segura: 'No estoy segura',
}

export const LABELS_CALOR: Record<CalorEnrojecimiento, string> = {
  si: 'Sí',
  no: 'No',
  no_segura: 'No estoy segura',
}

export const LABELS_AL_MOVERSE: Record<AlMoverse, string> = {
  mejoro: 'Mejoró al moverme',
  empeoro: 'Empeoró al moverme',
  igual: 'Se quedó igual',
}

// ── Colores del calendario (tabla de estados) ─────────────────────────────────

export const ESTADO_COLORES: Record<
  EstadoGeneral,
  { fondo: string; trazo: string }
> = {
  bien:        { fondo: '#EFEBFA', trazo: '#7A6FB8' },
  regular:     { fondo: '#E7E2F4', trazo: '#8C82BE' },
  molestia:    { fondo: '#F0E0EE', trazo: '#B07AA8' },
  mucho_dolor: { fondo: '#EBD6E8', trazo: '#9E5E96' },
}

// ── Versión de datos ──────────────────────────────────────────────────────────

export const VERSION_DATOS = 1
