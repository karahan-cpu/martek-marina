# Marina Smart Pedestal Management System

## Overview

This is a marina management application built for Martek, designed to help marina operators and boat owners manage berth services, monitor smart pedestals (water and electricity distribution points), create bookings, and submit service requests. The system provides real-time control and monitoring of marina utilities through a mobile-first web interface.

The application serves as a utility-focused platform where users can:
- Monitor and control water/electricity at individual pedestal locations
- Book berths with specific utility requirements
- Submit maintenance and service requests
- View usage metrics and berth availability
- Navigate marina locations via an interactive map

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool

**UI Component System**: shadcn/ui component library built on Radix UI primitives
- Provides accessible, customizable components following Material Design principles
- Components are styled with Tailwind CSS and support both light/dark themes
- Design follows a mobile-first approach optimized for touch interactions

**Routing**: Wouter (lightweight client-side router)
- Routes: Dashboard (/), Pedestals (/pedestals), Map (/map), Bookings (/bookings), Services (/services), Profile (/profile)
- Bottom navigation bar provides persistent access to main sections

**State Management**: TanStack Query (React Query)
- Handles server state, caching, and automatic refetching
- Configured with infinite stale time to minimize unnecessary network requests
- Custom query client with 401 error handling

**Design System**:
- Typography: Inter/Roboto for body text, DM Sans for Martek branding
- Mobile-optimized with touch-friendly controls (minimum 48px touch targets)
- Tailwind-based spacing system (2, 4, 6, 8, 12, 16, 20px units)
- Custom color scheme using HSL values with CSS variables for theming

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

4. **ServiceRequests**: Maintenance and support tickets
   - Fields: userId, pedestalId (optional), requestType (maintenance/technical/general), description, urgency (normal/urgent), status (pending/in_progress/resolved)

### External Dependencies

**Database Configuration**: 
- Drizzle ORM configured for PostgreSQL (@neondatabase/serverless driver)
- Schema located in `shared/schema.ts`
- Migrations output to `./migrations` directory
- Currently using in-memory storage but architected for PostgreSQL migration

**Third-Party Services**:
- Google Fonts CDN: Inter, Roboto, and DM Sans font families
- Asset hosting: Generated images stored in `attached_assets/generated_images/`
  - Marina backgrounds, Martek logo, promotional banners

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