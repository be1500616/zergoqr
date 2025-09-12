#!/bin/bash

# Developer Onboarding Script
# This script helps new developers get started with the ZERGO QR project

set -e

echo "👋 Welcome to ZERGO QR Development Team!"

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

# Welcome message
show_welcome() {
    echo ""
    echo "🏗️  ZERGO QR - Developer Onboarding"
    echo "===================================="
    echo ""
    echo "This script will help you set up your development environment"
    echo "for the ZERGO QR restaurant ordering system."
    echo ""
}

# Check system requirements
check_system_requirements() {
    print_status "Checking system requirements..."
    
    # Check operating system
    OS=$(uname -s)
    print_status "Operating System: $OS"
    
    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js: $NODE_VERSION"
        
        # Check if version is 18+
        NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$NODE_MAJOR" -lt 18 ]; then
            print_error "Node.js version 18+ is required. Please upgrade."
            exit 1
        fi
    else
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        echo "Visit: https://nodejs.org/"
        exit 1
    fi
    
    # Check pnpm
    if command -v pnpm &> /dev/null; then
        PNPM_VERSION=$(pnpm --version)
        print_success "pnpm: v$PNPM_VERSION"
    else
        print_warning "pnpm is not installed. Installing pnpm..."
        npm install -g pnpm@8.7.0
        print_success "pnpm installed successfully"
    fi
    
    # Check Docker
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version)
        print_success "Docker: $DOCKER_VERSION"
    else
        print_error "Docker is not installed. Please install Docker first."
        echo "Visit: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    # Check Docker Compose
    if command -v docker-compose &> /dev/null; then
        COMPOSE_VERSION=$(docker-compose --version)
        print_success "Docker Compose: $COMPOSE_VERSION"
    else
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check Git
    if command -v git &> /dev/null; then
        GIT_VERSION=$(git --version)
        print_success "Git: $GIT_VERSION"
    else
        print_error "Git is not installed. Please install Git first."
        exit 1
    fi
}

# Setup Git configuration
setup_git_config() {
    print_status "Setting up Git configuration..."
    
    # Check if Git user is configured
    if ! git config user.name &> /dev/null; then
        read -p "Enter your full name for Git commits: " git_name
        git config --global user.name "$git_name"
        print_success "Git user name set to: $git_name"
    else
        print_success "Git user name already configured: $(git config user.name)"
    fi
    
    if ! git config user.email &> /dev/null; then
        read -p "Enter your email for Git commits: " git_email
        git config --global user.email "$git_email"
        print_success "Git user email set to: $git_email"
    else
        print_success "Git user email already configured: $(git config user.email)"
    fi
    
    # Set up useful Git aliases
    git config --global alias.co checkout
    git config --global alias.br branch
    git config --global alias.ci commit
    git config --global alias.st status
    git config --global alias.unstage 'reset HEAD --'
    git config --global alias.last 'log -1 HEAD'
    git config --global alias.visual '!gitk'
    
    print_success "Git aliases configured"
}

# Setup development environment
setup_dev_environment() {
    print_status "Setting up development environment..."
    
    # Run the main setup script
    ./scripts/dev-setup.sh
    
    print_success "Development environment setup completed!"
}

# Setup IDE configuration
setup_ide_config() {
    print_status "Setting up IDE configuration..."
    
    # Create VS Code settings if not exists
    if [ ! -d ".vscode" ]; then
        mkdir -p .vscode
        
        # Create settings.json
        cat > .vscode/settings.json << 'EOF'
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/.next": true,
    "**/dist": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/.next": true,
    "**/dist": true,
    "**/coverage": true
  }
}
EOF
        
        # Create extensions.json
        cat > .vscode/extensions.json << 'EOF'
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "prisma.prisma",
    "ms-vscode.vscode-json"
  ]
}
EOF
        
        print_success "VS Code configuration created"
    else
        print_success "VS Code configuration already exists"
    fi
}

# Show project overview
show_project_overview() {
    echo ""
    print_status "📚 Project Overview"
    echo "==================="
    echo ""
    echo "ZERGO QR is a restaurant ordering system built with:"
    echo "- Next.js 14 with App Router"
    echo "- TypeScript 5.2"
    echo "- Turborepo monorepo"
    echo "- PostgreSQL with Prisma ORM"
    echo "- Redis for caching"
    echo "- Vercel for deployment"
    echo ""
    echo "Project Structure:"
    echo "- apps/web/          - Main Next.js application"
    echo "- packages/shared/   - Shared utilities and types"
    echo "- packages/ui/       - Shared UI components"
    echo "- packages/db/       - Database package with Prisma"
    echo "- packages/config/   - Shared configuration"
    echo ""
}

# Show useful commands
show_useful_commands() {
    echo ""
    print_status "🛠️  Useful Commands"
    echo "==================="
    echo ""
    echo "Development:"
    echo "  pnpm dev                    - Start development server"
    echo "  pnpm build                  - Build for production"
    echo "  pnpm test                   - Run unit tests"
    echo "  pnpm test:e2e               - Run E2E tests"
    echo "  pnpm lint                   - Run ESLint"
    echo "  pnpm type-check             - Run TypeScript checks"
    echo ""
    echo "Database:"
    echo "  pnpm --filter @zergoqr/db db:studio    - Open Prisma Studio"
    echo "  pnpm --filter @zergoqr/db db:seed      - Seed database"
    echo "  pnpm --filter @zergoqr/db db:reset     - Reset database"
    echo ""
    echo "Environment:"
    echo "  pnpm dev:setup              - Setup development environment"
    echo "  pnpm dev:reset              - Reset development environment"
    echo "  pnpm dev:test-services      - Test mock services"
    echo ""
    echo "Deployment:"
    echo "  pnpm promote:staging        - Promote to staging"
    echo "  pnpm promote:production     - Promote to production"
    echo "  pnpm test:production-readiness - Test production readiness"
    echo ""
}

# Show next steps
show_next_steps() {
    echo ""
    print_status "🚀 Next Steps"
    echo "=============="
    echo ""
    echo "1. Explore the codebase:"
    echo "   - Read docs/architecture.md for system overview"
    echo "   - Check apps/web/src/ for the main application code"
    echo "   - Look at packages/ for shared components"
    echo ""
    echo "2. Start development:"
    echo "   - Run 'pnpm dev' to start the development server"
    echo "   - Open http://localhost:3000 in your browser"
    echo "   - Make changes and see them hot-reload automatically"
    echo ""
    echo "3. Learn the workflow:"
    echo "   - Create feature branches from 'develop'"
    echo "   - Write tests for your changes"
    echo "   - Submit pull requests for code review"
    echo ""
    echo "4. Useful resources:"
    echo "   - Project documentation: docs/"
    echo "   - API documentation: apps/web/src/app/api/"
    echo "   - Database schema: packages/db/prisma/schema.prisma"
    echo ""
}

# Main onboarding function
main() {
    show_welcome
    check_system_requirements
    setup_git_config
    setup_dev_environment
    setup_ide_config
    show_project_overview
    show_useful_commands
    show_next_steps
    
    echo ""
    print_success "🎉 Welcome to the team! You're all set up and ready to contribute!"
    echo ""
    print_status "If you have any questions, don't hesitate to ask the team."
    print_status "Happy coding! 🚀"
}

# Run main function
main "$@"
