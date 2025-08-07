#!/bin/bash

# Agent OS Deployment Validator
# Prevents common deployment issues based on lessons learned
# Version: 1.0.0
# Date: 2025-01-27

set -e

echo "🔍 Agent OS Deployment Validation Starting..."
echo "================================================"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
ERRORS=0
WARNINGS=0
CHECKS_PASSED=0

# Configuration
BACKEND_DIR="${BACKEND_DIR:-backend}"
FRONTEND_DIR="${FRONTEND_DIR:-frontend}"

# Function to print section headers
print_section() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}▶ $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Function to check HQL compatibility
check_hql_compatibility() {
    print_section "Checking HQL Query Compatibility"
    
    local found_issues=false
    
    # Check for PostgreSQL-specific EXTRACT(EPOCH FROM ...)
    echo -n "  Checking for EXTRACT(EPOCH) usage... "
    if grep -r "EXTRACT(EPOCH" --include="*.java" "$BACKEND_DIR/src" 2>/dev/null | grep -v "^[[:space:]]*//"; then
        echo -e "${RED}FAILED${NC}"
        echo -e "    ${RED}❌ PostgreSQL-specific EXTRACT(EPOCH) found${NC}"
        echo "    💡 Solution: Move timestamp calculations to service layer"
        ((ERRORS++))
        found_issues=true
    else
        echo -e "${GREEN}PASSED${NC}"
        ((CHECKS_PASSED++))
    fi
    
    # Check for DATE_TRUNC usage
    echo -n "  Checking for DATE_TRUNC usage... "
    if grep -r "DATE_TRUNC" --include="*.java" "$BACKEND_DIR/src" 2>/dev/null | grep -v "^[[:space:]]*//"; then
        echo -e "${RED}FAILED${NC}"
        echo -e "    ${RED}❌ PostgreSQL-specific DATE_TRUNC found${NC}"
        echo "    💡 Solution: Use HQL date functions or service layer"
        ((ERRORS++))
        found_issues=true
    else
        echo -e "${GREEN}PASSED${NC}"
        ((CHECKS_PASSED++))
    fi
    
    # Check for FUNCTION('DATE_TRUNC') usage
    echo -n "  Checking for FUNCTION calls... "
    if grep -r "FUNCTION('DATE_TRUNC'" --include="*.java" "$BACKEND_DIR/src" 2>/dev/null | grep -v "^[[:space:]]*//"; then
        echo -e "${RED}FAILED${NC}"
        echo -e "    ${RED}❌ Database-specific FUNCTION calls found${NC}"
        echo "    💡 Solution: Use standard HQL functions"
        ((ERRORS++))
        found_issues=true
    else
        echo -e "${GREEN}PASSED${NC}"
        ((CHECKS_PASSED++))
    fi
    
    if [ "$found_issues" = false ]; then
        echo -e "  ${GREEN}✓ All HQL queries are database-agnostic${NC}"
    fi
}

# Function to check repository method signatures
check_repository_methods() {
    print_section "Checking Repository Method Signatures"
    
    echo -n "  Checking for Optional with Pageable... "
    if grep -r "Optional<.*>.*Pageable" --include="*.java" "$BACKEND_DIR/src" 2>/dev/null | grep -v "^[[:space:]]*//"; then
        echo -e "${RED}FAILED${NC}"
        echo -e "    ${RED}❌ Optional with Pageable found in repository${NC}"
        echo "    💡 Solution: Use List<Entity> return type with Pageable"
        echo "    Example: List<Entity> findByStatus(String status, Pageable pageable);"
        ((ERRORS++))
    else
        echo -e "${GREEN}PASSED${NC}"
        echo -e "  ${GREEN}✓ All repository methods have valid signatures${NC}"
        ((CHECKS_PASSED++))
    fi
}

