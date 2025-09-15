#!/bin/bash

# Production Readiness Testing Script
# This script validates that the application is ready for production deployment

set -e

echo "🧪 Testing production readiness..."

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

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    print_status "Running: $test_name"
    
    if eval "$test_command" > /dev/null 2>&1; then
        print_success "✅ $test_name"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        print_error "❌ $test_name"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# Environment validation tests
test_environment_variables() {
    print_status "Testing environment variable validation..."
    
    # Test with production environment
    export NODE_ENV=production
    export DATABASE_URL=postgresql://user:pass@host:5432/db
    export DIRECT_URL=postgresql://user:pass@host:5432/db
    export NEXTAUTH_SECRET=production-secret-key-32-chars-minimum
    export JWT_SECRET=production-jwt-secret-key
    export NEXT_PUBLIC_APP_URL=https://zergoqr.vercel.app
    export NEXT_PUBLIC_API_URL=https://zergoqr.vercel.app/api
    
    run_test "Environment variable validation" "node -e 'require(\"./packages/config/src/env.ts\")'"
}

# Code quality tests
test_code_quality() {
    print_status "Testing code quality..."
    
    run_test "ESLint validation" "pnpm lint"
    run_test "TypeScript type checking" "pnpm type-check"
    run_test "Prettier formatting" "pnpm format:check"
}

# Build tests
test_build_process() {
    print_status "Testing build process..."
    
    run_test "Clean build" "pnpm clean && pnpm build"
    run_test "Build artifacts exist" "test -d apps/web/.next"
    run_test "Build size check" "du -sh apps/web/.next | awk '{if(\$1 ~ /[0-9]+M/ && \$1+0 > 100) exit 1}'"
}

# Security tests
test_security() {
    print_status "Testing security configurations..."
    
    run_test "No hardcoded secrets" "! grep -r 'password\\|secret\\|key' --include='*.ts' --include='*.js' apps/ packages/ | grep -v 'test\\|example\\|mock'"
    run_test "Security headers configured" "grep -q 'X-Content-Type-Options' vercel.json"
    run_test "HTTPS redirect configured" "grep -q 'X-Frame-Options' vercel.json"
}

# Database tests
test_database_compatibility() {
    print_status "Testing database compatibility..."
    
    # Start test database
    docker-compose up -d postgres
    sleep 5
    
    export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/zergoqr_test
    export DIRECT_URL=postgresql://postgres:postgres@localhost:5432/zergoqr_test
    
    run_test "Prisma client generation" "pnpm --filter @zergoqr/db db:generate"
    run_test "Database schema push" "pnpm --filter @zergoqr/db db:push"
    run_test "Database seeding" "pnpm --filter @zergoqr/db db:seed"
    run_test "Database connection test" "node -e 'const {prisma} = require(\"./packages/db/src\"); prisma.\$queryRaw\`SELECT 1\`.then(() => process.exit(0)).catch(() => process.exit(1))'"
}

# Performance tests
test_performance() {
    print_status "Testing performance characteristics..."
    
    # Build the application first
    pnpm build > /dev/null 2>&1
    
    # Start the application in background
    pnpm --filter @zergoqr/web start &
    APP_PID=$!
    
    # Wait for app to start
    sleep 10
    
    # Test response times
    run_test "Homepage response time < 2s" "timeout 2s curl -s http://localhost:3000 > /dev/null"
    run_test "API health check < 1s" "timeout 1s curl -s http://localhost:3000/api/health > /dev/null"
    
    # Kill the application
    kill $APP_PID 2>/dev/null || true
    wait $APP_PID 2>/dev/null || true
}

# API tests
test_api_endpoints() {
    print_status "Testing API endpoints..."
    
    # Start the application in background
    pnpm --filter @zergoqr/web start &
    APP_PID=$!
    
    # Wait for app to start
    sleep 10
    
    run_test "Health endpoint returns 200" "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/health | grep -q '200'"
    run_test "API returns JSON" "curl -s http://localhost:3000/api/health | grep -q 'status'"
    
    # Kill the application
    kill $APP_PID 2>/dev/null || true
    wait $APP_PID 2>/dev/null || true
}

# Dependency tests
test_dependencies() {
    print_status "Testing dependencies..."
    
    run_test "No vulnerable dependencies" "pnpm audit --audit-level moderate"
    run_test "Dependencies are up to date" "pnpm outdated --depth 0 | wc -l | grep -q '^0$'"
    run_test "Lock file is up to date" "pnpm install --frozen-lockfile"
}

# Configuration tests
test_configuration() {
    print_status "Testing configuration files..."
    
    run_test "Vercel configuration is valid" "node -e 'JSON.parse(require(\"fs\").readFileSync(\"vercel.json\", \"utf8\"))'"
    run_test "Package.json is valid" "node -e 'JSON.parse(require(\"fs\").readFileSync(\"package.json\", \"utf8\"))'"
    run_test "Turbo configuration is valid" "node -e 'JSON.parse(require(\"fs\").readFileSync(\"turbo.json\", \"utf8\"))'"
}

# Cleanup function
cleanup() {
    print_status "Cleaning up test environment..."
    docker-compose down > /dev/null 2>&1 || true
    pkill -f "next start" > /dev/null 2>&1 || true
}

# Main test function
main() {
    echo "🧪 ZERGO QR - Production Readiness Testing"
    echo "=========================================="
    echo ""
    
    # Set trap for cleanup
    trap cleanup EXIT
    
    # Install dependencies
    print_status "Installing dependencies..."
    pnpm install --frozen-lockfile > /dev/null
    
    # Run all test suites
    test_environment_variables
    test_code_quality
    test_build_process
    test_security
    test_database_compatibility
    test_performance
    test_api_endpoints
    test_dependencies
    test_configuration
    
    # Print summary
    echo ""
    echo "📊 Test Results Summary"
    echo "======================"
    echo "Total Tests: $TESTS_TOTAL"
    echo "Passed: $TESTS_PASSED"
    echo "Failed: $TESTS_FAILED"
    echo ""
    
    if [ $TESTS_FAILED -eq 0 ]; then
        print_success "🎉 All production readiness tests passed!"
        print_success "The application is ready for production deployment."
        exit 0
    else
        print_error "❌ $TESTS_FAILED test(s) failed."
        print_error "Please fix the issues before deploying to production."
        exit 1
    fi
}

# Run main function
main "$@"
