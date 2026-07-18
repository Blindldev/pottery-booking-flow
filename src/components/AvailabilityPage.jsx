import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import './AvailabilityPage.css'

// Each person gets a semi-private link: /availability/<Name><randomId>
const SCHEDULES = {
  Kali771: {
    name: 'Kali',
    month: 'August',
    dates: [
      { id: 'aug-2', label: 'Sunday, August 2 — 11:30am–4:30pm' },
      { id: 'aug-9', label: 'Sunday, August 9 — 11:30am–4:30pm' },
      { id: 'aug-16', label: 'Sunday, August 16 — 11:30am–4:30pm' },
      { id: 'aug-23', label: 'Sunday, August 23 — 11:30am–4:30pm' },
      { id: 'aug-30', label: 'Sunday, August 30 — 11:30am–4:30pm' }
    ]
  },
  Molly117: {
    name: 'Molly',
    month: 'August',
    dates: [
      { id: 'aug-1', label: 'Saturday, August 1 — 4:30pm–9:30pm' },
      { id: 'aug-8', label: 'Saturday, August 8 — 10:30am–3:30pm' },
      { id: 'aug-15', label: 'Saturday, August 15 — 10:30am–3:30pm' },
      { id: 'aug-22', label: 'Saturday, August 22 — 10:30am–3:30pm' },
      { id: 'aug-29', label: 'Saturday, August 29 — 10:30am–3:30pm' }
    ]
  },
  Maggie718: {
    name: 'Maggie',
    month: 'August',
    dates: [
      { id: 'aug-3', label: 'Monday, August 3 — 5:30pm–9:30pm' },
      { id: 'aug-10', label: 'Monday, August 10 — 5:30pm–9:30pm' },
      { id: 'aug-17', label: 'Monday, August 17 — 5:30pm–9:30pm' },
      { id: 'aug-24', label: 'Monday, August 24 — 5:30pm–9:30pm' },
      { id: 'aug-31', label: 'Monday, August 31 — 5:30pm–9:30pm' }
    ]
  }
}

function AvailabilityPage() {
  const { slug } = useParams()
  const schedule = SCHEDULES[slug]

  if (!schedule) {
    return (
      <div className="availability-container">
        <div className="availability-card">
          <h1>Link not found</h1>
          <p className="availability-intro">
            This availability link isn't valid. Please double-check the link you were sent.
          </p>
        </div>
      </div>
    )
  }

  return <AvailabilityForm key={slug} schedule={schedule} />
}

function AvailabilityForm({ schedule }) {
  const [checked, setChecked] = useState(() =>
    Object.fromEntries(schedule.dates.map(d => [d.id, true]))
  )
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const toggle = (id) => {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    const available = schedule.dates.filter(d => checked[d.id])
    const unavailable = schedule.dates.filter(d => !checked[d.id])

    const message = [
      `${schedule.name} confirmed their ${schedule.month} availability.`,
      '',
      'AVAILABLE:',
      ...(available.length ? available.map(d => `  • ${d.label}`) : ['  (none)']),
      '',
      'NOT AVAILABLE:',
      ...(unavailable.length ? unavailable.map(d => `  • ${d.label}`) : ['  (none)'])
    ].join('\n')

    try {
      const baseUrl = import.meta.env.VITE_AWS_API_URL || ''
      let API_URL = ''
      if (baseUrl) {
        if (baseUrl.includes('/booking')) {
          API_URL = baseUrl.replace('/booking', '/contact')
        } else {
          API_URL = baseUrl.replace(/\/$/, '') + '/contact'
        }
      }

      if (!API_URL) {
        if (import.meta.env.DEV) {
          console.warn('API not configured. Availability data:', message)
        }
        setSubmitted(true)
        return
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${schedule.name} — ${schedule.month} Availability`,
          email: 'availability@potterychicago.com',
          message,
          submittedAt: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }

      setSubmitted(true)
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Availability submission error:', error)
      }
      setSubmitError('Something went wrong sending your availability. Please try again.')
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    const availableCount = schedule.dates.filter(d => checked[d.id]).length
    return (
      <div className="availability-container">
        <div className="availability-card">
          <div className="availability-success-icon">✓</div>
          <h1>Thanks, {schedule.name}!</h1>
          <p className="availability-intro">
            Your {schedule.month} availability has been sent
            ({availableCount} of {schedule.dates.length} dates confirmed).
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="availability-container">
      <div className="availability-card">
        <h1>Hi {schedule.name}!</h1>
        <p className="availability-intro">
          Here is your {schedule.month} schedule. All dates are checked by default —
          please <strong>uncheck any dates you are unable to do</strong>, then confirm below.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="availability-dates">
            {schedule.dates.map(d => (
              <label
                key={d.id}
                className={`availability-date ${checked[d.id] ? 'is-checked' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={!!checked[d.id]}
                  onChange={() => toggle(d.id)}
                />
                <span>{d.label}</span>
              </label>
            ))}
          </div>

          {submitError && (
            <div className="availability-error">{submitError}</div>
          )}

          <button
            type="submit"
            className="availability-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Confirm availability'}
          </button>
          <p className="availability-note">
            Uncheck any dates you can't make before confirming.
          </p>
        </form>
      </div>
    </div>
  )
}

export default AvailabilityPage
