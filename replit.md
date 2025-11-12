# Martek Marina - Premium Berth Booking Platform

## Overview

This is a premium marina berth booking application built for Martek (www.martek.com.tr), designed with a D-Marin-inspired booking-first interface. The platform enables boat owners to easily book berths at Martek's marina facilities, manage their reservations, and access marina services through a clean, professional web interface.

The application serves as a booking-focused platform where users can:
- Book berths online with instant pricing and availability
- View and manage upcoming and past bookings
- Access marina facilities and services (water, electricity, WiFi)
- Submit maintenance and service requests
- View marina locations and available berths
- Monitor pedestal utilities at occupied berths

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool

**UI Component System**: shadcn/ui component library built on Radix UI primitives
- Provides accessible, customizable components with premium design aesthetic
- Components are styled with Tailwind CSS and support both light/dark themes
- Design follows a booking-first, mobile-responsive approach optimized for touch interactions

**Routing**: Wouter (lightweight client-side router)
- Routes: Homepage (/), Marinas (/marinas), Bookings (/bookings), Services (/services), Profile (/profile), Map (/map)
- Top navigation bar with logo, menu items, and account dropdown
- Responsive mobile drawer menu for small screens

**State Management**: TanStack Query (React Query)
- Handles server state, caching, and automatic refetching
- Configured with infinite stale time to minimize unnecessary network requests
- Custom query client with 401 error handling

**Design System** (D-Marin Inspired):
- **Colors**: Deep navy primary (HSL 210 100% 20%), ocean blue accent (HSL 210 100% 40%), clean white backgrounds
- **Typography**: Plus Jakarta Sans for headings and body text, DM Sans for branding accents
- **Layout**: Large hero sections, generous whitespace, premium card-based design
- **Touch Targets**: Minimum 44px for all interactive elements
- **Spacing**: Tailwind-based system with emphasis on 6, 8, 12, 16, 24px units for premium feel

### Backend Architecture

**Server Framework**: Express.js with TypeScript
- RESTful API endpoints for CRUD operations
- Middleware for request logging and JSON body parsing
- Raw body capture for potential webhook integrations

**Data Storage Strategy**: In-memory storage (MemStorage class) with interface-based design
- Implements IStorage interface allowing future database migration
- Current implementation uses Map data structures for users, pedestals, bookings, and service requests
- Sample data initialization for development/demo purposes

**API Endpoints**:
- `/api/pedestals` - GET (list), POST (create)
- `/api/pedestals/:id` - GET (single), PATCH (update)
- `/api/bookings` - GET (list), POST (create)
- `/api/bookings/:id` - PATCH (update)
- `/api/service-requests` - GET (list), POST (create)
- `/api/service-requests/:id` - PATCH (update)

**Data Validation**: Zod schemas with Drizzle integration
- Schema definitions provide type safety and runtime validation
- Uses `drizzle-zod` to generate insert schemas from table definitions

### Data Models

**Core Entities**:

1. **Users**: Marina customers with boat information
   - Fields: username, password, fullName, boatName, boatType, boatLength, boatRegistration

2. **Pedestals**: Smart utility distribution points
   - Fields: berthNumber, status (available/occupied/maintenance/offline), waterEnabled, electricityEnabled, waterUsage, electricityUsage, currentUserId, locationX, locationY
   - Represents physical pedestal units at marina berths

3. **Bookings**: Berth reservations with utility requirements
   - Fields: userId, pedestalId, startDate, endDate, needsWater, needsElectricity, status, estimatedCost
   - Status flow: pending → confirmed → active → completed/cancelled
   - **Important**: estimatedCost is stored in CENTS (e.g., 15000 cents = $150.00)
   - Display formatting: Always divide by 100: `${(cost / 100).toFixed(2)}`

4. **ServiceRequests**: Maintenance and support tickets
   - Fields: userId, pedestalId (optional), requestType (maintenance/technical/general), description, urgency (normal/urgent), status (pending/in_progress/resolved)

### External Dependencies

**Database Configuration**: 
- Drizzle ORM configured for PostgreSQL (@neondatabase/serverless driver)
- Schema located in `shared/schema.ts`
- Migrations output to `./migrations` directory
- Currently using in-memory storage but architected for PostgreSQL migration

**Third-Party Services**:
- Google Fonts CDN: Plus Jakarta Sans and DM Sans font families
- Asset hosting: Generated images stored in `attached_assets/generated_images/`
  - Marina backgrounds (hero images), Martek logo, promotional banners

**Key Libraries**:
- Form Management: react-hook-form with @hookform/resolvers
- Date Handling: date-fns for formatting and manipulation
- UI Components: Extensive Radix UI component suite (@radix-ui/react-*)
- Icons: lucide-react for consistent iconography
- Carousel: embla-carousel-react
- Command Palette: cmdk

**Development Tools**:
- TypeScript for type safety across client/server/shared code
- Vite plugins: runtime error overlay, Replit cartographer, dev banner
- PostCSS with Tailwind and Autoprefixer
- esbuild for server bundling in production

### Build and Deployment

**Development**: `npm run dev` - Runs Express server with Vite middleware and HMR
**Production Build**: `npm run build` - Vite client build + esbuild server bundle
**Production Server**: `npm start` - Runs bundled server from dist/
**Database Migrations**: `npm run db:push` - Pushes schema changes to database

**Configuration**:
- Environment variable required: `DATABASE_URL` for PostgreSQL connection
- Client assets served from `dist/public` in production
- Path aliases configured: `@/` (client src), `@shared/` (shared schemas), `@assets/` (attached assets)