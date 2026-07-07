import { useState } from 'react'

export default function GoalForm({ onSubmit, loading, error }) {
  const [targetAmount, setTargetAmount] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [localError, setLocalError] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLocalError(null)

    if (!targetAmount || !targetDate) {
      setLocalError('Both amount and date are required')
      return
    }

    onSubmit(targetAmount, targetDate)
    setTargetAmount('')
    setTargetDate('')
  }

  const minDate = new Date().toISOString().split('T')[0]

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
          Target Amount (Rs.)
        </label>
        <input
          type="number"
          step="0.01"
          value={targetAmount}
          onChange={(e) => setTargetAmount(e.target.value)}
          placeholder="e.g., 50000"
          required
        />
      </div>

      <div className="mb-4">
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
          Target Date
        </label>
        <input
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          min={minDate}
          required
        />
      </div>

      {(error || localError) && (
        <div style={{ color: 'var(--color-error)', marginBottom: '1rem', fontSize: '0.875rem' }}>
          {error || localError}
        </div>
      )}

      <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>
        {loading ? 'Creating...' : 'Set Goal'}
      </button>
    </form>
  )
}
