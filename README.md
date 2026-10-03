# IT-Tools

A monolithic full-stack application providing a comprehensive collection of handy tools designed for developers and IT professionals.

This repository unites the **Next.js frontend** and the **ASP.NET Core backend** in a single monolithic repository with full **Docker Compose** support.

---

## Quick Start with Docker Compose (One-Command Launch)

Run the entire stack (PostgreSQL database, backend API, and frontend) with a single command:

```bash
docker compose up --build -d
```

### Services & URLs

| Service | Port | URL | Description |
| :--- | :--- | :--- | :--- |
| **Frontend** | `3000` | [http://localhost:3000](http://localhost:3000) | Next.js 16 Web Application |
| **Backend API** | `5145` | [http://localhost:5145/api](http://localhost:5145/api) | ASP.NET Core 10 Web API |
| **Swagger UI** | `5145` | [http://localhost:5145/swagger](http://localhost:5145/swagger) | Interactive API Documentation |
| **Database** | `5432` | `localhost:5432` | PostgreSQL 18 (auto-initialized with schema) |

### Default Admin Account

| Username | Password | Role |
| :--- | :--- | :--- |
| `admin` | `AdminPassword123!` | `Admin` |

To stop all containers:
```bash
docker compose down
```

To stop and remove data volumes:
```bash
docker compose down -v
```

---

## Architecture & Project Structure

```text
IT-Tools/
├── backend/                  # ASP.NET Core Web API (.NET 10)
│   ├── Controllers/          # API Controllers (Auth, Tools, Admin, Favorites, User)
│   ├── Data/                 # EF Core DbContext & Database Configurations
│   ├── Dtos/                 # Request/Response Data Transfer Objects
│   ├── Models/               # Domain Models (User, Tool, Category, etc.)
│   ├── Properties/           # Launch settings & environment profiles
│   ├── Services/             # Business Logic & Services (JwtService)
│   ├── Utils/                # Utilities & helpers (Security, SlugHelper)
│   ├── Dockerfile            # Multi-stage Docker build (.NET 10 SDK & Runtime)
│   ├── appsettings.json      # Base application configuration
│   ├── appsettings.Development.json # Development configuration & connection string
│   ├── IT-Tools.csproj       # .NET 10 Project file
│   ├── IT-Tools.sln          # Solution file
│   └── IT-Tools.sql          # PostgreSQL schema script (auto-mounted in Docker)
│
├── frontend/                 # Next.js 16 (React 19, Tailwind CSS 4)
│   ├── public/               # Static assets & icons
│   ├── src/
│   │   ├── app/              # Next.js App Router (pages & layouts)
│   │   ├── components/       # Shared UI and Layout components
│   │   ├── contexts/         # Authentication & app state contexts
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # API client and utility libraries
│   │   └── tools/            # Modular developer tools (hot-pluggable)
│   ├── Dockerfile            # Multi-stage Docker build (Node 24 Alpine)
│   ├── package.json          # Node dependencies & scripts
│   └── .env.example          # Environment variables template
│
├── samples/                  # Pre-configured tool JSON files for hot-plug import
├── docker-compose.yml        # Orchestrates db, backend, and frontend
├── .gitignore                # Unified gitignore for .NET and Node.js
└── README.md                 # Project documentation
```

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack), [React 19](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/), [mathjs](https://mathjs.org/), [libphonenumber-js](https://gitlab.com/catamphetamine/libphonenumber-js), [ibantools](https://github.com/arhs/ibantools) |
| **Backend** | [ASP.NET Core 10](https://dotnet.microsoft.com/), [Entity Framework Core 10](https://learn.microsoft.com/ef/core/) (Native LINQ projections), [PostgreSQL 18](https://www.postgresql.org/) ([Npgsql](https://www.npgsql.org/efcore/)), [BCrypt.Net-Next](https://github.com/BcryptNet/bcrypt.net) |
| **Auth** | JWT (JSON Web Tokens) with role-based access control (`User`, `Premium`, `Admin`) |
| **DevOps** | [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/) |

---

## Local Development (Without Docker)

### Prerequisites

- [.NET SDK 10.0](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (v24.x or later) & [npm](https://www.npmjs.com/)
- [PostgreSQL](https://www.postgresql.org/) (local or cloud-hosted instance)

### 1. Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Configure Database Connection & JWT:**
   Open `backend/appsettings.Development.json` and adjust your connection string and JWT secret if necessary:
   ```json
   {
     "ConnectionStrings": {
       "PostgreSQLContext": "Host=localhost;Database=it_tools_db;Username=postgres;Password=your_password;Port=5432;"
     },
     "JwtSettings": {
       "Secret": "your-super-secret-jwt-key-minimum-512-bits-for-security",
       "ExpiryMinutes": 3600,
       "Issuer": "IT-Tools.Api",
       "Audience": "IT-Tools.Api"
     },
     "AppSettings": {
       "FrontendBaseUrl": "http://localhost:3000"
     }
   }
   ```

3. **Initialize Database (Optional / Schema Setup):**
   Execute `backend/IT-Tools.sql` or apply migrations:
   ```bash
   dotnet ef database update
   ```

4. **Run the Backend:**
   ```bash
   dotnet run
   ```
   The backend API starts on:
   - HTTP: `http://localhost:5145`
   - HTTPS: `https://localhost:7119`
   - Swagger / OpenAPI Documentation: `http://localhost:5145/swagger` (or `https://localhost:7119/swagger`)

---

### 2. Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   Create `.env.local` or `.env` from `.env.example`:
   ```bash
   cp .env.example .env.local
   ```
   Set `NEXT_PUBLIC_API_URL` to your running backend API URL:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5145/api
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### 3. Running Both from the Root Directory

You can run both services concurrently from the repository root in separate terminals:

**Terminal 1 (Backend):**
```bash
dotnet run --project backend/IT-Tools.csproj
```

**Terminal 2 (Frontend):**
```bash
npm --prefix frontend run dev
```

---

## Hot-Plugging New Tools (Cấp độ 1: Hot Plug & Instant Recognition)

IT-Tools is designed to satisfy **Level 1 Hot-Plugging**:
> **Cấp độ 1:** Không cần biên dịch lại mã nguồn của hệ thống đang vận hành, công cụ mới sẽ được gắn nóng vào hệ thống (hot plug), hệ thống tự nhận dạng các thay đổi này ngay lập tức.

### How it works:
1. **Component Architecture:**
   - Tools are implemented as modular React components in `frontend/src/tools/<category>/<ToolName>.jsx`.
   - Next.js dynamic routing (`src/app/tools/[toolSlug]/page.jsx`) dynamically resolves tool components on-demand at runtime (`import("@/tools/" + path)`).
   - Icons are placed in `frontend/public/images/icons/<icon-name>.svg`.

2. **Zero-Recompilation Tool Registration:**
   - When a tool is added to the system via the **Admin Portal** or **JSON Import**, it is immediately registered in the PostgreSQL database.
   - The frontend automatically recognizes the change:
     - The Sidebar navigation and Home page catalog query `GET /api/tools` on render and display the newly added tool immediately.
     - Navigating to `/tools/<slug>` dynamically mounts the tool's component.
     - Disabling or deleting a tool in the Admin panel takes effect immediately across all users without restarting containers or rebuilding any code.

### Importing Tools via JSON (Admin Feature):
Admins can batch-register or single-register tools using JSON files:
1. Log in with an Admin account (default: `admin` / `AdminPassword123!`).
2. Go to **Admin** -> **Tools** (`http://localhost:3000/admin/tools`).
3. Click the **"📥 Import JSON"** button to upload a single tool or an array of tools.
4. Alternatively, click **"+ Add New Tool"** and click **"📁 Load JSON File"** to pre-fill the form fields for manual review before saving.

#### Ready-to-Test Sample JSON Files:
Sample files are provided in the [`samples/`](samples/) directory:
- [`samples/uuid-generator.json`](samples/uuid-generator.json) — **UUID Generator** (Development)
- [`samples/base64-string-converter.json`](samples/base64-string-converter.json) — **Base64 String Converter** (Converter)
- [`samples/jwt-parser.json`](samples/jwt-parser.json) — **JWT Parser** (Crypto)
- [`samples/all-new-tools.json`](samples/all-new-tools.json) — Batch import for all 3 tools in one click.

#### JSON Schema Format:
```json
{
  "name": "UUID Generator",
  "description": "Generate UUIDs / GUIDs version 1 and 4 in uppercase, lowercase, with or without hyphens.",
  "categoryName": "Development",
  "componentUrl": "tools/development/UuidGenerator.jsx",
  "icon": "uuid-generator.svg",
  "isPremium": false,
  "isEnabled": true
}
```
Or as an array for batch import:
```json
[
  { "name": "Tool A", ... },
  { "name": "Tool B", ... }
]
```

---

## API Endpoints Overview

| Endpoint | Method | Role / Auth | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Public | Register a new account |
| `/api/auth/login` | `POST` | Public | Authenticate user and receive JWT |
| `/api/auth/change-password` | `POST` | Authenticated | Change user password |
| `/api/auth/forgot-password` | `POST` | Public | Request password reset |
| `/api/tools` | `GET` | Public | Retrieve all categorized tools |
| `/api/tools/{slug}` | `GET` | Public | Retrieve tool details by slug |
| `/api/favorites` | `GET` | Authenticated | List favorite tools |
| `/api/favorites/{toolId}` | `POST`, `DELETE` | Authenticated | Add or remove tool from favorites |
| `/api/admin/tools` | `GET`, `POST` | Admin | List or create tools |
| `/api/admin/tools/{id}` | `PUT`, `DELETE` | Admin | Update or delete existing tool |
| `/api/admin/categories` | `GET` | Admin | List all tool categories |
| `/api/admin/upgrade-requests` | `GET` | Admin | Review premium upgrade requests |
| `/api/admin/upgrade-requests/{requestId}/status` | `PUT` | Admin | Update status of upgrade request |
| `/api/admin/users` | `GET` | Admin | List registered users |
| `/api/user/upgrade-requests` | `POST` | Authenticated | Submit request for Premium status |

---

## Scripts & Commands

### Docker Compose
- `docker compose up --build -d` - Build and start all services in the background
- `docker compose logs -f` - Follow container logs
- `docker compose ps` - Check running container statuses
- `docker compose down` - Stop and remove all containers

### Backend (`backend/`)
- `dotnet build` - Build the C# solution (.NET 10)
- `dotnet run` - Start the API server
- `dotnet watch run` - Start the API server with hot-reload

### Frontend (`frontend/`)
- `npm run dev` - Start Next.js development server with Turbopack
- `npm run build` - Build production bundle and validate pages
- `npm run start` - Run production server
- `npm run doctor` - Run React Doctor diagnostics

---

## License

This project is licensed under the MIT License.
