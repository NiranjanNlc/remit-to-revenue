import { useState, useEffect } from 'react'
import TransactionCard from './TransactionCard'

const PAGE_SIZE = 10

// Compact page list: 1 … 4 5 [6] 7 8 … 12
function pageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = new Set([1, total, current - 1, current, current + 1])
  const sorted = [...pages].filter(p => p >= 1 && p <= total).sort((a, b) => a - b)
  const result = []
  let prev = 0
  for (const p of sorted) {
    if (p - prev > 1) result.push('…')
    result.push(p)
    prev = p
  }
  return result
}

export default function TransactionList({ transactions, savingsLog, user, onSaved }) {
  const [page, setPage] = useState(1)
  const savedTxnIds = new Set(savingsLog.map(s => s.transaction_id))

  const totalPages = Math.max(1, Math.ceil(transactions.length / PAGE_SIZE))

  // Snap back into range when the list changes (search, add, delete)
  useEffect(() => {
    if (page > totalPages) setPage(1)
  }, [transactions.length, totalPages, page])

  const start = (page - 1) * PAGE_SIZE
  const visible = transactions.slice(start, start + PAGE_SIZE)

  const btnStyle = (disabled) => ({
    padding: '0.4rem 0.8rem',
    border: '1px solid var(--color-neutral-200)',
    borderRadius: '0.375rem',
    background: 'white',
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.4 : 1,
    fontSize: '0.875rem'
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Recent Transactions</h2>
        <span className="text-sm">
          {transactions.length === 0
            ? ''
            : `${start + 1}–${Math.min(start + PAGE_SIZE, transactions.length)} of ${transactions.length}`}
        </span>
      </div>

      {visible.map((txn) => (
        <TransactionCard
          key={txn.id}
          transaction={txn}
          isSaved={savedTxnIds.has(txn.id)}
          user={user}
          onSaved={onSaved}
        />
      ))}

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          <button
            style={btnStyle(page === 1)}
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            ‹ Prev
          </button>

          {pageNumbers(page, totalPages).map((p, i) =>
            p === '…' ? (
              <span key={`e-${i}`} className="text-sm" style={{ padding: '0 0.25rem' }}>…</span>
            ) : (
              <button
                key={p}
                style={{
                  ...btnStyle(false),
                  background: p === page ? 'var(--color-indigo, #667eea)' : 'white',
                  color: p === page ? 'white' : 'inherit',
                  borderColor: p === page ? 'var(--color-indigo, #667eea)' : 'var(--color-neutral-200)',
                  fontWeight: p === page ? 600 : 400
                }}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            )
          )}

          <button
            style={btnStyle(page === totalPages)}
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next ›
          </button>
        </div>
      )}
    </div>
  )
}
