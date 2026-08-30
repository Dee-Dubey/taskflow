# TaskFlow — MEAN Stack Task Management Application

A role-based task management application built with MongoDB, Express, Angular, and Node.js (MEAN stack). Supports three roles — **Manager**, **Team Lead**, and **Employee** — each with scoped access to tasks and team data, plus real-time updates via Socket.IO.

## Live Demo

- **Frontend:** https://taskflow-4k681iz7b-deepak-s-projects-fdcb.vercel.app
- **Backend API:** https://taskflow-backend-gukw.onrender.com

> Note: the backend is hosted on Render's free tier, which spins down after 15 minutes of inactivity. The first request after a period of inactivity may take 30-60 seconds while the server wakes up — subsequent requests will be fast.

## Features

- **Authentication** — JWT-based (short-lived access token + httpOnly refresh token cookie), registration, login, logout
- **Role-based authorization**
  - **Manager** — sees all users and all tasks, can create/modify/reassign any task
  - **Team Lead** — sees their own tasks plus their direct reports' tasks, can assign to self or team members
  - **Employee** — sees and manages only their own tasks; tasks they create are auto-assigned to themselves
- **Task management** — full CRUD, status tracking (pending / in-progress / completed), reassignment, search and filtering by status/assignee
- **Team & Users views** — Team Lead/Manager can see team overview with task stats; Manager has a full user directory grouped by role
- **Real-time updates** — Socket.IO pushes task changes to relevant connected clients instantly
- **Responsive UI** — built with Angular (standalone components, signals) and Bootstrap 5

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 21 (standalone components), Bootstrap 5, ng-bootstrap |
| Backend | Node.js, Express |
| Database | MongoDB (MongoDB Atlas) |
| Auth | JWT (access + refresh tokens) |
| Real-time | Socket.IO |
| Hosting | Backend on Render, Frontend on Vercel, Database on MongoDB Atlas |

## Project Structure

```
TaskFlow/
├── backend/     # Express API, MongoDB models, JWT auth, Socket.IO
└── frontend/    # Angular application
```

---

## Prerequisites

- Node.js v20+ and npm
- A MongoDB connection string (local MongoDB or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free tier)

---

## Backend Setup (local development)

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with the following variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:4200

JWT_ACCESS_SECRET=a_long_random_string
JWT_ACCESS_EXPIRES_IN=15m

JWT_REFRESH_SECRET=a_different_long_random_string
JWT_REFRESH_EXPIRES_IN=7d

NODE_ENV=development
```

> Generate a random secret with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

Run the server:

```bash
npm run dev
```

The API will be available at `http://localhost:5000/api`. Health check: `GET /api/health`.

---

## Frontend Setup (local development)

```bash
cd frontend
npm install
npm start
```

The app will be available at `http://localhost:4200`.

---

## How to Test the Role Hierarchy

Because Team Leads report to a Manager and Employees report to a Team Lead, **registration order matters**:

1. Register a **Manager** first (no reporting selection needed).
2. Register a **Team Lead** — you'll be prompted to select the Manager you just created.
3. Register an **Employee** — you'll be prompted to select the Team Lead you just created.

Once registered, log in with any of the three accounts to see role-specific views:
- Manager → Dashboard, My Tasks, Team, All Users
- Team Lead → Dashboard, My Tasks, Team
- Employee → Dashboard, My Tasks

> Note: role and reporting structure are set at registration and are immutable afterward by design (out of scope for this project).

---

## API Overview

| Method | Route | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/refresh` | Public (uses refresh cookie) |
| POST | `/api/auth/logout` | Public |
| GET | `/api/auth/managers` | Public (for registration dropdown) |
| GET | `/api/auth/teamleads` | Public (for registration dropdown) |
| GET | `/api/users/assignable` | Authenticated |
| GET | `/api/users/team-overview` | Manager, Team Lead |
| GET | `/api/users/overview` | Manager |
| POST | `/api/tasks` | Authenticated |
| GET | `/api/tasks` | Authenticated (scoped by role) |
| GET | `/api/tasks/:id` | Authenticated (scoped) |
| PUT | `/api/tasks/:id` | Authenticated (scoped) |
| PATCH | `/api/tasks/:id/reassign` | Manager, Team Lead |
| DELETE | `/api/tasks/:id` | Authenticated (scoped) |

## Real-Time Updates

The backend emits `task:created`, `task:updated`, and `task:deleted` events over Socket.IO whenever a task changes. Connected clients automatically refetch their scoped task list, so changes made by one user (e.g. an Employee updating a task) are reflected live for their Team Lead/Manager without a page refresh.

## Known Behavior

- Completed tasks remain fully editable (title, description, status) by design — no locking is enforced.
- A user's role and reporting hierarchy (`reportsTo`) are set once at registration and cannot be changed afterward in this version.

---

## Author

Deepak — built as part of a MEAN stack machine test assignment.
