import { useAnalytics } from '../hooks/useAnalytics'

const formatAmount = (paisa) => `Rs. ${(paisa / 100).toFixed(0)}`
const formatAmountDecimal = (paisa) => `Rs. ${(paisa / 100).toFixed(2)}`

function SimpleBarChart({ value, maxValue, label, color }) {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
        <span>{label}</span>
        <span style={{ fontWeight: 'bold' }}>{formatAmount(value)}</span>
      </div>
      <div
        style={{
          width: '100%',
          height: '24px',
          backgroundColor: 'var(--color-neutral-200)',
          borderRadius: '0.375rem',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${percentage}%`,
            backgroundColor: color,
            transition: 'width 0.3s ease'
          }}
        />
      </div>
    </div>
  )
}

function MonthlyChart({ monthlyTotals }) {
  if (monthlyTotals.length === 0) {
    return <p className="text-center text-sm">No monthly data yet</p>
  }

  // Find max values for scaling
  const maxReceived = Math.max(...monthlyTotals.map(m => m.total_received), 1)
  const maxSaved = Math.max(...monthlyTotals.map(m => m.total_saved), 1)

  // SVG dimensions
  const width = 320
  const height = 240
  const padding = { top: 20, right: 20, bottom: 40, left: 40 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  // Calculate positions
  const months = monthlyTotals.slice().reverse() // oldest to newest for chart
  const xStep = chartWidth / (months.length - 1 || 1)

  return (
    <svg width={width} height={height} style={{ border: '1px solid var(--color-neutral-200)', borderRadius: '0.375rem', backgroundColor: 'var(--color-white)' }}>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
        <line
          key={`grid-${ratio}`}
          x1={padding.left}
          y1={padding.top + chartHeight * (1 - ratio)}
          x2={width - padding.right}
          y2={padding.top + chartHeight * (1 - ratio)}
          stroke="var(--color-neutral-200)"
          strokeWidth="1"
          strokeDasharray="2,2"
        />
      ))}

      {/* Y-axis */}
      <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="var(--color-neutral-600)" strokeWidth="2" />

      {/* X-axis */}
      <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="var(--color-neutral-600)" strokeWidth="2" />

      {/* Received bars */}
      {months.map((m, i) => {
        const x = padding.left + i * xStep
        const receivedHeight = (m.total_received / maxReceived) * chartHeight
        return (
          <rect
            key={`recv-${i}`}
            x={x - 6}
            y={padding.top + chartHeight - receivedHeight}
            width={6}
            height={receivedHeight}
            fill="var(--color-indigo)"
            opacity="0.8"
          />
        )
      })}

      {/* Saved bars */}
      {months.map((m, i) => {
        const x = padding.left + i * xStep
        const savedHeight = (m.total_saved / maxSaved) * chartHeight
        return (
          <rect
            key={`saved-${i}`}
            x={x}
            y={padding.top + chartHeight - savedHeight}
            width={6}
            height={savedHeight}
            fill="var(--color-copper)"
            opacity="0.8"
          />
        )
      })}

      {/* X-axis labels (month names) */}
      {months.map((m, i) => {
        const x = padding.left + i * xStep
        const [year, monthNum] = m.month.split('-')
        const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleString('default', { month: 'short' })
        return (
          <text
            key={`label-${i}`}
            x={x}
            y={height - 10}
            textAnchor="middle"
            fontSize="12"
            fill="var(--color-neutral-600)"
          >
            {monthName}
          </text>
        )
      })}

      {/* Legend */}
      <rect x={padding.left} y={padding.top} width={12} height={12} fill="var(--color-indigo)" opacity="0.8" />
      <text x={padding.left + 16} y={padding.top + 10} fontSize="12" fill="var(--color-neutral-900)">
        Received
      </text>

      <rect x={padding.left + 80} y={padding.top} width={12} height={12} fill="var(--color-copper)" opacity="0.8" />
      <text x={padding.left + 96} y={padding.top + 10} fontSize="12" fill="var(--color-neutral-900)">
        Saved
      </text>
    </svg>
  )
}

export default function AnalyticsSection({ user }) {
  const { topSender, monthlyTotals, loading, error } = useAnalytics(user.id)

  return (
    <div className="mb-4">
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '600' }}>Analytics</h2>

      {error && (
        <div style={{ color: 'var(--color-error)', marginBottom: '1rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-center text-sm">Loading analytics...</p>
      ) : (
        <>
          {/* Top Sender Section */}
          <div className="card mb-4">
            <h3 style={{ marginBottom: '1.25rem', fontSize: '1.05rem', fontWeight: '500' }}>Top Sender</h3>
            {topSender ? (
              <div>
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-indigo)', marginBottom: '0.25rem' }}>
                    {topSender.sender_name}
                  </p>
                  <p className="text-sm">
                    {formatAmountDecimal(topSender.total_amount)} in {topSender.count} transaction{topSender.count !== 1 ? 's' : ''}
                  </p>
                </div>
                <SimpleBarChart
                  value={topSender.total_amount}
                  maxValue={topSender.total_amount}
                  label="Total Received"
                  color="var(--color-indigo)"
                />
              </div>
            ) : (
              <p className="text-center text-sm">No transaction data yet</p>
            )}
          </div>

          {/* Month-over-Month Section */}
          <div className="card">
            <h3 style={{ marginBottom: '1.25rem', fontSize: '1.05rem', fontWeight: '500' }}>Monthly Totals</h3>
            {monthlyTotals.length > 0 ? (
              <>
                <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
                  <MonthlyChart monthlyTotals={monthlyTotals} />
                </div>
                <div style={{ marginTop: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '500', marginBottom: '0.75rem' }}>Monthly Breakdown</h4>
                  <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {monthlyTotals.map(m => {
                      const [year, monthNum] = m.month.split('-')
                      const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleString('default', { month: 'long', year: 'numeric' })
                      return (
                        <div key={m.month} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', padding: '0.75rem 0', borderBottom: '1px solid var(--color-neutral-200)' }}>
                          <div>
                            <p className="text-sm">{monthName}</p>
                          </div>
                          <div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--color-indigo)', fontWeight: '500' }}>
                              {formatAmount(m.total_received)}
                            </p>
                          </div>
                          <div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--color-copper)', fontWeight: '500' }}>
                              {formatAmount(m.total_saved)}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-center text-sm">No monthly data yet</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
