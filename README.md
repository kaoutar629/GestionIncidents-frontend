# 🛠️ Gestion des Incidents

A full-stack incident management system built with Spring Boot and React, featuring JWT authentication, role-based access control, AI-powered incident classification, real-time notifications, and analytics dashboards.

---

## 🚀 How to Run the Project

### Prerequisites

- **Node.js** v18+ and **npm** v9+
- **Java** 17+
- **Maven** 3.9+
- **MySQL** 8+

---

### Backend (Spring Boot)

```bash
# 1. Clone the repo
git clone https://github.com/kaoutar629/GestionIncidents.git
cd GestionIncidents-backend

# 2. Configure environment variables (create a .env or export them)
export MYSQL_ADDON_HOST=localhost
export MYSQL_ADDON_PORT=3306
export MYSQL_ADDON_DB=gestion_incidents
export MYSQL_ADDON_USER=root
export MYSQL_ADDON_PASSWORD=yourpassword
export MAIL_USER=your_mailtrap_user
export MAIL_PASS=your_mailtrap_pass

# 3. Run the app
./mvnw spring-boot:run

# Backend starts at http://localhost:8080
# Swagger UI available at: http://localhost:8080/swagger-ui.html
```

> ⚙️ The database schema is auto-created by Hibernate (`ddl-auto=update`). No manual migration needed.

---

### Frontend (React + Vite)

```bash
# 1. Navigate to frontend directory
cd frontend-fixed

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev

# App runs at http://localhost:5173
```

#### Environment Variables (Frontend)

Create a `.env.development` file at the project root:

```env
VITE_API_URL=http://localhost:8080/api
```

For production:
```env
VITE_API_URL=https://your-backend.onrender.com/api
```

---

### Build for Production

```bash
# Frontend
npm run build
# Output in /dist — deploy to Vercel, Netlify, etc.

# Backend
./mvnw package -DskipTests
# Produces target/gestionIncidents-*.jar — deploy to Render, Railway, etc.
```

---

## 🧰 Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| **Spring Boot 3** | REST API framework |
| **Spring Security + JWT** | Authentication & stateless session management |
| **Spring Data JPA / Hibernate** | ORM & database access |
| **MySQL 8** | Relational database |
| **Lombok** | Boilerplate reduction |
| **SpringDoc / Swagger UI** | API documentation |
| **JavaMailSender + Mailtrap** | Email notifications |
| **Spring Events (async)** | Decoupled notification system |
| **MapStruct** | DTO ↔ Entity mapping |
| **Bean Validation** | Input validation |

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 19** | UI framework |
| **Vite 7** | Build tool & dev server |
| **React Router v7** | Client-side routing |
| **Tailwind CSS v4** | Utility-first styling |
| **PrimeReact** | UI component library |
| **Chart.js** | Data visualization (dashboard charts) |
| **React Toastify** | Toast notifications |
| **Moment.js** | Date formatting |

### DevOps & Deployment
| Tool | Purpose |
|------|---------|
| **Render** | Backend deployment (free tier) |
| **Vercel** | Frontend deployment |
| **GitHub** | Version control |

---

## ✨ Features

### 🔐 Authentication & Security
- JWT-based stateless authentication
- Role-based access control: **ADMIN** and **USER** roles
- Protected routes on frontend — unauthorized access redirected to login
- Passwords hashed with BCrypt

### 📋 Incident Management
- Create, read, update, and delete incidents
- Incidents have: **title**, **description**, **status** (OPEN / IN_PROGRESS / RESOLVED / CLOSED), **priority** (LOW / MEDIUM / HIGH), **category**, and **assignee**
- ADMINs see all incidents; regular USERs see only their own
- Inline status/priority updates with confirmation toasts

### 🤖 AI Incident Classifier
- Automatic priority and category suggestion based on incident title and description
- Rule-based NLP engine running on the backend (no external API required)
- Suggestions appear in real-time as the user types (debounced 1s)
- User can accept or ignore suggestions

### 📊 Analytics Dashboard
- Summary cards: Total / Open / In Progress / Resolved incidents
- **Doughnut chart** — breakdown by status or priority (toggle)
- **Line chart** — incident volume per month for the current year
- Data filtered by role: admins see all data, users see their own

### 👥 User Management (Admin only)
- List, create, edit, and delete users
- Assign roles (ADMIN / USER)
- Paginated user table

### 🌙 Dark / Light Mode
- System-aware theme toggle persisted across sessions
- All components styled for both themes

### 📧 Email Notifications
- Asynchronous email sent on incident creation and status change
- Powered by Spring Events + JavaMailSender
- Mailtrap-compatible for development, configurable for production SMTP

### 📖 API Documentation
- Swagger UI at `/swagger-ui.html`
- Bearer token authentication supported in Swagger
- All endpoints documented with descriptions

---

## 🐛 Bugs Fixed (v2)

| Bug | Root Cause | Fix Applied |
|-----|-----------|------------|
| `Uncaught SyntaxError: Unexpected token 'export'` | `eslint.config.js` used unstable `defineConfig` from `eslint/config` | Rewrote using stable flat config array format |
| `Password field not in a form` (browser warning) | Login inputs were raw `<div>` elements, no `<form>` wrapper | Wrapped in `<form onSubmit>` with `autoComplete` attributes |
| `HTTP 403` on `/api/incidents` | CORS config only whitelisted specific Vercel preview URLs; deployed frontend URL not matched | Added wildcard `https://gestion-incidents-frontend-*.vercel.app` pattern + dynamic origins from config |
| `ReferenceError: BASE_URL is not defined` in AiService | `AiService.js` referenced `BASE_URL` without importing or defining it | Added `const BASE_URL = import.meta.env.VITE_API_URL` at top of file |
| `/vite.svg 404` | `index.html` referenced Vite's default template favicon which wasn't in the project | Replaced with inline SVG data URI favicon |
| Invalid `.env.development` | File contained a raw JavaScript line `const BASE_URL = ...` which `.env` parsers reject | Removed the invalid JS line; env file now only contains valid `KEY=VALUE` pairs |

---

## 📁 Project Structure

```
frontend-fixed/
├── src/
│   ├── config/         # API client, AuthContext, ThemeContext, roles
│   ├── components/     # Reusable UI (KTable, KModal, IncidentForm…)
│   ├── pages/          # Route pages (Dashboard, Incidents, Users, Login…)
│   ├── services/       # AiService (classification)
│   ├── hooks/          # useAiClassifier, useIncidents
│   └── layout/         # Navbar, BodyContent, AuthContextProvider
│
GestionIncidents-backend/
├── src/main/java/com/kaoutar/gestionIncidents/
│   ├── config/         # OpenAPI, AsyncConfig
│   ├── controller/     # REST controllers
│   ├── service/        # Business logic (Auth, Incident, AI, User, Notification…)
│   ├── security/       # JWT filter, WebSecurityConfig
│   ├── entity/         # JPA entities
│   ├── dto/            # Request/Response DTOs
│   ├── repository/     # Spring Data JPA repositories
│   ├── events/         # Spring application events
│   ├── mappers/        # MapStruct mappers
│   └── exception/      # Global exception handler
```
