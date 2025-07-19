# Automated Fuel Dispensing System

## Overview

This is a React-based automated fuel dispensing system that allows customers to select fuel amounts, pay via QR code, and receive fuel upon successful payment. The system is built with modern web technologies and follows a clean, component-based architecture.

## User Preferences

Preferred communication style: Simple, everyday language.
Project Focus: Creating comprehensive and functional automated fuel dispensing system with advanced features.
Mobile Optimization: Prioritize mobile-first responsive design and performance optimization.
Performance Focus: Optimize API calls, reduce bundle size, and improve loading times.

## Recent Changes

- **July 19, 2025**: Comprehensive UX/UI Enhancement and Migration Completion
- **Enhanced Design System**: Implemented modern gradients, shadows, glass morphism effects, and micro-interactions
- **Interactive Components**: Added hover animations, press effects, loading states, and smooth transitions
- **Visual Hierarchy**: Improved typography, spacing, color contrast, and component organization
- **Mobile-First Design**: Enhanced responsive layouts with touch-friendly interactions and optimized animations
- **Accessibility**: Added focus management, reduced motion support, and high contrast compatibility
- **Migration Completion**: Successfully migrated from Replit Agent with full database setup and system verification
- **July 17, 2025**: Successfully migrated project from Replit Agent to Replit environment
- **Database Migration**: Updated from Neon Database client to standard PostgreSQL client for better Replit compatibility
- **System Verification**: Confirmed all core features working (QR generation, payment tracking, fuel dispensing)
- **Transaction Testing**: Verified complete transaction flow with 100 THB fuel dispensing
- **Real-time Animations**: Implemented comprehensive pump status animations with live fuel flow visualizations
- **Monitoring Dashboard**: Added real-time monitoring interface with system health metrics and visual feedback
- **Mobile Optimization**: Complete mobile-first responsive design with touch-friendly interfaces and adaptive layouts
- **Performance Optimization**: Optimized API polling, lazy loading, and bundle size reduction for improved performance
- **Font & Icon Optimization**: Implemented efficient loading strategies and tree-shaking for better resource management

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: TailwindCSS with custom design system
- **State Management**: React Query (TanStack Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Radix UI primitives with custom styling
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM (Active)
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: PostgreSQL-based persistent storage

### Data Storage Solutions
- **Database**: PostgreSQL via Neon Database (Active)
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema**: Shared schema definitions using Drizzle and Zod
- **Migrations**: Drizzle Kit for database migrations
- **Storage Layer**: DatabaseStorage class implementing IStorage interface

## Key Components

### Database Schema
The system uses two main tables:
- **Users**: Basic user management with username/password
- **Transactions**: Fuel purchase transactions with QR code data, payment status, and fuel details

### Core Features
1. **Amount Selection**: Choose from quick amounts (100, 200, 500, 1000 THB) or enter custom amount
2. **QR Code Generation**: Creates PromptPay-compatible QR codes for payments
3. **Payment Status Tracking**: Real-time polling of payment status
4. **Multi-language Support**: Thai and English interface
5. **Transaction History**: View past fuel purchases
6. **Hardware Integration**: Real-time pump control and monitoring
7. **Responsive Design**: Works on both desktop and mobile devices

### Admin Dashboard Implementation (July 17, 2025)
- **Comprehensive Admin Interface**: Full-featured dashboard with real-time monitoring
- **Dashboard Statistics**: Revenue tracking, transaction analytics, fuel dispensed metrics
- **Pump Management**: Real-time pump control, emergency stop, reset functionality
- **Transaction Management**: Complete transaction history with filtering and search
- **Settings Panel**: Fuel pricing management and system configuration
- **Navigation System**: Seamless switching between customer and admin interfaces
- **API Endpoints**: RESTful admin APIs for stats, pump control, and system management

### Hardware Integration
- **Pump Controller**: HardwareController class for fuel pump management
- **WebSocket Communication**: Real-time hardware status updates
- **Safety Systems**: Emergency stop, flow monitoring, error handling
- **Control Interface**: Hardware control component for pump operations
- **API Endpoints**: RESTful API for hardware control and status
- **Real-time Animations**: Live pump status displays with animated fuel flow particles
- **Visual Feedback**: Interactive pump visualizations during transaction progress
- **Monitoring Interface**: Comprehensive real-time monitoring dashboard with system health metrics

### Enhanced UI Components (July 19, 2025)
- **AmountSelection**: Modern fuel amount selection with gradient cards, animated buttons, and enhanced summary section
- **QRPayment**: Premium QR display with animated corner indicators, enhanced instructions, and glass effects
- **PaymentSuccess**: Success confirmation with celebratory animations and smooth transitions
- **PaymentError**: Professional error handling with clear retry actions and visual feedback
- **TransactionHistory**: Clean historical display with enhanced card layouts and hover effects
- **ProgressSteps**: Responsive progress indicator with animated states, mobile optimization, and smooth transitions
- **PumpStatusDisplay**: Real-time status with modern indicators, shadows, and interactive elements
- **AnimatedFuelFlow**: Particle-based animations with hardware acceleration and performance optimization
- **PumpVisualization**: Interactive graphics with enhanced visual feedback and smooth progress tracking
- **RealTimeMonitor**: Professional monitoring dashboard with glass morphism and premium card designs
- **Navigation**: Enhanced mobile/desktop navigation with floating effects and gradient headers

## Data Flow

1. **Customer selects amount** → Validates minimum amount (50 THB)
2. **Generate QR code** → Creates transaction record and QR data
3. **Display QR code** → Customer scans and pays externally
4. **Payment polling** → System checks payment status every few seconds
5. **Payment confirmation** → Updates transaction status and enables fuel dispensing
6. **Transaction completion** → Records final transaction details

## External Dependencies

### Frontend Dependencies & Enhanced Features
- **@tanstack/react-query**: Server state management with optimized polling and loading states
- **@radix-ui/react-***: Accessible UI components with enhanced styling and animations
- **wouter**: Lightweight routing with lazy loading and smooth page transitions
- **clsx & tailwind-merge**: Utility class management with custom design system integration
- **date-fns**: Date manipulation with internationalization support
- **Enhanced CSS System**: Modern design tokens, gradient utilities, shadow system, glass morphism effects
- **Animation Framework**: Hardware-accelerated animations, micro-interactions, and reduced motion support
- **Responsive Design**: Mobile-first approach with touch-friendly interfaces and adaptive layouts
- **Performance Optimization**: Optimized polling, efficient animations, and accessibility enhancements

### Backend Dependencies
- **express**: Web framework
- **drizzle-orm**: Database ORM
- **@neondatabase/serverless**: PostgreSQL client
- **zod**: Schema validation
- **connect-pg-simple**: PostgreSQL session store

### Development Dependencies
- **vite**: Build tool and dev server
- **typescript**: Type checking
- **tailwindcss**: Styling framework
- **drizzle-kit**: Database migration tool

## Deployment Strategy

### Development Environment
- **Dev Server**: Vite dev server for frontend with Express backend
- **Database**: Neon Database (serverless PostgreSQL)
- **Hot Reload**: Vite HMR for fast development cycles

### Production Build
- **Frontend**: Vite builds optimized static assets
- **Backend**: ESBuild bundles server code
- **Database**: PostgreSQL migrations via Drizzle Kit
- **Deployment**: Single Node.js process serving both API and static files

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **NODE_ENV**: Environment mode (development/production)
- **PORT**: Server port (defaults to system assigned)

The system is designed to be deployed on platforms like Replit, Railway, or any Node.js hosting service with PostgreSQL support.

## Performance Optimization Summary (July 17, 2025)

### Mobile Optimization Implemented:
- **Responsive Design**: Mobile-first CSS utilities with touch-friendly interfaces
- **Typography Scale**: Adaptive text sizing across all screen sizes
- **Touch Targets**: Minimum 44px touch targets for accessibility
- **Navigation**: Mobile-optimized navigation with collapsible menus
- **Grid Systems**: Flexible grid layouts that adapt to mobile screens

### Performance Enhancements:
- **API Optimization**: Eliminated 404 errors for non-existent pumps (01, 02)
- **Smart Polling**: Dynamic intervals based on pump status (1s active, 5s idle)
- **Lazy Loading**: Route-based code splitting for reduced initial bundle
- **Error Handling**: Proper retry logic and fallback strategies
- **Bundle Optimization**: Icon tree-shaking and component chunking

### Resource Optimization:
- **Font Loading**: Optimized with font-display: swap
- **Icon Management**: Efficient lucide-react imports with sprite system
- **CSS Performance**: Hardware-accelerated animations with reduced motion support
- **Memory Management**: Optimized React Query caching and stale time

### Accessibility Improvements:
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Keyboard Navigation**: Full keyboard accessibility for all components
- **Focus Management**: Visible focus indicators and logical tab order
- **Motion Preferences**: Respects user's reduced motion settings

The application now provides optimal performance across all device sizes while maintaining full functionality and accessibility standards.