import { useState } from 'react'
import { supabase } from '../utils/supabase'

/**
 * LessonCard: displays a lesson (in English or Nepali) with a "Got it" button.
 *
 * @param {object} lesson - Lesson object with id, content_en, content_np, trigger_condition
 * @param {string} userId - The authenticated user's ID
 * @param {function} onDismiss - Callback when user dismisses the lesson
 */
export default function LessonCard({ lesson, userId, onDismiss }) {
  const [dismissing, setDismissing] = useState(false)
  const [error, setError] = useState(null)

  // Detect language preference (default to English if not set)
  const lang = localStorage.getItem('preferredLanguage') || 'en'
  const content = lang === 'np' ? lesson.content_np : lesson.content_en

  const handleGotIt = async () => {
    setDismissing(true)
    setError(null)

    try {
      // Mark lesson as seen in user_lesson_progress
      const { error: insertError } = await supabase
        .from('user_lesson_progress')
        .insert({
          user_id: userId,
          lesson_id: lesson.id,
          seen_at: new Date().toISOString()
        })

      if (insertError) {
        // If unique constraint fails (already marked), that's ok
        if (!insertError.message.includes('duplicate') && !insertError.message.includes('unique')) {
          throw insertError
        }
      }

      // Notify parent to dismiss the card
      if (onDismiss) onDismiss(lesson.id)
    } catch (err) {
      setError(err.message)
    } finally {
      setDismissing(false)
    }
  }

  return (
    <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--color-indigo)' }}>
      <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, marginBottom: '1rem', color: 'var(--color-neutral-900)' }}>
        {content}
      </div>

      {error && (
        <p style={{ color: 'var(--color-error)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
          {error}
        </p>
      )}

      <button
        className="btn-primary"
        onClick={handleGotIt}
        disabled={dismissing}
        style={{ width: '100%' }}
      >
        {dismissing ? 'Saving...' : 'Got it'}
      </button>
    </div>
  )
}
