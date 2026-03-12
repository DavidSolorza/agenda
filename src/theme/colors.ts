/**
 * Paleta pastel consistente. Un solo lugar para colores (mantenibilidad).
 */

export const pastel = {
  // Fondo general con dominante rosa pastel
  background: '#fff4f9',
  surface: '#ffffff',
  surfaceHover: '#ffe7f3',
  border: '#f4cfe0',
  text: '#3d2836',
  textMuted: '#a17694',
  // Acentos en gama rosa-lila
  accent: '#f28fb7',
  accentLight: '#ffd6ea',
  lavender: '#e3b5ff',
  mint: '#cde8de',
  peach: '#ffc7a6',
  sky: '#f5a8ff',
  honey: '#ffe5af',
  coral: '#ff9fb6',
} as const

export const categoryColors: Record<string, string> = {
  trabajo: pastel.coral,
  personal: pastel.accent,
  salud: pastel.mint,
  ocio: pastel.peach,
  otro: pastel.honey,
}

export const categoryLabels: Record<string, string> = {
  trabajo: 'Trabajo',
  personal: 'Personal',
  salud: 'Salud',
  ocio: 'Ocio',
  otro: 'Otro',
}
