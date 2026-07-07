import { useState, useMemo } from 'react'
import ProgressBar from './ProgressBar'

export default function Goal({ goal, savingsLog, onDelete, loading }) {
  const [deleting, setDeleting] = useState(false)

  const currentSaved = useMemo(() => {
    if (!goal || !savingsLog) return 0
    const goalDate = new Date(goal.created_at)
    return savingsLog
      .filter((s) => new Date(s.saved_at || s.created_at) >= goalDate)
      .reduce((sum, s) => sum + s.amount_saved, 0)
  }, [goal, savingsLog])

  const handleDelete = async () => {
    if (window.confirm('Delete this goal?')) {
      setDeleting(true)
      await onDelete()
      setDeleting(false)
    }
  }

  const targetDate = new Date(goal.target_date).toLocaleDateString('ne-NP', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

  const daysLeft = Math.ceil(
    (new Date(goal.target_date) - new Date()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div className="card mb-4">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem' }}>Savings Goal</h2>
        <button
          onClick={handleDelete}
          disabled={deleting || loading}
          style={{
            background: 'transparent',
            color: 'var(--color-error)',
            fontSize: '0.875rem',
            padding: '0.25rem 0.5rem',
            border: '1px solid var(--color-error)',
            borderRadius: '0.375rem',
            cursor: 'pointer'
          }}
        >
          {deleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>

      <ProgressBar current={currentSaved} target={goal.target_amount} label="Progress" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <p className="text-sm mb-2">Days Left</p>
          <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-indigo)' }}>
            {daysLeft > 0 ? daysLeft : 'Overdue'}
          </p>
        </div>
        <div>
          <p className="text-sm mb-2">Target Date</p>
          <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-copper)' }}>
            {targetDate}
          </p>
        </div>
      </div>
    </div>
  )
}
