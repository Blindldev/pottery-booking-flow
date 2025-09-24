# PotteryChicago - Private Party Booking Flow

A multi-step booking form for PotteryChicago's private party and corporate event services at The Pottery Loop (1770 W Berteau Ave).

## Features

- **Multi-step wizard flow** with progress tracking
- **Dynamic workshop filtering** based on group size and venue constraints
- **Real-time pricing calculation** with per-person rates
- **Date selection** with up to 5 preferred dates
- **Form validation** with inline error messages
- **Accessibility support** with keyboard navigation and ARIA labels
- **Responsive design** that works on mobile and desktop

## Workshop Options

### Studio-Only Workshops
- **Pottery Wheel classes** - $45/person (8-15 guests, ready in ~3 weeks)
- **Handbuilding workshops** - $45/person (8-30 guests, ready in ~3 weeks)  
- **Custom magnet making workshops** - $45/person (8-20 guests, glazed during session)

### Studio or On-site Workshops
- **Custom mug glazing workshop** - $35/person studio, $40/person off-site (8+ guests, ready in ~2 weeks)
- **Custom candle making workshops** - $40/person studio, $45/person off-site (8+ guests, take home same day)
- **Custom Glazing trinket tray workshops** - $35/person studio, $40/person off-site (8+ guests, ready in ~2 weeks)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to `http://localhost:3007`

## Deployment to GitHub Pages

This project is configured for automatic deployment to GitHub Pages.

### Setup Instructions

1. **Create a GitHub repository** and push your code
2. **Enable GitHub Pages**:
   - Go to your repository settings
   - Navigate to "Pages" section
   - Source: "GitHub Actions"
3. **Configure your custom domain** (optional):
   - Create a `CNAME` file in the `public/` directory
   - Add your domain name to the file
   - Configure DNS settings with your domain provider

### Automatic Deployment

The project uses GitHub Actions for automatic deployment:
- Every push to `main` branch triggers a deployment
- The workflow builds the project and deploys to GitHub Pages
- Your site will be available at `https://yourusername.github.io/pottery-booking-flow/`

### Manual Deployment

```bash
npm run deploy
```

## Project Structure

```
src/
├── components/
│   ├── BookingFlow.jsx          # Main form orchestrator
│   └── steps/                   # Individual step components
│       ├── EventTypeStep.jsx
│       ├── GroupSizeStep.jsx
│       ├── VenueStep.jsx
│       ├── WorkshopStep.jsx
│       ├── DateStep.jsx
│       ├── ContactStep.jsx
│       ├── ReviewStep.jsx
│       └── SuccessStep.jsx
├── utils/
│   └── validation.js            # Business rules and validation logic
├── App.jsx                      # Main app component
├── App.css                      # Styles
└── main.jsx                     # Entry point
```

## Business Rules

The form enforces the following constraints:

- **Group Size**: Minimum 8 people, slider goes to 40+ with optional exact count
- **Venue Restrictions**: Wheel, Handbuilding, and Magnets are studio-only
- **Size Limits**: 
  - Wheel: 8-15 guests
  - Handbuilding: 8-30 guests  
  - Magnets: 8-20 guests
  - All others: 8+ guests (no upper limit)
- **Date Selection**: 1-5 preferred dates, future dates only
- **Contact Info**: Name, phone, and email are required

## Form Flow

1. **Event Type** - Choose from Corporate, Birthday, Bridal Party, or Other Gathering
2. **Group Size** - Slider from 8-40+ with optional exact count input
3. **Venue** - Studio (The Pottery Loop) or On-site at your location
4. **Workshop** - Filtered options based on size/venue constraints
5. **Dates** - Select up to 5 preferred dates
6. **Contact** - Name, phone, email, and optional notes
7. **Review** - Summary with pricing estimate and readiness timeline
8. **Success** - Confirmation message

## Technical Details

- Built with React 18 and Vite
- No external dependencies beyond React
- Responsive CSS with mobile-first design
- Form state management with React hooks
- Client-side validation with real-time feedback
- Accessible with keyboard navigation and screen reader support

## Future Enhancements

- Email notifications to staff and customers
- Database persistence for booking requests
- Analytics tracking for form completion rates
- Integration with calendar system for availability checking
