import React from 'react'
import { getWorkshopConstraints, calculatePricing, getEffectiveGroupSize, WORKSHOP_CONSTRAINTS } from '../../utils/validation'

const WORKSHOPS = [
  { 
    id: 'Pottery Wheel classes', 
    name: 'Pottery Wheel Classes', 
    tagline: 'Master the spinning wheel and create beautiful ceramics',
    emoji: '🌀',
    description: 'Learn the art of throwing clay on the pottery wheel. Create bowls, mugs, and vases while mastering the spinning wheel technique. Perfect for beginners and those wanting to refine their skills.',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center',
    readinessNote: 'Ready in ~3 weeks (single color glazing)',
    duration: '90 min',
    skillLevel: 'Beginner+',
    maxGroupSize: 15
  },
  { 
    id: 'Handbuilding workshops', 
    name: 'Handbuilding Workshops', 
    tagline: 'Create unique pottery using traditional hand techniques',
    emoji: '👐',
    description: 'Create pottery using hand-building techniques like pinch pots, coil building, and slab construction. Perfect for unique, organic shapes and those who prefer a more tactile approach to pottery.',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center',
    readinessNote: 'Ready in ~3 weeks (single color glazing)',
    duration: '90 min',
    skillLevel: 'All Levels',
    maxGroupSize: 30
  },
  { 
    id: 'Custom mug glazing workshop', 
    name: 'Custom Mug Glazing', 
    tagline: 'Design and glaze your own personalized mugs',
    emoji: '☕️',
    description: 'Design and glaze your own custom mugs. Choose from our selection of bisque-fired mugs and create unique patterns and colors. No pottery experience needed!',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center',
    readinessNote: 'Ready in ~2 weeks',
    duration: '60 min',
    skillLevel: 'All Levels',
    maxGroupSize: 40
  },
  { 
    id: 'Custom candle making workshops', 
    name: 'Candle Making Workshop', 
    tagline: 'Create beautiful scented candles in pottery containers',
    emoji: '🕯️',
    description: 'Create beautiful, scented candles in pottery containers. Learn candle-making techniques while designing your own ceramic vessels. Take home your creations the same day!',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center',
    readinessNote: 'Take home same day (or curing guidance)',
    duration: '75 min',
    skillLevel: 'All Levels',
    maxGroupSize: 40
  },
  { 
    id: 'Custom magnet making workshops', 
    name: 'Magnet Making Workshop', 
    tagline: 'Design adorable ceramic magnets for your fridge',
    emoji: '🧲',
    description: 'Create adorable ceramic magnets for your fridge. Design, paint, and glaze tiny pottery pieces that will brighten your kitchen. Perfect for all ages!',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center',
    readinessNote: 'Glazed during session (set of 4 tiny fridge magnets)',
    duration: '45 min',
    skillLevel: 'All Levels',
    maxGroupSize: 20
  },
  { 
    id: 'Custom Glazing trinket tray workshops', 
    name: 'Trinket Tray Glazing', 
    tagline: 'Design beautiful trays for jewelry and small items',
    emoji: '🍽️',
    description: 'Design beautiful trinket trays for jewelry, keys, or small items. Learn glazing techniques to create functional art pieces that add beauty to your home.',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center',
    readinessNote: 'Ready in ~2 weeks',
    duration: '60 min',
    skillLevel: 'All Levels',
    maxGroupSize: 40
  }
]

