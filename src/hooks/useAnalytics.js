import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../utils/supabase'

// Monday-based start of the week containing d
function weekStart(d) {
  const date = new Date(d)
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7))
  return date
}

function monthKey(d) {
  const date = new Date(d)
  return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0')
}

export function useAnalytics(userId) {
  const [weekly, setWeekly] = useState([])
  const [senders, setSenders] = useState([])
  const [kpis, setKpis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // RLS filters both tables to auth.uid() automatically
      const { data: txns, error: txnError } = await supabase
        .from('transactions')
        .select('sender_name, amount_received, received_at')

      if (txnError) throw txnError

      const { data: savings, error: savingsError } = await supabase
        .from('savings_log')
        .select('amount_saved, saved_at')

      if (savingsError) throw savingsError

      // --- Weekly buckets: trailing 8 weeks including the current one ---
      const thisWeek = weekStart(new Date())
      const weeks = []
      for (let i = 7; i >= 0; i--) {
        const start = new Date(thisWeek)
        start.setDate(start.getDate() - i * 7)
        weeks.push({
          start,
          label: start.toLocaleDateString('default', { month: 'short', day: 'numeric' }),
          received: 0,
          saved: 0
        })
      }
      const weekIndex = (d) => {
        const diff = Math.round((weekStart(d) - weeks[0].start) / (7 * 24 * 3600 * 1000))
        return diff >= 0 && diff < weeks.length ? diff : -1
      }
      txns?.forEach(t => {
        const i = weekIndex(t.received_at)
        if (i >= 0) weeks[i].received += t.amount_received
      })
      savings?.forEach(s => {
        const i = weekIndex(s.saved_at)
        if (i >= 0) weeks[i].saved += s.amount_saved
      })
      setWeekly(weeks)

      // --- Senders ranked by total received (top 5) ---
      const senderMap = {}
      txns?.forEach(t => {
        if (!senderMap[t.sender_name]) senderMap[t.sender_name] = { total: 0, count: 0 }
        senderMap[t.sender_name].total += t.amount_received
        senderMap[t.sender_name].count += 1
      })
      setSenders(
        Object.entries(senderMap)
          .map(([name, v]) => ({ name, ...v }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 5)
      )

      // --- KPIs: this calendar month vs last, with save rate ---
      const now = new Date()
      const thisMonth = monthKey(now)
      const lastMonth = monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1))
      const sums = { [thisMonth]: { received: 0, saved: 0 }, [lastMonth]: { received: 0, saved: 0 } }
      txns?.forEach(t => {
        const k = monthKey(t.received_at)
        if (sums[k]) sums[k].received += t.amount_received
      })
      savings?.forEach(s => {
        const k = monthKey(s.saved_at)
        if (sums[k]) sums[k].saved += s.amount_saved
      })
      const cur = sums[thisMonth]
      const prev = sums[lastMonth]
      const pctDelta = (c, p) => (p > 0 ? ((c - p) / p) * 100 : null)
      const rate = (s) => (s.received > 0 ? (s.saved / s.received) * 100 : null)
      setKpis({
        received: { value: cur.received, delta: pctDelta(cur.received, prev.received) },
        saved: { value: cur.saved, delta: pctDelta(cur.saved, prev.saved) },
        saveRate: {
          value: rate(cur),
          delta: rate(cur) !== null && rate(prev) !== null ? rate(cur) - rate(prev) : null
        }
      })
    } catch (err) {
      setError(err.message)
      setWeekly([])
      setSenders([])
      setKpis(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (userId) fetch()
  }, [userId, fetch])

  return { weekly, senders, kpis, loading, error, refresh: fetch }
}
