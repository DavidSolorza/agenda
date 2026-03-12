import { useCallback, useEffect, useState } from 'react'
import type { EventEntity } from '@/types'
import { useEventService } from './useEventService'

export function useBaseEvents() {
  const service = useEventService()
  const [events, setEvents] = useState<EventEntity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const all = await service.listAll()
      setEvents(all.sort((a, b) => a.start.localeCompare(b.start)))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar eventos')
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [service])

  useEffect(() => {
    load()
  }, [load])

  return { events, loading, error, refresh: load }
}

