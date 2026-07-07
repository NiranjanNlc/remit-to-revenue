import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../utils/supabase'

/**
 * Hook to fetch and determine the next unseen lesson for a user.
 *
 * Trigger conditions checked:
 * - "third_save": user has saved from 3+ transactions
 * - "missed_streak": no transaction in last 7 days (supportive tone)
 * - "first_goal": user has created a goal
 * - "consistency_boost": 5 consecutive recent transactions all have savings
 *
 * @param {string} userId - The authenticated user's ID
 * @param {array} transactions - User's transactions (most recent first)
 * @param {array} savingsLog - User's savings log entries
 * @param {object} goal - User's current goal (or null/undefined)
 * @returns {object} { lesson, loading, error }
 */
export function useUserLessons(userId, transactions = [], savingsLog = [], goal = null) {
  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const checkTriggerCondition = useCallback((trigger, txns, savings, userGoal) => {
    switch (trigger) {
      case 'third_save':
        // Trigger if user has saved from 3+ transactions
        return savings.length >= 3

      case 'missed_streak': {
        // Trigger if no transaction in last 7 days
        if (txns.length === 0) return false
        const mostRecentTxn = txns[0]
        const lastTxnTime = new Date(mostRecentTxn.received_at)
        const daysSinceLastTxn = (Date.now() - lastTxnTime.getTime()) / (1000 * 60 * 60 * 24)
        return daysSinceLastTxn >= 7
      }

      case 'first_goal':
        // Trigger if user just created a goal
        return userGoal !== null && userGoal !== undefined

      case 'consistency_boost': {
        // Trigger if 5 consecutive recent transactions all have savings
        if (txns.length < 5) return false
        const savedTxnIds = new Set(savings.map(s => s.transaction_id))
        for (let i = 0; i < 5; i++) {
          if (!savedTxnIds.has(txns[i].id)) return false
        }
        return true
      }

      default:
        return false
    }
  }, [])

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchLessons = async () => {
      setLoading(true)
      setError(null)

      try {
        // Fetch all lessons
        const { data: allLessons, error: lessonsError } = await supabase
          .from('lessons')
          .select('*')

        if (lessonsError) throw lessonsError

        // Fetch user's already-seen lessons
        const { data: seenLessons, error: seenError } = await supabase
          .from('user_lesson_progress')
          .select('lesson_id')
          .eq('user_id', userId)

        if (seenError) throw seenError

        const seenLessonIds = new Set(seenLessons?.map(s => s.lesson_id) || [])

        // Find the first unseen lesson that matches a trigger condition
        const nextLesson = allLessons?.find(les => {
          if (seenLessonIds.has(les.id)) return false
          return checkTriggerCondition(les.trigger_condition, transactions, savingsLog, goal)
        })

        setLesson(nextLesson || null)
      } catch (err) {
        setError(err.message)
        setLesson(null)
      } finally {
        setLoading(false)
      }
    }

    fetchLessons()
  }, [userId, transactions, savingsLog, goal, checkTriggerCondition])

  return { lesson, loading, error }
}
