# My Little Planner 🌸

A modern, aesthetic, and feature-packed personal digital planner & life organization web application. Built with **React**, **Vite**, **Tailwind CSS**, **Node.js**, **Express**, and **MongoDB**.

---

## ✨ Features & Modules

### 📅 Daily Planner & Timeline
- **5-Block Daily Timeline**: Organize tasks by **Morning 🌅**, **Afternoon ☀️**, **Evening 🌆**, **Night 🌃**, and **Midnight 🌌**.
- **Interactive Date Navigation**: Easily switch between days with `< Prev`, `Today`, `Next >`, or select any custom date via the date picker.
- **Top 3 Daily Priorities**: Enforce laser focus by pin-pointing up to 3 main priority missions per day.
- **Repeat Daily 🔄**: Mark tasks to automatically repeat every single day while independently tracking completion for each date.

### 🗓️ Interactive Calendar
- Visual month grid view displaying events and tasks mapped across dates.
- Click any calendar date to inspect, schedule, and complete events or tasks for that specific day.

### 🎯 Goals & Milestones
- Track long-term and short-term goals with status badges (`Not Started`, `In Progress`, `Completed`, `Paused`).
- Add and complete sub-milestones for each goal.

### 🌱 Habit Tracker
- Build daily habits, track completion streaks, and view progress over time.

### ⏱️ Focus Mode
- Distraction-free Pomodoro & custom deep-work timer with task linking.

### 📝 Notes & Brain Dump
- Color-coded sticky notes with tag filtering.
- Quick thought capture that can be converted directly into tasks or scheduled events.

### 💖 Mood Check-in & Daily Reflections
- Track daily mood signals (`Amazing`, `Good`, `Okay`, `Low`, `Tired`).
- End-of-day journaling for gratitude, achievements, and improvement reflections.

### 🎨 Custom Design Themes
- **Cozy Standard 🌸**: Warm, soft pastel aesthetic.
- **GTA City Ops 🌆**: High-contrast, action-oriented dark HUD aesthetic.
- **Strange World 🌌**: Cyberpunk / parallel dimension dark environment.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 (with Vite)
- **Styling**: Tailwind CSS
- **State & Data Fetching**: TanStack React Query (v5), Axios
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB with Mongoose ORM
- **Validation**: Zod
- **Authentication**: JWT (JSON Web Tokens) & bcryptjs
- **Deployment**: Vercel

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas cluster)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/harshitabisht05/myplanner.git
   cd myplanner
   ```

2. **Install all dependencies**:
   ```bash
   npm run install:all
   ```

3. **Configure Environment Variables**:
   Create a `.env` file inside the `server/` directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/myplanner
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=development
   ```

4. **Run Locally**:
   - Start the backend server:
     ```bash
     npm run dev:server
     ```
   - Start the frontend client:
     ```bash
     npm run dev:client
     ```
   - Access the application at `http://localhost:5173`.

---

## 📁 Repository Structure

```text
myplanner/
├── client/                     # Frontend Vite + React application
│   ├── public/                 # Static assets & Service Worker (sw.js)
│   ├── src/
│   │   ├── api/                # Axios API service calls
│   │   ├── components/         # Reusable UI components & Modals
│   │   ├── context/            # Auth, Theme, Focus & Toast Contexts
│   │   ├── pages/              # App routes (Today, Tasks, Calendar, Focus, etc.)
│   │   └── utils/              # Date helper utilities
│   └── package.json
├── server/                     # Backend Node.js + Express API
│   ├── src/
│   │   ├── config/             # Database connection setup
│   │   ├── controllers/        # Route controllers (Task, Goal, Habit, Note, etc.)
│   │   ├── middleware/         # Auth & validation middleware
│   │   ├── models/             # Mongoose schemas (Task, User, Goal, Habit, etc.)
│   │   ├── routes/             # API endpoints
│   │   └── validators/         # Zod schemas
│   └── package.json
└── package.json                # Root scripts
```

---

## 📄 License

This project is open source and available under the [ISC License](LICENSE).