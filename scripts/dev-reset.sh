#!/bin/bash

# ZERGO QR Development Environment Reset Script
# This script resets the development environment to a clean state

set -e

echo "🔄 Resetting ZERGO QR Development Environment..."

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

# Stop and remove Docker containers
cleanup_docker() {
    print_status "Cleaning up Docker containers..."
    
    # Stop all containers
    docker-compose down --remove-orphans
    
    # Remove volumes (this will delete all data)
    docker-compose down -v
    
    # Remove any dangling images
    docker image prune -f
    
    print_success "Docker cleanup completed!"
}

# Clean node_modules and build artifacts
cleanup_node() {
    print_status "Cleaning Node.js artifacts..."
    
    # Remove node_modules
    rm -rf node_modules
    rm -rf apps/web/node_modules
    rm -rf packages/*/node_modules
    
    # Remove build artifacts
    rm -rf apps/web/.next
    rm -rf packages/*/dist
    rm -rf packages/db/src/generated
    
    # Remove test artifacts
    rm -rf coverage
    rm -rf test-results
    rm -rf playwright-report
    
    print_success "Node.js cleanup completed!"
}

# Reset database
reset_database() {
    print_status "Resetting database..."
    
    # Start only PostgreSQL for reset
    docker-compose up -d postgres
    
    # Wait for PostgreSQL to be ready
    sleep 5
    until docker-compose exec postgres pg_isready -U postgres -d zergoqr; do
        print_status "Waiting for PostgreSQL..."
        sleep 2
    done
    
    # Reset database schema and data
    cd packages/db
    pnpm db:migrate:reset --force
    cd ../..
    
    print_success "Database reset completed!"
}

# Reinstall dependencies
reinstall_dependencies() {
    print_status "Reinstalling dependencies..."
    
    # Clean pnpm cache
    pnpm store prune
    
    # Install dependencies
    pnpm install --frozen-lockfile
    
    print_success "Dependencies reinstalled!"
}

# Regenerate Prisma client
regenerate_prisma() {
    print_status "Regenerating Prisma client..."
    
    cd packages/db
    pnpm db:generate
    cd ../..
    
    print_success "Prisma client regenerated!"
}

# Main reset function
main() {
    echo "🔄 ZERGO QR Development Environment Reset"
    echo "========================================"
    echo ""
    print_warning "This will delete all development data and reset the environment!"
    echo ""
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Reset cancelled."
        exit 0
    fi
    
    echo ""
    print_status "Starting reset process..."
    
    cleanup_docker
    cleanup_node
    reinstall_dependencies
    regenerate_prisma
    
    # Start fresh environment
    print_status "Starting fresh environment..."
    ./scripts/dev-setup.sh
    
    echo ""
    print_success "Development environment has been reset successfully!"
    echo ""
    echo "You can now run 'pnpm dev' to start the development server."
}

# Check if script is executable
if [ ! -x "scripts/dev-setup.sh" ]; then
    chmod +x scripts/dev-setup.sh
fi

# Run main function
main "$@"
