// Workshop constraints based on group size and venue
export const WORKSHOP_CONSTRAINTS = {
  'Pottery Wheel classes': {
    minSize: 1,
    maxSize: 15,
    venues: ['Studio']
  },
  'Handbuilding workshops': {
    minSize: 1,
    maxSize: 30,
    venues: ['Studio']
  },
  'Custom mug glazing workshop': {
    minSize: 1,
    maxSize: Infinity,
    venues: ['Studio', 'On-site']
  },
  'Custom candle making workshops': {
    minSize: 1,
    maxSize: Infinity,
    venues: ['Studio', 'On-site']
  },
  'Custom magnet making workshops': {
    minSize: 1,
    maxSize: 20,
    venues: ['Studio']
  },
  'Custom Glazing trinket tray workshops': {
    minSize: 1,
    maxSize: Infinity,
    venues: ['Studio', 'On-site']
  }
}

// Pricing per workshop and venue
export const PRICING = {
  'Pottery Wheel classes': { Studio: 45 },
  'Handbuilding workshops': { Studio: 45 },
  'Custom mug glazing workshop': { Studio: 35, 'On-site': 40 },
  'Custom candle making workshops': { Studio: 40, 'On-site': 45 },
  'Custom magnet making workshops': { Studio: 45 },
  'Custom Glazing trinket tray workshops': { Studio: 35, 'On-site': 40 }
}

// Readiness notes per workshop
export const READINESS_NOTES = {
  'Pottery Wheel classes': 'Ready in ~3 weeks (single color glazing)',
  'Handbuilding workshops': 'Ready in ~3 weeks (single color glazing)',
  'Custom mug glazing workshop': 'Ready in ~2 weeks',
  'Custom candle making workshops': 'Take home same day (or curing guidance)',
  'Custom magnet making workshops': 'Glazed during session (set of 4 tiny fridge magnets)',
  'Custom Glazing trinket tray workshops': 'Ready in ~2 weeks'
}

export const getWorkshopConstraints = (groupSize, venue) => {
  const constraints = {}
  
  Object.entries(WORKSHOP_CONSTRAINTS).forEach(([workshop, rules]) => {
    const sizeValid = groupSize >= rules.minSize && groupSize <= rules.maxSize
    const venueValid = rules.venues.includes(venue)
    constraints[workshop] = sizeValid && venueValid
  })
  
  return constraints
}

export const getEffectiveGroupSize = (groupSize, exactGroupSize) => {
  return groupSize === 40 && exactGroupSize ? exactGroupSize : groupSize
}

export const calculatePricing = (workshop, venue, groupSize, exactGroupSize = null) => {
  if (!workshop || !venue) {
    return { perPerson: 0, total: 0, readinessNote: '' }
  }
  
  const basePrice = PRICING[workshop]?.[venue] || 0
  const effectiveGroupSize = groupSize === 40 && exactGroupSize ? exactGroupSize : groupSize
  
  // Apply tiered pricing based on group size (exclude glazing workshops)
  const glazingWorkshops = [
    'Custom mug glazing workshop',
    'Custom candle making workshops', 
    'Custom Glazing trinket tray workshops'
  ]
  
  let perPerson = basePrice
  if (!glazingWorkshops.includes(workshop)) {
    // Only apply small group pricing to non-glazing workshops
    if (effectiveGroupSize >= 1 && effectiveGroupSize <= 3) {
      // 100% more expensive (2x base price)
      perPerson = basePrice * 2
    } else if (effectiveGroupSize >= 4 && effectiveGroupSize <= 5) {
      // 50% more expensive (1.5x base price)
      perPerson = basePrice * 1.5
    } else if (effectiveGroupSize === 6) {
      // 33.3333% more expensive (1.333333x base price)
      perPerson = basePrice * 1.333333
    } else if (effectiveGroupSize === 7) {
      // 14.2857% more expensive (1.142857x base price)
      perPerson = basePrice * 1.142857
    }
  }
  // Glazing workshops and groups of 8+ use base pricing
  
  const total = perPerson * effectiveGroupSize
  const readinessNote = READINESS_NOTES[workshop] || ''
  
  return { perPerson: Math.round(perPerson * 100) / 100, total: Math.round(total * 100) / 100, readinessNote, effectiveGroupSize }
}

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePhone = (phone) => {
  const phoneDigits = phone.replace(/\D/g, '')
  return phoneDigits.length >= 7
}

