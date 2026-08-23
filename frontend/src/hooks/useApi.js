import { useCallback, useEffect, useState } from 'react'

export function useApi(load, dependencies = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setData(await load())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, dependencies)

  useEffect(() => {
    refresh()
  }, [refresh])

  return { data, setData, loading, error, refresh }
}

