#!/bin/bash

# Keycloak Realm Setup Script for Grafana OAuth Integration (Docker Version)
# This script creates a Keycloak realm called 'grafana' with proper OAuth configuration
# Designed to run from within a Docker container

set -e

# Configuration variables (using Docker service names)
KEYCLOAK_URL="http://keycloak:8080"
ADMIN_USER="admin"
ADMIN_PASSWORD="admin123"
REALM_NAME="grafana"
CLIENT_ID="grafana"
CLIENT_SECRET="grafana-secret"
GRAFANA_URL="http://localhost:3000"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Keycloak Realm Setup for Grafana OAuth (Docker Mode)${NC}"
echo "================================================================="

# Function to wait for Keycloak to be ready
wait_for_keycloak() {
    echo -e "${YELLOW}⏳ Waiting for Keycloak to be ready...${NC}"
    local max_attempts=60
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "$KEYCLOAK_URL/health/ready" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Keycloak is ready!${NC}"
            sleep 5  # Give it a bit more time to fully initialize
            return 0
        fi
        echo "Attempt $attempt/$max_attempts - Keycloak not ready yet..."
        sleep 10
        ((attempt++))
    done
    
    echo -e "${RED}❌ Keycloak failed to start within timeout period${NC}"
    exit 1
}

# Function to get admin access token
get_admin_token() {
    echo -e "${YELLOW}🔑 Getting admin access token...${NC}"
    
    local response=$(curl -s -X POST "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "username=$ADMIN_USER" \
        -d "password=$ADMIN_PASSWORD" \
        -d "grant_type=password" \
        -d "client_id=admin-cli")
    
    if [ $? -eq 0 ]; then
        ACCESS_TOKEN=$(echo $response | jq -r '.access_token')
        if [ "$ACCESS_TOKEN" != "null" ] && [ -n "$ACCESS_TOKEN" ]; then
            echo -e "${GREEN}✅ Admin token obtained successfully${NC}"
            return 0
        fi
    fi
    
    echo -e "${RED}❌ Failed to get admin token${NC}"
    echo "Response: $response"
    exit 1
}

# Function to check if realm exists
realm_exists() {
    local response=$(curl -s -w "%{http_code}" "$KEYCLOAK_URL/admin/realms/$REALM_NAME" \
        -H "Authorization: Bearer $ACCESS_TOKEN")
    
    local http_code="${response: -3}"
    if [ "$http_code" = "200" ]; then
        return 0  # Realm exists
    else
        return 1  # Realm doesn't exist
    fi
}

# Function to create realm
create_realm() {
    if realm_exists; then
        echo -e "${YELLOW}⚠️  Realm '$REALM_NAME' already exists, skipping creation${NC}"
        return 0
    fi
    
    echo -e "${YELLOW}🏗️  Creating realm '$REALM_NAME'...${NC}"
    
    local realm_config='{
        "realm": "'$REALM_NAME'",
        "enabled": true,
        "displayName": "Grafana Realm",
        "displayNameHtml": "<div class=\"kc-logo-text\"><span>Grafana</span></div>",
        "loginTheme": "keycloak",
        "accountTheme": "keycloak",
        "adminTheme": "keycloak",
        "emailTheme": "keycloak",
        "accessTokenLifespan": 300,
        "ssoSessionIdleTimeout": 1800,
        "ssoSessionMaxLifespan": 36000,
        "registrationAllowed": false,
        "rememberMe": true,
        "verifyEmail": false,
        "loginWithEmailAllowed": true,
        "duplicateEmailsAllowed": false,
        "resetPasswordAllowed": true,
        "editUsernameAllowed": false,
        "bruteForceProtected": true
    }'
    
    local response=$(curl -s -w "%{http_code}" -X POST "$KEYCLOAK_URL/admin/realms" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$realm_config")
    
    local http_code="${response: -3}"
    if [ "$http_code" = "201" ]; then
        echo -e "${GREEN}✅ Realm '$REALM_NAME' created successfully${NC}"
    else
        echo -e "${RED}❌ Failed to create realm. HTTP Code: $http_code${NC}"
        echo "Response: ${response%???}"
        exit 1
    fi
}

# Function to check if client exists
client_exists() {
    local response=$(curl -s "$KEYCLOAK_URL/admin/realms/$REALM_NAME/clients?clientId=$CLIENT_ID" \
        -H "Authorization: Bearer $ACCESS_TOKEN")
    
    local count=$(echo $response | jq length)
    if [ "$count" -gt 0 ]; then
        return 0  # Client exists
    else
        return 1  # Client doesn't exist
    fi
}

# Function to create OAuth client
create_oauth_client() {
    if client_exists; then
        echo -e "${YELLOW}⚠️  OAuth client '$CLIENT_ID' already exists, skipping creation${NC}"
        return 0
    fi
    
    echo -e "${YELLOW}🔧 Creating OAuth client '$CLIENT_ID'...${NC}"
    
    local client_config='{
        "clientId": "'$CLIENT_ID'",
        "name": "Grafana OAuth Client",
        "description": "OAuth client for Grafana integration",
        "enabled": true,
        "clientAuthenticatorType": "client-secret",
        "secret": "'$CLIENT_SECRET'",
        "redirectUris": [
            "'$GRAFANA_URL'/login/generic_oauth",
            "'$GRAFANA_URL'/*"
        ],
        "webOrigins": [
            "'$GRAFANA_URL'"
        ],
        "protocol": "openid-connect",
        "publicClient": false,
        "bearerOnly": false,
        "consentRequired": false,
        "standardFlowEnabled": true,
        "implicitFlowEnabled": false,
        "directAccessGrantsEnabled": true,
        "serviceAccountsEnabled": false,
        "fullScopeAllowed": true,
        "attributes": {
            "saml.assertion.signature": "false",
            "saml.multivalued.roles": "false",
            "saml.force.post.binding": "false",
            "saml.encrypt": "false",
            "saml.server.signature": "false",
            "saml.server.signature.keyinfo.ext": "false",
            "exclude.session.state.from.auth.response": "false",
            "saml_force_name_id_format": "false",
            "saml.client.signature": "false",
            "tls.client.certificate.bound.access.tokens": "false",
            "saml.authnstatement": "false",
            "display.on.consent.screen": "false",
            "saml.onetimeuse.condition": "false",
            "pkce.code.challenge.method": "S256"
        },
        "authenticationFlowBindingOverrides": {},
        "protocolMappers": [
            {
                "name": "email",
                "protocol": "openid-connect",
                "protocolMapper": "oidc-usermodel-property-mapper",
                "consentRequired": false,
                "config": {
                    "userinfo.token.claim": "true",
                    "user.attribute": "email",
                    "id.token.claim": "true",
                    "access.token.claim": "true",
                    "claim.name": "email",
                    "jsonType.label": "String"
                }
            },
            {
                "name": "name",
                "protocol": "openid-connect",
                "protocolMapper": "oidc-usermodel-property-mapper",
                "consentRequired": false,
                "config": {
                    "userinfo.token.claim": "true",
                    "user.attribute": "username",
                    "id.token.claim": "true",
                    "access.token.claim": "true",
                    "claim.name": "name",
                    "jsonType.label": "String"
                }
            },
            {
                "name": "roles",
                "protocol": "openid-connect",
                "protocolMapper": "oidc-usermodel-realm-role-mapper",
                "consentRequired": false,
                "config": {
                    "userinfo.token.claim": "true",
                    "id.token.claim": "true",
                    "access.token.claim": "true",
                    "claim.name": "roles",
                    "jsonType.label": "String",
                    "multivalued": "true"
                }
            }
        ]
    }'
    
    local response=$(curl -s -w "%{http_code}" -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/clients" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$client_config")
    
    local http_code="${response: -3}"
    if [ "$http_code" = "201" ]; then
        echo -e "${GREEN}✅ OAuth client '$CLIENT_ID' created successfully${NC}"
    else
        echo -e "${RED}❌ Failed to create OAuth client. HTTP Code: $http_code${NC}"
        echo "Response: ${response%???}"
        exit 1
    fi
}

