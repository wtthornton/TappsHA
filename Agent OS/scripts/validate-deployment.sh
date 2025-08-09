#!/bin/bash

# Agent OS Deployment Validation Script
# Based on lessons learned from TappHA project

set -e

echo "🔍 Agent OS Deployment Validation Starting..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_CONTAINER="tappha-frontend"
FRONTEND_PORT="5173"
BACKEND_CONTAINER="tappha-backend"
BACKEND_PORT="8080"

# Validation functions
check_docker_running() {
    echo -e "${BLUE}📦 Checking Docker status...${NC}"
    if ! docker info >/dev/null 2>&1; then
        echo -e "${RED}❌ Docker is not running. Please start Docker Desktop.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Docker is running${NC}"
}

check_containers_running() {
    echo -e "${BLUE}🐳 Checking container status...${NC}"
    
    # Check if containers are running
    if ! docker-compose ps | grep -q "Up"; then
        echo -e "${RED}❌ No containers are running. Starting services...${NC}"
        docker-compose up -d
        sleep 10
    fi
    
    # Check specific containers
    if ! docker-compose ps | grep -q "$FRONTEND_CONTAINER.*Up"; then
        echo -e "${RED}❌ Frontend container is not running${NC}"
        exit 1
    fi
    
    if ! docker-compose ps | grep -q "$BACKEND_CONTAINER.*Up"; then
        echo -e "${YELLOW}⚠️  Backend container is not running (may be expected)${NC}"
    fi
    
    echo -e "${GREEN}✅ Containers are running${NC}"
}

validate_css_build() {
    echo -e "${BLUE}🎨 Validating CSS build...${NC}"
    
    # Check if CSS file exists and has content
    CSS_FILES=$(docker exec $FRONTEND_CONTAINER find /usr/share/nginx/html/assets/ -name "*.css" 2>/dev/null || true)
    
    if [ -z "$CSS_FILES" ]; then
        echo -e "${RED}❌ No CSS files found in assets directory${NC}"
        return 1
    fi
    
    for css_file in $CSS_FILES; do
        file_size=$(docker exec $FRONTEND_CONTAINER wc -c < "$css_file" 2>/dev/null || echo "0")
        
        if [ "$file_size" -eq 0 ]; then
            echo -e "${RED}❌ CSS file $css_file is empty (0 bytes) - Tailwind build failed${NC}"
            echo -e "${YELLOW}💡 This usually indicates Tailwind CSS 4.x compatibility issues${NC}"
            echo -e "${YELLOW}💡 Solution: Downgrade to Tailwind CSS 3.x${NC}"
            return 1
        elif [ "$file_size" -lt 10000 ]; then
            echo -e "${YELLOW}⚠️  CSS file $css_file is very small ($file_size bytes) - may be incomplete${NC}"
        else
            echo -e "${GREEN}✅ CSS file $css_file is properly built ($file_size bytes)${NC}"
        fi
    done
}

validate_port_mappings() {
    echo -e "${BLUE}🔌 Validating port mappings...${NC}"
    
    # Check frontend port mapping
    port_mapping=$(docker-compose ps $FRONTEND_CONTAINER | grep -o "0.0.0.0:$FRONTEND_PORT->[0-9]*/tcp" || true)
    
    if [ -z "$port_mapping" ]; then
        echo -e "${RED}❌ Frontend port mapping not found${NC}"
        return 1
    fi
    
    # Extract container port
    container_port=$(echo "$port_mapping" | grep -o "->[0-9]*" | grep -o "[0-9]*")
    
    if [ "$container_port" != "80" ]; then
        echo -e "${YELLOW}⚠️  Frontend container serving on port $container_port (expected 80 for Nginx)${NC}"
        echo -e "${YELLOW}💡 Check docker-compose.yml port mapping: should be '5173:80'${NC}"
    else
        echo -e "${GREEN}✅ Frontend port mapping correct (5173:80)${NC}"
    fi
}

validate_service_accessibility() {
    echo -e "${BLUE}🌐 Validating service accessibility...${NC}"
    
    # Test frontend
    if curl -s -f "http://localhost:$FRONTEND_PORT" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend accessible at http://localhost:$FRONTEND_PORT${NC}"
    else
        echo -e "${RED}❌ Frontend not accessible at http://localhost:$FRONTEND_PORT${NC}"
        return 1
    fi
    
    # Test backend (if running)
    if docker-compose ps | grep -q "$BACKEND_CONTAINER.*Up"; then
        if curl -s -f "http://localhost:$BACKEND_PORT/api/actuator/health" >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Backend accessible at http://localhost:$BACKEND_PORT${NC}"
        else
            echo -e "${YELLOW}⚠️  Backend not accessible (may be starting up)${NC}"
        fi
    fi
}

validate_authentication_bypass() {
    echo -e "${BLUE}🔐 Validating authentication bypass for development...${NC}"
    
    # Check if we can access the main application (not just login)
    response=$(curl -s "http://localhost:$FRONTEND_PORT" | grep -o "TappHA" || true)
    
    if [ -n "$response" ]; then
        echo -e "${GREEN}✅ Application accessible (authentication bypass working)${NC}"
    else
        echo -e "${YELLOW}⚠️  Application may require authentication${NC}"
        echo -e "${YELLOW}💡 Consider implementing development bypass for localhost${NC}"
    fi
}

validate_dependencies() {
    echo -e "${BLUE}📦 Validating npm dependencies...${NC}"
    
    # Check for critical missing dependencies
    missing_deps=$(docker exec $FRONTEND_CONTAINER npm list --depth=0 2>&1 | grep -E "(missing|not found)" || true)
    
    if [ -n "$missing_deps" ]; then
        echo -e "${YELLOW}⚠️  Some dependencies may be missing:${NC}"
        echo "$missing_deps"
    else
        echo -e "${GREEN}✅ Dependencies appear to be installed${NC}"
    fi
}

# Main validation
main() {
    echo -e "${BLUE}🚀 Starting Agent OS Deployment Validation...${NC}"
    echo ""
    
    check_docker_running
    check_containers_running
    validate_css_build
    validate_port_mappings
    validate_service_accessibility
    validate_authentication_bypass
    validate_dependencies
    
    echo ""
    echo -e "${GREEN}🎉 Deployment validation completed!${NC}"
    echo ""
    echo -e "${BLUE}📋 Summary:${NC}"
    echo -e "  • Frontend: http://localhost:$FRONTEND_PORT"
    echo -e "  • Backend: http://localhost:$BACKEND_PORT"
    echo -e "  • Grafana: http://localhost:3000"
    echo -e "  • Prometheus: http://localhost:9090"
    echo ""
    echo -e "${YELLOW}💡 If issues persist, check the lessons learned documentation:${NC}"
    echo -e "  • .agent-os/lessons-learned/categories/deployment/deployment-issues.md"
    echo -e "  • .agent-os/standards/tech-stack.md"
}

# Run validation
main "$@"