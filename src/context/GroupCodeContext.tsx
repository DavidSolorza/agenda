import type React from 'react'
import { createContext, useContext } from 'react'

type GroupCodeContextValue = {
  groupCode: string
  setGroupCode: (code: string) => void
}

const GroupCodeContext = createContext<GroupCodeContextValue | null>(null)

export function GroupCodeProvider({
  value,
  children,
}: {
  value: GroupCodeContextValue
  children: React.ReactNode
}) {
  return <GroupCodeContext.Provider value={value}>{children}</GroupCodeContext.Provider>
}

export function useGroupCodeContext() {
  const ctx = useContext(GroupCodeContext)
  if (!ctx) throw new Error('useGroupCodeContext debe usarse dentro de GroupCodeProvider')
  return ctx
}

