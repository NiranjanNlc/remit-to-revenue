import { useState } from 'react'
import { useAnalytics } from '../hooks/useAnalytics'

// Validated palette (dataviz reference, light mode)
const C = {
  received: '#2a78d6', // categorical slot 1 (blue)
  saved: '#1baf7a',    // categorical slot 2 (aqua) — relief via table view below
  ink: '#0b0b0b',
  ink2: '#52514e',
  muted: '#898781',
  grid: '#e1e0d9',
  axis: '#c3c2b7',
  surface: '#ffffff',
  deltaGood: '#006300',
  deltaBad: '#d03b3b'
}

const rupees = (paisa) => paisa / 100
const fmtFull = (paisa) => 'Rs. ' + rupees(paisa).toLocaleString('en-IN', { maximumFractionDigits: 0 })
const fmtCompact = (paisa) => {
  const r = rupees(paisa)
  if (r >= 100000) return (r / 100000).toFixed(1).replace(/\.0$/, '') + 'L'
  if (r >= 1000) return (r / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  return String(Math.round(r))
}

// Round up to a clean axis maximum (1/2/5 × 10^n)
function niceMax(v) {
  if (v <= 0) return 1
  const exp = Math.pow(10, Math.floor(Math.log10(v)))
  const f = v / exp
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * exp
}

function StatTile({ label, value, delta, deltaSuffix = '% vs last month' }) {
  return (
    <div className="card" style={{ flex: 1, minWidth: '140px' }}>
      <p style={{ margin: 0, fontSize: '0.8rem', color: C.muted }}>{label}</p>
      <p style={{ margin: '0.25rem 0 0', fontSize: '1.6rem', fontWeight: 600, color: C.ink }}>{value}</p>
      {delta !== null && delta !== undefined && (
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', fontWeight: 600, color: delta >= 0 ? C.deltaGood : C.deltaBad }}>
          {delta >= 0 ? '↑' : '↓'} {Math.abs(delta).toFixed(0)}{deltaSuffix}
        </p>
      )}
    </div>
  )
}

// Column with a 4px rounded cap and a square baseline
function roundedColumn(x, y, w, h, r = 4) {
  if (h <= 0) return ''
  const rr = Math.min(r, h, w / 2)
  return `M${x},${y + h} L${x},${y + rr} Q${x},${y} ${x + rr},${y}
          L${x + w - rr},${y} Q${x + w},${y} ${x + w},${y + rr} L${x + w},${y + h} Z`
}

function WeeklyChart({ weeks }) {
  const [hover, setHover] = useState(null)

  const W = 640
  const H = 280
  const pad = { top: 16, right: 16, bottom: 36, left: 52 }
  const plotW = W - pad.left - pad.right
  const plotH = H - pad.top - pad.bottom

  const max = niceMax(Math.max(...weeks.map(w => Math.max(w.received, w.saved)), 1))
  const band = plotW / weeks.length
  const barW = 14
  const gap = 2 // surface gap between the pair
  const y = (v) => pad.top + plotH * (1 - v / max)
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(r => r * max)

  return (
    <div style={{ position: 'relative' }}>
      {/* Legend */}
      <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '0.75rem', fontSize: '0.8rem', color: C.ink2 }}>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: C.received, marginRight: 6 }} />Received</span>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: C.saved, marginRight: 6 }} />Saved</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        {/* Gridlines: solid hairlines */}
        {ticks.map((t, i) => (
          <line key={i} x1={pad.left} x2={W - pad.right} y1={y(t)} y2={y(t)}
            stroke={i === 0 ? C.axis : C.grid} strokeWidth="1" />
        ))}
        {/* Y tick labels */}
        {ticks.map((t, i) => (
          <text key={i} x={pad.left - 8} y={y(t) + 4} textAnchor="end" fontSize="11"
            fill={C.muted} style={{ fontVariantNumeric: 'tabular-nums' }}>
            {fmtCompact(t)}
          </text>
        ))}

        {weeks.map((w, i) => {
          const cx = pad.left + band * i + band / 2
          const x1 = cx - barW - gap / 2
          const x2 = cx + gap / 2
          const hR = plotH * (w.received / max)
          const hS = plotH * (w.saved / max)
          return (
            <g key={i}>
              <path d={roundedColumn(x1, y(w.received), barW, hR)} fill={C.received} />
              <path d={roundedColumn(x2, y(w.saved), barW, hS)} fill={C.saved} />
              {/* X label */}
              <text x={cx} y={H - 12} textAnchor="middle" fontSize="11" fill={C.muted}>{w.label}</text>
              {/* Full-band hit target */}
              <rect x={pad.left + band * i} y={pad.top} width={band} height={plotH}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)} />
              {hover === i && (
                <line x1={cx} x2={cx} y1={pad.top} y2={pad.top + plotH} stroke={C.axis} strokeWidth="1" />
              )}
            </g>
          )
        })}
      </svg>

      {hover !== null && (
        <div style={{
          position: 'absolute',
          left: `${((pad.left + band * hover + band / 2) / W) * 100}%`,
          top: 28,
          transform: hover > weeks.length / 2 ? 'translateX(-105%)' : 'translateX(8px)',
          background: C.surface,
          border: `1px solid ${C.grid}`,
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          padding: '0.5rem 0.75rem',
          fontSize: '0.8rem',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          zIndex: 5
        }}>
          <p style={{ margin: 0, fontWeight: 600, color: C.ink }}>Week of {weeks[hover].label}</p>
          <p style={{ margin: '0.25rem 0 0', color: C.ink2 }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: C.received, marginRight: 6 }} />
            Received {fmtFull(weeks[hover].received)}
          </p>
          <p style={{ margin: '0.15rem 0 0', color: C.ink2 }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: C.saved, marginRight: 6 }} />
            Saved {fmtFull(weeks[hover].saved)}
          </p>
        </div>
      )}
    </div>
  )
}

