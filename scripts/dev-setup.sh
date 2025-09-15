#!/bin/bash

# ZERGO QR Development Environment Setup Script
# This script sets up the complete development environment

set -e

echo "🚀 Setting up ZERGO QR Development Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    # Check pnpm
    if ! command -v pnpm &> /dev/null; then
        print_warning "pnpm is not installed. Installing pnpm..."
        npm install -g pnpm@8.7.0
    fi
    
    print_success "All prerequisites are installed!"
}

# Setup environment files
setup_environment() {
    print_status "Setting up environment files..."
    
    # Copy environment files if they don't exist
    if [ ! -f .env.local ]; then
        cp .env.development .env.local
        print_success "Created .env.local from .env.development"
    else
        print_warning ".env.local already exists, skipping..."
    fi
    
    if [ ! -f apps/web/.env.local ]; then
        cp apps/web/.env.example apps/web/.env.local
        print_success "Created apps/web/.env.local"
    else
        print_warning "apps/web/.env.local already exists, skipping..."
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    pnpm install --frozen-lockfile
    print_success "Dependencies installed!"
}

# Start Docker services
start_docker_services() {
    print_status "Starting Docker services..."
    
    # Stop any existing containers
    docker-compose down --remove-orphans
    
    # Build and start services
    docker-compose up -d postgres redis mock-services
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 10
    
    # Check if PostgreSQL is ready
    until docker-compose exec postgres pg_isready -U postgres -d zergoqr; do
        print_status "Waiting for PostgreSQL..."
        sleep 2
    done
    
    # Check if Redis is ready
    until docker-compose exec redis redis-cli ping; do
        print_status "Waiting for Redis..."
        sleep 2
    done
    
    print_success "Docker services are ready!"
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    # Generate Prisma client
    cd packages/db
    pnpm db:generate
    
    # Push database schema
    pnpm db:push
    
    # Seed database with sample data
    pnpm db:seed:dev
    
    cd ../..
    print_success "Database setup completed!"
}

# Verify setup
verify_setup() {
    print_status "Verifying setup..."
    
    # Check if services are running
    if ! docker-compose ps | grep -q "Up"; then
        print_error "Some Docker services are not running!"
        exit 1
    fi
    
    # Test database connection
    if ! docker-compose exec postgres pg_isready -U postgres -d zergoqr; then
        print_error "Database connection failed!"
        exit 1
    fi
    
    # Test Redis connection
    if ! docker-compose exec redis redis-cli ping; then
        print_error "Redis connection failed!"
        exit 1
    fi
    
    print_success "All services are running correctly!"
}

# Main setup function
main() {
    echo "🏗️  ZERGO QR Development Environment Setup"
    echo "=========================================="
    
    check_prerequisites
    setup_environment
    install_dependencies
    start_docker_services
    setup_database
    verify_setup
    
    echo ""
    echo "🎉 Development environment setup completed!"
    echo ""
    echo "Next steps:"
    echo "1. Run 'pnpm dev' to start the development server"
    echo "2. Open http://localhost:3000 in your browser"
    echo "3. Access Prisma Studio at http://localhost:5555 (run 'pnpm db:studio' in packages/db)"
    echo ""
    echo "Available services:"
    echo "- PostgreSQL: localhost:5432"
    echo "- Redis: localhost:6379"
    echo "- Mock Twilio: localhost:8080"
    echo "- Mock Razorpay: localhost:8081"
    echo "- Mock Services: localhost:8082"
    echo ""
    echo "Useful commands:"
    echo "- 'pnpm dev' - Start development server"
    echo "- 'pnpm test' - Run tests"
    echo "- 'pnpm lint' - Run linting"
    echo "- 'pnpm build' - Build for production"
    echo "- 'docker-compose logs -f' - View Docker logs"
    echo "- 'scripts/dev-reset.sh' - Reset development environment"
}

# Run main function
main "$@"
