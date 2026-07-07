import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../utils/supabase'

export function useWeeklySummary(userId, refreshKey) {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data, error: rpcError } = await supabase.rpc('get_weekly_summary', {
      user_id: userId
    })

    if (rpcError) {
      setError(rpcError.message)
      setSummary(null)
    } else {
      setSummary(data?.[0] ?? null)
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    if (userId) refresh()
  }, [userId, refresh, refreshKey])

  return { summary, loading, error, refresh }
}
