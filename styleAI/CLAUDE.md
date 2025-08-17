# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production version
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Build and Deployment
The build process requires all import paths to be correct (case-sensitive). Common build errors include:
- Import path case mismatches (e.g., `@/components/background/LiquidChrome` should be `@/components/Background/LiquidChrome`)
- Missing Suspense boundaries for components using `useSearchParams()`

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15.2.2 with App Router
- **Styling**: Tailwind CSS with custom font configuration (Playfair Display, Inter, Geist Mono)
- **Authentication**: Clerk for user management and auth
- **Payments**: Stripe with Embedded Checkout
- **Database**: PostgreSQL with custom models
- **3D Graphics**: Three.js via OGL for liquid chrome backgrounds
- **AI/ML**: Face-api.js for facial detection and analysis
- **State Management**: Zustand for client state

### Project Structure

#### Core Application Flow
1. **Home Page** (`/`) - Landing with hero section and style gallery
2. **Algorithm Gallery** (`/algorithmGallery`) - Service selection interface
3. **Upload Flow** (`/getBestFitCloth/` or `/hair-style/`) - Image upload and processing
4. **Analysis** (`/getBestFitCloth/loading`) - AI processing with progress tracking
5. **Results** (`/getBestFitCloth/generateReport`) - Style recommendations and analysis
6. **History** (`/reportHistory`) - Past analysis results

#### Key Components Architecture

**Background System**:
- `LiquidChrome` component in `@/components/Background/` (note: capital B)
- WebGL-based animated backgrounds using OGL library
- Interactive and configurable via props

**Authentication Flow**:
- Clerk integration in root layout
- `UserSync` component handles user data synchronization
- Server actions for user management in `/app/actions/`

**API Integration**:
- `ApiService` class for external API communication (Flask backend)
- Server actions for database operations and Stripe integration
- Configuration in `@/lib/api/config.ts`

**Image Processing Pipeline**:
- Client-side image processing with face-api.js
- Server-side processing via external API
- Session storage for temporary image data

### Environment Configuration

Required environment variables:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` - Clerk auth
- `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe payments
- `NEXT_PUBLIC_BASE_PATH` - Application base path (`/styleai`)
- `NEXT_PUBLIC_API_SERVER_URL` - External API server URL (defaults to `http://127.0.0.1:5001`)
- `NEXT_PUBLIC_URL` - Public application URL

### Database Schema

Key models in `@/lib/models/`:
- `User` - User profiles synchronized with Clerk
- `Job` - Analysis jobs and processing state
- PostgreSQL connection via `@/lib/db.ts`

### Payment System

Stripe integration features:
- Product ID: `prod_SAFz8thNESwg5S` (Style recommends credit)
- Embedded Checkout implementation
- Server actions for session management
- Test mode configuration (use test API keys)

### Import Path Conventions

- All imports use `@/` alias pointing to `src/`
- Component paths are case-sensitive (e.g., `@/components/Background/LiquidChrome`)
- Shared utilities in `@/lib/` and `@/utils/`
- Type definitions in `@/types/`

### Common Issues and Solutions

1. **Build Errors**: Often caused by import path case mismatches - verify component folder casing
2. **Suspense Boundaries**: Components using `useSearchParams()` must be wrapped in `<Suspense>`
3. **Face-api.js Warnings**: Expected warnings about `encoding` and `fs` modules in browser environment
4. **API Integration**: External Flask API must be running on configured port for full functionality

### Styling Guidelines

- Uses Tailwind with custom font families configured
- Backdrop blur utilities extended (`backdrop-blur-xs`)
- Custom animations (`animate-spin-slow`)
- Responsive design patterns throughout
- Consistent color scheme with brand colors (`#2D4B37`, `#FF9999`)

### State Management

- Zustand store for authentication state (`@/store/authStore.ts`)
- React hooks for API data fetching (`@/hooks/`)
- Session storage for temporary data (user images, job IDs)
- Server state via Next.js server components and actions