export default function InactivityBanner({ isOverdue }) {
  if (!isOverdue) return null

  return (
    <div
      style={{
        backgroundColor: 'rgba(217, 119, 6, 0.1)',
        borderLeft: '4px solid var(--color-copper)',
        padding: '1rem',
        borderRadius: '0.5rem',
        marginBottom: '1.5rem',
        color: 'var(--color-neutral-900)',
        fontSize: '0.95rem',
        fontWeight: '500'
      }}
    >
      It's been a while since your last update!
    </div>
  )
}
