import React from 'react'

const EVENT_TYPES = [
  { id: 'Corporate', name: 'Corporate', emoji: '💼' },
  { id: 'Birthday', name: 'Birthday', emoji: '🎂' },
  { id: 'Bridal Party', name: 'Bridal Party', emoji: '💍' },
  { id: 'Other Gathering', name: 'Other Gathering', emoji: '🎉' }
]

function EventTypeStep({ formData, errors, updateFormData }) {
  const handleEventTypeSelect = (typeId) => {
    // Single selection only
    updateFormData('eventTypes', [typeId])
  }

  return (
    <div className="form-group">
      <div className="option-grid">
        {EVENT_TYPES.map(type => {
          const isSelected = (formData.eventTypes || []).includes(type.id)
          return (
            <div
              key={type.id}
              className={`option-card ${isSelected ? 'selected' : ''}`}
              onClick={() => handleEventTypeSelect(type.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleEventTypeSelect(type.id)
                }
              }}
              aria-pressed={isSelected}
            >
              <div className="option-title">
                <span className="option-emoji">{type.emoji}</span>
                {type.name}
              </div>
            </div>
          )
        })}
      </div>
      {errors.eventTypes && (
        <div className="error-message">{errors.eventTypes}</div>
      )}
    </div>
  )
}

export default EventTypeStep
