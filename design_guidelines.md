# Marina Berth Booking App - Design Guidelines

## Design Approach
**Reference-Based Approach**: Drawing inspiration from premium booking platforms (Airbnb, Booking.com, luxury hotel apps) with a maritime aesthetic. Booking-first philosophy with minimal, sophisticated interfaces emphasizing trust, clarity, and effortless navigation.

**Rationale**: This is a premium marina berth booking application where the booking experience is paramount. Users expect a high-end, frictionless process similar to luxury accommodation booking, with emphasis on visual appeal, trust signals, and streamlined workflows.

---

## Typography

**Primary Font**: Plus Jakarta Sans (via Google Fonts CDN)
- H1: 36px, bold - Page titles, hero headlines
- H2: 28px, semibold - Section headers
- H3: 22px, semibold - Card titles, step headers
- H4: 18px, medium - Subsection titles
- Body Large: 18px, regular - Primary content, important info
- Body: 16px, regular - Standard content, form labels
- Body Small: 14px, regular - Secondary info, captions

**Accent Font**: DM Sans (for subtle differentiation in CTAs and premium badges)

---

## Layout System

**Spacing Units**: Tailwind primitives of 4, 6, 8, 12, 16, 24
- Page padding: px-6 mobile, px-8 tablet+
- Section spacing: space-y-12 to space-y-16
- Card gaps: gap-6, gap-8
- Component padding: p-6, p-8 for cards
- Generous whitespace throughout for premium feel

**Container Strategy**:
- Content: max-w-6xl centered with mx-auto
- Booking wizard: max-w-3xl for focused flow
- Full-width hero sections with inner containers

---

## Core Components

### Navigation
**Top Navigation Bar** (sticky, translucent backdrop):
- Logo left (Martek wordmark, 140px)
- Center: minimal nav links (Home, Marinas, My Bookings, Services)
- Right: Account avatar (40px) + dropdown
- Mobile: Hamburger menu with slide-out drawer
- Height: h-20 with shadow-sm when scrolled

### Home/Landing Page
**Hero Section**:
- Full-width hero image: Luxury marina sunset/yacht scene (h-[600px])
- Overlay with gradient (navy to transparent)
- Centered headline: "Your Perfect Berth Awaits"
- Booking search widget: Floating card (blurred background) with marina selector, dates (calendar picker), boat details, and primary CTA
- Widget button with blurred backdrop-blur-lg background

**Featured Marinas Section**:
- 3-column grid (mobile: 1-col)
- Large cards: Marina image (300x200), name, location, amenities icons, "View Availability" link
- Cards with rounded-2xl, shadow-lg on hover

**Trust Indicators**:
- 4-column stats: Total Berths, Marinas, Happy Boaters, Years of Service
- Large numbers (48px) with icons
- Subtle separator lines

**How It Works**:
- 3-step visual process (icons + descriptions)
- Timeline connector between steps
- Booking wizard preview screenshot

### Booking Wizard (Multi-Step Flow)
**Step Container**:
- max-w-3xl centered
- Progress indicator: Linear stepper at top (Step 1/4)
- Each step in white card with rounded-2xl, p-8

**Step 1 - Select Marina & Dates**:
- Marina selection: Large image cards in grid
- Date range picker: Calendar component (inline, large touch targets)
- Duration calculator showing nights

**Step 2 - Choose Berth**:
- Interactive marina map SVG with available berths highlighted
- Berth list view toggle option
- Berth cards: Number, dimensions, amenities icons, price/night
- Comparison checkboxes for up to 3 berths

**Step 3 - Services & Add-ons**:
- Service cards: Electricity, water, wifi, waste disposal
- Toggle switches (h-12) with pricing
- Premium services section: Concierge, maintenance, provisioning

**Step 4 - Review & Pay**:
- Booking summary sidebar (sticky on scroll)
- Guest details form (name, boat registration, phone)
- Payment method selector with card input
- Total cost breakdown with daily rate, services, taxes
- "Confirm Booking" CTA (full-width, h-14)

**Navigation**: "Back" and "Continue" buttons anchored at bottom (sticky), adequate spacing from content

### My Bookings Dashboard
**Upcoming Bookings**:
- Timeline view with cards showing: Marina image thumbnail, dates, berth number, QR code for check-in
- Status badges: Confirmed, Pending Payment, Checked In
- Quick actions: Modify, Cancel, Contact Marina

**Past Bookings**:
- Condensed list view
- "Book Again" quick action button
- Review/rating prompt for completed stays

**Booking Detail View**:
- Full-screen modal
- Hero image of marina
- All booking details, services, costs
- Digital check-in instructions
- Marina contact card
- Cancellation policy accordion

### Marina Services
**Service Categories**:
- Card grid: Boat Maintenance, Provisioning, Concierge, Storage
- Each card: Icon (48px), title, description, "Learn More" link

**Service Detail Pages**:
- Hero image specific to service
- Service description
- Pricing table
- Request service form: Date, service type, special instructions
- "Book Service" CTA

### Account Portal
**Profile Section**:
- Large avatar (120px) with edit overlay
- User info fields: Name, email, phone (editable inline)
- Boat profiles: Multiple boats supported, each with name, type, length, registration

**Payment Methods**:
- Saved cards display (last 4 digits, card brand icon)
- Add payment method modal
- Set default payment toggle

**Preferences**:
- Notification settings toggles
- Language/currency selector
- Newsletter subscription checkbox

**Documents**:
- Insurance papers upload
- Boat registration documents
- Download booking confirmations

---

## Visual Elements

**Buttons**:
- Primary: h-14, rounded-xl, font-semibold, text-lg
- Secondary: h-12, rounded-xl, border-2, font-medium
- Text links: Underline on hover, ocean blue color
- Icon buttons: h-12 w-12, rounded-full

**Cards**: rounded-2xl, shadow-md (hover: shadow-xl transition), bg-white, overflow-hidden for images
**Status Badges**: rounded-full, px-4 py-1.5, font-medium text-sm, uppercase tracking-wide
**Form Inputs**: h-12, rounded-lg, border-2, focus:border-ocean-blue
**Dividers**: 2px borders, subtle gray, used sparingly

---

## Images

**Hero Images Required**:
- Homepage: Luxury marina at sunset with yachts (1920x600), overlay gradient
- Marina detail pages: Aerial view of specific marina (1920x500)
- Service pages: Service-specific imagery (maintenance, provisioning)

**Supporting Images**:
- Marina cards: Thumbnail images (400x300) of each marina
- Berth visualization: Optional berth layout diagrams
- Profile: User avatar placeholder, boat images

**Image Treatment**: All images use subtle rounded corners (rounded-xl), lazy loading, proper aspect ratios maintained

---

## Accessibility

- Touch targets minimum 44x44px throughout
- High contrast maintained on all text (navy on white meets WCAG AAA)
- Keyboard navigation for entire booking flow
- Focus indicators: 3px ocean blue ring on interactive elements
- Screen reader labels on all form inputs and icons
- Large font sizes (16px minimum) for readability
- Clear error states with icons and descriptive messages