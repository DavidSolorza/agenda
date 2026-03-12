import { useState, useEffect } from 'react'
import type { EventEntity, CreateEventInput, UpdateEventInput, EventCategory, EventRecurrenceRule } from '@/types'
import { categoryLabels, pastel } from '@/theme/colors'
import './EventFormModal.css'

interface EventFormModalProps {
  isOpen: boolean
  editEvent: EventEntity | null
  defaultDate: string
  defaultHour: number
  onClose: () => void
  onSubmit: (input: CreateEventInput | UpdateEventInput) => Promise<void> | void
  onDelete?: (id: string) => void
}

function toLocalDateTime(dateStr: string, hour: number): string {
  const d = new Date(dateStr)
  d.setHours(hour, 0, 0, 0)
  return d.toISOString().slice(0, 16)
}

function toLocalDate(dateStr: string): string {
  return dateStr.slice(0, 10)
}

function fromISOToLocal(iso: string): string {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  const h = d.getHours().toString().padStart(2, '0')
  const min = d.getMinutes().toString().padStart(2, '0')
  return `${y}-${m}-${day}T${h}:${min}`
}

const CATEGORIES = (Object.keys(categoryLabels) as EventCategory[])

export function EventFormModal({
  isOpen,
  editEvent,
  defaultDate,
  defaultHour,
  onClose,
  onSubmit,
  onDelete,
}: EventFormModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [allDay, setAllDay] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [repeatMonthly, setRepeatMonthly] = useState(false)
  const [untilDate, setUntilDate] = useState<string>('')
  const [category, setCategory] = useState<EventCategory>('personal')
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    setSubmitError(null)
    if (editEvent) {
      setTitle(editEvent.title)
      setDescription(editEvent.description)
      const isAllDay = Boolean(editEvent.allDay)
      setAllDay(isAllDay)
      if (isAllDay) {
        setStartDate(toLocalDate(editEvent.start))
      } else {
        setStart(fromISOToLocal(editEvent.start))
        setEnd(fromISOToLocal(editEvent.end))
      }
      const r = editEvent.recurrence ?? null
      setRepeatMonthly(Boolean(r))
      setUntilDate(r?.untilDate ? r.untilDate : '')
      setCategory(editEvent.category)
    } else {
      setTitle('')
      setDescription('')
      setStart(toLocalDateTime(defaultDate, defaultHour))
      setEnd(toLocalDateTime(defaultDate, defaultHour + 1))
      setAllDay(false)
      setStartDate(defaultDate)
      setRepeatMonthly(false)
      setUntilDate('')
      setCategory('personal')
    }
  }, [editEvent, defaultDate, defaultHour, isOpen])

  useEffect(() => {
    if (allDay) {
      // Mantener startDate razonable si el usuario activa "todo el día"
      setStartDate((d) => d || defaultDate)
    } else {
      setStart((s) => s || toLocalDateTime(defaultDate, defaultHour))
      setEnd((e) => e || toLocalDateTime(defaultDate, defaultHour + 1))
    }
  }, [allDay, defaultDate, defaultHour])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    const recurrence: EventRecurrenceRule | null = repeatMonthly
      ? {
          freq: 'monthly',
          intervalMonths: 1,
          byMonthDay: allDay ? Number(startDate.slice(8, 10)) : new Date(start).getDate(),
          fallback: 'last_day',
          untilDate: untilDate ? untilDate : null,
        }
      : null

    const startISO = allDay ? `${startDate}T00:00:00` : new Date(start).toISOString()
    const endISO = allDay ? `${startDate}T23:59:59` : new Date(end).toISOString()
    try {
      if (editEvent) {
        await onSubmit({
          id: editEvent.id,
          title,
          description,
          start: startISO,
          end: endISO,
          category,
          allDay,
          recurrence,
        })
      } else {
        await onSubmit({
          title,
          description,
          start: startISO,
          end: endISO,
          category,
          allDay,
          recurrence,
        })
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'No se pudo guardar el evento')
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          ['--pastel-surface' as string]: pastel.surface,
          ['--pastel-border' as string]: pastel.border,
          ['--pastel-accent' as string]: pastel.accent,
        }}
      >
        <div className="modal-header">
          <h2>{editEvent ? 'Editar evento' : 'Nuevo evento'}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          {submitError ? <div className="form-error" role="alert">{submitError}</div> : null}
          <label>
            Título
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Ej. Reunión equipo"
              autoFocus
            />
          </label>
          <label>
            Descripción
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Opcional"
              rows={2}
            />
          </label>
          <label className="checkbox-row">
            <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} />
            <span>Todo el día</span>
          </label>
          <div className="form-row">
            {allDay ? (
              <label>
                Fecha
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
              </label>
            ) : (
              <>
                <label>
                  Inicio
                  <input
                    type="datetime-local"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    required
                  />
                </label>
                <label>
                  Fin
                  <input
                    type="datetime-local"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                    required
                  />
                </label>
              </>
            )}
          </div>
          <label className="checkbox-row">
            <input type="checkbox" checked={repeatMonthly} onChange={(e) => setRepeatMonthly(e.target.checked)} />
            <span>Repetir cada mes (si no existe el día, cae al último)</span>
          </label>
          {repeatMonthly ? (
            <label>
              Repetir hasta (opcional)
              <input type="date" value={untilDate} onChange={(e) => setUntilDate(e.target.value)} />
            </label>
          ) : null}
          <label>
            Categoría
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as EventCategory)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {categoryLabels[cat]}
                </option>
              ))}
            </select>
          </label>
          <div className="modal-actions">
            {editEvent && onDelete ? (
              <button
                type="button"
                className="btn-danger"
                onClick={() => {
                  onDelete(editEvent.id)
                  onClose()
                }}
              >
                Eliminar
              </button>
            ) : null}
            <span className="modal-actions__spacer" />
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {editEvent ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
