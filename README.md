# DailyPulse

A full-stack daily task tracking application built with Next.js 16, Express, MongoDB, and TypeScript.

## Tech Stack

**Frontend:** Next.js 16 (App Router), React 18, TypeScript, Tailwind CSS, TanStack React Query, Axios, recharts, lucide-react
**Backend:** Express 4, Mongoose, JWT, bcrypt, Zod, Helmet, express-rate-limit
**Testing:** Vitest, React Testing Library

## Project Structure

```
dailypulse/
├── server/                  # Express API backend
│   ├── config/              # DB & env configuration
│   ├── controllers/         # Route handlers
│   ├── middleware/          # Auth, validation, error handling
│   ├── models/              # Mongoose schemas (User, Task)
│   ├── routes/              # Express routers
│   ├── services/            # Business logic
│   └── utils/               # AppError, validation schemas, date utils
├── src/                     # Next.js frontend
│   ├── app/                 # App Router pages
│   │   ├── (auth)/          # Login & register
│   │   └── (dashboard)/     # Dashboard, tasks, history, analytics
│   ├── components/          # UI components
│   ├── lib/                 # Utilities, Excel export
│   ├── services/            # API client modules
│   ├── store/               # Auth context
│   └── types/               # TypeScript type definitions
└── vitest.config.ts         # Test configuration
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Setup

1. **Clone and install dependencies**

```bash
git clone <repo-url>
cd dailypulse

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

2. **Configure environment variables**

```bash
# Frontend (root)
cp .env.example .env

# Backend
cp server/.env.example server/.env
```

Edit `server/.env` with your MongoDB URI and a secure JWT secret.

3. **Run the application**

```bash
# Start the backend (from root)
cd server && npm run dev

# In a separate terminal, start the frontend
npm run dev
```

The frontend runs on `http://localhost:3000` and the API on `http://localhost:5000`.

## Available Scripts

### Frontend (root)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |

### Backend (server/)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled server |

## API Endpoints

### Auth `/api/auth`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Create account |
| POST | `/login` | Sign in |
| POST | `/logout` | Sign out |
| GET | `/me` | Get current user |

### Tasks `/api/tasks`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/today` | Today's tasks |
| GET | `/date/:date` | Tasks by date |
| GET | `/postponed` | Rescheduled tasks |
| GET | `/history` | Task history |
| POST | `/` | Create task |
| PUT | `/:id` | Update task |
| DELETE | `/:id` | Delete task |
| PATCH | `/:id/complete` | Toggle complete |
| PATCH | `/:id/postpone` | Reschedule |
| PATCH | `/:id/revert` | Revert to today |

### Analytics `/api/analytics`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/weekly` | Weekly summary + daily breakdown |
| GET | `/monthly` | Monthly summary + daily breakdown |
| GET | `/quarterly` | Quarterly summary + daily breakdown |
| GET | `/half-yearly` | Half-yearly summary + daily breakdown |
| GET | `/yearly` | Yearly summary + daily breakdown |

## Features

- **Dashboard** — Overview of today's tasks with completion stats
- **Task Management** — Create, edit, complete, reschedule, and delete tasks
- **Priority System** — High / Medium / Low with proper sorting
- **Rescheduling** — Move tasks to future dates with history tracking
- **History** — Browse past tasks grouped by date
- **Analytics** — Track completion rates, streaks, productivity scores, and daily breakdown charts
- **Excel Export** — Export task history to `.xlsx` with formatted summary and detail sheets
- **Authentication** — JWT-based auth with HttpOnly cookies
- **Timezone Support** — Timezone-aware date handling
