import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, getToken, setToken, type User, type WorkspaceSummary } from './api'

type SessionState = {
  user: User | null
  workspaces: WorkspaceSummary[]
  loading: boolean
  signIn: (email: string) => Promise<void>
  signOut: () => void
  refresh: () => Promise<void>
}

const SessionContext = createContext<SessionState | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setLoading(false)
      return
    }
    try {
      const me = await api<{ user: User; workspaces: WorkspaceSummary[] }>('/me')
      setUser(me.user)
      setWorkspaces(me.workspaces)
    } catch {
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const signIn = useCallback(
    async (email: string) => {
      const { token } = await api<{ token: string }>('/sign-in', { method: 'POST', body: { email } })
      setToken(token)
      await refresh()
    },
    [refresh],
  )

  const signOut = useCallback(() => {
    setToken(null)
    setUser(null)
    setWorkspaces([])
  }, [])

  return (
    <SessionContext.Provider value={{ user, workspaces, loading, signIn, signOut, refresh }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession(): SessionState {
  const session = useContext(SessionContext)
  if (!session) {
    throw new Error('useSession must be used inside SessionProvider')
  }
  return session
}
