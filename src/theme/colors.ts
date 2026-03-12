/**
 * Paleta pastel consistente. Un solo lugar para colores (mantenibilidad).
 */

export const pastel = {
  background: '#faf8f5',
  surface: '#ffffff',
  surfaceHover: '#f5f2ee',
  border: '#e8e4de',
  text: '#3d3a36',
  textMuted: '#7a756e',
  accent: '#b8a9c9',
  accentLight: '#e5dfed',
  lavender: '#c5b8d9',
  mint: '#b8d4c8',
  peach: '#e8c9b8',
  sky: '#b8c9e0',
  honey: '#e8dcb8',
  coral: '#e8b8c5',
} as const

export const categoryColors: Record<string, string> = {
  trabajo: pastel.sky,
  personal: pastel.lavender,
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
