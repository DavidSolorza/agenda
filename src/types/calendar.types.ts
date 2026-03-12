/**
 * Tipos para la vista del calendario.
 * SRP: solo responsabilidad de tipos de calendario.
 */

export type ViewMode = 'mes' | 'eventos'

export interface DaySlot {
  date: string
  hour: number
  label: string
}

export interface WeekDay {
  date: string
  dayName: string
  dayNumber: number
  month: string
  isToday: boolean
}
