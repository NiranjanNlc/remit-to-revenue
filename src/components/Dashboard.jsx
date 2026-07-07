import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'
import TransactionList from './TransactionList'
import Stats from './Stats'
import AddTransaction from './AddTransaction'
import Goal from './Goal'
import GoalForm from './GoalForm'
import AnalyticsSection from './AnalyticsSection'
import LessonCard from './LessonCard'
import { useGoal } from '../hooks/useGoal'
import { useUserLessons } from '../hooks/useUserLessons'
import { useLastTransactionDate } from '../hooks/useLastTransactionDate'
import InactivityBanner from './InactivityBanner'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'add', label: 'Add' },
  { id: 'history', label: 'History' },
  { id: 'analytics', label: 'Analytics' }
]

export default function Dashboard({ user }) {
  const [transactions, setTransactions] = useState([])
  const [savingsLog, setSavingsLog] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [search, setSearch] = useState('')
  const [dismissedLessonId, setDismissedLessonId] = useState(null)
  const { goal, loading: goalLoading, error: goalError, createGoal, deleteGoal, refresh: refreshGoal } = useGoal(user.id)
  const { isOverdue } = useLastTransactionDate()
  const { lesson, loading: lessonLoading } = useUserLessons(user.id, transactions, savingsLog, goal)

  useEffect(() => {
    fetchData()
  }, [user.id])

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch transactions
      const { data: txns, error: txnError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('received_at', { ascending: false })

      if (txnError) throw txnError
      setTransactions(txns || [])

      // Fetch savings log
      const { data: savings, error: savError } = await supabase
        .from('savings_log')
        .select('*')
        .eq('user_id', user.id)

      if (savError) throw savError
      setSavingsLog(savings || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const handleTransactionAdded = (newTxn) => {
    setTransactions([newTxn, ...transactions])
    setActiveTab('history')
  }

  const handleSaved = (transactionId, amountSaved) => {
    const newSaving = { transaction_id: transactionId, amount_saved: amountSaved, saved_at: new Date().toISOString() }
    setSavingsLog([...savingsLog, newSaving])
  }

  const handleLessonDismissed = (lessonId) => {
    setDismissedLessonId(lessonId)
  }

  const filteredTransactions = search.trim()
    ? transactions.filter((t) =>
        t.sender_name?.toLowerCase().includes(search.trim().toLowerCase())
      )
    : transactions

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', marginTop: '1rem' }}>
        <h1>Remittance Tracker</h1>
        <button className="btn-secondary" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <InactivityBanner isOverdue={isOverdue} />

      {error && (
        <div style={{ color: 'var(--color-error)', marginBottom: '1rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem' }}>
          {error}
        </div>
      )}

      <div className="tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          {lesson && !dismissedLessonId && (
            <LessonCard
              lesson={lesson}
              userId={user.id}
              onDismiss={handleLessonDismissed}
            />
          )}
          {goal ? (
            <Goal
              goal={goal}
              savingsLog={savingsLog}
              onDelete={deleteGoal}
              loading={goalLoading}
            />
          ) : (
            <div className="card mb-4">
              <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Set a Savings Goal</h2>
              <GoalForm
                onSubmit={createGoal}
                loading={goalLoading}
                error={goalError}
              />
            </div>
          )}
          <Stats
            user={user}
            transactions={transactions}
            savingsLog={savingsLog}
            loading={loading}
            refreshKey={transactions.length + savingsLog.length}
          />
        </>
      )}

      {activeTab === 'add' && (
        <AddTransaction user={user} onAdded={handleTransactionAdded} />
      )}

      {activeTab === 'history' && (
        <div>
          <input
            type="text"
            placeholder="Search by sender name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4"
          />

          {loading ? (
            <p className="text-center">Loading transactions...</p>
          ) : filteredTransactions.length === 0 ? (
            <p className="text-center text-sm">
              {search ? 'No transactions match your search.' : 'No transactions yet. Add one to get started!'}
            </p>
          ) : (
            <TransactionList
              transactions={filteredTransactions}
              savingsLog={savingsLog}
              user={user}
              onSaved={handleSaved}
            />
          )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <AnalyticsSection user={user} />
      )}
    </div>
  )
}
