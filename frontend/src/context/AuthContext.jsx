import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../services/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!localStorage.getItem('fairshare_token')) {
      setLoading(false)
      return
    }
    api.get('/auth/me').then(data => setUser(data.user)).catch(() => localStorage.removeItem('fairshare_token')).finally(() => setLoading(false))
  }, [])

  function saveSession(data) {
    localStorage.setItem('fairshare_token', data.token)
    setUser(data.user)
  }

  async function login(values) {
    const data = await api.post('/auth/login', values)
    saveSession(data)
  }

  async function register(values) {
    const data = await api.post('/auth/register', values)
    saveSession(data)
  }

  function logout() {
    localStorage.removeItem('fairshare_token')
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}

