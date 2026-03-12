/**
 * Casos de uso de eventos. Depende de IEventStorage (DIP).
 * SRP: orquesta operaciones de eventos.
 */

import type { IEventStorage } from './storage/IEventStorage'
import type { EventEntity, CreateEventInput, UpdateEventInput, EventDateRange } from '@/types'

export class EventService {
  constructor(private readonly storage: IEventStorage) {}

  async listAll(): Promise<EventEntity[]> {
    return this.storage.getAll()
  }

  async listInRange(range: EventDateRange): Promise<EventEntity[]> {
    const all = await this.storage.getAll()
    return all.filter((e) => e.start >= range.start && e.end <= range.end)
  }

  async getById(id: string): Promise<EventEntity | null> {
    return this.storage.getById(id)
  }

  async create(input: CreateEventInput): Promise<EventEntity> {
    return this.storage.create(input)
  }

  async update(input: UpdateEventInput): Promise<EventEntity | null> {
    return this.storage.update(input)
  }

  async delete(id: string): Promise<boolean> {
    return this.storage.delete(id)
  }
}
