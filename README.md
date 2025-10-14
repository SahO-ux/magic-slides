# 🪄 Magic Slides

Magic Slides is an AI-powered presentation generator that turns your text prompts into elegant, ready-to-present slides using the **Gemini API**.  
It includes a **React (Vite) frontend** and an **Express.js backend**, connected seamlessly with Docker for easy deployment.

- Deployment Link:- https://magic-slides-frontend.vercel.app/

---

## 🚀 Features

- ✨ Generate slides dynamically using **Google Gemini API**
- 💬 Interactive chat-based prompt input
- 🧠 Smart context retention for continued slide updates
- 🎨 Split-view UI — simultaneous view of chat and generated slides
- 📱 Responsive design for smooth UX
- 🐳 Dockerized setup for fast, consistent deployment

---

## 🧩 Project Structure

```
magic-slides/
├── backend/ # Node.js + Express backend
│ ├── server.js # Main server entry
│ ├── modules/
│ ├── src/
│ ├── package.json
│ ├── Dockerfile
│ └── .env
│
├── frontend/ # Vite + React frontend
│ ├── src/
│ ├── index.html
│ ├── package.json
│ ├── vite.config.js
│ ├── eslint.config.js
│ ├── tailwind.config.js
│ ├── postcss.config.js
│ ├── Dockerfile
│ ├── nginx.conf
│ └── .env
│
├── docker-compose.yml
└── README.md
```

---

## ⚙️ Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/en/) (v20+)
- Docker Desktop installed and running.
- A valid **Google Gemini API key**

---

## 🔑 Environment Variables

### 🖥 Create `backend/.env`:

```
# backend/.env
PORT=8081

# GEMINI CREDS
GEMINI_API_KEY=<YOUR_GEMINI_KEY>
GEMINI_MODEL=gemini-2.5-pro-preview-05-06

# Per request configs
GEMINI_TEMPERATURE=0.2
GEMINI_MAX_TOKENS=1500
```

### 🖥 Create `frontend/.env`:

```
# frontend/.env
VITE_API_URL=http://localhost:8081
VITE_CONTENT_LIMIT=900-1200
VITE_MAX_SLIDES=7
```

---

## 🛠️ Local Development (Without Docker)

- Here I am assuming you are currently at the root of the project (magic-slides).

### 1️⃣ Start Backend

```bash
cd backend
npm install
npm run dev
```

### 2️⃣ Start Frontend

```bash
cd frontend
npm install
npm run dev
```

- Open the app in your browser at http://localhost:5173

---

## 🐳 Docker Setup

### 1️⃣ Build and Run the Project

- After creating .env files for frontend and backend, run the following from the root directory (magic-slides):

```bash
docker compose up --build
```

- This will:
-> Build the backend (Node.js)
-> Build the frontend (Vite + Nginx)
-> Start both services

### 2️⃣ Access the Application

| Service  | URL                                            |
| -------- | ---------------------------------------------- |
| Frontend | [http://localhost:3000](http://localhost:3000) |
| Backend  | [http://localhost:8081](http://localhost:8081) |

### 3️⃣ Stop Containers

```bash
docker-compose down
```

### 4️⃣ View Logs

```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

---

## 📦 Docker Image Details

### Backend:
- Base Image: node:20-alpine
- Exposed Port: 8081

### Frontend:
- Base Image: node:20-alpine (build stage), then nginx:alpine
- Exposed Port: 80 (mapped to 3000 on host)
- Served by: nginx with try_files for SPA routing
- Static Build Output: /usr/share/nginx/html

---

## 🧰 Useful Commands

| Command                         | Description                     |
| ------------------------------- | ------------------------------- |
| `docker-compose up --build`     | Build and start all services    |
| `docker-compose down`           | Stop and remove containers      |
| `docker-compose logs -f`        | Stream logs from all containers |
| `docker-compose build frontend` | Rebuild only the frontend       |
| `docker-compose build backend`  | Rebuild only the backend        |

---

## 🧠 Assumptions Made


- For simplicity, the app does not store user data — all AI communication is session-based.
- No tryLocalEdit optimization or client-side caching for Gemini SDK calls is implemented (to ensure correctness).
- The backend does not use Redis, DB, or persistent storage — only API relay.

---

## 🧩 System Architecture Overview

```
User ─▶ Frontend (React + Nginx)
         │
         ▼
      Backend (Express.js)
         │
         ▼
   Google Gemini SDK
```

- Frontend handles user interactions, prompt submission, and rendering slides/chat.
- Backend handles communication with the Gemini SDK, securely managing API keys.
- Gemini SDK processes the user prompts and returns structured content for slides.

---

## 🔍 Server Health Check

- The backend exposes a lightweight GET /health endpoint for backend healthchecks:

```
http://localhost:8081/health
```

- Expected Response:

```
{ "status": "ok" }
```

---




