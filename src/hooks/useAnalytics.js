import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../utils/supabase'

export function useAnalytics(userId) {
  const [topSender, setTopSender] = useState(null)
  const [monthlyTotals, setMonthlyTotals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch top sender by total amount received
      // RLS will filter to auth.uid() automatically
      const { data: topSenderData, error: topSenderError } = await supabase
        .from('transactions')
        .select('sender_name, amount_received')
        .order('received_at', { ascending: false })

      if (topSenderError) throw topSenderError

      // Aggregate top sender in-memory since Supabase JS doesn't support GROUP BY well
      // but RLS ensures only user's own transactions are returned
      const senderMap = {}
      if (topSenderData) {
        topSenderData.forEach(txn => {
          if (!senderMap[txn.sender_name]) {
            senderMap[txn.sender_name] = { total_amount: 0, count: 0 }
          }
          senderMap[txn.sender_name].total_amount += txn.amount_received
          senderMap[txn.sender_name].count += 1
        })
      }

      // Find top sender
      let top = null
      if (Object.keys(senderMap).length > 0) {
        const topSenderName = Object.keys(senderMap).reduce((a, b) =>
          senderMap[a].total_amount > senderMap[b].total_amount ? a : b
        )
        top = {
          sender_name: topSenderName,
          total_amount: senderMap[topSenderName].total_amount,
          count: senderMap[topSenderName].count
        }
      }
      setTopSender(top)

      // Fetch all transactions for month-over-month aggregation
      const { data: monthlyData, error: monthlyError } = await supabase
        .from('transactions')
        .select('received_at, amount_received')
        .order('received_at', { ascending: false })

      if (monthlyError) throw monthlyError

      // Fetch all savings for month-over-month aggregation
      const { data: savingsData, error: savingsError } = await supabase
        .from('savings_log')
        .select('saved_at, amount_saved')
        .order('saved_at', { ascending: false })

      if (savingsError) throw savingsError

      // Aggregate by YEAR-MONTH to avoid conflating Jan 2024 with Jan 2025
      const monthMap = {}
      if (monthlyData) {
        monthlyData.forEach(txn => {
          const date = new Date(txn.received_at)
          const key = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0')
          if (!monthMap[key]) {
            monthMap[key] = { total_received: 0, total_saved: 0, date }
          }
          monthMap[key].total_received += txn.amount_received
        })
      }

      if (savingsData) {
        savingsData.forEach(saving => {
          const date = new Date(saving.saved_at)
          const key = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0')
          if (!monthMap[key]) {
            monthMap[key] = { total_received: 0, total_saved: 0, date }
          }
          monthMap[key].total_saved += saving.amount_saved
        })
      }

      // Convert to array and sort by month (most recent first)
      const monthly = Object.entries(monthMap)
        .map(([key, data]) => ({
          month: key,
          total_received: data.total_received,
          total_saved: data.total_saved,
          date: data.date
        }))
        .sort((a, b) => new Date(b.date) - new Date(a.date))

      setMonthlyTotals(monthly)
    } catch (err) {
      setError(err.message)
      setTopSender(null)
      setMonthlyTotals([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (userId) fetch()
  }, [userId, fetch])

  return { topSender, monthlyTotals, loading, error, refresh: fetch }
}
