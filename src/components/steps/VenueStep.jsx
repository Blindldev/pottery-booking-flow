import React from 'react'
import { getEffectiveGroupSize } from '../../utils/validation'

const VENUES = [
  { id: 'Studio', name: 'Studio', description: 'Our pottery studio', emoji: '🏠' },
  { id: 'On-site', name: 'On-site at your location', description: 'We come to you', emoji: '🚚' }
]

function VenueStep({ formData, errors, updateFormData }) {
  const effectiveGroupSize = getEffectiveGroupSize(formData.groupSize, formData.exactGroupSize)
  
  const handleVenueSelect = (venueId) => {
    // Don't allow selection of On-site if group size is less than 10
    if (venueId === 'On-site' && effectiveGroupSize < 10) {
      return
    }
    updateFormData('venue', venueId)
  }

  return (
    <div className="form-group">
      <div className="option-grid">
        {VENUES.map(venue => {
          const isOnSiteDisabled = venue.id === 'On-site' && effectiveGroupSize < 10
          const isDisabled = isOnSiteDisabled
          
          return (
            <div
              key={venue.id}
              className={`option-card ${formData.venue === venue.id ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
              onClick={() => !isDisabled && handleVenueSelect(venue.id)}
              role="button"
              tabIndex={isDisabled ? -1 : 0}
              onKeyDown={(e) => {
                if (!isDisabled && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault()
                  handleVenueSelect(venue.id)
                }
              }}
              aria-pressed={formData.venue === venue.id}
              aria-disabled={isDisabled}
            >
                <div className="option-title">
                  <span className="option-emoji">{venue.emoji}</span>
                  <div className="option-title-text">
                    <div className="option-name">{venue.name}</div>
                    {venue.id === 'Studio' && (
                      <div className="studio-address-badge">1770 W Berteau Ave (The Pottery Loop)</div>
                    )}
                  </div>
                </div>
                <div className="option-description">{venue.description}</div>
                {isOnSiteDisabled && (
                  <div className="option-constraint">Minimum 10 guests required for on-site events</div>
                )}
            </div>
          )
        })}
      </div>
      
      {formData.venue === 'On-site' && (
        <div className="form-text">
          <strong>Note:</strong> Wheel, Handbuilding, and Magnets are studio-only workshops.
        </div>
      )}
      
      {errors.venue && (
        <div className="error-message">{errors.venue}</div>
      )}
    </div>
  )
}

export default VenueStep
