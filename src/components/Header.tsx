import type { ViewMode } from '@/types'
import { pastel } from '@/theme/colors'
import './Header.css'

interface HeaderProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  weekLabel: string
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onNewEvent: () => void
}

export function Header({
  viewMode,
  onViewModeChange,
  weekLabel,
  onPrev,
  onNext,
  onToday,
  onNewEvent,
}: HeaderProps) {
  return (
    <header className="agenda-header" style={{ ['--pastel-bg' as string]: pastel.surface, ['--pastel-border' as string]: pastel.border }}>
      <div className="agenda-header__brand">
        <span className="agenda-header__logo">◇</span>
        <h1 className="agenda-header__title">Nuestros Planes</h1>
      </div>
      <div className="agenda-header__nav">
        {viewMode === 'mes' ? (
          <>
            <button type="button" className="agenda-header__btn" onClick={onPrev} aria-label="Anterior">
              ‹
            </button>
            <button type="button" className="agenda-header__btn today" onClick={onToday}>
              Hoy
            </button>
            <button type="button" className="agenda-header__btn" onClick={onNext} aria-label="Siguiente">
              ›
            </button>
            <span className="agenda-header__range">{weekLabel}</span>
          </>
        ) : (
          <span className="agenda-header__range">Todos los eventos</span>
        )}
      </div>
      <div className="agenda-header__views">
        {(['mes', 'eventos'] as ViewMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            className={`agenda-header__view ${viewMode === mode ? 'active' : ''}`}
            onClick={() => onViewModeChange(mode)}
          >
            {mode === 'mes' ? 'Mes' : 'Eventos'}
          </button>
        ))}
      </div>
      <button type="button" className="agenda-header__add" onClick={onNewEvent}>
        + Nuevo evento
      </button>
    </header>
  )
}