function SenderBars({ senders }) {
  const max = Math.max(...senders.map(s => s.total), 1)
  return (
    <div>
      {senders.map(s => (
        <div key={s.name} style={{ marginBottom: '0.9rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
            <span style={{ color: C.ink, fontWeight: 500 }}>{s.name}</span>
            <span style={{ color: C.ink2, fontVariantNumeric: 'tabular-nums' }}>
              {fmtFull(s.total)} · {s.count} txn{s.count !== 1 ? 's' : ''}
            </span>
          </div>
          <div style={{ height: 12, background: '#e8f0fb', borderRadius: '0 4px 4px 0', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${(s.total / max) * 100}%`,
              background: C.received,
              borderRadius: '0 4px 4px 0'
            }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function AnalyticsSection({ user }) {
  const { weekly, senders, kpis, loading, error } = useAnalytics(user.id)

  const hasActivity = weekly.some(w => w.received > 0 || w.saved > 0)

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
          {/* KPI row */}
          {kpis && (
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              <StatTile label="Received this month" value={fmtFull(kpis.received.value)} delta={kpis.received.delta} />
              <StatTile label="Saved this month" value={fmtFull(kpis.saved.value)} delta={kpis.saved.delta} />
              <StatTile
                label="Save rate this month"
                value={kpis.saveRate.value !== null ? kpis.saveRate.value.toFixed(1) + '%' : '—'}
                delta={kpis.saveRate.delta}
                deltaSuffix=" pts vs last month"
              />
            </div>
          )}

          {/* Weekly trend */}
          <div className="card mb-4">
            <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.05rem', fontWeight: '500' }}>
              Last 8 weeks — received vs saved
            </h3>
            {hasActivity ? (
              <WeeklyChart weeks={weekly} />
            ) : (
              <p className="text-center text-sm">No activity in the last 8 weeks — add a remittance to see your trend.</p>
            )}
          </div>

          {/* Senders */}
          {senders.length > 0 && (
            <div className="card mb-4">
              <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.05rem', fontWeight: '500' }}>
                Who sends the most
              </h3>
              <SenderBars senders={senders} />
            </div>
          )}

          {/* Table view (accessibility twin of the weekly chart) */}
          {hasActivity && (
            <div className="card">
              <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.05rem', fontWeight: '500' }}>
                Weekly breakdown
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ color: C.muted, textAlign: 'left' }}>
                      <th style={{ padding: '0.5rem 0', fontWeight: 500 }}>Week of</th>
                      <th style={{ padding: '0.5rem 0', fontWeight: 500, textAlign: 'right' }}>Received</th>
                      <th style={{ padding: '0.5rem 0', fontWeight: 500, textAlign: 'right' }}>Saved</th>
                      <th style={{ padding: '0.5rem 0', fontWeight: 500, textAlign: 'right' }}>Save rate</th>
                    </tr>
                  </thead>
                  <tbody style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {weekly.slice().reverse().map((w, i) => (
                      <tr key={i} style={{ borderTop: `1px solid ${C.grid}` }}>
                        <td style={{ padding: '0.5rem 0', color: C.ink }}>{w.label}</td>
                        <td style={{ padding: '0.5rem 0', textAlign: 'right', color: C.ink2 }}>{fmtFull(w.received)}</td>
                        <td style={{ padding: '0.5rem 0', textAlign: 'right', color: C.ink2 }}>{fmtFull(w.saved)}</td>
                        <td style={{ padding: '0.5rem 0', textAlign: 'right', color: C.ink2 }}>
                          {w.received > 0 ? ((w.saved / w.received) * 100).toFixed(0) + '%' : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
