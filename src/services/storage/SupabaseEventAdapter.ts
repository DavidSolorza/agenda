import type { IEventStorage } from './IEventStorage'
import type { CreateEventInput, EventEntity, EventRecurrenceRule, UpdateEventInput } from '@/types'
import { getSupabase } from '@/services/supabaseClient'

type DbRecurrenceRow = {
  event_id: string
  freq: 'monthly'
  interval_months: number
  by_month_day: number
  fallback: 'last_day' | 'skip'
  until_date: string | null
}

type DbEventRow = {
  id: string
  title: string
  notes: string | null
  all_day: boolean
  start_at: string | null
  start_date: string | null
  duration_minutes: number
  timezone: string
  created_at: string
  updated_at: string
  event_recurrence?: Omit<DbRecurrenceRow, 'event_id'> | null
}

function toLocalDateTimeString(dateIsoYYYYMMDD: string, hh = 0, mm = 0, ss = 0) {
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${dateIsoYYYYMMDD}T${pad(hh)}:${pad(mm)}:${pad(ss)}`
}

function rowToEntity(row: DbEventRow): EventEntity {
  const allDay = row.all_day
  const start =
    allDay && row.start_date
      ? toLocalDateTimeString(row.start_date, 0, 0, 0)
      : (row.start_at ?? new Date(row.created_at).toISOString())

  const end =
    allDay && row.start_date
      ? toLocalDateTimeString(row.start_date, 23, 59, 59)
      : (() => {
          const s = row.start_at ? new Date(row.start_at) : new Date(row.created_at)
          const e = new Date(s.getTime() + (row.duration_minutes ?? 60) * 60_000)
          return e.toISOString()
        })()

  const recurrence: EventRecurrenceRule | null =
    row.event_recurrence
      ? {
          freq: row.event_recurrence.freq,
          intervalMonths: row.event_recurrence.interval_months,
          byMonthDay: row.event_recurrence.by_month_day,
          fallback: row.event_recurrence.fallback,
          untilDate: row.event_recurrence.until_date,
        }
      : null

  return {
    id: row.id,
    title: row.title,
    description: row.notes ?? '',
    start,
    end,
    category: 'personal',
    allDay,
    recurrence,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function inputToDbEvent(input: CreateEventInput | UpdateEventInput) {
  const allDay = Boolean(input.allDay)
  const start = input.start ? new Date(input.start) : null
  const end = input.end ? new Date(input.end) : null
  const durationMinutes =
    !allDay && start && end ? Math.max(1, Math.round((end.getTime() - start.getTime()) / 60_000)) : 60

  const startDate = allDay ? (input.start ? input.start.slice(0, 10) : null) : null

  return {
    title: input.title,
    notes: input.description ?? '',
    all_day: allDay,
    start_at: allDay ? null : input.start,
    start_date: allDay ? startDate : null,
    duration_minutes: durationMinutes,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC',
    updated_at: new Date().toISOString(),
  }
}

export class SupabaseEventAdapter implements IEventStorage {
  async getAll(): Promise<EventEntity[]> {
    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('events')
      .select(
        'id,title,notes,all_day,start_at,start_date,duration_minutes,timezone,created_at,updated_at'
      )
      .order('start_at', { ascending: true, nullsFirst: true })

    if (error) throw new Error(error.message)

    const events = (data as unknown as DbEventRow[]) ?? []
    const ids = events.map((e) => e.id)
    if (ids.length === 0) return []

    const { data: recData, error: recErr } = await supabase
      .from('event_recurrence')
      .select('event_id,freq,interval_months,by_month_day,fallback,until_date')
      .in('event_id', ids)
    if (recErr) throw new Error(recErr.message)

    const byEventId = new Map<string, DbRecurrenceRow>()
    for (const r of (recData as unknown as DbRecurrenceRow[]) ?? []) {
      byEventId.set(r.event_id, r)
    }

    return events.map((e) => {
      const r = byEventId.get(e.id)
      return rowToEntity({
        ...e,
        event_recurrence: r
          ? {
              freq: r.freq,
              interval_months: r.interval_months,
              by_month_day: r.by_month_day,
              fallback: r.fallback,
              until_date: r.until_date,
            }
          : null,
      })
    })
  }

  async getById(id: string): Promise<EventEntity | null> {
    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('events')
      .select(
        'id,title,notes,all_day,start_at,start_date,duration_minutes,timezone,created_at,updated_at'
      )
      .eq('id', id)
      .maybeSingle()

    if (error) throw new Error(error.message)
    if (!data) return null

    const { data: recData, error: recErr } = await supabase
      .from('event_recurrence')
      .select('event_id,freq,interval_months,by_month_day,fallback,until_date')
      .eq('event_id', id)
      .maybeSingle()
    if (recErr) throw new Error(recErr.message)

    const row = data as unknown as DbEventRow
    const rec = recData as unknown as DbRecurrenceRow | null
    return rowToEntity({
      ...row,
      event_recurrence: rec
        ? {
            freq: rec.freq,
            interval_months: rec.interval_months,
            by_month_day: rec.by_month_day,
            fallback: rec.fallback,
            until_date: rec.until_date,
          }
        : null,
    })
  }

  async create(input: CreateEventInput): Promise<EventEntity> {
    const supabase = getSupabase()

    const payload = {
      ...inputToDbEvent(input),
      created_at: new Date().toISOString(),
    }

    const { data: created, error } = await supabase
      .from('events')
      .insert(payload)
      .select('id')
      .single()

    if (error) throw new Error(error.message)
    const createdId = (created as { id: string }).id

    const recurrence = input.recurrence ?? null
    if (recurrence) {
      const { error: recErr } = await supabase.from('event_recurrence').insert({
        event_id: createdId,
        freq: recurrence.freq,
        interval_months: recurrence.intervalMonths,
        by_month_day: recurrence.byMonthDay,
        fallback: recurrence.fallback,
        until_date: recurrence.untilDate ?? null,
      })
      if (recErr) throw new Error(recErr.message)
    }

    const entity = await this.getById(createdId)
    if (!entity) throw new Error('No se pudo leer el evento recién creado')
    return entity
  }

  async update(input: UpdateEventInput): Promise<EventEntity | null> {
    const supabase = getSupabase()

    const payload = inputToDbEvent({
      title: input.title ?? '',
      description: input.description ?? '',
      start: input.start ?? new Date().toISOString(),
      end: input.end ?? new Date().toISOString(),
      category: input.category ?? 'personal',
      color: input.color,
      allDay: input.allDay,
      recurrence: input.recurrence ?? null,
    })

    const { error } = await supabase
      .from('events')
      .update(payload)
      .eq('id', input.id)

    if (error) throw new Error(error.message)

    if (input.recurrence === null) {
      const { error: delErr } = await supabase.from('event_recurrence').delete().eq('event_id', input.id)
      if (delErr) throw new Error(delErr.message)
    } else if (input.recurrence) {
      const r = input.recurrence
      const { error: upErr } = await supabase.from('event_recurrence').upsert({
        event_id: input.id,
        freq: r.freq,
        interval_months: r.intervalMonths,
        by_month_day: r.byMonthDay,
        fallback: r.fallback,
        until_date: r.untilDate ?? null,
      })
      if (upErr) throw new Error(upErr.message)
    }

    return this.getById(input.id)
  }

  async delete(id: string): Promise<boolean> {
    const supabase = getSupabase()

    const { error } = await supabase.from('events').delete().eq('id', id)
    if (error) throw new Error(error.message)
    return true
  }
}

