import { useState, useMemo, useCallback } from 'react'
import type { ViewMode } from '@/types'
import type { CreateEventInput, UpdateEventInput } from '@/types'
import { startOfWeek, addDays, toDateKey } from '@/utils/dateUtils'
import { Header } from '@/components/Header'
import { WeekGrid } from '@/components/WeekGrid'
import { MonthGrid } from '@/components/MonthGrid'
import { EventFormModal } from '@/components/EventFormModal'
import { EventsList } from '@/components/EventsList'
import { useAgendaEvents } from '@/hooks/useAgendaEvents'
import { pastel } from '@/theme/colors'
import './App.css'

function formatWeekLabel(weekStart: Date): string {
  const end = addDays(weekStart, 6)
  const a = weekStart.getDate()
  const b = end.getDate()
  const monthA = weekStart.toLocaleDateString('es-ES', { month: 'short' })
  const monthB = end.toLocaleDateString('es-ES', { month: 'short' })
  const year = weekStart.getFullYear()
  if (monthA === monthB) return `${a} – ${b} ${monthA} ${year}`
  return `${a} ${monthA} – ${b} ${monthB} ${year}`
}

function formatDayLabel(date: string): string {
  return new Date(date + 'T12:00:00').toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatMonthLabel(year: number, month: number): string {
  const d = new Date(year, month, 1)
  return d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
}

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('semana')
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))
  const [focusedDate, setFocusedDate] = useState(() => toDateKey(new Date()))
  const [modalOpen, setModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<import('@/types').EventEntity | null>(null)
  const [newEventSlot, setNewEventSlot] = useState<{ date: string; hour: number }>({ date: focusedDate, hour: 9 })

  const range = useMemo(() => {
    if (viewMode === 'eventos') return null
    if (viewMode === 'mes') {
      const d = new Date(weekStart)
      const start = new Date(d.getFullYear(), d.getMonth(), 1)
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
      return { start: start.toISOString(), end: end.toISOString() }
    }
    const start = viewMode === 'dia' ? new Date(focusedDate + 'T00:00:00') : weekStart
    const days = viewMode === 'dia' ? 1 : 7
    const end = addDays(start, days)
    end.setHours(23, 59, 59, 999)
    return {
      start: start.toISOString(),
      end: end.toISOString(),
    }
  }, [viewMode, weekStart, focusedDate])

  const { events, create, update, remove, loading, error } = useAgendaEvents(range)

  const handlePrev = useCallback(() => {
    if (viewMode === 'mes') {
      setWeekStart((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
    } else {
      setWeekStart((d) => addDays(d, -7))
      setFocusedDate((d) => toDateKey(addDays(new Date(d + 'T12:00:00'), -7)))
    }
  }, [viewMode])

  const handleNext = useCallback(() => {
    if (viewMode === 'mes') {
      setWeekStart((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
    } else {
      setWeekStart((d) => addDays(d, 7))
      setFocusedDate((d) => toDateKey(addDays(new Date(d + 'T12:00:00'), 7)))
    }
  }, [viewMode])

  const handleToday = useCallback(() => {
    const today = new Date()
    setWeekStart(startOfWeek(today))
    setFocusedDate(toDateKey(today))
  }, [])

  const headerLabel = useMemo(() => {
    if (viewMode === 'eventos') return 'Todos los eventos'
    if (viewMode === 'semana') return formatWeekLabel(weekStart)
    if (viewMode === 'dia') return formatDayLabel(focusedDate)
    return formatMonthLabel(weekStart.getFullYear(), weekStart.getMonth())
  }, [viewMode, weekStart, focusedDate])

  const handleNewEvent = useCallback(() => {
    setEditingEvent(null)
    setNewEventSlot({ date: focusedDate, hour: 9 })
    setModalOpen(true)
  }, [focusedDate])

  const handleSlotClick = useCallback((date: string, hour: number) => {
    setEditingEvent(null)
    setNewEventSlot({ date, hour })
    setModalOpen(true)
  }, [])

  const handleEventClick = useCallback(
    (event: import('@/types').EventEntity) => {
      const base = event.parentId ? events.find((e) => e.id === event.parentId) : event
      setEditingEvent(base ?? event)
      setModalOpen(true)
    },
    [events]
  )

  const handleModalSubmit = useCallback(
    async (input: CreateEventInput | UpdateEventInput) => {
      if ('id' in input && input.id) {
        await update(input)
      } else {
        await create(input as CreateEventInput)
      }
      setModalOpen(false)
      setEditingEvent(null)
    },
    [create, update]
  )

  const handleDeleteEvent = useCallback(
    async (id: string) => {
      await remove(id)
      setModalOpen(false)
      setEditingEvent(null)
    },
    [remove]
  )

  const handleDayClickFromMonth = useCallback((date: string) => {
    setFocusedDate(date)
    setViewMode('dia')
    setWeekStart(startOfWeek(new Date(date + 'T12:00:00')))
  }, [])

  const weekStartForGrid = viewMode === 'dia' ? new Date(focusedDate + 'T00:00:00') : weekStart
  const daysCount = viewMode === 'dia' ? 1 : 7

  return (
    <div className="app" style={{ ['--pastel-bg' as string]: pastel.background }}>
      <Header
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        weekLabel={headerLabel}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        onNewEvent={handleNewEvent}
      />
      <main className="app-main">
        {loading ? (
          <div style={{ margin: '0.75rem auto', maxWidth: 960, padding: '0 1rem', color: '#7a756e' }}>
            Cargando…
          </div>
        ) : null}
        {error ? (
          <div style={{ margin: '0.75rem auto', maxWidth: 960, padding: '0 1rem', color: '#8b3d4c' }}>
            Error: {error}
          </div>
        ) : null}
        {viewMode === 'eventos' ? (
          <EventsList onEventClick={handleEventClick} />
        ) : viewMode === 'mes' ? (
          <MonthGrid
            year={weekStart.getFullYear()}
            month={weekStart.getMonth()}
            events={events}
            onDayClick={handleDayClickFromMonth}
          />
        ) : (
          <WeekGrid
            weekStart={weekStartForGrid}
            daysCount={daysCount}
            events={events}
            onEventClick={handleEventClick}
            onSlotClick={handleSlotClick}
          />
        )}
      </main>
      <EventFormModal
        isOpen={modalOpen}
        editEvent={editingEvent}
        defaultDate={newEventSlot.date}
        defaultHour={newEventSlot.hour}
        onClose={() => {
          setModalOpen(false)
          setEditingEvent(null)
        }}
        onSubmit={handleModalSubmit}
        onDelete={handleDeleteEvent}
      />
    </div>
  )
}
