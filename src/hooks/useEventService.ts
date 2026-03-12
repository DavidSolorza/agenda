/**
 * Hook que expone EventService inyectado. Facilita testing (inyección).
 */

import { useMemo } from 'react'
import { EventService } from '@/services/EventService'
import { SupabaseEventAdapter } from '@/services/storage/SupabaseEventAdapter'

export function useEventService(): EventService {
  return useMemo(() => {
    const storage = new SupabaseEventAdapter()
    return new EventService(storage)
  }, [])
}
