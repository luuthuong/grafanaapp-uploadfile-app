# Keycloak Setup Guide for Grafana OAuth Integration

This guide will help you set up Keycloak with a Grafana realm for OAuth authentication.

## Automatic Setup (Recommended)

The easiest way is to use the integrated Docker setup that automatically configures Keycloak:

### Quick Start

1. **Start all services (includes automatic Keycloak setup):**
   ```bash
   docker-compose up -d
   ```

2. **Wait for setup completion** (this may take a few minutes on first startup)
   - Watch the logs: `docker-compose logs -f keycloak-setup`
   - The setup is complete when you see "✅ Setup completed successfully!"

3. **Test the integration:**
   - Navigate to http://localhost:3000
   - You should see a "Sign in with Keycloak" button
   - Use one of the test users created automatically

## Manual Setup (Alternative)

If you prefer to run the setup manually or need to troubleshoot:

### Prerequisites

Make sure you have the following installed:
- `jq` - JSON processor
- `curl` - Command line tool for HTTP requests

Install them if needed:
```bash
sudo apt-get update
sudo apt-get install jq curl
```

### Manual Steps

1. **Start Keycloak first:**
   ```bash
   docker-compose up -d postgres keycloak
   ```

2. **Wait for Keycloak to be ready** (this may take a few minutes on first startup)

3. **Run the setup script:**
   ```bash
   ./setup-keycloak-realm.sh
   ```

4. **Start Grafana:**
   ```bash
   docker-compose up -d grafana
   ```

## What the Setup Does

The Keycloak setup (either automatic via Docker or manual script) automatically:

1. **Creates a Keycloak realm** called `grafana`
2. **Sets up OAuth client** with:
   - Client ID: `grafana`
   - Client Secret: `grafana-secret`
   - Proper redirect URIs for Grafana
   - PKCE support enabled
3. **Creates realm roles:**
   - `grafanaadmin` - Maps to GrafanaAdmin in Grafana
   - `admin` - Maps to Admin in Grafana  
   - `editor` - Maps to Editor in Grafana
4. **Creates test users:**
   - `grafana-admin` / `admin123` (GrafanaAdmin role)
   - `grafana-editor` / `editor123` (Editor role)
   - `grafana-viewer` / `viewer123` (Viewer role - no special Keycloak role)

## Docker Integration Details

The docker-compose.yaml now includes a `keycloak-setup` service that:

- **Runs automatically** when you start the stack with `docker-compose up`
- **Uses curlimages/curl image** with jq and bash installed
- **Mounts the setup script** (`setup-keycloak-realm-docker.sh`) as read-only
- **Runs once and exits** (restart: "no") after completing the setup
- **Uses Docker networking** to communicate with Keycloak via service names
- **Includes idempotency** - safe to run multiple times, skips existing resources

The setup service runs before Grafana starts, ensuring the realm is ready for OAuth integration.

## Configuration Details

The script matches your docker-compose.yaml configuration:

- **Keycloak URL:** http://localhost:8080
- **Grafana URL:** http://localhost:3000
- **Admin credentials:** admin/admin123
- **OAuth endpoints:** Properly configured for the `grafana` realm
- **Role mapping:** Uses the exact role mapping expression from your Grafana config

## Manual Configuration (Alternative)

If you prefer to set up manually:

1. Access Keycloak Admin Console: http://localhost:8080
2. Login with admin/admin123
3. Create a new realm called `grafana`
4. Create a client with ID `grafana` and secret `grafana-secret`
5. Configure redirect URIs: `http://localhost:3000/login/generic_oauth`
6. Create roles: `grafanaadmin`, `admin`, `editor`
7. Create users and assign appropriate roles

## Troubleshooting

### Keycloak not ready
If you get connection errors, wait longer for Keycloak to start completely. The first startup takes time as it initializes the database.

### Permission denied on script
Make sure the script is executable:
```bash
chmod +x setup-keycloak-realm.sh
```

### jq or curl not found
Install the required dependencies:
```bash
sudo apt-get install jq curl
```

### OAuth login not working
1. Check that both Keycloak and Grafana are running
2. Verify the redirect URIs are correct in the Keycloak client settings
3. Check Grafana logs for OAuth-related errors: `docker-compose logs grafana`

## Security Notes

⚠️ **Important:** This setup is for development only!

- Default admin passwords are used (change in production)
- HTTP is used instead of HTTPS (use HTTPS in production)
- Simplified configuration for ease of use (add proper security in production)

For production deployment:
- Use strong, unique passwords
- Enable HTTPS/TLS
- Configure proper CORS and security headers
- Review and harden Keycloak settings
- Use environment variables for secrets

## Testing the Integration

After setup, you can test with these users:

| Username | Password | Grafana Role |
|----------|----------|--------------|
| grafana-admin | admin123 | GrafanaAdmin |
| grafana-editor | editor123 | Editor |
| grafana-viewer | viewer123 | Viewer |

1. Go to http://localhost:3000
2. Click "Sign in with Keycloak"
3. Login with any test user
4. Verify you're logged into Grafana with the correct role