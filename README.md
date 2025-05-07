## Prerequisites

- [Node.js](https://nodejs.org/) (v22.13.0 or later recommended)
- [npm](https://www.npmjs.com/)

## Getting Started

1.  **Install dependencies:**

    ```bash
    npm install
    ```

2.  **Configure environment variables:**

    - In the `.env` file in the project root.
    - Add the base URL of your running backend API:
      ```
      NEXT_PUBLIC_API_URL=http://localhost:5145/api
      ```
      _(Replace `http://localhost:5145` with the actual URL and port your backend is listening on)_

3.  **Run the development server:**

    ```bash
    npm run dev
    ```

4.  **Open the application:** Open [http://localhost:3000](http://localhost:3000) (or the specified port) in your browser.

## Adding New Tools (Hot Plugging)

1.  **Create the tool component:**
    - Create a new React component file (e.g., `MyNewLabelGenerator.jsx`) in an appropriate subdirectory (e.g., `src/tools/generators/MyNewLabelGenerator.jsx`).
    - The component must be a **default export**.
    - Add `"use client";` if the component needs to use state, effects, or browser APIs.
    - Implement the UI and logic for the tool within this component.
2.  **Add to the backend database:**
    - Use the admin interface to add a new record to the `tool` table in the PostgreSQL database.
    - Provide the necessary information:
      - `Tool Name`: e.g., "New Label Generator"
      - `Description`: A brief description.
      - `Component Url`: **Important**, set this value to the _exact path_ from `src/` where you saved the component file (e.g., `tools/generators/MyNewLabelGenerator.jsx`).
      - `Category`: Choose one of the existing categories (e.g., `Converter`).
      - `Icon Filename`: The name of the icon file (e.g., `label-icon.svg`) located in `public/images/icons/`.
      - `Premium Tool?`, `Enabled?`: Set as needed.

## Available Scripts

- `dev`: Runs the app in development mode.
- `build`: Builds the app for production.
- `start`: Starts the production server.
- `lint`: Runs the linter (ESLint).
