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

## Recent Changes

- **November 18, 2025**: Added QR code scanning and access entry screen for pedestals
  - Implemented PedestalAccessEntry component with two access methods:
    - QR code scanner using phone camera (html5-qrcode library)
    - Manual 6-digit code entry with pedestal selection (secure, per-pedestal verification)
  - QR codes encode format: "pedestalId:accessCode" for secure pedestal identification
  - Manual entry flow: Select pedestal → Enter 6-digit code → Verify against specific pedestal
  - Updated /pedestals page to show access entry screen first, then unlocked pedestal
  - Removed "Marinas" from navigation bar (kept Pedestals, My Bookings, Services)
  - Security: Per-pedestal code verification prevents brute-force attacks

- **November 18, 2025**: Implemented marina entity system
  - Created marinas table with JSONB amenities field
  - Seeded 2 premium marinas: Martek Marina İstanbul and Martek Marina Bodrum
  - Updated pedestals to reference marina via marinaId foreign key
  - Distributed 20 pedestals across 2 marinas (Istanbul: A01-A10, Bodrum: B01-B10)
  - Created Marina frontend page displaying premium facilities
  - Added marina API routes with proper validation (GET, POST, PATCH)
  - Secured pedestal creation to admin-only access (POST /api/pedestals requires admin)

- **November 18, 2025**: Implemented secure pedestal access control system
  - Added 6-digit access codes to pedestals for secure service control
  - Manual code entry verification before allowing water/electricity control
  - Server-side authorization tracking (verifiedAccess Map)
  - Strict API validation preventing access code tampering
  - Defense-in-depth: both API and storage layer protect immutable fields
  - Architect-approved security implementation

- **November 2025**: Migrated from Replit Auth to Supabase Auth
  - Client-side session management via Supabase SDK
  - JWT-based authentication with Bearer tokens
  - Backend JWT verification via Supabase Admin client
  - Email/password authentication with email confirmation
  - All authentication vulnerabilities resolved and architect-approved

## Admin Account Setup

To create an admin account:

1. **Sign up for an account**:
   - Navigate to `/signup` in your browser
   - Enter your email (e.g., karahan.karakurt1997@gmail.com) and password
   - Complete the Supabase email verification process

2. **Promote account to admin**:
   - After successful signup and login, run this SQL command:
   ```sql
   UPDATE users SET is_admin = true WHERE email = 'karahan.karakurt1997@gmail.com';
   ```
   - You can execute this via the database pane in Replit or using the execute_sql_tool

3. **Verify admin access**:
   - Log in to the application
   - Navigate to `/admin` to access the admin dashboard
   - Admin features include:
     - View all users
     - View all pedestals with access codes (for customer support)
     - Create/manage marinas
     - Create/manage pedestals

**Note**: Only admin users can access the `/admin` route and perform administrative operations like creating pedestals or marinas.

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

**Authentication**: Supabase Auth integration (November 2025)
- Migrated from Replit Auth to Supabase for enhanced authentication features
- Client-side session management via Supabase client
- JWT-based authentication with Bearer tokens
- Email/password authentication with email confirmation requirement
- Session stored in browser localStorage (managed by Supabase)
- Backend JWT verification via `server/supabaseAuth.ts` middleware
- Graceful 401 handling for unauthenticated requests
- Landing page for logged-out users, authenticated app for logged-in users

**Data Storage Strategy**: PostgreSQL database with DatabaseStorage class
- Migrated from in-memory to persistent database storage (November 2025)
- Implements IStorage interface for clean separation of concerns
- Uses Drizzle ORM for type-safe database operations
- Database tables: users, marinas, pedestals, bookings, serviceRequests
- Session management handled by Supabase (client-side)

**API Endpoints**:
- **Authentication**:
  - Client-side authentication handled by Supabase Auth SDK
  - All API requests include `Authorization: Bearer {jwt_token}` header
  - Backend validates JWT tokens via Supabase Admin client