# Function to check if role exists
role_exists() {
    local role_name=$1
    local response=$(curl -s -w "%{http_code}" "$KEYCLOAK_URL/admin/realms/$REALM_NAME/roles/$role_name" \
        -H "Authorization: Bearer $ACCESS_TOKEN")
    
    local http_code="${response: -3}"
    if [ "$http_code" = "200" ]; then
        return 0  # Role exists
    else
        return 1  # Role doesn't exist
    fi
}

# Function to create roles
create_roles() {
    echo -e "${YELLOW}👥 Creating realm roles...${NC}"
    
    local roles=("grafanaadmin" "admin" "editor")
    
    for role in "${roles[@]}"; do
        if role_exists "$role"; then
            echo -e "${YELLOW}⚠️  Role '$role' already exists, skipping${NC}"
            continue
        fi
        
        local role_config='{
            "name": "'$role'",
            "description": "Grafana '$role' role",
            "composite": false,
            "clientRole": false
        }'
        
        local response=$(curl -s -w "%{http_code}" -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/roles" \
            -H "Authorization: Bearer $ACCESS_TOKEN" \
            -H "Content-Type: application/json" \
            -d "$role_config")
        
        local http_code="${response: -3}"
        if [ "$http_code" = "201" ]; then
            echo -e "${GREEN}✅ Role '$role' created successfully${NC}"
        else
            echo -e "${RED}❌ Failed to create role '$role'. HTTP Code: $http_code${NC}"
        fi
    done
}

