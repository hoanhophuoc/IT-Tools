# IT-Tools

A monolithic full-stack application providing a comprehensive collection of handy tools designed for developers and IT professionals.

This repository unites the **Next.js frontend** and the **ASP.NET Core backend** in a single monolithic repository.

---

## Architecture & Project Structure

```text
IT-Tools/
├── backend/                  # ASP.NET Core Web API (.NET 9)
│   ├── Controllers/          # API Controllers (Auth, Tools, Admin, Favorites, User)
│   ├── Data/                 # EF Core DbContext & Database Configurations
│   ├── Dtos/                 # Request/Response Data Transfer Objects
│   ├── Mappings/             # AutoMapper profiles
│   ├── Models/               # Domain Models (User, Tool, Category, etc.)
│   ├── Properties/           # Launch settings & environment profiles
│   ├── Services/             # Business Logic & Services
│   ├── Utils/                # Utilities & helpers
│   ├── appsettings.json      # Base application configuration
│   ├── appsettings.Development.json # Development configuration & connection string
│   ├── IT-Tools.csproj       # .NET 9 Project file
│   └── IT-Tools.sln          # Solution file
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
│   ├── package.json          # Node dependencies & scripts
│   └── .env.example          # Environment variables template
│
├── .gitignore                # Unified gitignore for .NET and Node.js
└── README.md                 # Project documentation
```

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack), [React 19](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/), [date-fns](https://date-fns.org/), [mathjs](https://mathjs.org/) |
| **Backend** | [ASP.NET Core 9](https://dotnet.microsoft.com/), [Entity Framework Core 9](https://learn.microsoft.com/ef/core/), [PostgreSQL](https://www.postgresql.org/) ([Npgsql](https://www.npgsql.org/efcore/)), [AutoMapper 16](https://automapper.org/), [BCrypt.Net-Next](https://github.com/BcryptNet/bcrypt.net) |
| **Auth** | JWT (JSON Web Tokens) with role-based access control (`User`, `Premium`, `Admin`) |

---

## Prerequisites

- [.NET SDK 9.0](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (v20.x or later) & [npm](https://www.npmjs.com/)
- [PostgreSQL](https://www.postgresql.org/) (local or cloud-hosted instance)

---

## Getting Started

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
   If creating the database tables from scratch, run the SQL script `backend/IT-Tools.sql` or apply migrations:
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

## Hot-Plugging New Tools

IT-Tools supports dynamically registering new tools via React components and database metadata:

1. **Create the React Component:**
   - Add your tool component in `frontend/src/tools/<category>/MyNewTool.jsx`.
   - Ensure the component is a default export and includes `"use client";` if client-side state is required.

2. **Register the Tool in the Backend Database:**
   - Use the Admin panel (`/admin/tools`) or insert directly into the `tool` table:
     - `name`: Human-readable tool name (e.g. `UUID Generator`)
     - `slug`: URL slug (e.g. `uuid-generator`)
     - `description`: Short description of what the tool does
     - `category_id`: Category foreign key
     - `component_url`: Relative path from `src/` (e.g. `tools/generators/UuidGenerator.jsx`)
     - `icon`: Icon filename located in `frontend/public/images/icons/`
     - `is_enabled`: `true`
     - `is_premium`: `false` (or `true` for premium users)

---

## API Endpoints Overview

| Endpoint | Method | Role / Auth | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Public | Register a new account |
| `/api/auth/login` | `POST` | Public | Authenticate user and receive JWT |
| `/api/auth/change-password` | `POST` | Authenticated | Change user password |
| `/api/tools` | `GET` | Public | Retrieve all categorized tools |
| `/api/tools/{slug}` | `GET` | Public | Retrieve tool details by slug |
| `/api/favorites` | `GET`, `POST`, `DELETE` | Authenticated | Manage favorite tools |
| `/api/admin/tools` | `GET`, `POST`, `PUT` | Admin | Manage tools (CRUD) |
| `/api/admin/users` | `GET` | Admin | List registered users |
| `/api/admin/upgrade-requests`| `GET`, `POST` | Admin | Review premium upgrade requests |
| `/api/user/upgrade-requests` | `POST` | Authenticated | Submit request for Premium status |

---

## Scripts & Commands

### Backend (`backend/`)
- `dotnet build` - Build the C# solution
- `dotnet run` - Start the API server
- `dotnet watch run` - Start the API server with hot-reload

### Frontend (`frontend/`)
- `npm run dev` - Start Next.js development server with Turbopack
- `npm run build` - Build production bundle
- `npm run start` - Run production server
- `npm run lint` - Run ESLint checks

---

## License

This project is licensed under the MIT License.
