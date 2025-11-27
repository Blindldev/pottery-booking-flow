import React, { useState, useEffect } from 'react'
import EventTypeStep from './steps/EventTypeStep'
import GroupSizeStep from './steps/GroupSizeStep'
import VenueStep from './steps/VenueStep'
import WorkshopStep from './steps/WorkshopStep'
import DateStep from './steps/DateStep'
import ContactStep from './steps/ContactStep'
import ReviewStep from './steps/ReviewStep'
import SuccessStep from './steps/SuccessStep'
import { validateStep, getWorkshopConstraints, calculatePricing, getEffectiveGroupSize } from '../utils/validation'

const STEPS = [
  { id: 'eventType', title: '🎨 Choose Your Event Type', emoji: '🎨', component: EventTypeStep },
  { id: 'groupSize', title: '👥 Gather Your Group', emoji: '👥', component: GroupSizeStep },
  { id: 'venue', title: '📍 Choose a Location', emoji: '📍', component: VenueStep },
  { id: 'workshop', title: '🏺 Select Workshop', emoji: '🏺', component: WorkshopStep },
  { id: 'dates', title: '📅 Pick Your Dates', emoji: '📅', component: DateStep },
  { id: 'contact', title: '📝 Contact Details', emoji: '📝', component: ContactStep },
  { id: 'review', title: '✨ Final Review', emoji: '✨', component: ReviewStep },
]

