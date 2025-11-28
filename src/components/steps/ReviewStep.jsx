import React, { useState } from 'react'
import { calculatePricing, getEffectiveGroupSize } from '../../utils/validation'

function ReviewStep({ formData, errors, updateFormData }) {
  const [expandedSections, setExpandedSections] = useState({})
  const effectiveGroupSize = getEffectiveGroupSize(formData.groupSize, formData.exactGroupSize)

  const formatDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00')
    return date.toLocaleDateString('en-US', {
      timeZone: 'America/Chicago',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatFlexibleDate = (flexibleDates) => {
    if (!flexibleDates) return ''
    
    const flexibility = flexibleDates.flexibility
    if (!flexibility) return ''
    
    // If there's a start date, format it with the date
    if (flexibleDates.start) {
      const startDate = formatDate(flexibleDates.start)
      if (flexibility === 'exact') {
        return `${startDate} (exact date)`
      } else if (flexibility === '+1') {
        return `${startDate} (+1 day)`
      } else {
        return `${startDate} (±${flexibility} days)`
      }
    } else {
      // If no start date but there's flexibility, just show the flexibility
      if (flexibility === 'exact') {
        return 'Exact date (no specific date selected)'
      } else if (flexibility === '+1') {
        return 'Flexible (+1 day from selected date)'
      } else {
        return `Flexible (±${flexibility} days from selected date)`
      }
    }
  }

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  const getWorkshopEmoji = (workshopId) => {
    const workshopEmojis = {
      'Pottery Wheel classes': '🌀',
      'Handbuilding workshops': '👐',
      'Custom mug glazing workshop': '☕️',
      'Custom candle making workshops': '🕯️',
      'Custom magnet making workshops': '🧲',
      'Custom Glazing trinket tray workshops': '🍽️'
    }
    return workshopEmojis[workshopId] || '🏺'
  }

  const getEventTypeEmoji = (eventType) => {
    const eventEmojis = {
      'Corporate': '💼',
      'Birthday': '🎂',
      'Bridal Party': '💍',
      'Other Gathering': '🎉'
    }
    return eventEmojis[eventType] || '🎉'
  }

  return (
    <div className="form-group">
      <div className="estimate-notice">
        <div className="notice-icon">ℹ️</div>
        <div className="notice-text">
          <strong>This is NOT a bill.</strong> Please note this is just an estimate and we will customize & finalize details of the event with you via email.
        </div>
      </div>

      <div className="review-summary">
        <h3>Booking Summary</h3>
        
        <div className="summary-item">
          <strong>Group Size:</strong> {effectiveGroupSize} guests
          {formData.groupSize === 40 && formData.exactGroupSize && (
            <span className="summary-note"> (estimated from 40+)</span>
          )}
        </div>
        
        <div className="summary-item">
          <strong>Venue:</strong> {formData.venue}
          {formData.venue === 'Studio' && (
            <div className="studio-address">1770 W Berteau Ave (The Pottery Loop)</div>
          )}
        </div>
        
        <div className="summary-item">
          <strong>Preferred Dates:</strong>
          <ul className="date-list">
            {formData.flexibleDates?.start && formData.flexibleDates?.flexibility ? (
              // Show only flexible date when flexibility is selected
              <li className="flexible-range">
                {formatFlexibleDate(formData.flexibleDates)}
              </li>
            ) : (
              // Show specific dates when no flexibility is selected
              formData.dates.map(date => (
                <li key={date}>{formatDate(date)}</li>
              ))
            )}
          </ul>
        </div>
        
        <div className="summary-item">
          <strong>Contact:</strong>
          <div className="contact-details">
            <div>{formData.contact.name}</div>
            <div>{formData.contact.phone}</div>
            <div>{formData.contact.email}</div>
            {formData.contact.notes && (
              <div className="notes">
                <strong>Notes:</strong> {formData.contact.notes}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Event Type and Workshop Combinations */}
      <div className="workshop-estimates">
        <h3>Workshop Estimates</h3>
        <p className="workshop-subtitle">Click on any section to view detailed pricing and information</p>
        
        {formData.workshops.length > 1 && (
          <div className="multiple-workshops-note">
            <strong>Note:</strong> You've selected multiple workshops. We'll follow up to confirm your final preference for the activity.
          </div>
        )}
        
        {formData.eventTypes.map(eventType => (
          <div key={eventType} className="event-type-section">
            <h4 className="event-type-header">
              <span className="event-type-emoji">{getEventTypeEmoji(eventType)}</span>
              {eventType}
            </h4>
            
            {formData.workshops.map(workshop => {
              const sectionId = `${eventType}-${workshop}`
              const isExpanded = expandedSections[sectionId]
              const pricing = calculatePricing(workshop, formData.venue, formData.groupSize, formData.exactGroupSize)
              
              return (
                <div key={sectionId} className="workshop-estimate-card">
                  <button
                    className="workshop-card-header"
                    onClick={() => toggleSection(sectionId)}
                    aria-expanded={isExpanded}
                  >
                    <div className="workshop-card-title">
                      <span className="workshop-emoji">{getWorkshopEmoji(workshop)}</span>
                      <span className="workshop-name">{workshop}</span>
                    </div>
                    <div className="workshop-card-pricing">
                      <span className="workshop-price">${pricing.total.toLocaleString()}</span>
                      <span className="workshop-chevron">{isExpanded ? '▼' : '▶'}</span>
                    </div>
                  </button>
                  
                  {isExpanded && (
                    <div className="workshop-card-details">
                      <div className="pricing-breakdown">
                        <div className="breakdown-line">
                          <span>Per person:</span>
                          <span>${pricing.perPerson}</span>
                        </div>
                        <div className="breakdown-line">
                          <span>Group size:</span>
                          <span>{effectiveGroupSize} guests</span>
                        </div>
                        <div className="breakdown-line total-line">
                          <span>Total:</span>
                          <span>${pricing.total.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div className="readiness-info">
                        <strong>Timeline:</strong> {pricing.readinessNote}
                      </div>
                      
                      <div className="workshop-actions">
                        <button 
                          className="edit-button"
                          onClick={() => {/* TODO: Implement edit functionality */}}
                        >
                          Edit Workshop
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      <div className="agreement-section">
        <label className="agreement-checkbox">
          <input
            type="checkbox"
            checked={formData.agreement || false}
            onChange={(e) => updateFormData('agreement', e.target.checked)}
            className="agreement-input"
          />
          <span className="agreement-text">
            By submitting this form you agree to have us contact you via the phone or email you provided to plan this event. 
            <strong> We'll review your request and contact you to confirm availability and next steps to book.</strong> 
            Submitting this form does not guarantee a reservation.
          </span>
        </label>
        {errors.agreement && (
          <div className="error-message">{errors.agreement}</div>
        )}
      </div>

      {errors.submit && (
        <div className="error-message">{errors.submit}</div>
      )}
    </div>
  )
}

export default ReviewStep
