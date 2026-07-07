import { useState } from 'react'
import { supabase } from '../utils/supabase'

export default function TransactionCard({ transaction, isSaved, user, onSaved }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [savingsRate, setSavingsRate] = useState(10)

  const amountSave = Math.ceil(transaction.amount_received * (savingsRate / 100))
  const amountReceived = (transaction.amount_received / 100).toFixed(2)

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    try {
      const { error: insertError } = await supabase
        .from('savings_log')
        .insert({
          transaction_id: transaction.id,
          user_id: user.id,
          amount_saved: amountSave
        })

      if (insertError) throw insertError
      onSaved(transaction.id, amountSave)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const date = new Date(transaction.received_at)
  const formatted = date.toLocaleDateString('ne-NP', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div className="card" style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
        <div>
          <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{transaction.sender_name}</p>
          <p className="text-sm">{formatted}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-indigo)' }}>
            Rs. {amountReceived}
          </p>
        </div>
      </div>

      {!isSaved && (
        <div style={{ padding: '0.75rem', backgroundColor: 'var(--color-neutral-50)', borderRadius: '0.5rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span className="text-sm">Save</span>
            <input
              type="number"
              min="1"
              max="100"
              value={savingsRate}
              onChange={(e) => setSavingsRate(parseInt(e.target.value) || 10)}
              style={{ width: '3rem', padding: '0.4rem', textAlign: 'center' }}
            />
            <span className="text-sm">%?</span>
          </div>
          <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-copper)', marginBottom: '0.75rem' }}>
            Rs. {(amountSave / 100).toFixed(2)}
          </p>
          {error && (
            <p style={{ color: 'var(--color-error)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
              {error}
            </p>
          )}
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={saving}
            style={{ width: '100%' }}
          >
            {saving ? 'Saving...' : `Save ${savingsRate}%`}
          </button>
        </div>
      )}

      {isSaved && (
        <div style={{ padding: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.5rem' }}>
          <p style={{ color: 'var(--color-success)', fontWeight: '600' }}>
            ✓ Saved Rs. {(amountSave / 100).toFixed(2)}
          </p>
        </div>
      )}
    </div>
  )
}
