import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../utils/supabase'

export function useGoal(userId) {
  const [goal, setGoal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchGoal = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      setError(fetchError.message)
      setGoal(null)
    } else {
      setGoal(data || null)
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    if (userId) fetchGoal()
  }, [userId, fetchGoal])

  const createGoal = async (targetAmountRs, targetDate) => {
    const targetAmountPaisa = Math.round(parseFloat(targetAmountRs) * 100)

    if (targetAmountPaisa <= 0) {
      setError('Target amount must be greater than 0')
      return false
    }

    const { error: insertError } = await supabase
      .from('goals')
      .insert({
        user_id: userId,
        target_amount: targetAmountPaisa,
        target_date: targetDate
      })

    if (insertError) {
      setError(insertError.message)
      return false
    }

    await fetchGoal()
    return true
  }

  const deleteGoal = async () => {
    const { error: deleteError } = await supabase
      .from('goals')
      .delete()
      .eq('user_id', userId)

    if (deleteError) {
      setError(deleteError.message)
      return false
    }

    setGoal(null)
    return true
  }

  return { goal, loading, error, createGoal, deleteGoal, refresh: fetchGoal }
}
