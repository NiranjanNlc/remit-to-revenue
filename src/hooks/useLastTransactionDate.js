import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../utils/supabase'

const DAYS_THRESHOLD = 14

export function useLastTransactionDate() {
  const [lastTransactionDate, setLastTransactionDate] = useState(null)
  const [isOverdue, setIsOverdue] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const checkOverdue = useCallback(() => {
    if (!lastTransactionDate) {
      setIsOverdue(false)
      return
    }

    const now = new Date()
    const lastDate = new Date(lastTransactionDate)
    const daysDifference = (now - lastDate) / (1000 * 60 * 60 * 24)
    setIsOverdue(daysDifference > DAYS_THRESHOLD)
  }, [lastTransactionDate])

  const fetchLastTransaction = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: queryError } = await supabase
        .from('transactions')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1)

      if (queryError) throw queryError

      if (data && data.length > 0) {
        setLastTransactionDate(data[0].created_at)
      } else {
        setLastTransactionDate(null)
      }
    } catch (err) {
      setError(err.message)
      setLastTransactionDate(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLastTransaction()
  }, [fetchLastTransaction])

  useEffect(() => {
    checkOverdue()
  }, [lastTransactionDate, checkOverdue])

  return { lastTransactionDate, isOverdue, loading, error, refresh: fetchLastTransaction }
}
