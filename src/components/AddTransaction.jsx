import { useState } from 'react'
import { supabase } from '../utils/supabase'

export default function AddTransaction({ user, onAdded }) {
  const [senderName, setSenderName] = useState('')
  const [amountInput, setAmountInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const amountPaisa = Math.round(parseFloat(amountInput) * 100)
      if (amountPaisa <= 0) throw new Error('Amount must be greater than 0')

      const { data, error: insertError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          amount_received: amountPaisa,
          sender_name: senderName
        })
        .select()
        .single()

      if (insertError) throw insertError

      setSenderName('')
      setAmountInput('')
      onAdded(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card mb-4">
      <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Add Remittance</h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Sender Name</label>
          <input
            type="text"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            placeholder="e.g., Father, Brother"
            required
          />
        </div>

        <div className="mb-4">
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Amount (Rs.)</label>
          <input
            type="number"
            step="0.01"
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
            placeholder="e.g., 5000"
            required
          />
        </div>

        {error && (
          <div style={{ color: 'var(--color-error)', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Adding...' : 'Add Transaction'}
        </button>
      </form>
    </div>
  )
}
