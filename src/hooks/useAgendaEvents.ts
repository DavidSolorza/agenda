/**
 * Hook para cargar y mutar eventos de la agenda en un rango.
 */

import { useState, useCallback, useEffect } from 'react'
import type { EventEntity, CreateEventInput, UpdateEventInput, EventDateRange } from '@/types'
import { useEventService } from './useEventService'
import { expandRecurringEvents } from '@/utils/recurrenceUtils'

export function useAgendaEvents(range: EventDateRange | null) {
  const service = useEventService()
  const [events, setEvents] = useState<EventEntity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const all = await service.listAll()
      if (!range) {
        setEvents(all.sort((a, b) => a.start.localeCompare(b.start)))
      } else {
        const expanded = expandRecurringEvents(all, range)
        setEvents(expanded)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar eventos')
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [service, range?.start, range?.end])

  useEffect(() => {
    load()
  }, [load])

  const create = useCallback(
    async (input: CreateEventInput) => {
      const created = await service.create(input)
      await load()
      return created
    },
    [service, load]
  )

  const update = useCallback(
    async (input: UpdateEventInput) => {
      const updated = await service.update(input)
      await load()
      return updated
    },
    [service, load]
  )

  const remove = useCallback(
    async (id: string) => {
      const ok = await service.delete(id)
      await load()
      return ok
    },
    [service, load]
  )

  return { events, loading, error, create, update, remove, refresh: load }
}
