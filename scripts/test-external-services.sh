#!/bin/bash

# Test script for external service mocks
# This script tests all mock external services to ensure they're working correctly

set -e

echo "🧪 Testing External Service Mocks..."

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

# Test Twilio Mock Service
test_twilio_mock() {
    print_status "Testing Twilio Mock Service..."
    
    # Test health endpoint
    if curl -s -f http://localhost:8080/health > /dev/null; then
        print_success "Twilio mock health check passed"
    else
        print_error "Twilio mock health check failed"
        return 1
    fi
    
    # Test SMS sending
    response=$(curl -s -X POST http://localhost:8080/2010-04-01/Accounts/ACtest123456789/Messages.json \
        -d "From=+911234567890" \
        -d "To=+919876543210" \
        -d "Body=Test message from development environment")
    
    if echo "$response" | grep -q "queued"; then
        print_success "Twilio SMS mock test passed"
    else
        print_error "Twilio SMS mock test failed"
        return 1
    fi
    
    # Test OTP verification
    otp_response=$(curl -s -X POST http://localhost:8080/2010-04-01/Accounts/ACtest123456789/Services/VAtest123456789/VerificationCheck \
        -d "To=+919876543210" \
        -d "Code=123456")
    
    if echo "$otp_response" | grep -q "approved"; then
        print_success "Twilio OTP verification mock test passed"
    else
        print_error "Twilio OTP verification mock test failed"
        return 1
    fi
}

# Test Razorpay Mock Service
test_razorpay_mock() {
    print_status "Testing Razorpay Mock Service..."
    
    # Test health endpoint
    if curl -s -f http://localhost:8081/health > /dev/null; then
        print_success "Razorpay mock health check passed"
    else
        print_error "Razorpay mock health check failed"
        return 1
    fi
    
    # Test order creation
    order_response=$(curl -s -X POST http://localhost:8081/v1/orders \
        -H "Content-Type: application/json" \
        -d '{
            "amount": 50000,
            "currency": "INR",
            "receipt": "test_receipt_123"
        }')
    
    if echo "$order_response" | grep -q "created"; then
        print_success "Razorpay order creation mock test passed"
    else
        print_error "Razorpay order creation mock test failed"
        return 1
    fi
    
    # Test payment verification
    payment_response=$(curl -s -X POST http://localhost:8081/v1/payments/pay_test123456789 \
        -H "Content-Type: application/json")
    
    if echo "$payment_response" | grep -q "captured"; then
        print_success "Razorpay payment verification mock test passed"
    else
        print_error "Razorpay payment verification mock test failed"
        return 1
    fi
}

# Test Generic Mock Service
test_generic_mock() {
    print_status "Testing Generic Mock Service..."
    
    # Test health endpoint
    if curl -s -f http://localhost:8082/health > /dev/null; then
        print_success "Generic mock health check passed"
    else
        print_error "Generic mock health check failed"
        return 1
    fi
    
    # Test generic endpoint
    generic_response=$(curl -s -X POST http://localhost:8082/api/test \
        -H "Content-Type: application/json" \
        -d '{"test": "data"}')
    
    if echo "$generic_response" | grep -q "success"; then
        print_success "Generic mock service test passed"
    else
        print_error "Generic mock service test failed"
        return 1
    fi
}

# Test database connectivity
test_database() {
    print_status "Testing database connectivity..."
    
    if docker-compose exec postgres pg_isready -U postgres -d zergoqr; then
        print_success "Database connectivity test passed"
    else
        print_error "Database connectivity test failed"
        return 1
    fi
}

# Test Redis connectivity
test_redis() {
    print_status "Testing Redis connectivity..."
    
    if docker-compose exec redis redis-cli ping | grep -q "PONG"; then
        print_success "Redis connectivity test passed"
    else
        print_error "Redis connectivity test failed"
        return 1
    fi
}

# Main test function
main() {
    echo "🧪 External Services Mock Testing"
    echo "================================="
    echo ""
    
    # Check if services are running
    if ! docker-compose ps | grep -q "Up"; then
        print_error "Docker services are not running. Please run 'scripts/dev-setup.sh' first."
        exit 1
    fi
    
    # Wait a moment for services to be fully ready
    sleep 2
    
    # Run all tests
    test_database
    test_redis
    test_twilio_mock
    test_razorpay_mock
    test_generic_mock
    
    echo ""
    print_success "All external service mock tests passed! 🎉"
    echo ""
    echo "Mock service endpoints:"
    echo "- Twilio Mock: http://localhost:8080"
    echo "- Razorpay Mock: http://localhost:8081"
    echo "- Generic Mock: http://localhost:8082"
    echo ""
    echo "You can now use these mock services in your development environment."
}

# Run main function
main "$@"
