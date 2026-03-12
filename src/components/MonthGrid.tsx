import type { EventEntity } from '@/types'
import { getMonthDaySlots } from '@/utils/dateUtils'
import { pastel } from '@/theme/colors'
import './MonthGrid.css'

interface MonthGridProps {
  year: number
  month: number
  events: EventEntity[]
  onDayClick: (date: string) => void
}

function eventsOnDate(events: EventEntity[], date: string): EventEntity[] {
  const dayStart = `${date}T00:00:00`
  const dayEnd = `${date}T23:59:59`
  return events
    .filter((e) => e.start < dayEnd && e.end > dayStart)
    .sort((a, b) => a.start.localeCompare(b.start))
}

export function MonthGrid({ year, month, events, onDayClick }: MonthGridProps) {
  const slots = getMonthDaySlots(year, month)
  const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

  return (
    <div className="month-grid" style={{ ['--pastel-border' as string]: pastel.border }}>
      <div className="month-grid__weekday-headers">
        {dayNames.map((name) => (
          <div key={name} className="month-grid__weekday">{name}</div>
        ))}
      </div>
      <div className="month-grid__cells">
        {slots.map((slot) => {
          const dayEvents = eventsOnDate(events, slot.date)
          const count = dayEvents.length
          const top = dayEvents.slice(0, 2)
          return (
            <button
              key={slot.date}
              type="button"
              className={`month-grid__cell ${slot.isCurrentMonth ? '' : 'other-month'} ${slot.isToday ? 'today' : ''}`}
              onClick={() => onDayClick(slot.date)}
            >
              <span className="month-grid__day-num">{slot.dayNumber}</span>
              {top.length ? (
                <div className="month-grid__events">
                  {top.map((e) => (
                    <div key={e.id} className="month-grid__event">
                      {e.title}
                    </div>
                  ))}
                  {count > top.length ? (
                    <div className="month-grid__more">+{count - top.length} más</div>
                  ) : null}
                </div>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
