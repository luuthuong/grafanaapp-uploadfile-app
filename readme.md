# Grafana File Upload Application

A comprehensive file management system built with Grafana plugin architecture and ASP.NET Core API backend, featuring authentication, file upload capabilities, and PostgreSQL integration.

## 🏗️ Architecture

This project consists of two main components:

### Frontend - Grafana Plugin (`grafanaapp-uploadfile-app/`)

- **Framework**: React + TypeScript
- **UI Library**: Grafana UI components
- **Authentication**: Keycloak integration
- **Features**: File upload, metadata management, role-based access control

### Backend - ASP.NET Core API (`api/`)

- **Framework**: .NET Core Web API
- **Database**: PostgreSQL with Entity Framework
- **Authentication**: JWT Bearer tokens (Keycloak)
- **Storage**: Local file system with metadata tracking

## 🚀 Features

### File Management

- **Upload Files**: Drag-and-drop interface with progress tracking
- **Metadata Support**: Add titles, tags, and descriptions to files
- **File Listing**: View uploaded files with sorting and filtering
- **Download/Delete**: Manage existing files (role-based permissions)

### Authentication & Authorization

- **Keycloak Integration**: Single sign-on authentication
- **Role-Based Access**: Different permissions for Viewer, Editor, and Admin roles
- **JWT Security**: Secure API endpoints with token validation

### Infrastructure

- **Docker Compose**: Complete development environment
- **PostgreSQL**: Reliable database with migration support
- **Health Checks**: API health monitoring endpoints

## 📦 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ and pnpm (for development)
- .NET 8 SDK (for API development)

### Development Setup

1. **Clone the repository**

    ```bash
    git clone <repository-url>
    cd sample-grafanaapp
    ```

2. **Start the infrastructure**

    ```bash
    cd grafanaapp-uploadfile-app
    docker compose up --build
    ```

3. **Install frontend dependencies**

    ```bash
    cd grafanaapp-uploadfile-app
    pnpm install
    ```

4. **Run the Grafana plugin in development mode**

    ```bash
    pnpm dev
    ```

5. **Start the API (separate terminal)**

    ```bash
    cd api
    dotnet run
    ```

### Access Points

- **Grafana**: <http://localhost:3000>
- **Keycloak Admin**: <http://localhost:8080> (admin/admin123)
- **API**: <http://localhost:5000>
- **PostgreSQL**: localhost:5432 (keycloak/keycloak123)

## 🔧 Configuration

### Database Configuration

Update connection strings in:

- `api/appsettings.json` - Production settings
- `api/appsettings.Development.json` - Development settings

### Authentication Setup

Configure Keycloak realm and client settings:

- See `KEYCLOAK_SETUP.md` for detailed setup instructions
- Update JWT authority in `api/Program.cs`

### Frontend Configuration

Update API endpoints in:

- `grafanaapp-uploadfile-app/src/components/FileManagement/file.api.ts`

## 📁 Project Structure

```text
├── api/                          # ASP.NET Core Web API
│   ├── Controllers/              # API Controllers
│   ├── Models/                   # Data Models
│   ├── Data/                     # Entity Framework DbContext
│   ├── Migrations/               # Database Migrations
│   └── UploadedFiles/            # File Storage Directory
│
├── grafanaapp-uploadfile-app/    # Grafana Plugin
│   ├── src/
│   │   ├── components/           # React Components
│   │   ├── pages/                # Plugin Pages
│   │   └── hooks/                # Custom React Hooks
│   ├── provisioning/             # Grafana Provisioning
│   └── docker-compose.yaml      # Development Environment
│
└── README.md                     # Project Documentation
```

## 🛠️ Development

### Frontend Development

```bash
# Install dependencies
pnpm install

# Development mode with hot reload
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test

# Linting
pnpm lint
```

### Backend Development

```bash
# Run API in development mode
dotnet run

# Add new migration
dotnet ef migrations add MigrationName

# Update database
dotnet ef database update

# Run tests (if available)
dotnet test
```

### Database Migrations

The project uses Entity Framework Core migrations:

- Migrations are automatically applied on startup
- New migrations can be added with `dotnet ef migrations add`

## 🐳 Docker Support

Complete containerized environment with:

- PostgreSQL database
- Keycloak authentication server
- Automated database initialization
- Volume persistence for data

## 📊 Monitoring

- Health check endpoints available at `/health`
- Application logging and error tracking
- Database connection monitoring
