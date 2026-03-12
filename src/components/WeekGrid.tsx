import type { EventEntity } from '@/types'
import { getWeekDays, getHourSlots } from '@/utils/dateUtils'
import { EventCard } from './EventCard'
import { pastel } from '@/theme/colors'
import './WeekGrid.css'

interface WeekGridProps {
  weekStart: Date
  daysCount?: number
  events: EventEntity[]
  onEventClick: (event: EventEntity) => void
  onSlotClick: (date: string, hour: number) => void
}

export function WeekGrid({ weekStart, daysCount = 7, events, onEventClick, onSlotClick }: WeekGridProps) {
  const days = getWeekDays(weekStart, daysCount)
  const hours = getHourSlots()

  function eventsForDay(date: string) {
    const dayStart = `${date}T00:00:00`
    const dayEnd = `${date}T23:59:59`
    return events.filter((e) => e.start < dayEnd && e.end > dayStart)
  }

  return (
    <div
      className="week-grid"
      style={{
        ['--pastel-border' as string]: pastel.border,
        ['--days-count' as string]: String(days.length),
      }}
    >
      <div className="week-grid__corner" />
      <div className="week-grid__days">
        {days.map((d) => (
          <div
            key={d.date}
            className={`week-grid__day-header ${d.isToday ? 'today' : ''}`}
          >
            <span className="week-grid__day-name">{d.dayName}</span>
            <span className="week-grid__day-num">{d.dayNumber}</span>
            <span className="week-grid__month">{d.month}</span>
          </div>
        ))}
      </div>
      <div className="week-grid__body">
        <div className="week-grid__hours">
          {hours.map(({ hour, label }) => (
            <div key={hour} className="week-grid__hour-label">
              {label}
            </div>
          ))}
        </div>
        <div className="week-grid__columns">
          {days.map((d) => {
            const dayEvents = eventsForDay(d.date)
            return (
              <div key={d.date} className="week-grid__column">
                {hours.map(({ hour }) => (
                  <div
                    key={hour}
                    className="week-grid__slot"
                    onClick={() => onSlotClick(d.date, hour)}
                    role="gridcell"
                  />
                ))}
                {dayEvents.length === 0 ? (
                  <div className="week-grid__empty-label">Sin eventos</div>
                ) : null}
                {dayEvents.map((e) => (
                  <EventCard
                    key={e.id}
                    event={e}
                    dayStart={`${d.date}T00:00:00`}
                    onClick={() => onEventClick(e)}
                  />
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