# Function to check Docker configuration
check_docker_config() {
    print_section "Checking Docker Configuration"
    
    if [ -f "$BACKEND_DIR/Dockerfile" ]; then
        # Check if using Alpine
        echo -n "  Checking base image... "
        if grep -q "FROM.*alpine" "$BACKEND_DIR/Dockerfile"; then
            echo -e "${YELLOW}Alpine Linux${NC}"
            
            # Check for native dependencies
            echo -n "  Checking for libstdc++ (required for ONNX/TensorFlow)... "
            if grep -q "libstdc++" "$BACKEND_DIR/Dockerfile"; then
                echo -e "${GREEN}FOUND${NC}"
                ((CHECKS_PASSED++))
            else
                echo -e "${YELLOW}NOT FOUND${NC}"
                echo -e "    ${YELLOW}⚠ Consider adding: RUN apk add --no-cache libstdc++ libgomp${NC}"
                ((WARNINGS++))
            fi
        else
            echo -e "${GREEN}Full Linux distribution${NC}"
            ((CHECKS_PASSED++))
        fi
    else
        echo -e "  ${YELLOW}⚠ No Dockerfile found in $BACKEND_DIR${NC}"
        ((WARNINGS++))
    fi
}

# Function to check Spring configuration
check_spring_config() {
    print_section "Checking Spring Configuration"
    
    local app_yml="$BACKEND_DIR/src/main/resources/application.yml"
    local app_props="$BACKEND_DIR/src/main/resources/application.properties"
    
    # Check for circular references
    echo -n "  Checking for circular references workaround... "
    if [ -f "$app_yml" ] && grep -q "allow-circular-references:[[:space:]]*true" "$app_yml"; then
        echo -e "${YELLOW}WARNING${NC}"
        echo -e "    ${YELLOW}⚠ Circular references allowed - consider refactoring${NC}"
        ((WARNINGS++))
    elif [ -f "$app_props" ] && grep -q "spring.main.allow-circular-references=true" "$app_props"; then
        echo -e "${YELLOW}WARNING${NC}"
        echo -e "    ${YELLOW}⚠ Circular references allowed - consider refactoring${NC}"
        ((WARNINGS++))
    else
        echo -e "${GREEN}PASSED${NC}"
        ((CHECKS_PASSED++))
    fi
    
    # Check for WebSocket configuration
    echo -n "  Checking for WebSocket configuration... "
    if grep -r "enableSimpleBroker" --include="*.java" "$BACKEND_DIR/src" 2>/dev/null | grep -q "setHeartbeatValue"; then
        if ! grep -r "TaskScheduler" --include="*.java" "$BACKEND_DIR/src" 2>/dev/null | grep -q "@Bean"; then
            echo -e "${YELLOW}WARNING${NC}"
            echo -e "    ${YELLOW}⚠ WebSocket heartbeat configured without TaskScheduler bean${NC}"
            ((WARNINGS++))
        else
            echo -e "${GREEN}PASSED${NC}"
            ((CHECKS_PASSED++))
        fi
    else
        echo -e "${GREEN}N/A${NC}"
    fi
}

# Function to check test coverage
check_test_coverage() {
    print_section "Checking Test Coverage"
    
    if [ -d "$BACKEND_DIR/src/test" ]; then
        # Count repository tests
        echo -n "  Checking for repository tests... "
        local repo_tests=$(find "$BACKEND_DIR/src/test" -name "*RepositoryTest.java" 2>/dev/null | wc -l)
        if [ "$repo_tests" -gt 0 ]; then
            echo -e "${GREEN}Found $repo_tests repository test(s)${NC}"
            ((CHECKS_PASSED++))
        else
            echo -e "${YELLOW}WARNING${NC}"
            echo -e "    ${YELLOW}⚠ No repository tests found${NC}"
            echo "    💡 Add @DataJpaTest tests for repositories"
            ((WARNINGS++))
        fi
        
        # Check for integration tests
        echo -n "  Checking for integration tests... "
        local int_tests=$(find "$BACKEND_DIR/src/test" -name "*IntegrationTest.java" -o -name "*IT.java" 2>/dev/null | wc -l)
        if [ "$int_tests" -gt 0 ]; then
            echo -e "${GREEN}Found $int_tests integration test(s)${NC}"
            ((CHECKS_PASSED++))
        else
            echo -e "${YELLOW}WARNING${NC}"
            echo -e "    ${YELLOW}⚠ No integration tests found${NC}"
            ((WARNINGS++))
        fi
    else
        echo -e "  ${YELLOW}⚠ No test directory found${NC}"
        ((WARNINGS++))
    fi
}

