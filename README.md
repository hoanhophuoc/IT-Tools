## Prerequisites

- [Node.js](https://nodejs.org/) (v22.13.0 or later recommended)
- [npm](https://www.npmjs.com/), [yarn](https://yarnpkg.com/), or [pnpm](https://pnpm.io/) package manager
- A running instance of the [IT-Tools Backend API](#) (link to your backend repo/docs if available)

## Getting Started

1.  **Clone the repository:**

    ```bash
    git clone <your-frontend-repository-url>
    cd <your-frontend-repository-directory>
    ```

2.  **Install Dependencies:**

    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Configure Environment Variables:**

    - Create a file named `.env` in the project root.
    - Add the base URL of your running backend API:
      ```
      NEXT_PUBLIC_API_URL=http://localhost:5145/api
      ```
      _(Replace `http://localhost:5145` with the actual URL and port your backend is listening on)_

4.  **Run the Development Server:**

    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```

5.  **Open the Application:** Open [http://localhost:3000](http://localhost:3000) (or the specified port) in your browser.

## Adding New Tools (Hot Plugging)

1.  **Create the Tool Component:**
    - Create a new React component file (e.g., `MyNewLabelGenerator.jsx`) inside the `src/tools/` directory, preferably under a relevant category subfolder (e.g., `src/tools/generators/MyNewLabelGenerator.jsx`).
    - The component should be a **default export**.
    - Mark it with `"use client";` if it requires state, effects, or browser APIs.
    - Implement the tool's UI and logic within this component.
2.  **Add to Backend Database:**
    - Use the Admin panel (or direct database access) to add a new entry to the `tool` table in your PostgreSQL database.
    - Provide the necessary details:
      - `name`: e.g., "New Label Generator"
      - `description`: A brief description.
      - `category_id`: The ID of the category it belongs to.
      - `component_url`: **Crucially**, set this to the _exact relative path_ from `src/` where you saved the component file (e.g., `tools/generators/MyNewLabelGenerator.jsx`).
      - `slug`: A unique, URL-friendly slug (e.g., `new-label-generator`). The backend should ideally generate this from the name.
      - `icon`: The filename of the icon (e.g., `label-icon.png`) located in `public/images/icons/`.
      - `isPremium`, `isEnabled`: Set as needed.
3.  **Restart/Refresh (Usually Not Needed):**
    - **No frontend rebuild/restart is required.**
    - The next time the Home page or Sidebar fetches data from the backend (`apiGetCategorizedTools`), the new tool will be included in the list.
    - Navigating to `/tools/new-label-generator` (using the slug) will trigger the dynamic tool page (`[toolSlug]/page.jsx`), which will fetch the tool's details (including the `component_url`) and dynamically import (`@/tools/generators/MyNewLabelGenerator`) and render your new component.

## Available Scripts

- `dev`: Runs the app in development mode.
- `build`: Builds the app for production.
- `start`: Starts the production server.
- `lint`: Runs the linter (ESLint).
