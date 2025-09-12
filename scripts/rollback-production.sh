#!/bin/bash

# Emergency rollback script for production environment
# This script quickly reverts to the previous stable version

set -e

echo "🚨 Emergency production rollback initiated..."

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

# Confirm rollback
confirm_rollback() {
    echo ""
    print_warning "⚠️  PRODUCTION ROLLBACK CONFIRMATION ⚠️"
    echo ""
    echo "You are about to ROLLBACK the PRODUCTION environment."
    echo "This will revert to the previous stable version."
    echo ""
    echo "Current commit: $(git rev-parse --short HEAD)"
    echo "Previous commit: $(git rev-parse --short HEAD~1)"
    echo ""
    read -p "Are you sure you want to rollback? (yes/no): " -r
    echo ""
    
    if [[ ! $REPLY =~ ^(yes|YES)$ ]]; then
        print_status "Rollback cancelled."
        exit 0
    fi
    
    print_success "Rollback confirmed"
}

# Check current branch
check_branch() {
    current_branch=$(git branch --show-current)
    if [ "$current_branch" != "main" ]; then
        print_status "Switching to main branch..."
        git checkout main
        git pull origin main
    fi
    print_success "On main branch"
}

# Perform rollback
perform_rollback() {
    print_status "Performing rollback..."
    
    # Get the previous commit
    previous_commit=$(git rev-parse HEAD~1)
    
    # Create rollback commit
    git revert HEAD --no-edit
    
    # Create rollback tag
    rollback_tag="rollback-$(date '+%Y.%m.%d-%H%M%S')"
    git tag -a "$rollback_tag" -m "Emergency rollback $rollback_tag"
    
    print_success "Rollback commit created with tag: $rollback_tag"
}

# Push rollback
push_rollback() {
    print_status "Pushing rollback to production..."
    git push origin main
    git push origin --tags
    print_success "Rollback pushed to production"
}

# Verify rollback
verify_rollback() {
    print_status "Verifying rollback deployment..."
    print_status "Monitor the deployment at: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^.]*\).*/\1/')/actions"
    
    echo ""
    print_warning "Please verify the following after rollback:"
    echo "1. Application is accessible: https://zergoqr.vercel.app"
    echo "2. Key user flows are working"
    echo "3. Database integrity is maintained"
    echo "4. External services are functioning"
    echo ""
}

# Post-rollback actions
post_rollback_actions() {
    echo ""
    print_warning "🔧 POST-ROLLBACK ACTIONS"
    echo ""
    echo "1. Investigate the root cause of the issue"
    echo "2. Fix the problem in the develop branch"
    echo "3. Test thoroughly in staging environment"
    echo "4. Plan the next deployment carefully"
    echo ""
    echo "Incident Response:"
    echo "- Document what went wrong"
    echo "- Update monitoring and alerts if needed"
    echo "- Review deployment process for improvements"
    echo ""
}

# Create rollback summary
create_summary() {
    echo ""
    echo "📋 Rollback Summary"
    echo "=================="
    echo "Rollback Tag: $(git describe --tags --abbrev=0)"
    echo "Current Commit: $(git rev-parse --short HEAD)"
    echo "Time: $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""
    echo "Production URL: https://zergoqr.vercel.app"
    echo ""
}

# Main rollback function
main() {
    echo "🚨 ZERGO QR - Emergency Production Rollback"
    echo "==========================================="
    echo ""
    
    confirm_rollback
    check_branch
    perform_rollback
    push_rollback
    verify_rollback
    post_rollback_actions
    create_summary
    
    print_success "Emergency rollback completed! 🎉"
    print_warning "Please monitor the application and investigate the root cause."
}

# Run main function
main "$@"
