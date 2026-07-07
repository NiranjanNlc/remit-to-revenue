import TransactionCard from './TransactionCard'

export default function TransactionList({ transactions, savingsLog, user, onSaved }) {
  const savedTxnIds = new Set(savingsLog.map(s => s.transaction_id))

  return (
    <div>
      <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Recent Transactions</h2>
      {transactions.map((txn) => (
        <TransactionCard
          key={txn.id}
          transaction={txn}
          isSaved={savedTxnIds.has(txn.id)}
          user={user}
          onSaved={onSaved}
        />
      ))}
    </div>
  )
}
