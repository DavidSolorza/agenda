# Agenda Pastel

Agenda semanal/diaria/mensual en React con colores pastel, con persistencia en Supabase (Postgres).

## Cómo ejecutar

```bash
npm install
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en el navegador.

## Variables de entorno

Crea un archivo `.env` (no se sube al repo) con:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_xxx
```

## Funcionalidades

- **Vistas**: Semana, Día, Mes y Eventos.
- **Eventos**: Crear, editar y eliminar; soporta **todo el día** y **repetición mensual** (si el día no existe en el mes, cae al último).
- **Persistencia**: Los datos se guardan en Supabase.
- **Navegación**: Anterior/Siguiente, botón "Hoy", y clic en una celda para crear evento a esa hora.

## Estructura (SOLID)

- **Tipos** (`src/types`): Interfaces pequeñas (ISP).
- **Servicios**: `IEventStorage` (abstracción) y `SupabaseEventAdapter` (DIP). `EventService` orquesta casos de uso (SRP).
- **Componentes**: Un responsable por componente (Header, WeekGrid, MonthGrid, EventCard, EventFormModal).
- **Hooks**: `useEventService` y `useAgendaEvents` para estado y carga de eventos.

## Build

```bash
npm run build
npm run preview
```
