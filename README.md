# 🚀 ProjectFlow — Full-Stack Project Management App

A full-stack project management application with role-based access control, built with **Spring Boot** (backend) and **React + Vite** (frontend).

---

## 🌟 Features

- **Authentication** — JWT-based signup/login
- **Projects** — Create, view, update, delete projects; manage members
- **Tasks** — Create, assign, and track tasks with status and priority
- **Dashboard** — Stats: total projects, tasks by status, overdue tasks
- **Role-Based Access** — ADMIN can create/delete projects; MEMBER can only view and update task status
- **Responsive UI** — Built with Tailwind CSS

---

## 🛠️ Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Backend   | Java 17, Spring Boot 3.2, Spring Security |
| Auth      | JWT (jjwt 0.11.5)                       |
| Database  | MySQL 8 + Spring Data JPA / Hibernate   |
| Frontend  | React 18, Vite, React Router v6         |
| Styling   | Tailwind CSS 3                          |
| HTTP      | Axios                                   |
| Deploy    | Railway (backend + MySQL), Vercel (frontend) |

---

## ⚙️ Local Setup

### Prerequisites
- Java 17+
- Maven 3.8+
- MySQL 8+
- Node.js 18+

### 1. Database
```sql
-- MySQL auto-creates the DB via createDatabaseIfNotExist=true
-- Or manually:
CREATE DATABASE IF NOT EXISTS project_manager;
```

### 2. Backend
```bash
cd backend

# Edit src/main/resources/application.properties if needed:
# spring.datasource.username=root
# spring.datasource.password=123459

mvn spring-boot:run
# Server starts at http://localhost:8080
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
# App starts at http://localhost:5173
```

---

## 🔑 API Endpoints

### Auth
| Method | URL | Body | Description |
|--------|-----|------|-------------|
| POST | `/api/auth/signup` | `{name, email, password, role}` | Register user |
| POST | `/api/auth/login` | `{email, password}` | Login, returns JWT |

### Projects
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/projects` | Get all user projects |
| POST | `/api/projects` | Create project (ADMIN) |
| GET | `/api/projects/{id}` | Get project details |
| PUT | `/api/projects/{id}` | Update project |
| DELETE | `/api/projects/{id}` | Delete project (owner only) |
| POST | `/api/projects/{id}/members` | Add member |
| DELETE | `/api/projects/{id}/members/{userId}` | Remove member |

### Tasks
| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks/project/{projectId}` | Get tasks for project |
| PUT | `/api/tasks/{id}` | Update task |
| PATCH | `/api/tasks/{id}/status` | Update task status |
| DELETE | `/api/tasks/{id}` | Delete task |
| GET | `/api/tasks/my-tasks` | Get my assigned tasks |

### Dashboard
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/dashboard/stats` | Get dashboard statistics |

---

## 🌐 Deployment on Railway

### Backend + MySQL

1. Push backend to a GitHub repo
2. Go to [railway.app](https://railway.app) → New Project
3. Add a **MySQL** plugin — Railway provides `DATABASE_URL`
4. Deploy backend from GitHub — set environment variables:
   ```
   SPRING_DATASOURCE_URL=jdbc:mysql://<host>:<port>/railway
   SPRING_DATASOURCE_USERNAME=<railway_user>
   SPRING_DATASOURCE_PASSWORD=<railway_password>
   JWT_SECRET=YourSuperSecretKeyHere
   JWT_EXPIRATION=86400000
   ```
5. Railway auto-detects Dockerfile and builds

### Frontend on Vercel

1. Push frontend to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import repo
3. Set environment variable:
   ```
   VITE_API_URL=https://your-backend.railway.app/api
   ```
4. Deploy — Vercel auto-detects Vite

---

## 👤 Role Permissions

| Action | ADMIN | MEMBER |
|--------|-------|--------|
| Create Project | ✅ | ❌ |
| Delete Project | ✅ (owner) | ❌ |
| Add/Remove Members | ✅ | ❌ |
| Create Task | ✅ | ✅ |
| Delete Task | ✅ | ✅ (own tasks) |
| Change Task Status | ✅ | ✅ (assigned only) |
| View Projects/Tasks | ✅ | ✅ (member projects) |

---

## 📦 Project Structure

```
project-manager/
├── backend/
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main/java/com/pm/
│       ├── model/          # JPA Entities
│       ├── repository/     # Spring Data repos
│       ├── service/        # Business logic
│       ├── controller/     # REST controllers
│       ├── dto/            # Request/Response DTOs
│       ├── security/       # JWT + UserDetails
│       └── config/         # SecurityConfig + CORS
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios config
│   │   ├── context/        # AuthContext
│   │   ├── components/     # Navbar, TaskCard, PrivateRoute
│   │   └── pages/          # Login, Signup, Dashboard, Projects, Tasks
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

---

## 🧪 Testing with Postman

1. **Signup**: `POST /api/auth/signup`
   ```json
   { "name": "Admin User", "email": "admin@test.com", "password": "password123", "role": "ADMIN" }
   ```

2. **Login**: `POST /api/auth/login`
   ```json
   { "email": "admin@test.com", "password": "password123" }
   ```
   → Copy the `token` from response

3. **Add Auth Header** to all subsequent requests:
   ```
   Authorization: Bearer <your_token>
   ```

4. **Create Project**: `POST /api/projects`
   ```json
   { "name": "My Project", "description": "Test project", "status": "ACTIVE" }
   ```
