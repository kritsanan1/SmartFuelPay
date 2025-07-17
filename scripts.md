# Available Scripts Documentation

This document provides comprehensive information about all available npm scripts in the Automated Fuel Dispensing System.

## 📋 Script Overview

| Script | Purpose | Environment | Output |
|--------|---------|-------------|--------|
| `dev` | Development server | Development | Frontend + Backend with hot reload |
| `build` | Production build | Production | Optimized bundles in `dist/` |
| `start` | Production server | Production | Serves built application |
| `check` | Type checking | Any | TypeScript compilation errors |
| `db:push` | Database sync | Any | Database schema updates |

---

## 🚀 Development Scripts

### `npm run dev`

**Purpose**: Starts the development server with hot reload capabilities.

**Command**: `NODE_ENV=development tsx server/index.ts`

**Functionality**:
- Launches Express server on port 5000 (or PORT env variable)
- Enables Vite development server for frontend
- Provides hot module replacement (HMR)
- Serves both API and frontend from the same port
- Enables detailed logging and error reporting
- Watches for file changes and auto-restarts

**Usage Examples**:
```bash
# Standard development start
npm run dev

# With custom port
PORT=3000 npm run dev

# With verbose logging
DEBUG=* npm run dev
```

**Expected Output**:
```
[Hardware] Pump 03 initialized
4:03:06 PM [express] serving on port 5000
[vite] dev server running at http://localhost:5000
[vite] ready in 245ms
```

**Required Environment Variables**:
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - Set to "development"
- `PORT` (optional) - Server port, defaults to 5000

**Common Use Cases**:
- Local development and testing
- Frontend component development
- API endpoint testing
- Real-time hardware simulation
- Database integration testing

---

## 🏗 Build Scripts

### `npm run build`

**Purpose**: Creates optimized production builds for both frontend and backend.

**Command**: `vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist`

**Functionality**:
- **Frontend Build** (via Vite):
  - Bundles React application with optimizations
  - Minifies JavaScript and CSS
  - Implements code splitting and lazy loading
  - Generates optimized assets with hashing
  - Creates manifest for cache busting
- **Backend Build** (via ESBuild):
  - Bundles server code into single executable
  - Optimizes for Node.js runtime
  - Excludes external dependencies
  - Generates source maps for debugging

**Usage Examples**:
```bash
# Standard production build
npm run build

# Build with analysis
npm run build -- --analyze

# Clean build (remove dist first)
rm -rf dist && npm run build
```

**Expected Output Structure**:
```
dist/
├── public/               # Frontend assets
│   ├── index.html       # Main HTML file
│   ├── assets/          # JS, CSS, images
│   │   ├── index-[hash].js
│   │   ├── index-[hash].css
│   │   └── vendor-[hash].js
│   └── manifest.json    # Asset manifest
└── index.js             # Bundled server
```

**Build Optimizations**:
- **Bundle Splitting**: Vendor libraries separated from app code
- **Tree Shaking**: Unused code elimination
- **Minification**: Compressed JavaScript and CSS
- **Asset Optimization**: Optimized images and fonts
- **Code Splitting**: Lazy-loaded route components

**Required Environment Variables**: None (build-time only)

**Common Use Cases**:
- Production deployment preparation
- Performance optimization testing
- Bundle size analysis
- Static asset generation

---

## 🚀 Production Scripts

### `npm start`

**Purpose**: Starts the production server using pre-built assets.

**Command**: `NODE_ENV=production node dist/index.js`

**Functionality**:
- Serves the built application from `dist/` directory
- Enables production optimizations
- Serves static assets with proper caching headers
- Uses compressed responses (gzip)
- Minimal logging for performance
- Handles both API routes and static file serving

**Usage Examples**:
```bash
# Standard production start
npm start

# With custom port
PORT=8080 npm start

# With PM2 process manager
pm2 start "npm start" --name fuel-system
```

**Expected Output**:
```
[Hardware] Pump 03 initialized
Server running in production mode on port 5000
```

**Required Environment Variables**:
- `DATABASE_URL` - Production PostgreSQL connection
- `NODE_ENV` - Set to "production"
- `SESSION_SECRET` - Secure session secret key
- `PORT` (optional) - Server port, defaults to system assigned

**Production Features**:
- **Asset Caching**: Long-term caching for static assets
- **Compression**: Gzip compression for responses
- **Security Headers**: Enhanced security configurations
- **Error Handling**: Production error reporting
- **Session Management**: Persistent sessions with PostgreSQL

**Common Use Cases**:
- Production deployment
- Performance testing
- Load testing
- Production monitoring

---

## 🔍 Quality Assurance Scripts

### `npm run check`

**Purpose**: Performs TypeScript type checking across the entire codebase.

**Command**: `tsc`

**Functionality**:
- Validates TypeScript syntax and types
- Checks for type errors without emitting files
- Validates imports and module resolution
- Ensures type safety across frontend, backend, and shared code
- Reports compilation errors and warnings