function WorkshopStep({ formData, errors, updateFormData, goToStep }) {
  const [expandedInfo, setExpandedInfo] = React.useState({})
  
  // Calculate effective group size for filtering
  const effectiveGroupSize = getEffectiveGroupSize(formData.groupSize, formData.exactGroupSize)
  
  const constraints = getWorkshopConstraints(effectiveGroupSize, formData.venue)
  
  const handleWorkshopToggle = (workshopId) => {
    const currentWorkshops = formData.workshops || []
    const isSelected = currentWorkshops.includes(workshopId)
    
    if (isSelected) {
      // Remove workshop
      updateFormData('workshops', currentWorkshops.filter(id => id !== workshopId))
    } else {
      // Add workshop
      updateFormData('workshops', [...currentWorkshops, workshopId])
    }
  }

  const toggleInfo = (workshopId) => {
    setExpandedInfo(prev => ({
      ...prev,
      [workshopId]: !prev[workshopId]
    }))
  }
  
  const getConstraintMessage = (workshopId) => {
    const constraint = constraints[workshopId]
    if (constraint) return null
    
    // Determine why it's disabled
    if (formData.venue === 'On-site') {
      if (['Pottery Wheel classes', 'Handbuilding workshops', 'Custom magnet making workshops'].includes(workshopId)) {
        return 'Studio only'
      }
    }
    
    if (workshopId === 'Pottery Wheel classes' && effectiveGroupSize > 15) {
      return 'Maximum 15 guests'
    }
    
    if (workshopId === 'Handbuilding workshops' && effectiveGroupSize > 30) {
      return 'Maximum 30 guests'
    }
    
    if (workshopId === 'Custom magnet making workshops' && effectiveGroupSize > 20) {
      return 'Maximum 20 guests'
    }
    
    return 'Not available'
  }

  const getPrice = (workshopId) => {
    if (!formData.venue) return ''
    const pricing = calculatePricing(workshopId, formData.venue, effectiveGroupSize)
    return `$${pricing.perPerson}`
  }

  const getLocationBadge = () => {
    return formData.venue === 'Studio' ? 'Studio' : 'Off-site'
  }

  // Filter out workshops that exceed maximum capacity
  const availableWorkshops = WORKSHOPS.filter(workshop => {
    const constraint = constraints[workshop.id]
    return constraint !== false // Show if available or if disabled for other reasons
  }).sort((a, b) => {
    // Sort by base price for the selected venue (cheapest first)
    if (!formData.venue) return 0
    
    const priceA = calculatePricing(a.id, formData.venue, 8).perPerson // Use base group size for sorting
    const priceB = calculatePricing(b.id, formData.venue, 8).perPerson
    
    if (priceA !== priceB) {
      return priceA - priceB
    }
    
    // If prices are equal, maintain original order
    return 0
  })

  // Check if any workshops are disabled due to group size limits
  const hasSizeLimitedWorkshops = availableWorkshops.some(workshop => {
    const constraint = constraints[workshop.id]
    if (constraint === false) {
      // Check if it's disabled due to size limits (not venue)
      const workshopRules = WORKSHOP_CONSTRAINTS[workshop.id]
      if (workshopRules && effectiveGroupSize > workshopRules.maxSize && workshopRules.venues.includes(formData.venue)) {
        return true
      }
    }
    return false
  })

  return (
    <div className="form-group">
      <label className="form-label">Workshop Selection</label>
      <p className="form-subtitle">Select all that you are interested in</p>
      
      {availableWorkshops.length === 0 ? (
        <div className="no-workshops-message">
          <p>No workshops are available for {effectiveGroupSize} guests at {formData.venue === 'Studio' ? 'our studio' : 'your location'}.</p>
          <p>Please adjust your group size or venue selection.</p>
        </div>
      ) : (
        <div className="workshop-grid">
          {availableWorkshops.map(workshop => {
            const isDisabled = !constraints[workshop.id]
            const constraintMessage = getConstraintMessage(workshop.id)
            const isSmallGroup = effectiveGroupSize < 8
            const isSelected = (formData.workshops || []).includes(workshop.id)
            const isInfoExpanded = expandedInfo[workshop.id]
            
            return (
              <div
                key={workshop.id}
                className={`workshop-card ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''} ${isSmallGroup && !isDisabled ? 'small-group' : ''}`}
                role="button"
                tabIndex={isDisabled ? -1 : 0}
                onKeyDown={(e) => {
                  if (!isDisabled && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault()
                    handleWorkshopToggle(workshop.id)
                  }
                }}
                aria-pressed={isSelected}
                aria-disabled={isDisabled}
              >
                {/* Header Section */}
                <div className="workshop-header">
                  <div className="workshop-title-section">
                    <h3 className="workshop-title">
                      <span className="workshop-emoji">{workshop.emoji}</span>
                      {workshop.name}
                    </h3>
                    <p className="workshop-tagline">{workshop.tagline}</p>
                  </div>
                </div>

                {/* Facts Row */}
                <div className="workshop-facts">
                  <div className="fact-item price">
                    <span className="fact-label">Price</span>
                    <span className="fact-value">{getPrice(workshop.id)} / person</span>
                  </div>
                  <div className="fact-item duration">
                    <span className="fact-label">Duration</span>
                    <span className="fact-value">{workshop.duration}</span>
                  </div>
                  <div className="fact-item location">
                    <span className="fact-label">Location</span>
                    <span className="fact-value">{getLocationBadge()}</span>
                  </div>
                  <div className="fact-item skill">
                    <span className="fact-label">Skill</span>
                    <span className="fact-value">{workshop.skillLevel}</span>
                  </div>
                </div>

                {/* Constraint Message */}
                {constraintMessage && (
                  <div className="workshop-constraint">{constraintMessage}</div>
                )}

                {/* Action Footer */}
                <div className="workshop-actions">
                  <button
                    className={`workshop-select-btn ${isSelected ? 'selected' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (!isDisabled) {
                        handleWorkshopToggle(workshop.id)
                      }
                    }}
                    disabled={isDisabled}
                    aria-pressed={isSelected}
                  >
                    {isSelected ? '✓ Selected' : 'Select'}
                  </button>
                  
                  <button
                    className="workshop-info-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleInfo(workshop.id)
                    }}
                    aria-label={`More details about ${workshop.name}`}
                    aria-expanded={isInfoExpanded}
                    title="Details & photos"
                  >
                    <span className="info-text">Details</span>
                    <span className={`info-chevron ${isInfoExpanded ? 'expanded' : ''}`}>▼</span>
                  </button>
                </div>

                {/* Expandable Details Section */}
                {isInfoExpanded && (
                  <div className="workshop-details-panel">
                    <div className="workshop-details-content">
                      <div className="workshop-details-text">
                        <p className="workshop-description">{workshop.description}</p>
                        <div className="workshop-timeline">
                          <strong>Timeline:</strong> {workshop.readinessNote}
                        </div>
                        <div className="workshop-constraints">
                          <strong>Group Size:</strong> Up to {workshop.maxGroupSize} guests
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
      
      {hasSizeLimitedWorkshops && (
        <div className="workshop-size-note">
          <p><strong>Note:</strong> Some workshops are disabled because your group size exceeds their maximum capacity limits.</p>
        </div>
      )}
      
      {errors.workshops && (
        <div className="error-message">{errors.workshops}</div>
      )}
      
      {/* Global small group pricing notice */}
      {effectiveGroupSize < 8 && (
        <div className="global-small-group-notice">
          <div className="warning-icon">💰</div>
          <div className="warning-content">
            <strong>Small Group Pricing:</strong> Smaller groups have different pricing for pottery workshops (Wheel, Handbuilding, Magnets). Glazing workshops (Mugs, Candles, Trinket Trays) use standard pricing. If you are okay with others being in your group, please check out our regular class offerings.
          </div>
        </div>
      )}
      
      {/* Global availability disclaimer */}
      <div className="availability-disclaimer">
        <p><strong>Please note:</strong> All rates, estimates, and bookings are subject to availability.</p>
      </div>
    </div>
  )
}

export default WorkshopStep
