/**
 * Utilidades de fecha para la agenda. SRP: solo lógica de fechas.
 */

export function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function startOfWeek(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  date.setDate(diff)
  date.setHours(0, 0, 0, 0)
  return date
}

export function addDays(d: Date, n: number): Date {
  const out = new Date(d)
  out.setDate(out.getDate() + n)
  return out
}

export function getWeekDays(from: Date, count = 7): { date: string; dayName: string; dayNumber: number; month: string; isToday: boolean }[] {
  const days: { date: string; dayName: string; dayNumber: number; month: string; isToday: boolean }[] = []
  const today = toDateKey(new Date())
  const names = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  for (let i = 0; i < count; i++) {
    const d = addDays(from, i)
    const key = toDateKey(d)
    days.push({
      date: key,
      dayName: names[d.getDay()],
      dayNumber: d.getDate(),
      month: months[d.getMonth()],
      isToday: key === today,
    })
  }
  return days
}

export function startOfMonth(d: Date): Date {
  const date = new Date(d)
  date.setDate(1)
  date.setHours(0, 0, 0, 0)
  return date
}

/** Retorna los días a mostrar en vista mes (6 semanas × 7 días, empezando por el lunes de la primera semana). */
export function getMonthDaySlots(year: number, month: number): { date: string; dayNumber: number; isCurrentMonth: boolean; isToday: boolean }[] {
  const first = new Date(year, month, 1)
  const start = startOfWeek(first)
  const today = toDateKey(new Date())
  const slots: { date: string; dayNumber: number; isCurrentMonth: boolean; isToday: boolean }[] = []
  for (let i = 0; i < 42; i++) {
    const d = addDays(start, i)
    const key = toDateKey(d)
    slots.push({
      date: key,
      dayNumber: d.getDate(),
      isCurrentMonth: d.getMonth() === month,
      isToday: key === today,
    })
  }
  return slots
}

export function getHourSlots(): { hour: number; label: string }[] {
  const slots: { hour: number; label: string }[] = []
  for (let h = 0; h < 24; h++) {
    slots.push({ hour: h, label: `${h.toString().padStart(2, '0')}:00` })
  }
  return slots
}

export function parseTime(iso: string): { hours: number; minutes: number } {
  const d = new Date(iso)
  return { hours: d.getHours(), minutes: d.getMinutes() }
}

export function toMinutes(hours: number, minutes: number): number {
  return hours * 60 + minutes
}

export function eventTopPercent(startIso: string, dayStart: string): number {
  const day = new Date(dayStart)
  day.setHours(0, 0, 0, 0)
  const start = new Date(startIso)
  const diff = (start.getTime() - day.getTime()) / (1000 * 60)
  return (diff / (24 * 60)) * 100
}

export function eventHeightPercent(startIso: string, endIso: string): number {
  const start = new Date(startIso)
  const end = new Date(endIso)
  const diff = (end.getTime() - start.getTime()) / (1000 * 60)
  return (diff / (24 * 60)) * 100
}