# Function to check for common issues
check_common_issues() {
    print_section "Checking for Common Issues"
    
    # Check for hardcoded credentials
    echo -n "  Checking for hardcoded credentials... "
    if grep -r "password\s*=\s*\"[^$]" --include="*.java" --include="*.yml" --include="*.properties" "$BACKEND_DIR/src" 2>/dev/null | grep -v "test" | grep -v "example"; then
        echo -e "${RED}FAILED${NC}"
        echo -e "    ${RED}❌ Possible hardcoded credentials found${NC}"
        ((ERRORS++))
    else
        echo -e "${GREEN}PASSED${NC}"
        ((CHECKS_PASSED++))
    fi
    
    # Check for TODO/FIXME in critical files
    echo -n "  Checking for unresolved TODOs in repositories... "
    local todos=$(grep -r "TODO\|FIXME" --include="*Repository.java" "$BACKEND_DIR/src/main" 2>/dev/null | wc -l)
    if [ "$todos" -gt 0 ]; then
        echo -e "${YELLOW}Found $todos TODO/FIXME${NC}"
        echo -e "    ${YELLOW}⚠ Unresolved TODOs found in repository files${NC}"
        ((WARNINGS++))
    else
        echo -e "${GREEN}PASSED${NC}"
        ((CHECKS_PASSED++))
    fi
}

# Function to validate Docker Compose
check_docker_compose() {
    print_section "Checking Docker Compose Configuration"
    
    if [ -f "docker-compose.yml" ] || [ -f "docker-compose.yaml" ]; then
        echo -n "  Validating Docker Compose syntax... "
        if docker-compose config > /dev/null 2>&1; then
            echo -e "${GREEN}VALID${NC}"
            ((CHECKS_PASSED++))
        else
            echo -e "${RED}INVALID${NC}"
            echo -e "    ${RED}❌ Docker Compose configuration is invalid${NC}"
            ((ERRORS++))
        fi
        
        # Check for health checks
        echo -n "  Checking for health checks... "
        local services_with_health=$(grep -c "healthcheck:" docker-compose.y* 2>/dev/null || echo "0")
        if [ "$services_with_health" -gt 0 ]; then
            echo -e "${GREEN}Found $services_with_health service(s) with health checks${NC}"
            ((CHECKS_PASSED++))
        else
            echo -e "${YELLOW}WARNING${NC}"
            echo -e "    ${YELLOW}⚠ No health checks defined in docker-compose${NC}"
            ((WARNINGS++))
        fi
    else
        echo -e "  ${YELLOW}⚠ No docker-compose.yml found${NC}"
        ((WARNINGS++))
    fi
}

# Main execution
main() {
    echo "Project: $(basename $(pwd))"
    echo "Backend Directory: $BACKEND_DIR"
    echo "Frontend Directory: $FRONTEND_DIR"
    echo ""
    
    # Run all checks
    check_hql_compatibility
    check_repository_methods
    check_docker_config
    check_spring_config
    check_test_coverage
    check_common_issues
    check_docker_compose
    
    # Print summary
    print_section "Validation Summary"
    
    echo -e "  Checks Passed: ${GREEN}$CHECKS_PASSED${NC}"
    echo -e "  Warnings:      ${YELLOW}$WARNINGS${NC}"
    echo -e "  Errors:        ${RED}$ERRORS${NC}"
    echo ""
    
    # Final status
    if [ $ERRORS -gt 0 ]; then
        echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${RED}❌ DEPLOYMENT VALIDATION FAILED${NC}"
        echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo "Please fix the errors above before deploying."
        echo "Run this script again after making corrections."
        exit 1
    elif [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${YELLOW}⚠ DEPLOYMENT VALIDATION PASSED WITH WARNINGS${NC}"
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo "Review the warnings above to prevent potential issues."
        echo "Consider addressing them before production deployment."
        exit 0
    else
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}✅ DEPLOYMENT VALIDATION PASSED${NC}"
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo "Your application is ready for deployment!"
        exit 0
    fi
}

# Run main function
main "$@"