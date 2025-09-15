# ZERGO QR - Restaurant Ordering System

A production-ready Next.js monorepo for QR code-based restaurant ordering system.

## 🏗️ Architecture

This project uses a **Turborepo** monorepo structure with the following packages:

```
zergoqr/
├── apps/
│   └── web/                    # Next.js 14 web application
├── packages/
│   ├── shared/                 # Shared utilities and types
│   ├── ui/                     # Shared UI components
│   ├── db/                     # Database package
│   └── config/                 # Shared configuration
```

## 🚀 Tech Stack

- **Framework**: Next.js 14.0 with App Router
- **Language**: TypeScript 5.2 (strict mode)
- **Build Tool**: Turborepo 1.10.0
- **Package Manager**: pnpm 8.7.0
- **Testing**: Jest 29.7.0 + React Testing Library + Playwright 1.38.0
- **Linting**: ESLint 8.48.0 + Prettier 3.0.0
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- pnpm 8.0.0 or higher

## 🛠️ Getting Started

### Quick Start (Recommended)

For new developers, use the automated onboarding script:

```bash
git clone <repository-url>
cd zergoqr
./scripts/onboard-developer.sh
```

This script will set up everything you need including Docker services, database, and development tools.

### Manual Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd zergoqr
   ```

2. **Set up development environment**
   ```bash
   pnpm dev:setup
   ```

3. **Start development server**
   ```bash
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Development Services

The development environment includes:
- **PostgreSQL**: localhost:5432 (with sample data)
- **Redis**: localhost:6379
- **Mock Services**: localhost:8080-8082 (Twilio, Razorpay, etc.)
- **Prisma Studio**: Run `pnpm --filter @zergoqr/db db:studio`

## 📝 Available Scripts

### Root Level Commands

#### Development
- `pnpm dev` - Start development servers for all apps
- `pnpm build` - Build all packages and apps
- `pnpm lint` - Lint all packages and apps
- `pnpm test` - Run unit tests for all packages
- `pnpm test:coverage` - Run tests with coverage report
- `pnpm test:e2e` - Run E2E tests
- `pnpm type-check` - Type check all packages
- `pnpm format` - Format code with Prettier
- `pnpm clean` - Clean build artifacts

#### Environment Management
- `pnpm dev:setup` - Set up development environment
- `pnpm dev:reset` - Reset development environment
- `pnpm dev:test-services` - Test mock external services

#### Deployment
- `pnpm promote:staging` - Promote code to staging
- `pnpm promote:production` - Promote code to production
- `pnpm rollback:production` - Emergency rollback
- `pnpm test:production-readiness` - Test production readiness

### Package-Specific Commands

Navigate to any package directory and run:
- `pnpm dev` - Start development mode
- `pnpm build` - Build the package
- `pnpm test` - Run package tests
- `pnpm lint` - Lint package code

## 🧪 Testing

### Unit Tests (Jest + React Testing Library)

```bash
# Run all unit tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode
cd apps/web && pnpm test --watch
```

**Coverage Requirements**: >90% for all packages

### E2E Tests (Playwright)

```bash
# Run E2E tests
pnpm test:e2e

# Run E2E tests with UI
cd apps/web && pnpm test:e2e:ui
```

## 🔧 Code Quality

### ESLint Configuration

- **Root**: Basic TypeScript rules
- **Web App**: Next.js + React + TypeScript rules
- **Packages**: Package-specific rules

### Prettier Configuration

- Single quotes
- Semicolons
- 2-space indentation
- 100 character line width

### Pre-commit Hooks

Husky runs the following on each commit:
- ESLint with auto-fix
- Prettier formatting
- Type checking

## 🐳 Development Environment

This project includes a comprehensive development environment that mirrors production:

### Features
- **Docker Services**: PostgreSQL, Redis, and mock external services
- **Hot Reloading**: Instant feedback during development
- **Database Seeding**: Pre-populated with sample restaurant data
- **Mock Services**: Twilio, Razorpay, and other external APIs
- **Production Parity**: Same technology stack as production

### Environment Management
```bash
# Set up everything (recommended for new developers)
pnpm dev:setup

# Reset environment if needed
pnpm dev:reset

# Test all services
pnpm dev:test-services
```

For detailed setup instructions, see [Development Environment Guide](docs/DEVELOPMENT_ENVIRONMENT_GUIDE.md).

## 🚀 Deployment

The project uses a three-tier deployment strategy: Development → Staging → Production.

### Automated Deployment (GitHub Actions)
- Push to `develop` → Deploys to staging
- Push to `main` → Deploys to production

### Manual Deployment
```bash
# Promote to staging
pnpm promote:staging

# Promote to production (after staging validation)
pnpm promote:production

# Emergency rollback
pnpm rollback:production
```

### Vercel Configuration
The project is configured for Vercel deployment with:
- Mumbai region (bom1) for optimal performance in India
- Automatic builds and deployments
- Environment-specific configurations

For detailed deployment instructions, see [Deployment Guide](docs/DEPLOYMENT_GUIDE.md).

## 📁 Project Structure

```
apps/web/
├── src/
│   ├── app/                    # Next.js App Router
│   ├── components/             # React components
│   └── lib/                    # Utility functions
├── e2e/                        # Playwright E2E tests
├── public/                     # Static assets
└── __tests__/                  # Jest unit tests

packages/shared/
├── src/
│   ├── types/                  # TypeScript types
│   └── utils/                  # Utility functions
└── __tests__/                  # Package tests

packages/ui/
├── src/
│   └── components/             # Reusable UI components
└── __tests__/                  # Component tests
```

## 🔒 Environment Variables

Copy `.env.example` to `.env.local` and configure:

- `NODE_ENV` - Environment (development/production)
- `NEXT_PUBLIC_APP_URL` - Application URL
- `DATABASE_URL` - Database connection string
- `NEXTAUTH_SECRET` - NextAuth.js secret

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `pnpm test`
4. Run linting: `pnpm lint`
5. Commit your changes (pre-commit hooks will run)
6. Push and create a pull request

## 📊 Performance

- **Build Time Target**: <3 minutes for full monorepo
- **Bundle Size**: Optimized with tree-shaking
- **Test Coverage**: >90% required
- **Type Safety**: Strict TypeScript configuration

## 🐛 Troubleshooting

### Common Issues

1. **pnpm install fails**
   - Ensure Node.js version >=18.0.0
   - Clear pnpm cache: `pnpm store prune`

2. **Build fails**
   - Check TypeScript errors: `pnpm type-check`
   - Ensure all tests pass: `pnpm test`

3. **E2E tests fail**
   - Install Playwright browsers: `cd apps/web && npx playwright install`

## 📄 License

This project is licensed under the MIT License.
