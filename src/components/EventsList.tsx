import type { EventEntity } from '@/types'
import { useBaseEvents } from '@/hooks/useBaseEvents'
import { pastel } from '@/theme/colors'
import './EventsList.css'

function formatWhen(e: EventEntity) {
  const start = new Date(e.start)
  const end = new Date(e.end)
  if (e.allDay) {
    return start.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
  }
  const day = start.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short' })
  const a = start.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  const b = end.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  return `${day} · ${a}–${b}`
}

export function EventsList({
  onEventClick,
}: {
  onEventClick: (event: EventEntity) => void
}) {
  const { events, loading, error, refresh } = useBaseEvents()

  return (
    <section className="events-list" style={{ ['--pastel-border' as string]: pastel.border }}>
      <div className="events-list__header">
        <div>
          <h2 className="events-list__title">Eventos</h2>
          <div className="events-list__subtitle">Lista de eventos guardados (los recurrentes se editan desde el evento base).</div>
        </div>
        <button type="button" className="events-list__refresh" onClick={refresh}>
          Recargar
        </button>
      </div>

      {loading ? <div className="events-list__state">Cargando…</div> : null}
      {error ? <div className="events-list__error">Error: {error}</div> : null}

      {!loading && !error && events.length === 0 ? (
        <div className="events-list__state">No hay eventos todavía.</div>
      ) : null}

      <div className="events-list__items">
        {events.map((e) => (
          <button key={e.id} type="button" className="events-list__item" onClick={() => onEventClick(e)}>
            <div className="events-list__row">
              <div className="events-list__name">{e.title}</div>
              {e.recurrence ? <div className="events-list__badge">Mensual</div> : null}
              {e.allDay ? <div className="events-list__badge subtle">Todo el día</div> : null}
            </div>
            <div className="events-list__meta">{formatWhen(e)}</div>
            {e.description ? <div className="events-list__description">{e.description}</div> : null}
          </button>
        ))}
      </div>
    </section>
  )
}

