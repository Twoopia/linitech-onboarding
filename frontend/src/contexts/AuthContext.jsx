import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

const TOKEN_KEY = 'linitech_token'
const ROLE_KEY = 'linitech_role'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [role, setRole] = useState(() => localStorage.getItem(ROLE_KEY) ?? '')

  const login = useCallback((newToken, newRole) => {
    localStorage.setItem(TOKEN_KEY, newToken)
    localStorage.setItem(ROLE_KEY, newRole)
    setToken(newToken)
    setRole(newRole)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(ROLE_KEY)
    setToken(null)
    setRole('')
  }, [])

  const isRH = role === 'rh'

  return (
    <AuthContext.Provider value={{ token, role, isRH, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
