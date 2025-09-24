import React, { useState } from 'react'

function DateStep({ formData, errors, updateFormData }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  const handleDateClick = (date) => {
    const dateString = date.toISOString().split('T')[0]
    updateFormData('dates', [dateString])
  }

  const handleFlexibilityChange = (flexibility) => {
    updateFormData('flexibleDates', {
      ...formData.flexibleDates,
      start: selectedDate, // Set the selected date as the start date
      flexibility: flexibility
    })
  }

  const handleNotesChange = (e) => {
    updateFormData('flexibleDates', {
      ...formData.flexibleDates,
      notes: e.target.value
    })
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  const selectedDate = formData.dates && formData.dates.length > 0 ? formData.dates[0] : ''

  // Calendar generation functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const isDateInPast = (date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const isDateSelected = (date) => {
    if (!selectedDate) return false
    const dateString = date.toISOString().split('T')[0]
    return dateString === selectedDate
  }

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      newMonth.setMonth(prev.getMonth() + direction)
      return newMonth
    })
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth)
    const firstDay = getFirstDayOfMonth(currentMonth)
    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      const isPast = isDateInPast(date)
      const isSelected = isDateSelected(date)
      
      days.push(
        <div
          key={day}
          className={`calendar-day ${isPast ? 'past' : ''} ${isSelected ? 'selected' : ''}`}
          onClick={() => !isPast && handleDateClick(date)}
        >
          {day}
        </div>
      )
    }
    
    return days
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="form-group">
      <div className="date-step-header">
        <label className="form-label">Select Your Preferred Date</label>
        <p className="date-instruction">
          Click on a date in the calendar below to select your preferred date.
        </p>
      </div>

      {/* Embedded Calendar */}
      <div className="calendar-section">
        <div className="calendar-container">
          <div className="calendar-header">
            <button 
              className="calendar-nav-btn" 
              onClick={() => navigateMonth(-1)}
              aria-label="Previous month"
            >
              ‹
            </button>
            <h3 className="calendar-month-year">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <button 
              className="calendar-nav-btn" 
              onClick={() => navigateMonth(1)}
              aria-label="Next month"
            >
              ›
            </button>
          </div>
          
          <div className="calendar-grid">
            {dayNames.map(day => (
              <div key={day} className="calendar-day-header">{day}</div>
            ))}
            {renderCalendar()}
          </div>
        </div>
      </div>

      {/* Flexibility Options */}
      {selectedDate && (
        <div className="flexibility-section">
          <h4>How flexible are you with this date?</h4>
          <div className="flexibility-buttons">
            <button
              type="button"
              className={`flexibility-btn ${formData.flexibleDates?.flexibility === 'exact' ? 'selected' : ''}`}
              onClick={() => handleFlexibilityChange('exact')}
            >
              Exact
            </button>
            <button
              type="button"
              className={`flexibility-btn ${formData.flexibleDates?.flexibility === '+1' ? 'selected' : ''}`}
              onClick={() => handleFlexibilityChange('+1')}
            >
              +1 day
            </button>
            <button
              type="button"
              className={`flexibility-btn ${formData.flexibleDates?.flexibility === '1' ? 'selected' : ''}`}
              onClick={() => handleFlexibilityChange('1')}
            >
              ±1 day
            </button>
            <button
              type="button"
              className={`flexibility-btn ${formData.flexibleDates?.flexibility === '2' ? 'selected' : ''}`}
              onClick={() => handleFlexibilityChange('2')}
            >
              ±2 days
            </button>
            <button
              type="button"
              className={`flexibility-btn ${formData.flexibleDates?.flexibility === '3' ? 'selected' : ''}`}
              onClick={() => handleFlexibilityChange('3')}
            >
              ±3 days
            </button>
            <button
              type="button"
              className={`flexibility-btn ${formData.flexibleDates?.flexibility === '7' ? 'selected' : ''}`}
              onClick={() => handleFlexibilityChange('7')}
            >
              ±7 days
            </button>
            <button
              type="button"
              className={`flexibility-btn ${formData.flexibleDates?.flexibility === '14' ? 'selected' : ''}`}
              onClick={() => handleFlexibilityChange('14')}
            >
              ±14 days
            </button>
          </div>
        </div>
      )}

      {/* Notes Section */}
      <div className="notes-section">
        <label className="form-label">Additional Notes (Optional)</label>
        <textarea
          value={formData.flexibleDates?.notes || ''}
          onChange={handleNotesChange}
          className="form-control"
          rows="3"
          placeholder="Any specific availability constraints or preferences..."
        />
      </div>

      {/* Selected Date Display */}
      {selectedDate && (
        <div className="selected-date-display">
          <h4>Selected Date</h4>
          <div className="date-display-card">
            <div className="date-info">
              <span className="date-text">{formatDate(selectedDate)}</span>
              {formData.flexibleDates?.flexibility && (
                <span className="flexibility-text">
                  {formData.flexibleDates.flexibility === 'exact' 
                    ? '(exact date)' 
                    : formData.flexibleDates.flexibility === '+1'
                    ? '(+1 day)'
                    : `(±${formData.flexibleDates.flexibility} days)`
                  }
                </span>
              )}
            </div>
            {formData.flexibleDates?.notes && (
              <div className="notes-display">
                <strong>Notes:</strong> {formData.flexibleDates.notes}
              </div>
            )}
          </div>
        </div>
      )}
      
      {errors.dates && (
        <div className="error-message">{errors.dates}</div>
      )}
    </div>
  )
}

export default DateStep
