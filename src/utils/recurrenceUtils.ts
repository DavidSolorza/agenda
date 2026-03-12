import type { EventDateRange, EventEntity } from '@/types'

function lastDayOfMonth(year: number, monthIndex0: number) {
  return new Date(year, monthIndex0 + 1, 0).getDate()
}

function monthDiff(a: Date, b: Date) {
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth())
}

function dateToYYYYMMDD(d: Date) {
  const y = d.getFullYear()
  const m = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  return `${y}-${m}-${day}`
}

function toLocalDateTimeString(dateYYYYMMDD: string, hh = 0, mm = 0, ss = 0) {
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${dateYYYYMMDD}T${pad(hh)}:${pad(mm)}:${pad(ss)}`
}

export function expandRecurringEvents(baseEvents: EventEntity[], range: EventDateRange): EventEntity[] {
  const out: EventEntity[] = []
  const rangeStart = new Date(range.start)
  const rangeEnd = new Date(range.end)

  for (const base of baseEvents) {
    out.push(base)

    if (!base.recurrence) continue

    const rule = base.recurrence
    const baseStart = new Date(base.start)
    const durationMs = Math.max(1, new Date(base.end).getTime() - baseStart.getTime())

    const until = rule.untilDate ? new Date(`${rule.untilDate}T23:59:59`) : null

    // Empezamos desde el primer mes visible (o el mes del evento base, el que sea mayor)
    const cursor = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1, 12, 0, 0, 0)
    const baseMonthAnchor = new Date(baseStart.getFullYear(), baseStart.getMonth(), 1, 12, 0, 0, 0)

    const startMonthsDiff = monthDiff(baseMonthAnchor, cursor)
    const alignedOffset = startMonthsDiff <= 0 ? 0 : startMonthsDiff % rule.intervalMonths
    if (alignedOffset !== 0) {
      cursor.setMonth(cursor.getMonth() + (rule.intervalMonths - alignedOffset))
    }

    // Generamos ocurrencias hasta salir del rango
    while (cursor.getTime() <= rangeEnd.getTime()) {
      const y = cursor.getFullYear()
      const m = cursor.getMonth()
      const last = lastDayOfMonth(y, m)
      const desired = rule.byMonthDay
      const day = desired <= last ? desired : rule.fallback === 'last_day' ? last : -1
      if (day !== -1) {
        const occDate = new Date(y, m, day, baseStart.getHours(), baseStart.getMinutes(), baseStart.getSeconds(), 0)

        if (occDate.getTime() >= baseStart.getTime()) {
          if (!until || occDate.getTime() <= until.getTime()) {
            const occStart = base.allDay ? toLocalDateTimeString(dateToYYYYMMDD(occDate), 0, 0, 0) : occDate.toISOString()
            const occEnd = base.allDay
              ? toLocalDateTimeString(dateToYYYYMMDD(occDate), 23, 59, 59)
              : new Date(occDate.getTime() + durationMs).toISOString()

            // Evitar duplicar la ocurrencia exacta del evento base
            if (occStart === base.start && occEnd === base.end) {
              // no-op
            } else {
              // Intersección con rango
              if (occStart < range.end && occEnd > range.start) {
                out.push({
                  ...base,
                  id: `${base.id}::${dateToYYYYMMDD(occDate)}`,
                  parentId: base.id,
                  recurrence: null,
                  start: occStart,
                  end: occEnd,
                  updatedAt: base.updatedAt,
                  createdAt: base.createdAt,
                })
              }
            }

            // (si era duplicada, no agregamos)
          }
        }
      }

      cursor.setMonth(cursor.getMonth() + rule.intervalMonths)
    }
  }

  // Ordenar por inicio
  return out.sort((a, b) => a.start.localeCompare(b.start))
}

