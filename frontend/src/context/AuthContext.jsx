import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import api from '../api/client.js'
import { AuthContext } from './authContext.js'

const TOKEN_KEY = 'hermarket_token'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() =>
    window.sessionStorage.getItem(TOKEN_KEY),
  )
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState(() =>
    window.sessionStorage.getItem(TOKEN_KEY) ? 'checking' : 'anonymous',
  )
  const [authError, setAuthError] = useState('')
  const [validationAttempt, setValidationAttempt] = useState(0)

  useEffect(() => {
    if (!token) {
      return undefined
    }

    let active = true

    api
      .get('/api/auth/me')
      .then(({ data }) => {
        if (!data.success || !data.user) {
          throw new Error('The server returned an invalid account response.')
        }
        if (active) {
          setUser(data.user)
          setStatus('authenticated')
          setAuthError('')
        }
      })
      .catch((error) => {
        if (!active) return

        if ([401, 404].includes(error.response?.status)) {
          window.sessionStorage.removeItem(TOKEN_KEY)
          setToken(null)
          setUser(null)
          setStatus('anonymous')
          setAuthError('')
          return
        }

        setAuthError(
          error.response?.data?.message ||
            error.message ||
            'Could not verify your session.',
        )
        setStatus('error')
      })

    return () => {
      active = false
    }
  }, [token, validationAttempt])

  const login = useCallback(async (credentials) => {
    const { data } = await api.post('/api/auth/login', credentials)
    if (!data.success || !data.token || !data.user) {
      throw new Error(data.message || 'The server returned an invalid login response.')
    }

    window.sessionStorage.setItem(TOKEN_KEY, data.token)
    setToken(data.token)
    setUser(data.user)
    setStatus('authenticated')
    setAuthError('')
    return data.user
  }, [])

  const register = useCallback(async (details) => {
    const { data } = await api.post('/api/auth/register', details)
    if (!data.success || !data.user) {
      throw new Error(
        data.message || 'The server returned an invalid registration response.',
      )
    }
    return data.user
  }, [])

  const logout = useCallback(() => {
    window.sessionStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
    setStatus('anonymous')
    setAuthError('')
  }, [])

  const retrySessionValidation = useCallback(() => {
    setStatus('checking')
    setValidationAttempt((attempt) => attempt + 1)
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      status,
      authError,
      login,
      register,
      logout,
      retrySessionValidation,
    }),
    [
      user,
      token,
      status,
      authError,
      login,
      register,
      logout,
      retrySessionValidation,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
