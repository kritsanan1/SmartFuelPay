# Automated Fuel Dispensing System

## Overview

This is a React-based automated fuel dispensing system that allows customers to select fuel amounts, pay via QR code, and receive fuel upon successful payment. The system is built with modern web technologies and follows a clean, component-based architecture.

## User Preferences

Preferred communication style: Simple, everyday language.

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
6. **Responsive Design**: Works on both desktop and mobile devices

### UI Components
- **AmountSelection**: Fuel amount selection interface
- **QRPayment**: QR code display and payment waiting screen
- **PaymentSuccess**: Success confirmation screen
- **PaymentError**: Error handling and retry interface
- **TransactionHistory**: Historical transaction display
- **ProgressSteps**: Visual progress indicator

## Data Flow

1. **Customer selects amount** → Validates minimum amount (50 THB)
2. **Generate QR code** → Creates transaction record and QR data
3. **Display QR code** → Customer scans and pays externally
4. **Payment polling** → System checks payment status every few seconds
5. **Payment confirmation** → Updates transaction status and enables fuel dispensing
6. **Transaction completion** → Records final transaction details

## External Dependencies

### Frontend Dependencies
- **@tanstack/react-query**: Server state management
- **@radix-ui/react-***: Accessible UI components
- **wouter**: Lightweight routing
- **clsx & tailwind-merge**: Utility class management
- **date-fns**: Date manipulation

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