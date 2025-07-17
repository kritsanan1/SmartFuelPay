# Automated Fuel Dispensing System

A comprehensive React-based automated fuel dispensing system with real-time monitoring, QR payment processing, admin controls, and hardware integration. Built with modern web technologies and optimized for mobile-first responsive design.

## 🚀 Overview

This system allows customers to select fuel amounts, pay via QR code, and receive fuel upon successful payment. It features a complete admin dashboard, real-time monitoring, customer portal, analytics, and maintenance management.

## ✨ Key Features

### Customer Features
- **Fuel Amount Selection**: Choose from quick amounts (100, 200, 500, 1000 THB) or custom amounts
- **QR Code Payment**: PromptPay-compatible QR codes for seamless payments
- **Real-time Status Tracking**: Live payment and dispensing progress
- **Transaction History**: Complete purchase history with filtering
- **Multi-language Support**: Thai and English interface
- **Mobile-Optimized**: Touch-friendly interface with responsive design

### Admin Features
- **Comprehensive Dashboard**: Revenue tracking, transaction analytics, fuel metrics
- **Pump Management**: Real-time pump control, emergency stop, reset functionality
- **Transaction Management**: Complete transaction history with search and filtering
- **Settings Panel**: Fuel pricing management and system configuration
- **Real-time Monitoring**: Live system health metrics and visual feedback

### Technical Features
- **Hardware Integration**: Real-time pump control and monitoring via WebSocket
- **Performance Optimized**: Smart API polling, lazy loading, bundle optimization
- **Mobile-First Design**: Responsive layouts with touch-friendly interfaces
- **Real-time Animations**: Live fuel flow visualizations and pump status indicators
- **Type Safety**: Full TypeScript implementation with shared schemas

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript for component-based UI
- **TailwindCSS** for responsive styling and design system
- **Wouter** for lightweight client-side routing
- **React Query (TanStack Query)** for optimized server state management
- **Radix UI** primitives with custom styling for accessibility
- **Vite** for fast development and optimized builds
- **Framer Motion** for animations and transitions

### Backend
- **Node.js** with Express.js for RESTful API
- **TypeScript** with ES modules for type safety
- **PostgreSQL** with Drizzle ORM for database operations
- **WebSocket (ws)** for real-time hardware communication
- **Session-based Authentication** with PostgreSQL storage
- **Zod** for schema validation and type safety

### Development Tools
- **Vite** for development server and build optimization
- **Drizzle Kit** for database migrations
- **TypeScript** for static type checking
- **ESBuild** for server-side bundling

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **PostgreSQL** (v13 or higher)
- **Git** for version control

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd automated-fuel-dispensing-system
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/fuel_system"
PGHOST="localhost"
PGPORT="5432"
PGDATABASE="fuel_system"
PGUSER="your_username"
PGPASSWORD="your_password"

# Server Configuration
NODE_ENV="development"
PORT="5000"

# Session Configuration
SESSION_SECRET="your-super-secret-session-key"
```

### 4. Database Setup

#### Create Database
```bash
createdb fuel_system
```

#### Run Migrations
```bash
npm run db:push
```

This will create the necessary tables:
- `users` - User authentication and management
- `transactions` - Fuel purchase records
- `sessions` - User session storage

### 5. Start Development Server
```bash
npm run dev
```

The application will be available at:
- **Frontend**: `http://localhost:5000`
- **API**: `http://localhost:5000/api`
- **WebSocket**: `ws://localhost:5000/hardware-ws`

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (frontend + backend)
- `npm run start` - Start production server
- `npm run check` - Run TypeScript type checking
- `npm run db:push` - Push database schema changes

### Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route-based page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities and configurations
│   │   └── styles/         # CSS and styling files
│   └── index.html          # HTML template
├── server/                 # Backend Express application
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API route definitions
│   ├── db.ts               # Database connection
│   ├── storage.ts          # Data access layer
│   └── hardware.ts         # Hardware integration
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Database schema definitions
└── docs/                   # Documentation
```

### Key Development Guidelines

#### Frontend Development
- Use TypeScript for all components and hooks
- Follow mobile-first responsive design principles
- Implement lazy loading for route components
- Use React Query for all API interactions
- Follow the existing component structure and naming conventions

#### Backend Development
- Use the storage interface for all database operations
- Validate request data with Zod schemas
- Implement proper error handling and logging
- Use WebSocket for real-time hardware communication
- Follow RESTful API design principles

#### Database Development
- Use Drizzle ORM for all database operations
- Define schemas in `shared/schema.ts`
- Use `npm run db:push` for schema changes
- Never use raw SQL for migrations

## 🏗 Production Deployment

### Build for Production
```bash
npm run build
```

This creates:
- `dist/public/` - Optimized frontend assets
- `dist/index.js` - Bundled server application

### Environment Variables for Production
```env
NODE_ENV="production"
DATABASE_URL="your-production-database-url"
PORT="8080"
SESSION_SECRET="your-production-session-secret"
```

### Start Production Server
```bash
npm start
```

### Deployment Platforms

The application is optimized for deployment on:
- **Replit** (recommended)
- **Railway**
- **Heroku**
- **DigitalOcean App Platform**
- Any Node.js hosting service with PostgreSQL support

## 🧪 Testing

### Testing the Application

1. **Customer Flow Testing**:
   - Navigate to the main page
   - Select a fuel amount
   - Generate QR code
   - Simulate payment (payment status will auto-complete after delay)
   - Verify fuel dispensing authorization

2. **Admin Testing**:
   - Visit `/admin` for the admin dashboard
   - Test pump controls and emergency stop
   - Review transaction management
   - Check analytics and reporting

3. **Real-time Monitoring**:
   - Visit `/monitor` for live system monitoring
   - Test pump status updates
   - Verify WebSocket connectivity

### Hardware Integration Testing

The system includes a mock hardware controller that simulates:
- Pump status monitoring
- Fuel dispensing operations
- Emergency stop functionality
- Real-time status updates via WebSocket

## 📊 Performance Optimizations

### Mobile Optimization
- **Touch-friendly interfaces** with minimum 44px touch targets
- **Responsive typography** that scales across device sizes
- **Mobile-first CSS** utilities for optimal performance
- **Optimized navigation** with collapsible mobile menus

### API Optimization
- **Smart polling intervals**: 1s for active pumps, 5s for idle pumps
- **Error handling**: Proper retry logic and fallback strategies
- **Request optimization**: Eliminated unnecessary 404 requests
- **Caching strategy**: Optimized React Query configuration

### Bundle Optimization
- **Lazy loading**: Route-based code splitting
- **Icon optimization**: Tree-shaking for lucide-react imports
- **Component chunking**: Separate bundles for vendor and UI libraries
- **Font optimization**: Efficient loading with font-display: swap

## 🔒 Security

### Authentication & Authorization
- Session-based authentication with PostgreSQL storage
- CORS protection for API endpoints
- Input validation using Zod schemas
- Emergency stop controls for safety

### Data Protection
- Environment variables for sensitive configuration
- SQL injection prevention via Drizzle ORM
- XSS protection through React's built-in safeguards
- Secure session management

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the project guidelines
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Code Style Guidelines
- Use TypeScript for all new code
- Follow existing naming conventions
- Add proper JSDoc comments for complex functions
- Ensure mobile responsiveness for all UI changes
- Test your changes across different screen sizes

### Pull Request Process
1. Ensure all tests pass and TypeScript compiles without errors
2. Update documentation if you change functionality
3. Follow the existing commit message format
4. Request review from maintainers

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues

**Database Connection Errors**:
- Verify PostgreSQL is running
- Check DATABASE_URL environment variable
- Ensure database exists and user has proper permissions

**Build Errors**:
- Clear node_modules and reinstall dependencies
- Check Node.js version (requires v18+)
- Verify TypeScript compilation with `npm run check`

**Performance Issues**:
- Check browser developer tools for network requests
- Verify API polling intervals are optimized
- Ensure lazy loading is working for route components

### Getting Help

For technical support or questions:
1. Check the [documentation](docs/)
2. Review existing [issues](../../issues)
3. Create a new issue with detailed information
4. Include system information and error logs

## 🙏 Acknowledgments

- **Radix UI** for accessible component primitives
- **TailwindCSS** for the utility-first CSS framework
- **Drizzle ORM** for type-safe database operations
- **React Query** for optimized server state management
- **Vite** for fast development and build tools

---

Built with ❤️ for efficient fuel dispensing management