# Function to check if user exists
user_exists() {
    local username=$1
    local response=$(curl -s "$KEYCLOAK_URL/admin/realms/$REALM_NAME/users?username=$username" \
        -H "Authorization: Bearer $ACCESS_TOKEN")
    
    local count=$(echo $response | jq length)
    if [ "$count" -gt 0 ]; then
        return 0  # User exists
    else
        return 1  # User doesn't exist
    fi
}

# Function to create test users
create_test_users() {
    echo -e "${YELLOW}👤 Creating test users...${NC}"
    
    # Admin user
    create_user "grafana-admin" "grafana-admin@example.com" "admin123" "grafanaadmin"
    
    # Editor user
    create_user "grafana-editor" "grafana-editor@example.com" "editor123" "editor"
    
    # Viewer user (no special role, defaults to Viewer in Grafana)
    create_user "grafana-viewer" "grafana-viewer@example.com" "viewer123" ""
}

# Helper function to create a user
create_user() {
    local username=$1
    local email=$2
    local password=$3
    local role=$4
    
    if user_exists "$username"; then
        echo -e "${YELLOW}  ⚠️  User '$username' already exists, skipping${NC}"
        return 0
    fi
    
    echo -e "${YELLOW}  Creating user '$username'...${NC}"
    
    local user_config='{
        "username": "'$username'",
        "email": "'$email'",
        "firstName": "'${username^}'",
        "lastName": "User",
        "enabled": true,
        "emailVerified": true,
        "credentials": [{
            "type": "password",
            "value": "'$password'",
            "temporary": false
        }]
    }'
    
    local response=$(curl -s -w "%{http_code}" -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/users" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$user_config")
    
    local http_code="${response: -3}"
    if [ "$http_code" = "201" ]; then
        echo -e "${GREEN}    ✅ User '$username' created successfully${NC}"
        
        # Assign role if specified
        if [ -n "$role" ]; then
            assign_role_to_user "$username" "$role"
        fi
    else
        echo -e "${RED}    ❌ Failed to create user '$username'. HTTP Code: $http_code${NC}"
    fi
}

# Helper function to assign role to user
assign_role_to_user() {
    local username=$1
    local role_name=$2
    
    echo -e "${YELLOW}    Assigning role '$role_name' to user '$username'...${NC}"
    
    # Get user ID
    local user_response=$(curl -s "$KEYCLOAK_URL/admin/realms/$REALM_NAME/users?username=$username" \
        -H "Authorization: Bearer $ACCESS_TOKEN")
    local user_id=$(echo $user_response | jq -r '.[0].id')
    
    if [ "$user_id" = "null" ] || [ -z "$user_id" ]; then
        echo -e "${RED}    ❌ Could not find user '$username'${NC}"
        return 1
    fi
    
    # Get role
    local role_response=$(curl -s "$KEYCLOAK_URL/admin/realms/$REALM_NAME/roles/$role_name" \
        -H "Authorization: Bearer $ACCESS_TOKEN")
    
    # Assign role
    curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/users/$user_id/role-mappings/realm" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d "[$role_response]" > /dev/null
    
    echo -e "${GREEN}    ✅ Role '$role_name' assigned to user '$username'${NC}"
}

# Function to display setup summary
display_summary() {
    echo ""
    echo -e "${GREEN}🎉 Keycloak Realm Setup Complete!${NC}"
    echo "========================================"
    echo -e "${YELLOW}Realm Configuration:${NC}"
    echo "  • Realm Name: $REALM_NAME"
    echo "  • Realm URL: $KEYCLOAK_URL/realms/$REALM_NAME"
    echo "  • Client ID: $CLIENT_ID"
    echo "  • Client Secret: $CLIENT_SECRET"
    echo ""
    echo -e "${YELLOW}OAuth Endpoints:${NC}"
    echo "  • Auth URL: $KEYCLOAK_URL/realms/$REALM_NAME/protocol/openid-connect/auth"
    echo "  • Token URL: $KEYCLOAK_URL/realms/$REALM_NAME/protocol/openid-connect/token"
    echo "  • UserInfo URL: $KEYCLOAK_URL/realms/$REALM_NAME/protocol/openid-connect/userinfo"
    echo ""
    echo -e "${YELLOW}Test Users Created:${NC}"
    echo "  • grafana-admin / admin123 (GrafanaAdmin role)"
    echo "  • grafana-editor / editor123 (Editor role)"
    echo "  • grafana-viewer / viewer123 (Viewer role)"
    echo ""
    echo -e "${GREEN}✅ Setup completed successfully! Grafana can now use Keycloak OAuth.${NC}"
}

# Main execution
main() {
    wait_for_keycloak
    get_admin_token
    create_realm
    create_oauth_client
    create_roles
    create_test_users
    display_summary
}

# Run the main function
main "$@"