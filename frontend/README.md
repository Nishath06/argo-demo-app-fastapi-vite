# TaskFlow React 19 Frontend

Production-ready modern Single Page Application (SPA) built with React 19, Vite, React Router DOM, Axios, and Tailwind CSS. Packaged using a multi-stage Dockerfile with Node 22 Alpine and Nginx Alpine.

## Features

- **React 19 & Vite**: Ultra-fast build times, HMR, and modern React 19 architecture.
- **Tailwind CSS**: Sleek dark-mode aesthetic with custom glassmorphic styling and responsive layouts.
- **Context API Authentication**: Complete session management with automatic JWT token attachment in Axios requests and 401 handling.
- **Task Management**:
  - Task creation and edit modals.
  - Quick completion toggles with optimistic UI updates.
  - Delete confirmations with safe dialogs.
  - Search and status filtering (Pending, In Progress, Completed).
  - Metric summary cards (Total, In Progress, Completed, Pending).
- **SPA Routing**: React Router DOM with guarded protected routes and custom 404 page.
- **Production Nginx Image**: Multi-stage build serving optimized static files with gzip compression and `try_files $uri /index.html;`.

## Project Structure

```
frontend/
├── public/
│   └── favicon.svg          # Application icon
├── src/
│   ├── api/
│   │   └── axios.js         # Configured Axios instance with JWT interceptor
│   ├── assets/              # Static assets and icons
│   ├── components/
│   │   ├── ConfirmModal.jsx # Delete confirmation modal
│   │   ├── Navbar.jsx       # Header bar with user profile and task creation trigger
│   │   ├── ProtectedRoute.jsx # Route auth guard
│   │   ├── StatCard.jsx     # Overview metric cards
│   │   ├── TaskCard.jsx     # Task card with status toggle and action buttons
│   │   ├── TaskFilter.jsx   # Status tabs and search input
│   │   └── TaskModal.jsx    # Form modal for creating/editing tasks
│   ├── context/
│   │   └── AuthContext.jsx  # React Context API for authentication state
│   ├── hooks/
│   │   └── useAuth.js       # Custom authentication hook
│   ├── layouts/
│   │   └── MainLayout.jsx   # Common application shell layout
│   ├── pages/
│   │   ├── Dashboard.jsx    # Main task management dashboard
│   │   ├── Login.jsx        # User login form
│   │   ├── NotFound.jsx     # 404 error page
│   │   ├── Register.jsx     # User registration form
│   │   └── TaskDetails.jsx  # Detailed view of individual task
│   ├── routes/
│   │   └── AppRoutes.jsx    # Application route definitions
│   ├── services/
│   │   ├── authService.js   # Auth API calls
│   │   └── taskService.js   # Task API calls
│   ├── utils/
│   │   └── formatters.js    # Date and status badge styling utilities
│   ├── App.jsx              # Main app wrapper
│   ├── index.css            # Tailwind directives and custom CSS
│   └── main.jsx             # React entry point
├── index.html               # HTML template
├── package.json             # NPM dependencies and scripts
├── vite.config.js           # Vite configuration with API proxy
├── tailwind.config.js       # Tailwind CSS configuration
├── postcss.config.js        # PostCSS configuration
├── nginx.conf               # Production Nginx configuration with SPA routing
├── Dockerfile               # Multi-stage Docker build (Node 22 -> Nginx)
├── .dockerignore
├── .env.example
└── README.md
```

## Environment Variables

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL of the backend API | `http://localhost:8000/api/v1` |

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open in browser: `http://localhost:5173`

## Production Build

To build the static files locally:
```bash
npm run build
```
Output will be generated in the `dist/` directory.

## Docker Container Build & Run

The Dockerfile uses a multi-stage build:
1. Stage 1 (`node:22-alpine`): Installs dependencies and runs `npm run build`.
2. Stage 2 (`nginx:alpine`): Copies `/app/dist` to `/usr/share/nginx/html`, applies `nginx.conf` with SPA routing (`try_files $uri /index.html;`), and exposes port 80.

```bash
# Build production Docker image
docker build -t starter-frontend:latest .

# Run Nginx container on port 80 (or port 3000 locally)
docker run -p 80:80 starter-frontend:latest
```
