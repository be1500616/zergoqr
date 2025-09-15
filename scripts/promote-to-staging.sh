#!/bin/bash

# Promote code from development to staging environment
# This script handles the promotion process with proper validation

set -e

echo "🚀 Promoting code to staging environment..."

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
    if [ "$current_branch" != "develop" ]; then
        print_error "You must be on the 'develop' branch to promote to staging."
        print_status "Current branch: $current_branch"
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
    print_status "Pulling latest changes from origin/develop..."
    git pull origin develop
    print_success "Latest changes pulled"
}

# Run tests
run_tests() {
    print_status "Running tests to ensure code quality..."
    
    # Install dependencies
    pnpm install --frozen-lockfile
    
    # Run linting
    print_status "Running linting..."
    pnpm lint
    
    # Run type checking
    print_status "Running type checking..."
    pnpm type-check
    
    # Run unit tests
    print_status "Running unit tests..."
    pnpm test
    
    # Run build to ensure it works
    print_status "Testing build process..."
    pnpm build
    
    print_success "All tests passed!"
}

# Create staging branch or update existing one
prepare_staging_branch() {
    print_status "Preparing staging branch..."
    
    # Fetch all branches
    git fetch origin
    
    # Check if staging branch exists
    if git show-ref --verify --quiet refs/heads/staging; then
        print_status "Staging branch exists, updating it..."
        git checkout staging
        git merge develop --no-ff -m "Promote develop to staging - $(date '+%Y-%m-%d %H:%M:%S')"
    else
        print_status "Creating new staging branch..."
        git checkout -b staging
    fi
    
    print_success "Staging branch prepared"
}

# Push to staging
push_staging() {
    print_status "Pushing to staging branch..."
    git push origin staging
    print_success "Code pushed to staging branch"
}

# Trigger deployment
trigger_deployment() {
    print_status "Staging deployment will be triggered automatically by GitHub Actions"
    print_status "Monitor the deployment at: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^.]*\).*/\1/')/actions"
}

# Create deployment summary
create_summary() {
    echo ""
    echo "📋 Promotion Summary"
    echo "==================="
    echo "Source Branch: develop"
    echo "Target Branch: staging"
    echo "Commit: $(git rev-parse --short HEAD)"
    echo "Time: $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""
    echo "Next Steps:"
    echo "1. Monitor the GitHub Actions deployment"
    echo "2. Test the staging environment: https://staging.zergoqr.vercel.app"
    echo "3. If everything looks good, promote to production with: scripts/promote-to-production.sh"
    echo ""
}

# Main promotion function
main() {
    echo "🚀 ZERGO QR - Staging Promotion"
    echo "==============================="
    echo ""
    
    check_branch
    check_working_directory
    pull_latest
    run_tests
    prepare_staging_branch
    push_staging
    trigger_deployment
    create_summary
    
    print_success "Promotion to staging completed successfully! 🎉"
}

# Run main function
main "$@"
