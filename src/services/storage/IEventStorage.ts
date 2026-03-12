/**
 * Contrato de persistencia de eventos (DIP: dependemos de abstracción).
 */

import type { EventEntity, CreateEventInput, UpdateEventInput } from '@/types'

export interface IEventStorage {
  getAll(): Promise<EventEntity[]>
  getById(id: string): Promise<EventEntity | null>
  create(data: CreateEventInput): Promise<EventEntity>
  update(data: UpdateEventInput): Promise<EventEntity | null>
  delete(id: string): Promise<boolean>
}
