#!/bin/bash

# Promote code from staging to production environment
# This script handles the production promotion with extra safety checks

set -e

echo "🚀 Promoting code to production environment..."

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

# Check if we're on the correct branch
check_branch() {
    current_branch=$(git branch --show-current)
    if [ "$current_branch" != "staging" ]; then
        print_error "You must be on the 'staging' branch to promote to production."
        print_status "Current branch: $current_branch"
        print_status "Please run: git checkout staging"
        exit 1
    fi
    print_success "On correct branch: $current_branch"
}

# Check if working directory is clean
check_working_directory() {
    if [ -n "$(git status --porcelain)" ]; then
        print_error "Working directory is not clean. Please commit or stash your changes."
        git status --short
        exit 1
    fi
    print_success "Working directory is clean"
}

# Pull latest changes
pull_latest() {
    print_status "Pulling latest changes from origin/staging..."
    git pull origin staging
    print_success "Latest changes pulled"
}

# Run comprehensive tests
run_comprehensive_tests() {
    print_status "Running comprehensive tests for production readiness..."
    
    # Install dependencies
    pnpm install --frozen-lockfile
    
    # Run linting
    print_status "Running linting..."
    pnpm lint
    
    # Run type checking
    print_status "Running type checking..."
    pnpm type-check
    
    # Run unit tests with coverage
    print_status "Running unit tests with coverage..."
    pnpm test:coverage
    
    # Run E2E tests
    print_status "Running E2E tests..."
    pnpm test:e2e
    
    # Run production build
    print_status "Testing production build..."
    pnpm build
    
    print_success "All tests passed!"
}

# Confirm production deployment
confirm_deployment() {
    echo ""
    print_warning "⚠️  PRODUCTION DEPLOYMENT CONFIRMATION ⚠️"
    echo ""
    echo "You are about to deploy to PRODUCTION environment."
    echo "This will affect live users and real data."
    echo ""
    echo "Pre-deployment checklist:"
    echo "✅ All tests have passed"
    echo "✅ Staging environment has been tested"
    echo "✅ Database migrations are ready (if any)"
    echo "✅ External service configurations are correct"
    echo "✅ Monitoring and alerts are in place"
    echo ""
    read -p "Are you absolutely sure you want to proceed? (yes/no): " -r
    echo ""
    
    if [[ ! $REPLY =~ ^(yes|YES)$ ]]; then
        print_status "Production deployment cancelled."
        exit 0
    fi
    
    print_success "Production deployment confirmed"
}

# Create production release
create_production_release() {
    print_status "Creating production release..."
    
    # Fetch all branches
    git fetch origin
    
    # Switch to main branch
    git checkout main
    git pull origin main
    
    # Merge staging into main
    git merge staging --no-ff -m "Release to production - $(date '+%Y-%m-%d %H:%M:%S')"
    
    # Create a release tag
    release_tag="v$(date '+%Y.%m.%d-%H%M%S')"
    git tag -a "$release_tag" -m "Production release $release_tag"
    
    print_success "Production release created with tag: $release_tag"
}

# Push to production
push_production() {
    print_status "Pushing to main branch..."
    git push origin main
    git push origin --tags
    print_success "Code pushed to main branch with tags"
}

# Trigger deployment
trigger_deployment() {
    print_status "Production deployment will be triggered automatically by GitHub Actions"
    print_status "Monitor the deployment at: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^.]*\).*/\1/')/actions"
}

# Post-deployment monitoring
post_deployment_monitoring() {
    echo ""
    print_warning "🔍 POST-DEPLOYMENT MONITORING"
    echo ""
    echo "Please monitor the following after deployment:"
    echo "1. Application health: https://zergoqr.vercel.app/api/health"
    echo "2. Error tracking: Check Sentry dashboard"
    echo "3. Performance metrics: Check Vercel analytics"
    echo "4. Database performance: Monitor connection pool"
    echo "5. External service integrations: Test key user flows"
    echo ""
    echo "If any issues are detected, be prepared to:"
    echo "- Rollback using: git revert HEAD"
    echo "- Check logs in Vercel dashboard"
    echo "- Monitor error rates and user feedback"
    echo ""
}

# Create deployment summary
create_summary() {
    echo ""
    echo "📋 Production Deployment Summary"
    echo "==============================="
    echo "Source Branch: staging"
    echo "Target Branch: main"
    echo "Release Tag: $(git describe --tags --abbrev=0)"
    echo "Commit: $(git rev-parse --short HEAD)"
    echo "Time: $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""
    echo "Production URL: https://zergoqr.vercel.app"
    echo ""
}

# Main promotion function
main() {
    echo "🚀 ZERGO QR - Production Promotion"
    echo "=================================="
    echo ""
    
    check_branch
    check_working_directory
    pull_latest
    run_comprehensive_tests
    confirm_deployment
    create_production_release
    push_production
    trigger_deployment
    post_deployment_monitoring
    create_summary
    
    print_success "Promotion to production completed successfully! 🎉"
    print_warning "Please monitor the application closely for the next 30 minutes."
}

# Run main function
main "$@"
