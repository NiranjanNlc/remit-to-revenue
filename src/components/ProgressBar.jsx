export default function ProgressBar({ current, target, label }) {
  const percentage = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0
  const currentRs = (current / 100).toFixed(2)
  const targetRs = (target / 100).toFixed(2)

  return (
    <div style={{ marginBottom: '1rem' }}>
      {label && <p className="text-sm mb-2">{label}</p>}
      <div
        style={{
          width: '100%',
          height: '0.75rem',
          backgroundColor: 'var(--color-neutral-200)',
          borderRadius: '0.375rem',
          overflow: 'hidden',
          marginBottom: '0.5rem'
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: 'var(--color-success)',
            transition: 'width 0.3s ease'
          }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
        <span>Rs. {currentRs}</span>
        <span style={{ color: 'var(--color-neutral-600)' }}>{percentage}%</span>
        <span>Rs. {targetRs}</span>
      </div>
    </div>
  )
}
