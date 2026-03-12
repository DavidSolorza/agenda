import type { EventEntity } from '@/types'
import { categoryColors, categoryLabels, pastel } from '@/theme/colors'
import { eventTopPercent, eventHeightPercent } from '@/utils/dateUtils'
import './EventCard.css'

interface EventCardProps {
  event: EventEntity
  dayStart: string
  onClick: () => void
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

export function EventCard({ event, dayStart, onClick }: EventCardProps) {
  const isAllDay = Boolean(event.allDay)
  const top = isAllDay ? 0 : eventTopPercent(event.start, dayStart)
  const height = isAllDay ? 8 : Math.max(4, eventHeightPercent(event.start, event.end))
  const color = event.color ?? categoryColors[event.category] ?? pastel.lavender

  return (
    <button
      type="button"
      className="event-card"
      style={{
        top: `${top}%`,
        height: `${height}%`,
        ['--event-color' as string]: color,
      }}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    >
      <span className="event-card__time">
        {isAllDay ? 'Todo el día' : `${formatTime(event.start)} – ${formatTime(event.end)}`}
      </span>
      <span className="event-card__title">{event.title}</span>
      <span className="event-card__category">{categoryLabels[event.category]}</span>
    </button>
  )
}
