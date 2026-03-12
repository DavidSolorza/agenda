import { useState, useMemo, useCallback } from 'react'
import type { ViewMode } from '@/types'
import type { CreateEventInput, UpdateEventInput } from '@/types'
import { startOfWeek, toDateKey } from '@/utils/dateUtils'
import { Header } from '@/components/Header'
import { MonthGrid } from '@/components/MonthGrid'
import { EventFormModal } from '@/components/EventFormModal'
import { EventsList } from '@/components/EventsList'
import { useAgendaEvents } from '@/hooks/useAgendaEvents'
import { pastel } from '@/theme/colors'
import './App.css'

function formatMonthLabel(year: number, month: number): string {
  const d = new Date(year, month, 1)
  return d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
}

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('mes')
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))
  const [focusedDate, setFocusedDate] = useState(() => toDateKey(new Date()))
  const [modalOpen, setModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<import('@/types').EventEntity | null>(null)
  const [newEventSlot, setNewEventSlot] = useState<{ date: string; hour: number }>({ date: focusedDate, hour: 9 })

  const range = useMemo(() => {
    if (viewMode === 'eventos') return null
    const d = new Date(weekStart)
    const start = new Date(d.getFullYear(), d.getMonth(), 1)
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
    return { start: start.toISOString(), end: end.toISOString() }
  }, [viewMode, weekStart, focusedDate])

  const { events, create, update, remove, loading, error } = useAgendaEvents(range)

  const handlePrev = useCallback(() => {
    setWeekStart((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  }, [])

  const handleNext = useCallback(() => {
    setWeekStart((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
  }, [])

  const handleToday = useCallback(() => {
    const today = new Date()
    setWeekStart(startOfWeek(today))
    setFocusedDate(toDateKey(today))
  }, [])

  const headerLabel = useMemo(() => {
    if (viewMode === 'eventos') return 'Todos los eventos'
    return formatMonthLabel(weekStart.getFullYear(), weekStart.getMonth())
  }, [viewMode, weekStart, focusedDate])

  const handleNewEvent = useCallback(() => {
    setEditingEvent(null)
    setNewEventSlot({ date: focusedDate, hour: 9 })
    setModalOpen(true)
  }, [focusedDate])

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

  const handleDayClickFromMonth = useCallback(
    (date: string) => {
      const dayStart = `${date}T00:00:00`
      const dayEnd = `${date}T23:59:59`
      const dayEvents = events
        .filter((e) => e.start < dayEnd && e.end > dayStart)
        .sort((a, b) => a.start.localeCompare(b.start))

      if (dayEvents.length >= 1) {
        handleEventClick(dayEvents[0])
        return
      }

      setFocusedDate(date)
      setViewMode('mes')
      setWeekStart(startOfWeek(new Date(date + 'T12:00:00')))
    },
    [events, handleEventClick]
  )

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
        ) : (
          <MonthGrid
            year={weekStart.getFullYear()}
            month={weekStart.getMonth()}
            events={events}
            onDayClick={handleDayClickFromMonth}
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
