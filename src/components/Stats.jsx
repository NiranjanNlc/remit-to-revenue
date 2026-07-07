import { useState } from 'react'
import { useWeeklySummary } from '../hooks/useWeeklySummary'

const formatAmount = (paisa) => `Rs. ${(paisa / 100).toFixed(2)}`

export default function Stats({ user, transactions, savingsLog, loading, refreshKey }) {
  const [mode, setMode] = useState('week')
  const { summary, loading: weekLoading, error: weekError } = useWeeklySummary(user.id, refreshKey)

  const totalReceived = transactions.reduce((sum, t) => sum + t.amount_received, 0)
  const totalSaved = savingsLog.reduce((sum, s) => sum + s.amount_saved, 0)
  const percentSaved = totalReceived > 0 ? Math.round((totalSaved / totalReceived) * 100) : 0

  let streak = 0
  const savedTxnIds = new Set(savingsLog.map(s => s.transaction_id))
  for (const txn of transactions) {
    if (savedTxnIds.has(txn.id)) streak++
    else break
  }

  const stats = mode === 'week'
    ? {
        received: summary?.total_received ?? 0,
        saved: summary?.total_saved ?? 0,
        rate: summary?.save_rate_percent ?? 0,
        streak: summary?.current_streak ?? 0
      }
    : { received: totalReceived, saved: totalSaved, rate: percentSaved, streak }

  const isLoading = mode === 'week' ? weekLoading : loading

  return (
    <div className="mb-4">
      <div className="toggle-group">
        <button
          className={`toggle-option ${mode === 'week' ? 'active' : ''}`}
          onClick={() => setMode('week')}
        >
          This Week
        </button>
        <button
          className={`toggle-option ${mode === 'all' ? 'active' : ''}`}
          onClick={() => setMode('all')}
        >
          All Time
        </button>
      </div>

      {mode === 'week' && weekError && (
        <div style={{ color: 'var(--color-error)', marginBottom: '1rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem' }}>
          {weekError}
        </div>
      )}

      {isLoading ? (
        <p className="text-center text-sm">Loading stats...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="card">
            <p className="text-sm mb-2">Received{mode === 'week' ? ' (7d)' : ''}</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--color-indigo)' }}>
              {formatAmount(stats.received)}
            </p>
          </div>

          <div className="card">
            <p className="text-sm mb-2">Saved{mode === 'week' ? ' (7d)' : ''}</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--color-copper)' }}>
              {formatAmount(stats.saved)}
            </p>
          </div>

          <div className="card">
            <p className="text-sm mb-2">Save Rate</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--color-success)' }}>
              {stats.rate}%
            </p>
          </div>

          <div className="card">
            <p className="text-sm mb-2">Momentum</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--color-indigo)' }}>
              {stats.streak} 🔥
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
