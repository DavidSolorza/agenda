import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'agenda-pastel-group-code'

export function useGroupCode() {
  const [groupCode, setGroupCode] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) ?? ''
    } catch {
      return ''
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, groupCode)
    } catch {
      // ignore
    }
  }, [groupCode])

  const clearGroupCode = useCallback(() => setGroupCode(''), [])

  return { groupCode, setGroupCode, clearGroupCode }
}

