import { useCallback, useEffect, useState } from 'react'
import { api } from './api'

export function useApi<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (!path) {
      return
    }
    try {
      setData(await api<T>(path))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }, [path])

  useEffect(() => {
    void reload()
  }, [reload])

  return { data, error, reload }
}