**Usage Examples**:
```bash
# Standard type check
npm run check

# Watch mode for continuous checking
npm run check -- --watch

# Check specific files
npm run check -- --noEmit src/components/*.tsx
```

**Expected Output (Success)**:
```
> tsc

# No output indicates successful compilation
```

**Expected Output (Errors)**:
```
src/components/pump-status.tsx(45,12): error TS2345: 
Argument of type 'string' is not assignable to parameter of type 'number'.
```

**What It Checks**:
- **Type Safety**: Variable and function type correctness
- **Interface Compliance**: Implementation matches defined interfaces
- **Import Resolution**: All imports are valid and accessible
- **Generic Constraints**: Proper use of TypeScript generics
- **Null Safety**: Proper handling of nullable values

**Common Use Cases**:
- Pre-commit validation
- Continuous integration checks
- Development debugging
- Refactoring validation

---

## 🗄 Database Scripts

### `npm run db:push`

**Purpose**: Synchronizes database schema with Drizzle ORM definitions.

**Command**: `drizzle-kit push`

**Functionality**:
- Reads schema definitions from `shared/schema.ts`
- Compares with current database state
- Generates and executes DDL statements
- Creates tables, indexes, and constraints
- Handles schema migrations automatically
- Provides rollback information for safety

**Usage Examples**:
```bash
# Standard schema push
npm run db:push

# Force push (ignore warnings)
npm run db:push -- --force

# Dry run (show changes without applying)
npm run db:push -- --dry-run
```

**Expected Output**:
```
Reading config from ./drizzle.config.ts
Connecting to database...
✓ Schema up to date
No changes detected

# OR if changes exist:
Changes detected:
+ CREATE TABLE "transactions" (
+   "id" serial PRIMARY KEY,
+   "transaction_id" varchar(255) NOT NULL,
+   ...
+ );

? Apply changes? (y/N)
```

**Schema Validation**:
- **Table Creation**: Creates missing tables
- **Column Management**: Adds/modifies columns
- **Index Optimization**: Creates performance indexes
- **Constraint Enforcement**: Adds foreign keys and checks
- **Data Preservation**: Safely migrates existing data

**Required Environment Variables**:
- `DATABASE_URL` - Target database connection

**Safety Features**:
- **Confirmation Prompts**: Asks before destructive changes
- **Backup Recommendations**: Suggests backups for major changes
- **Rollback Information**: Provides undo instructions
- **Data Loss Warnings**: Alerts about potential data loss

**Common Use Cases**:
- Initial database setup
- Schema updates during development
- Production schema migrations
- Database structure synchronization

---

## 🔧 Advanced Usage Patterns

### Chaining Scripts

```bash
# Full development setup
npm install && npm run db:push && npm run dev

# Complete build and test cycle
npm run check && npm run build && npm start

# Database reset and restart
npm run db:push -- --force && npm run dev
```

### Environment-Specific Execution

```bash
# Development with specific database
DATABASE_URL="postgresql://dev_user:pass@localhost/dev_db" npm run dev

# Production build with optimization flags
NODE_ENV=production npm run build

# Testing with temporary database
DATABASE_URL="postgresql://test_user:pass@localhost/test_db" npm run check
```

### Debugging and Monitoring

```bash
# Development with debug logs
DEBUG=express:* npm run dev

# Check with verbose TypeScript output
npm run check -- --listFiles

# Build with bundle analysis
npm run build && npx bundlesize
```

### Integration with Process Managers

```bash
# PM2 development setup
pm2 start "npm run dev" --name fuel-dev --watch

# PM2 production deployment
pm2 start "npm start" --name fuel-prod --instances max

# Docker container
docker run -e NODE_ENV=production npm start
```

---

## 🚨 Troubleshooting

### Common Script Issues

**`npm run dev` fails to start**:
- Check PostgreSQL connection
- Verify environment variables
- Ensure port 5000 is available
- Check Node.js version (requires v18+)

**`npm run build` produces large bundles**:
- Check for circular dependencies
- Verify tree-shaking is working
- Review import statements for optimization
- Use bundle analyzer to identify large dependencies

**`npm run check` reports type errors**:
- Update type definitions
- Check import paths and aliases
- Verify shared schema consistency
- Review generic type constraints

**`npm run db:push` fails**:
- Verify database connectivity
- Check schema syntax in `shared/schema.ts`
- Ensure proper database permissions
- Review migration logs for conflicts

### Performance Optimization

**Development Speed**:
- Use `npm run check -- --incremental` for faster type checking
- Enable Vite's dependency pre-bundling
- Use `--watch` flags for continuous validation

**Build Performance**:
- Enable parallel builds where possible
- Use build caching mechanisms
- Optimize asset sizes before building
- Consider splitting large builds

**Database Performance**:
- Run `npm run db:push` during low-traffic periods
- Test schema changes in development first
- Monitor database performance after migrations
- Keep regular backups before major changes