function BookingFlow() {
  // Load saved state from localStorage on component mount
  const getSavedState = () => {
    try {
      const savedStep = localStorage.getItem('bookingFlow_currentStep')
      const savedFormData = localStorage.getItem('bookingFlow_formData')
      const savedErrors = localStorage.getItem('bookingFlow_errors')
      const savedSubmitted = localStorage.getItem('bookingFlow_isSubmitted')
      
      return {
        currentStep: savedStep ? parseInt(savedStep) : 0,
        formData: savedFormData ? JSON.parse(savedFormData) : {
          eventTypes: [],
          groupSize: 8,
          exactGroupSize: null,
          venue: '',
          workshops: [],
          dates: [],
          flexibleDates: null,
          contact: {
            name: '',
            phone: '',
            email: '',
            notes: ''
          },
          agreement: false
        },
        errors: savedErrors ? JSON.parse(savedErrors) : {},
        isSubmitted: savedSubmitted === 'true'
      }
    } catch (error) {
      console.warn('Error loading saved state:', error)
      // Return default state if there's an error
      return {
        currentStep: 0,
        formData: {
          eventTypes: [],
          groupSize: 8,
          exactGroupSize: null,
          venue: '',
          workshops: [],
          dates: [],
          flexibleDates: null,
          contact: {
            name: '',
            phone: '',
            email: '',
            notes: ''
          },
          agreement: false
        },
        errors: {},
        isSubmitted: false
      }
    }
  }

  const savedState = getSavedState()
  const [currentStep, setCurrentStep] = useState(savedState.currentStep)
  const [formData, setFormData] = useState(savedState.formData)
  const [errors, setErrors] = useState(savedState.errors)
  const [isSubmitted, setIsSubmitted] = useState(savedState.isSubmitted)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Clear saved state function
  const clearSavedState = () => {
    try {
      localStorage.removeItem('bookingFlow_currentStep')
      localStorage.removeItem('bookingFlow_formData')
      localStorage.removeItem('bookingFlow_errors')
      localStorage.removeItem('bookingFlow_isSubmitted')
    } catch (error) {
      console.warn('Error clearing saved state:', error)
    }
  }

  // Detect if this is a page refresh (not initial load)
  useEffect(() => {
    const isRefresh = performance.navigation?.type === 1 || 
                     performance.getEntriesByType('navigation')[0]?.type === 'reload'
    
    if (isRefresh) {
      console.log('Page refreshed - restored saved state')
    }
  }, [])

  // Auto-save state whenever formData, currentStep, errors, or isSubmitted changes
  useEffect(() => {
    // Skip saving on initial mount (state is already loaded from localStorage)
    const isInitialMount = currentStep === 0 && 
                          (!formData.eventTypes || formData.eventTypes.length === 0) && 
                          !formData.contact.name &&
                          !formData.venue
    
    if (isInitialMount) {
      return
    }
    
    saveState(formData, currentStep, errors, isSubmitted)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, currentStep, errors, isSubmitted])

  // Save state to localStorage
  const saveState = (newFormData, newCurrentStep, newErrors, newIsSubmitted) => {
    try {
      localStorage.setItem('bookingFlow_formData', JSON.stringify(newFormData))
      localStorage.setItem('bookingFlow_currentStep', newCurrentStep.toString())
      localStorage.setItem('bookingFlow_errors', JSON.stringify(newErrors))
      localStorage.setItem('bookingFlow_isSubmitted', newIsSubmitted.toString())
    } catch (error) {
      console.warn('Error saving state:', error)
    }
  }

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear errors when user makes changes
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }))
    }
  }

  const updateContactData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: value
      }
    }))
    
    // Clear contact errors when user makes changes
    if (errors.contact && errors.contact[field]) {
      setErrors(prev => ({
        ...prev,
        contact: {
          ...prev.contact,
          [field]: null
        }
      }))
    }
  }

  const nextStep = () => {
    const stepId = STEPS[currentStep].id
    const stepErrors = validateStep(stepId, formData)
    
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      return
    }

    // Clear invalid workshops when group size or venue changes
    if (stepId === 'groupSize' || stepId === 'venue') {
      const effectiveGroupSize = getEffectiveGroupSize(formData.groupSize, formData.exactGroupSize)
      const constraints = getWorkshopConstraints(effectiveGroupSize, formData.venue)
      
      if (formData.workshops && formData.workshops.length > 0) {
        const validWorkshops = formData.workshops.filter(workshop => constraints[workshop])
        if (validWorkshops.length !== formData.workshops.length) {
          updateFormData('workshops', validWorkshops)
        }
      }
    }
    
    // Clear venue selection if On-site becomes invalid due to group size
    if (stepId === 'groupSize') {
      const effectiveGroupSize = getEffectiveGroupSize(formData.groupSize, formData.exactGroupSize)
      if (formData.venue === 'On-site' && effectiveGroupSize < 10) {
        updateFormData('venue', '')
      }
    }

    setErrors({})
    const newStep = Math.min(currentStep + 1, STEPS.length)
    setCurrentStep(newStep)
    
    // Save state to localStorage only when moving to next step
    saveState(formData, newStep, {}, isSubmitted)
  }


  const goToStep = (stepIndex) => {
    // Allow navigation to current step, previous steps, or completed steps
    if (stepIndex <= currentStep || isStepCompleted(stepIndex)) {
      setCurrentStep(stepIndex)
      setErrors({})
      
      // Save state to localStorage when navigating between steps
      saveState(formData, stepIndex, {}, isSubmitted)
    }
  }

  const isStepCompleted = (stepIndex) => {
    const step = STEPS[stepIndex]
    if (!step) return false

    // Check if event type is selected first (required for most steps)
    const hasEventType = formData.eventTypes && formData.eventTypes.length > 0

    switch (step.id) {
      case 'eventType':
        return formData.eventTypes && formData.eventTypes.length > 0
      case 'groupSize':
        // Group size requires event type to be selected first
        return hasEventType && formData.groupSize && formData.groupSize >= 1
      case 'venue':
        return formData.venue !== ''
      case 'workshop':
        return formData.workshops && formData.workshops.length > 0
      case 'dates':
        return formData.dates && formData.dates.length > 0
      case 'contact':
        return formData.contact.name && formData.contact.phone && formData.contact.email
      case 'review':
        // Review step requires event type and contact details to be completed
        return hasEventType && formData.contact.name && formData.contact.phone && formData.contact.email
      default:
        return false
    }
  }

  const prevStep = () => {
    const newStep = Math.max(currentStep - 1, 0)
    setCurrentStep(newStep)
    setErrors({})
    
    // Save state to localStorage when going back
    saveState(formData, newStep, {}, isSubmitted)
  }

  const submitForm = async () => {
    console.log('Submit button clicked!')
    console.log('Current form data:', formData)
    
    const finalErrors = validateStep('review', formData)
    console.log('Validation errors:', finalErrors)
    
    if (Object.keys(finalErrors).length > 0) {
      setErrors(finalErrors)
      return
    }

    setIsSubmitting(true)
    setErrors({})

    // Calculate estimates for all selected workshops
    const workshopEstimates = formData.workshops.map(workshop => {
      const pricing = calculatePricing(workshop, formData.venue, formData.groupSize, formData.exactGroupSize)
      return {
        workshop,
        ...pricing
      }
    })
    
    const totalEstimate = workshopEstimates.reduce((sum, est) => sum + est.total, 0)
    
    // Prepare submission data
    const submissionData = {
      eventTypes: formData.eventTypes,
      groupSize: formData.groupSize,
      exactGroupSize: formData.exactGroupSize,
      venue: formData.venue,
      workshops: formData.workshops,
      dates: formData.dates,
      flexibleDates: formData.flexibleDates,
      contact: formData.contact,
      workshopEstimates,
      totalEstimate,
      submittedAt: new Date().toISOString()
    }
    
    try {
      // Check if API is configured
      const API_URL = import.meta.env.VITE_AWS_API_URL
      
      if (API_URL) {
        // Send to AWS API Gateway
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submissionData)
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || `Server error: ${response.status}`)
        }
        
        const result = await response.json()
        if (import.meta.env.DEV) {
          console.log('Booking submitted successfully')
        }
      } else {
        // Fallback: log to console if API not configured (dev only)
        if (import.meta.env.DEV) {
          console.log('API not configured. Booking data:', submissionData)
          console.warn('To enable AWS integration, set VITE_AWS_API_URL in your .env file')
        }
      }
      
      setIsSubmitted(true)
      
      // Clear saved state after successful submission
      try {
        localStorage.removeItem('bookingFlow_currentStep')
        localStorage.removeItem('bookingFlow_formData')
        localStorage.removeItem('bookingFlow_errors')
        localStorage.removeItem('bookingFlow_isSubmitted')
      } catch (error) {
        console.warn('Error clearing saved state:', error)
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Submission error:', error)
      }
      const errorMessage = error.message || 'Failed to submit form. Please try again.'
      setErrors({ submit: errorMessage })
      // Still show success to user, but log the error
      // This prevents user frustration if AWS is temporarily down
      setIsSubmitted(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRestartFromSuccess = () => {
    clearSavedState()
    setIsSubmitted(false)
    setCurrentStep(0)
    setFormData({
      eventTypes: [],
      groupSize: 8,
      exactGroupSize: null,
      venue: '',
      workshops: [],
      dates: [],
      flexibleDates: null,
      contact: {
        name: '',
        phone: '',
        email: '',
        notes: ''
      },
      agreement: false
    })
    setErrors({})
  }

  if (isSubmitted) {
    return (
      <div className="booking-flow">
        <div className="step-header" data-step="success">
          <h2 className="step-title">✨ Success!</h2>
        </div>
        <div className="step-content">
          <SuccessStep />
          <div className="success-restart-section">
            <button
              onClick={handleRestartFromSuccess}
              className="btn-restart-success"
            >
              ↻ Start New Booking
            </button>
          </div>
        </div>
      </div>
    )
  }

  const CurrentStepComponent = STEPS[currentStep].component
  const progress = ((currentStep + 1) / STEPS.length) * 100

  return (
    <div className="booking-flow">
      <div className="step-header" data-step={STEPS[currentStep].id}>
        <div className="progress-bar">
          <div className="pot-progress" style={{ width: `${progress}%` }} />
        <div className="progress-steps" role="navigation" aria-label="Booking flow steps">
          {STEPS.map((step, index) => {
            const isCompleted = isStepCompleted(index)
            const isAccessible = index <= currentStep || isCompleted
            
            return (
              <button
                key={index}
                className={`progress-step ${
                  isCompleted ? 'completed' :
                  index === currentStep ? 'current' : ''
                } ${!isAccessible ? 'disabled' : ''}`}
                onClick={() => goToStep(index)}
                disabled={!isAccessible}
                aria-label={`Go to step ${index + 1}: ${step.title}`}
                aria-current={index === currentStep ? 'step' : undefined}
                aria-describedby={!isAccessible ? `step-${index}-disabled` : undefined}
                data-emoji={step.emoji}
              >
                <span className="sr-only">{step.title}</span>
                {isCompleted && <span className="sr-only">Completed</span>}
              </button>
            )
          })}
        </div>
        </div>
        <h2 id={`step-${STEPS[currentStep].id}`} className="step-title">{STEPS[currentStep].title}</h2>
        {currentStep === 0 && <p className="step-subtitle">Choose one to help us tailor the perfect pottery experience.</p>}
        {currentStep === 1 && <p className="step-subtitle">Please provide an estimated group size</p>}
        {currentStep === 2 && <p className="step-subtitle">Choose our studio or we'll come to your location!</p>}
        {currentStep === 3 && <p className="step-subtitle">Select all offerings you are interesed in, we'll narrow down to one later!</p>}
        {currentStep === 4 && <p className="step-subtitle">Being flexible with your dates helps us work you into the studio schedule. If you want specific times or have special requests, please leave notes.</p>}
        {currentStep === 5 && <p className="step-subtitle">Tell us how to reach you for your pottery adventure.</p>}
        {currentStep === 6 && <p className="step-subtitle">Almost ready to create! Let's review your pottery journey.</p>}
      </div>

      <div className="step-content">
        <CurrentStepComponent
          formData={formData}
          errors={errors}
          updateFormData={updateFormData}
          updateContactData={updateContactData}
          goToStep={goToStep}
        />
        
        {errors.submit && (
          <div className="submit-error">
            {errors.submit}
          </div>
        )}
      </div>

      <div className="step-footer">
        <button
          className="btn btn-secondary"
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          Previous
        </button>
        
        {currentStep === STEPS.length - 1 ? (
          <button
            className="btn btn-primary"
            data-step={STEPS[currentStep].id}
            onClick={submitForm}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
        ) : (
          <button
            className="btn btn-primary"
            data-step={STEPS[currentStep].id}
            onClick={nextStep}
          >
            Next
          </button>
        )}
      </div>

      {/* Start Over Button */}
      <div className="start-over-section">
        <button
          className="start-over-btn"
          onClick={() => {
            clearSavedState()
            window.location.reload()
          }}
        >
          Start Over
        </button>
      </div>
    </div>
  )
}

export default BookingFlow
