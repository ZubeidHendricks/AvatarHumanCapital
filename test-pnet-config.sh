#!/bin/bash

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║          PNET Configuration Test Script                     ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "Checking PNET environment variables..."
echo ""

# Check Org ID
if [ -z "$PNET_ORG_ID" ]; then
    echo -e "${RED}✗ PNET_ORG_ID not set${NC}"
    echo "  Expected: 120911"
    echo "  Action: Add PNET_ORG_ID=120911 to your environment"
    ORG_ID_OK=false
else
    if [ "$PNET_ORG_ID" = "120911" ]; then
        echo -e "${GREEN}✓ PNET_ORG_ID correctly set: $PNET_ORG_ID${NC}"
        ORG_ID_OK=true
    else
        echo -e "${YELLOW}⚠ PNET_ORG_ID set but incorrect: $PNET_ORG_ID${NC}"
        echo "  Expected: 120911"
        ORG_ID_OK=false
    fi
fi

# Check Sender ID
if [ -z "$PNET_SENDER_ID" ]; then
    echo -e "${RED}✗ PNET_SENDER_ID not set${NC}"
    echo "  Expected: 21965"
    echo "  Action: Add PNET_SENDER_ID=21965 to your environment"
    SENDER_ID_OK=false
else
    if [ "$PNET_SENDER_ID" = "21965" ]; then
        echo -e "${GREEN}✓ PNET_SENDER_ID correctly set: $PNET_SENDER_ID${NC}"
        SENDER_ID_OK=true
    else
        echo -e "${YELLOW}⚠ PNET_SENDER_ID set but incorrect: $PNET_SENDER_ID${NC}"
        echo "  Expected: 21965"
        SENDER_ID_OK=false
    fi
fi

# Check API Key
if [ -z "$PNET_API_KEY" ]; then
    echo -e "${RED}✗ PNET_API_KEY not set${NC}"
    echo "  Action: Obtain API key from PNET and add to environment"
    API_KEY_OK=false
else
    echo -e "${GREEN}✓ PNET_API_KEY is set (${#PNET_API_KEY} characters)${NC}"
    API_KEY_OK=true
fi

# Check Base URL
if [ -z "$PNET_API_BASE_URL" ]; then
    echo -e "${YELLOW}⚠ PNET_API_BASE_URL not set${NC}"
    echo "  Recommended: https://api.pnet.co.za/v4"
    echo "  Action: Add PNET_API_BASE_URL to your environment"
    BASE_URL_OK=false
else
    echo -e "${GREEN}✓ PNET_API_BASE_URL set: $PNET_API_BASE_URL${NC}"
    BASE_URL_OK=true
fi

# Check Application Email Domain
if [ -z "$APPLICATION_EMAIL_DOMAIN" ]; then
    echo -e "${YELLOW}⚠ APPLICATION_EMAIL_DOMAIN not set${NC}"
    echo "  Recommended: applications@avatarhc.com"
    EMAIL_OK=false
else
    echo -e "${GREEN}✓ APPLICATION_EMAIL_DOMAIN set: $APPLICATION_EMAIL_DOMAIN${NC}"
    EMAIL_OK=true
fi

# Check Groq API Key (needed for AI features)
if [ -z "$GROQ_API_KEY" ]; then
    echo -e "${YELLOW}⚠ GROQ_API_KEY not set${NC}"
    echo "  Required for: AI job description enrichment, screening questions"
    GROQ_OK=false
else
    echo -e "${GREEN}✓ GROQ_API_KEY is set (${#GROQ_API_KEY} characters)${NC}"
    GROQ_OK=true
fi

echo ""
echo "────────────────────────────────────────────────────────────"
echo ""

# Summary
TOTAL_CHECKS=6
PASSED_CHECKS=0

if [ "$ORG_ID_OK" = true ]; then ((PASSED_CHECKS++)); fi
if [ "$SENDER_ID_OK" = true ]; then ((PASSED_CHECKS++)); fi
if [ "$API_KEY_OK" = true ]; then ((PASSED_CHECKS++)); fi
if [ "$BASE_URL_OK" = true ]; then ((PASSED_CHECKS++)); fi
if [ "$EMAIL_OK" = true ]; then ((PASSED_CHECKS++)); fi
if [ "$GROQ_OK" = true ]; then ((PASSED_CHECKS++)); fi

echo "Configuration Status: $PASSED_CHECKS / $TOTAL_CHECKS checks passed"
echo ""

if [ $PASSED_CHECKS -eq $TOTAL_CHECKS ]; then
    echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}✓ All checks passed! PNET integration is ready to use.${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Create a test job in HR Dashboard"
    echo "  2. Set status to 'Active' to trigger auto-posting"
    echo "  3. Check database for pnet_job_id"
    echo "  4. Verify job appears on PNET portal"
    exit 0
elif [ $PASSED_CHECKS -ge 3 ]; then
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}⚠ Partial configuration. Some features may not work.${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "Missing configuration items listed above."
    echo "Add missing variables to continue."
    exit 1
else
    echo -e "${RED}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${RED}✗ Configuration incomplete. PNET integration will not work.${NC}"
    echo -e "${RED}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "Quick setup:"
    echo ""
    echo "  export PNET_ORG_ID=120911"
    echo "  export PNET_SENDER_ID=21965"
    echo "  export PNET_API_KEY=<your_key_here>"
    echo "  export PNET_API_BASE_URL=https://api.pnet.co.za/v4"
    echo "  export APPLICATION_EMAIL_DOMAIN=applications@avatarhc.com"
    echo ""
    echo "Or add to .env file (Replit Secrets for Replit)"
    exit 1
fi
