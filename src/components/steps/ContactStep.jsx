import React from 'react'

function ContactStep({ formData, errors, updateContactData }) {
  return (
    <div className="form-group">
      <div className="form-group">
        <label className="form-label">Name *</label>
        <input
          type="text"
          value={formData.contact.name}
          onChange={(e) => updateContactData('name', e.target.value)}
          className={`form-control ${errors.contact?.name ? 'error' : ''}`}
          placeholder="Your full name"
        />
        {errors.contact?.name && (
          <div className="error-message">{errors.contact.name}</div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">Phone *</label>
        <input
          type="tel"
          value={formData.contact.phone}
          onChange={(e) => updateContactData('phone', e.target.value)}
          className={`form-control ${errors.contact?.phone ? 'error' : ''}`}
          placeholder="(555) 123-4567"
        />
        {errors.contact?.phone && (
          <div className="error-message">{errors.contact.phone}</div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">Email *</label>
        <input
          type="email"
          value={formData.contact.email}
          onChange={(e) => updateContactData('email', e.target.value)}
          className={`form-control ${errors.contact?.email ? 'error' : ''}`}
          placeholder="your.email@example.com"
        />
        {errors.contact?.email && (
          <div className="error-message">{errors.contact.email}</div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">Notes (optional)</label>
        <textarea
          value={formData.contact.notes}
          onChange={(e) => updateContactData('notes', e.target.value)}
          className="form-control"
          rows="4"
          placeholder="Any special requests or additional information..."
        />
      </div>
    </div>
  )
}

export default ContactStep
