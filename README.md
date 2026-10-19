# 🏰 ROYAL VISTA — Hotel & Suites Management System (HMS)

A complete, modern, luxury Hotel Management System (HMS) with a React TypeScript frontend and a Node.js Express TypeScript MongoDB backend.

---

## 📁 Repository Structure

```
Room Bookings/
├── frontend/                  # React + TypeScript + Vite + Tailwind CSS Frontend
│   ├── src/                   # Components, pages, hooks, services, context
│   ├── public/                # Static assets & icons
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── tailwind.config.js
│
├── backend/                   # Node.js + Express + TypeScript + MongoDB Backend
│   ├── src/                   # Models, controllers, routes, services, middleware
│   ├── .env                   # Environment configuration (MongoDB Atlas URI, JWT)
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

---

## 🚀 Running the Project Locally

### 1. Frontend (Port: 5174)
```bash
cd frontend
npm install
npm run dev
```

### 2. Backend (Port: 5000)
```bash
cd backend
npm install
npm run dev
```

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Recharts, React Router
- **Backend**: Node.js, Express.js, TypeScript, MongoDB Atlas, Mongoose, JWT, bcryptjs, Zod, Helmet, CORS
