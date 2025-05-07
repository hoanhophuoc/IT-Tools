# IT-Tools Backend API

## Overview

This project provides the backend API service for the IT-Tools application, a collection of handy tools designed for developers. It handles user authentication, tool management, category organization, user favorites, premium upgrade requests, and serves data to the Next.js frontend.

Built with ASP.NET Core, Entity Framework Core, and PostgreSQL.

## Features

- **Authentication:** User registration, login (JWT-based), password change, "forgot password" (direct reset based on username - **INSECURE, for specific internal use only as designed**).
- **Users & Roles:** Supports Anonymous, User, Premium, and Admin roles.
- **Tools & Categories:**
  - Serves categorized lists of tools.
  - Provides details for individual tools via slugs.
  - Supports Premium/Free tool distinctions.
  - Designed for "hot-plugging" new tools via frontend components (backend stores metadata like `component_url`).
- **Favorites:** Authenticated users can mark/unmark tools as favorites.
- **Premium Requests:** Users can request upgrades to Premium; Admins can manage these requests.
- **Admin Panel:**
  - Manage tools (Create, Read, Update Details, Update Status - Enable/Disable, Premium/Free).
  - Manage users (Read).
  - Manage premium upgrade requests (Read pending, Approve/Reject).
  - Manage categories (CRUD).

## Prerequisites

Before you begin, ensure you have the following installed:

- [.NET SDK](https://dotnet.microsoft.com/download) (.NET 9.0)
- [PostgreSQL](https://www.postgresql.org/download/) (Local installation) - Or access to a PostgreSQL instance (like Aiven Cloud).
- A Code Editor (like [Visual Studio 2022](https://visualstudio.microsoft.com/))
- (Optional) A PostgreSQL GUI tool (like pgAdmin, DBeaver) for database inspection.

## Configuration

Configuration is managed through `appsettings.Development.json`. For sensitive data during development.

1.  **Connection String:**

    - Set up your PostgreSQL database (create a user and database if needed).
    - Configure the Connection String in `appsettings.Development.json`.
    - **Using `appsettings.Development.json`:**
      ```json
      {
        "ConnectionStrings": {
          "DefaultConnection": "Host=localhost;Port=5432;Database=it_tools_db;Username=your_db_user;Password=your_db_password;"
        }
        // ... other settings
      }
      ```
      _(Replace placeholders with your actual local DB credentials)_

2.  **JWT Settings:**

    - Configure JWT settings for token generation and validation.
    - **Using `appsettings.Development.json`:**
      ```json
      {
        // ... ConnectionStrings ...
        "JwtSettings": {
          "Secret": "!!!REPLACE_THIS_WITH_A_VERY_STRONG_AND_LONG_SECRET_KEY!!!", // !!!REPLACE WITH A VERY STRONG AND LONG SECRET KEY!!!
          "ExpiryMinutes": 60,
          "Issuer": "IT-Tools.Api",
          "Audience": "IT-Tools.Api"
        }
        // ... AppSettings ...
      }
      ```

3.  **App Settings:**
    - Configure the base URL for the frontend application.
    - **Using `appsettings.Development.json`:**
      ```json
      {
        // ... ConnectionStrings, JwtSettings ...
        "AppSettings": {
          "FrontendBaseUrl": "http://localhost:3000"
        }
      }
      ```

## Database Setup (EF Core Migrations)

This project uses Entity Framework Core migrations to manage the database schema.

1.  **Ensure Configuration:** Make sure your `ConnectionStrings:DefaultConnection` is correctly set (in `appsettings.Development.json` or User Secrets) pointing to your development database.
2.  **Apply Migrations:** Open a terminal in the project directory (`Backend/IT-Tools`) and run:
    ```bash
    dotnet ef database update
    ```
    This command will create the database if it doesn't exist and apply all pending migrations to create/update the necessary tables and constraints.

## Running the Application (Development Environment)

1.  **Navigate to the project directory:** `cd Backend/IT-Tools`
2.  **Run the application:**
    ```bash
    dotnet run
    ```
    _(Or use `dotnet watch run` for automatic restarts on code changes)_
3.  The API will typically start listening on URLs specified in `Properties/launchSettings.json` (e.g., `http://localhost:5145` or `https://localhost:7119`). Check the terminal output for the exact URLs.

## API Endpoints Overview

The API provides endpoints for various resources. Use the Swagger UI (`/swagger`) for detailed information, request/response models, and testing. Key areas include:

- **`/api/auth/`**: Registration, Login, Password Change, Forgot Password.
- **`/api/tools/`**: Getting categorized tools (public), getting specific tool details by slug (public).
- **`/api/favorites/`**: Getting user favorites, adding/removing favorites (Requires Authentication).
- **`/api/admin/tools/`**: CRUD operations for tools (Requires Admin Role).
- **`/api/admin/users/`**: Listing users (Requires Admin Role).
- **`/api/admin/upgrade-requests/`**: Managing premium upgrade requests (Requires Admin Role).
- **`/api/admin/categories/`**: Fetching categories for admin forms (Requires Admin Role).
- **`/api/user/upgrade-requests/`**: Endpoint for users to submit upgrade requests (Requires Authentication).

## Technology Stack

- **Framework:** ASP.NET Core 9
- **ORM:** Entity Framework Core 9
- **Database:** PostgreSQL
- **Database Provider:** Npgsql.EntityFrameworkCore.PostgreSQL
- **Authentication:** JWT Bearer Tokens
- **Password Hashing:** BCrypt.Net-Next
- **Mapping:** AutoMapper
