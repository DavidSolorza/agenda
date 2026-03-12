/**
 * Tipos e interfaces para eventos de la agenda.
 * ISP: interfaces pequeñas y específicas.
 */

export type EventCategory = 'trabajo' | 'personal' | 'salud' | 'ocio' | 'otro'

export type RecurrenceFrequency = 'monthly'

export type RecurrenceFallback = 'last_day' | 'skip'

export interface EventRecurrenceRule {
  freq: RecurrenceFrequency
  intervalMonths: number
  byMonthDay: number
  fallback: RecurrenceFallback
  /** Fecha (YYYY-MM-DD) inclusive; null/undefined = sin límite */
  untilDate?: string | null
}

export interface EventEntity {
  id: string
  title: string
  description: string
  start: string
  end: string
  category: EventCategory
  color?: string
  allDay?: boolean
  /** Si es una ocurrencia generada, apunta al evento base. */
  parentId?: string | null
  /** Regla de repetición del evento base (si aplica). */
  recurrence?: EventRecurrenceRule | null
  createdAt: string
  updatedAt: string
}

export interface CreateEventInput {
  title: string
  description: string
  start: string
  end: string
  category: EventCategory
  color?: string
  allDay?: boolean
  recurrence?: EventRecurrenceRule | null
}

export interface UpdateEventInput extends Partial<CreateEventInput> {
  id: string
}

export interface EventDateRange {
  start: string
  end: string
}