export const validateStep = (stepId, formData) => {
  const errors = {}
  
  switch (stepId) {
    case 'eventType':
      if (!formData.eventTypes || formData.eventTypes.length === 0) {
        errors.eventTypes = 'Please select at least one event type'
      }
      break
      
    case 'groupSize':
      if (!formData.groupSize || formData.groupSize < 1) {
        errors.groupSize = 'Please select a group size'
      }
      // If slider is at 40 and exact size is provided, validate it
      if (formData.groupSize === 40 && formData.exactGroupSize && formData.exactGroupSize < 40) {
        errors.groupSize = 'Exact group size must be at least 40 when slider is at 40+'
      }
      break
      
    case 'venue':
      if (!formData.venue) {
        errors.venue = 'Please select a venue'
      }
      break
      
    case 'workshop':
      if (!formData.workshops || formData.workshops.length === 0) {
        errors.workshops = 'Please select at least one workshop'
      } else {
        const effectiveGroupSize = getEffectiveGroupSize(formData.groupSize, formData.exactGroupSize)
        const constraints = getWorkshopConstraints(effectiveGroupSize, formData.venue)
        
        const invalidWorkshops = formData.workshops.filter(workshop => !constraints[workshop])
        if (invalidWorkshops.length > 0) {
          const workshopRules = WORKSHOP_CONSTRAINTS[invalidWorkshops[0]]
          if (workshopRules) {
            if (effectiveGroupSize < workshopRules.minSize) {
              errors.workshops = `Some workshops require at least ${workshopRules.minSize} guests`
            } else if (effectiveGroupSize > workshopRules.maxSize) {
              errors.workshops = `Some workshops support up to ${workshopRules.maxSize} guests`
            } else if (!workshopRules.venues.includes(formData.venue)) {
              errors.workshops = 'Some workshops are only available at our studio'
            }
          }
        }
      }
      break
      
    case 'dates':
      const hasSpecificDates = formData.dates && formData.dates.length > 0
      const hasFlexibleDates = formData.flexibleDates && 
        formData.flexibleDates.flexibility
      
      if (!hasSpecificDates) {
        errors.dates = 'Please select a preferred date'
      }
      break
      
    case 'contact':
      if (!formData.contact.name?.trim()) {
        errors.contact = { ...errors.contact, name: 'Name is required' }
      }
      if (!formData.contact.phone?.trim()) {
        errors.contact = { ...errors.contact, phone: 'Phone is required' }
      } else if (!validatePhone(formData.contact.phone)) {
        errors.contact = { ...errors.contact, phone: 'Please enter a valid phone number' }
      }
      if (!formData.contact.email?.trim()) {
        errors.contact = { ...errors.contact, email: 'Email is required' }
      } else if (!validateEmail(formData.contact.email)) {
        errors.contact = { ...errors.contact, email: 'Please enter a valid email address' }
      }
      break
      
    case 'review':
      // Validate all required fields
      const allErrors = {}
      
      if (!formData.eventTypes || formData.eventTypes.length === 0) allErrors.eventTypes = 'Event type is required'
      if (!formData.groupSize || formData.groupSize < 1) allErrors.groupSize = 'Group size is required'
      if (!formData.venue) allErrors.venue = 'Venue is required'
      if (!formData.workshops || formData.workshops.length === 0) allErrors.workshops = 'Workshop is required'
      
      // Check for dates - either specific dates or flexible dates
      const hasSpecificDatesReview = formData.dates && formData.dates.length > 0
      const hasFlexibleDatesReview = formData.flexibleDates && formData.flexibleDates.start
      if (!hasSpecificDatesReview && !hasFlexibleDatesReview) {
        allErrors.dates = 'Please select dates or provide flexible date range'
      }
      
      if (!formData.contact.name?.trim()) {
        allErrors.contact = { ...allErrors.contact, name: 'Name is required' }
      }
      if (!formData.contact.phone?.trim()) {
        allErrors.contact = { ...allErrors.contact, phone: 'Phone is required' }
      } else if (!validatePhone(formData.contact.phone)) {
        allErrors.contact = { ...allErrors.contact, phone: 'Please enter a valid phone number' }
      }
      if (!formData.contact.email?.trim()) {
        allErrors.contact = { ...allErrors.contact, email: 'Email is required' }
      } else if (!validateEmail(formData.contact.email)) {
        allErrors.contact = { ...allErrors.contact, email: 'Please enter a valid email address' }
      }
      
      if (!formData.agreement) {
        allErrors.agreement = 'You must agree to be contacted to proceed'
      }
      
      return allErrors
  }
  
  return errors
}
