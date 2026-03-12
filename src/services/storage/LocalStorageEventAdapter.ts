/**
 * Implementación de IEventStorage usando localStorage.
 * SRP: solo persiste eventos en localStorage.
 */

import type { IEventStorage } from './IEventStorage'
import type { EventEntity, CreateEventInput, UpdateEventInput } from '@/types'

const STORAGE_KEY = 'agenda-pastel-events'

function loadEvents(): EventEntity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveEvents(events: EventEntity[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export class LocalStorageEventAdapter implements IEventStorage {
  async getAll(): Promise<EventEntity[]> {
    return loadEvents()
  }

  async getById(id: string): Promise<EventEntity | null> {
    const events = loadEvents()
    return events.find((e) => e.id === id) ?? null
  }

  async create(data: CreateEventInput): Promise<EventEntity> {
    const events = loadEvents()
    const now = new Date().toISOString()
    const entity: EventEntity = {
      id: generateId(),
      title: data.title,
      description: data.description,
      start: data.start,
      end: data.end,
      category: data.category,
      color: data.color,
      createdAt: now,
      updatedAt: now,
    }
    events.push(entity)
    saveEvents(events)
    return entity
  }

  async update(data: UpdateEventInput): Promise<EventEntity | null> {
    const events = loadEvents()
    const index = events.findIndex((e) => e.id === data.id)
    if (index === -1) return null
    const current = events[index]
    const updated: EventEntity = {
      ...current,
      ...data,
      id: current.id,
      createdAt: current.createdAt,
      updatedAt: new Date().toISOString(),
    }
    events[index] = updated
    saveEvents(events)
    return updated
  }

  async delete(id: string): Promise<boolean> {
    const events = loadEvents()
    const filtered = events.filter((e) => e.id !== id)
    if (filtered.length === events.length) return false
    saveEvents(filtered)
    return true
  }
}
