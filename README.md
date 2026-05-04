# 🛠️ Gestion des Incidents — Frontend

React frontend for the Gestion des Incidents application.  
**Backend repo:** https://github.com/kaoutar629/GestionIncidents-backend

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+
- **npm** v9+

### Installation

```bash
git clone https://github.com/kaoutar629/GestionIncidents-frontend.git
cd GestionIncidents-frontend
npm install
```

### Environment Variables

Create a `.env.development` file at the root:

```env
VITE_API_URL=http://localhost:8080/api
```

For production:
```env
VITE_API_URL=https://your-backend.onrender.com/api
```

### Run

```bash
npm run dev
# App runs at http://localhost:5173
```

### Build for Production

```bash
npm run build
# Output in /dist — deploy to Vercel, Netlify, etc.
```

---

## 🧰 Tech Stack

| Technology | Purpose |
|-----------|---------|
| **React 19** | UI framework |
| **Vite 7** | Build tool & dev server |
| **React Router v7** | Client-side routing |
| **Tailwind CSS v4** | Utility-first styling |
| **PrimeReact** | UI component library |
| **Chart.js** | Data visualization |
| **React Toastify** | Toast notifications |
| **Moment.js** | Date formatting |

---

## ✨ Features

- 🔐 JWT authentication with protected routes
- 📋 Incident CRUD with status/priority management
- 🤖 AI-powered incident classifier (real-time suggestions)
- 📊 Analytics dashboard with charts
- 👥 User management (Admin only)
- 🌙 Dark / Light mode

---

## 📁 Project Structure
src/
├── config/         # API client, AuthContext, ThemeContext, roles
├── components/     # Reusable UI (KTable, KModal, IncidentForm…)
├── pages/          # Route pages (Dashboard, Incidents, Users, Login…)
├── services/       # AiService (classification)
├── hooks/          # useAiClassifier, useIncidents
└── layout/         # Navbar, BodyContent, AuthContextProvider

---

## 🚀 Deployment

Deployed on **Vercel**: https://gestion-incidents-frontend.vercel.app
