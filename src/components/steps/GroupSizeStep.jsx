import React from 'react'

function GroupSizeStep({ formData, errors, updateFormData }) {
  const handleSliderChange = (e) => {
    const value = parseInt(e.target.value)
    updateFormData('groupSize', value)
    
    // Clear exact group size when slider moves away from 40
    if (value !== 40) {
      updateFormData('exactGroupSize', null)
    }
  }

  const handleNumericChange = (e) => {
    let value = parseInt(e.target.value)
    
    // Clamp to valid range
    if (value < 1) value = 1
    if (value > 40) value = 40
    
    updateFormData('groupSize', value)
    
    // Clear exact group size when not at 40
    if (value !== 40) {
      updateFormData('exactGroupSize', null)
    }
  }

  const handleExactSizeChange = (e) => {
    const value = e.target.value ? parseInt(e.target.value) : null
    updateFormData('exactGroupSize', value)
  }

  const displaySize = formData.groupSize === 40 && formData.exactGroupSize 
    ? formData.exactGroupSize 
    : formData.groupSize === 40 
    ? '40+' 
    : formData.groupSize

  const effectiveGroupSize = formData.groupSize === 40 && formData.exactGroupSize 
    ? formData.exactGroupSize 
    : formData.groupSize

  return (
    <div className="form-group">
      <label className="form-label">Group Size</label>
      
      <div className="group-size-controls">
        <div className="slider-container">
        <input
          type="range"
          min="1"
          max="40"
          value={formData.groupSize}
          onChange={handleSliderChange}
          className="slider"
        />
          <div className="slider-value">{displaySize} guests</div>
        </div>
        
        <div className="numeric-input-container">
          <label className="numeric-label">Or type a number:</label>
          <input
            type="number"
            min="1"
            max="40"
            step="1"
            value={formData.groupSize}
            onChange={handleNumericChange}
            className="numeric-input"
            placeholder="1-40"
          />
        </div>
      </div>
      
      {formData.groupSize >= 1 && formData.groupSize <= 7 && (
        <div className="group-size-warning">
          <div className="warning-icon">💰</div>
          <div className="warning-content">
            <strong>Small Group Notice:</strong> Bookings of this size are typically too small for a private event. We will still consider your inquiry, but groups of 8+ have a better chance at securing a private booking.
          </div>
        </div>
      )}
      
      {formData.groupSize === 40 && (
        <div className="form-group">
          <label className="form-label">Estimated exact count (optional)</label>
          <input
            type="number"
            min="40"
            max="100"
            value={formData.exactGroupSize || ''}
            onChange={handleExactSizeChange}
            className="form-control"
            placeholder="Enter exact number if known"
          />
        </div>
      )}
      
      <p className="form-text">We can adjust later; this helps us quote accurately.</p>
      
      {errors.groupSize && (
        <div className="error-message">{errors.groupSize}</div>
      )}
    </div>
  )
}

export default GroupSizeStep