- **Data Operations**:
  - `/api/marinas` - GET (list), POST (create - admin only)
  - `/api/marinas/:id` - GET (single), PATCH (update - admin only)
  - `/api/pedestals` - GET (list), POST (create - admin only)
  - `/api/pedestals/:id` - GET (single), PATCH (update - requires verified access)
  - `/api/pedestals/:id/verify-access` - POST (verify 6-digit access code for specific pedestal)
  - `/api/bookings` - GET (list), POST (create)
  - `/api/bookings/:id` - PATCH (update)
  - `/api/service-requests` - GET (list), POST (create)
  - `/api/service-requests/:id` - PATCH (update)
  
**Pedestal Security Architecture**:
  - All pedestal API responses exclude accessCode field (never sent to clients)
  - PATCH /api/pedestals/:id validates requests with strict Zod schema (only waterEnabled/electricityEnabled allowed)
  - Storage layer filters out immutable fields (accessCode, berthNumber, id) as defense-in-depth
  - Server-side verifiedAccess Map tracks authorization (userId -> Set<pedestalId>)
  - Users must POST to /verify-access with correct code before controlling pedestal services
  - **Rate Limiting & Brute-Force Protection**:
    - Maximum 3 failed verification attempts per user per pedestal
    - 15-minute lockout after exceeding max attempts
    - Automatic reset after 1 minute of inactivity
    - Security logging for all verification attempts (successful and failed)
    - Per-user-per-pedestal tracking prevents attacks across multiple pedestals

**Data Validation**: Zod schemas with Drizzle integration
- Schema definitions provide type safety and runtime validation
- Uses `drizzle-zod` to generate insert schemas from table definitions

### Data Models

**Core Entities**:

1. **Users**: Authenticated marina customers (managed by Supabase Auth)
   - Fields: id (Supabase user UUID), email, isAdmin
   - Users are created during signup via Supabase Auth
   - Passwords and authentication managed by Supabase
   - Email confirmation required for new signups (configurable in Supabase dashboard)
   - **Admin Access**: isAdmin field controls access to admin dashboard and admin-only API endpoints

2. **Marinas**: Premium marina facilities managed by Martek
   - Fields: id, name, location, description, amenities (JSONB array), totalBerths, imageUrl, isPremium
   - Represents physical marina locations (e.g., İstanbul, Bodrum)
   - amenities stored as JSONB for efficient array handling
   - Each marina contains multiple pedestals

3. **Pedestals**: Smart utility distribution points with secure access control
   - Fields: id, marinaId, berthNumber, status (available/occupied/maintenance/offline), waterEnabled, electricityEnabled, waterUsage, electricityUsage, currentUserId, locationX, locationY, accessCode
   - Represents physical pedestal units at marina berths
   - **Marina Reference**: Each pedestal belongs to a specific marina via marinaId foreign key
   - **Security**: accessCode field (6-digit code) never returned in API responses
   - **Access Control**: Users must verify access code via POST /api/pedestals/:id/verify-access before controlling services
   - **Authorization**: Server-side verifiedAccess Map tracks which users have unlocked which pedestals

4. **Bookings**: Berth reservations with utility requirements
   - Fields: userId, pedestalId, startDate, endDate, needsWater, needsElectricity, status, estimatedCost
   - Status flow: pending → confirmed → active → completed/cancelled
   - **Important**: estimatedCost is stored in CENTS (e.g., 15000 cents = $150.00)
   - Display formatting: Always divide by 100: `${(cost / 100).toFixed(2)}`

5. **ServiceRequests**: Maintenance and support tickets
   - Fields: userId, pedestalId (optional), requestType (maintenance/technical/general), description, urgency (normal/urgent), status (pending/in_progress/resolved)

### External Dependencies

**Database Configuration**: 
- Drizzle ORM configured for PostgreSQL (@neondatabase/serverless driver)
- Schema located in `shared/schema.ts`
- Migrations output to `./migrations` directory
- Currently using in-memory storage but architected for PostgreSQL migration

**Third-Party Services**:
- **Supabase**: Authentication, user management, and session handling
  - Project URL: https://qvgciezihmcprqoybhdx.supabase.co
  - Client configuration: `client/src/lib/supabase.ts`
  - Backend JWT verification: `server/supabaseAuth.ts`
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