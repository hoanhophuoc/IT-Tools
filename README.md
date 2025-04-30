# IT-Tools Backend API

## Overview

This project provides the backend API service for the IT-Tools application, a collection of handy tools designed for developers. It handles user authentication, tool management, category organization, user favorites, premium upgrade requests, and serves data to the Next.js frontend.

Built with ASP.NET Core, Entity Framework Core, and PostgreSQL.

## Features

*   **Authentication:** User registration, login (JWT-based), password change, "forgot password" (direct reset based on username - **INSECURE, for specific internal use only as designed**).
*   **Users & Roles:** Supports Anonymous, User, Premium, and Admin roles.
*   **Tools & Categories:**
    *   Serves categorized lists of tools.
    *   Provides details for individual tools via slugs.
    *   Supports Premium/Free tool distinctions.
    *   Designed for "hot-plugging" new tools via frontend components (backend stores metadata like `component_url`).
*   **Favorites:** Authenticated users can mark/unmark tools as favorites.
*   **Premium Requests:** Users can request upgrades to Premium; Admins can manage these requests.
*   **Admin Panel:**
    *   Manage tools (Create, Read, Update Details, Update Status - Enable/Disable, Premium/Free).
    *   Manage users (Read).
    *   Manage premium upgrade requests (Read pending, Approve/Reject).
    *   Manage categories (CRUD).

## Prerequisites

Before you begin, ensure you have the following installed:

*   [.NET SDK](https://dotnet.microsoft.com/download) (.NET 8.0 or later recommended)
*   [PostgreSQL](https://www.postgresql.org/download/) (Local installation recommended for development) - Or access to a PostgreSQL instance (like Aiven Cloud).
*   A Code Editor (like [Visual Studio Code](https://code.visualstudio.com/) or Visual Studio)
*   (Optional) [Git](https://git-scm.com/) for version control.
*   (Optional) A PostgreSQL GUI tool (like pgAdmin, DBeaver) for database inspection.

## Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <your-repository-directory>/Backend/IT-Tools # Navigate to the API project directory
    ```

2.  **Restore Dependencies:**
    ```bash
    dotnet restore
    ```

## Configuration

Configuration is primarily managed through `appsettings.json` and environment-specific overrides like `appsettings.Development.json`. For sensitive data during development, **.NET User Secrets** is highly recommended.

1.  **Connection String:**
    *   Set up your PostgreSQL database (create a user and database if needed).
    *   Configure the connection string in `appsettings.Development.json` or User Secrets.
    *   **Using `appsettings.Development.json`:**
        ```json
        {
          "ConnectionStrings": {
            "DefaultConnection": "Host=localhost;Port=5432;Database=it_tools_db;Username=your_db_user;Password=your_db_password;"
          },
          // ... other settings
        }
        ```
        *(Replace placeholders with your actual local DB credentials)*
    *   **Using User Secrets (Recommended for sensitive data):**
        *   Navigate to the project directory (`cd Backend/IT-Tools`) in your terminal.
        *   Initialize user secrets (if not already done): `dotnet user-secrets init`
        *   Set the connection string secret:
            ```bash
            dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=it_tools_db;Username=your_db_user;Password=your_db_password;"
            ```

2.  **JWT Settings:**
    *   Configure JWT settings for token generation and validation.
    *   **Using `appsettings.Development.json`:**
        ```json
        {
          // ... ConnectionStrings ...
          "JwtSettings": {
            "Secret": "!!!REPLACE_THIS_WITH_A_VERY_STRONG_AND_LONG_SECRET_KEY!!!",
            "ExpiryMinutes": 60,
            "Issuer": "IT-Tools.Api",
            "Audience": "IT-Tools.Api"
          },
           // ... AppSettings ...
        }
        ```
    *   **Using User Secrets (Recommended for `Secret`):**
        ```bash
        dotnet user-secrets set "JwtSettings:Secret" "!!!REPLACE_THIS_WITH_A_VERY_STRONG_AND_LONG_SECRET_KEY!!!"
        dotnet user-secrets set "JwtSettings:Issuer" "IT-Tools.Api"
        dotnet user-secrets set "JwtSettings:Audience" "IT-Tools.Api"
        dotnet user-secrets set "JwtSettings:ExpiryMinutes" "60"
        ```
    *   **IMPORTANT:** Generate a strong, random, long string for `JwtSettings:Secret`. **Never commit your actual secret key to version control.**

3.  **App Settings:**
    *   Configure the base URL for your frontend application (used for password reset links, if implementing the secure version later).
    *   **Using `appsettings.Development.json`:**
        ```json
        {
           // ... ConnectionStrings, JwtSettings ...
          "AppSettings": {
              "FrontendBaseUrl": "http://localhost:3000"
          }
        }
        ```
    *   **Using User Secrets:**
        ```bash
        dotnet user-secrets set "AppSettings:FrontendBaseUrl" "http://localhost:3000"
        ```

## Database Setup (EF Core Migrations)

This project uses Entity Framework Core migrations to manage the database schema.

1.  **Ensure Configuration:** Make sure your `ConnectionStrings:DefaultConnection` is correctly set (in `appsettings.Development.json` or User Secrets) pointing to your development database.
2.  **Apply Migrations:** Open a terminal in the project directory (`Backend/IT-Tools`) and run:
    ```bash
    dotnet ef database update
    ```
    This command will create the database if it doesn't exist and apply all pending migrations to create/update the necessary tables and constraints.

## Running the Application (Development)

1.  **Navigate to the project directory:** `cd Backend/IT-Tools`
2.  **Run the application:**
    ```bash
    dotnet run
    ```
    *(Or use `dotnet watch run` for automatic restarts on code changes)*
3.  The API will typically start listening on URLs specified in `Properties/launchSettings.json` (e.g., `http://localhost:5145` or `https://localhost:7119`). Check the terminal output for the exact URLs.

## API Endpoints Overview

The API provides endpoints for various resources. Use the Swagger UI (`/swagger`) for detailed information, request/response models, and testing. Key areas include:

*   **`/api/auth/`**: Registration, Login, Password Change, Forgot Password.
*   **`/api/tools/`**: Getting categorized tools (public), getting specific tool details by slug (public).
*   **`/api/favorites/`**: Getting user favorites, adding/removing favorites (Requires Authentication).
*   **`/api/admin/tools/`**: CRUD operations for tools (Requires Admin Role).
*   **`/api/admin/users/`**: Listing users (Requires Admin Role).
*   **`/api/admin/upgrade-requests/`**: Managing premium upgrade requests (Requires Admin Role).
*   **`/api/admin/categories/`**: Fetching categories for admin forms (Requires Admin Role).
*   **`/api/user/upgrade-requests/`**: Endpoint for users to submit upgrade requests (Requires Authentication).

## Technology Stack

*   **Framework:** ASP.NET Core 8 (or your specific version)
*   **ORM:** Entity Framework Core 8 (or your specific version)
*   **Database:** PostgreSQL
*   **Database Provider:** Npgsql.EntityFrameworkCore.PostgreSQL
*   **Authentication:** JWT Bearer Tokens
*   **Password Hashing:** BCrypt.Net-Next
*   **Mapping:** AutoMapper