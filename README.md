# My Little Planner 🌸

A modern, aesthetic, and feature-packed personal digital planner and team collaboration workspace web application. Built with **React 18**, **Vite**, **Tailwind CSS**, **TanStack React Query**, **Node.js**, **Express**, **Socket.io**, **Nodemailer**, and **MongoDB**.

---

## 🌟 Highlights

* **🌸 Personal & 👥 Team Workspace Modes**: Toggle seamlessly between personal daily planning and multi-member team workspace collaboration.
* **⚡ Modern UX & Design System**: Skeleton loading states, smooth micro-interactions, custom themes, toast feedback, and full accessibility support.
* **📱 Responsive & PWA Native Experience**: Optimized across Desktop, Tablet, and Mobile with safe-area notch support and touch targets.
* **⌨️ Global Command Palette (`Ctrl+K` / `Cmd+K`)**: Quick jump to any page, trigger actions, and execute quick additions instantly.
* **📧 Automated Morning Digest & CSV Export**: HTML table schedule digests delivered directly to your email, plus instant CSV export of daily tasks.

---

## ✨ Core Modules & Features

### 🏠 Personal Productivity Suite
* **📅 Today's Timeline & 5-Block System**: Organize tasks by **Morning 🌅**, **Afternoon ☀️**, **Evening 🌆**, **Night 🌃**, and **Midnight 🌌**.
* **⭐ Top 3 Daily Priorities**: Enforce laser focus by highlighting up to 3 primary missions per day.
* **🔄 Daily Recurring Tasks**: Automatically repeat daily habits and objectives with date-specific completion tracking.
* **🗓️ Interactive Calendar**: Comprehensive monthly calendar grid mapping events and tasks with click-to-schedule controls.
* **🎯 Goals & Milestones**: Define short-term and long-term objectives with status indicators and milestone checklists.
* **🌱 Habit Tracker**: Build daily routines, monitor completion streaks, and view consistency statistics.
* **⏱️ Focus Mode & Pomodoro**: Distraction-free timer with custom focus durations, ambient sounds, and activity logging.
* **📝 Notes & Brain Dump**: Color-coded sticky notes with tag filtering and raw thought capture that converts directly into tasks or calendar events.
* **💖 Mood Check-in & Daily Reflections**: Log daily mood signals (`Amazing`, `Good`, `Okay`, `Low`, `Tired`) and end-of-day gratitude journaling.
* **📊 Analytics & Time Dossier**: Detailed focus metrics, time distribution by category, and productivity analytics.

### 👥 Team Workspace Collaboration
* **📊 HQ Overview & Quick Stats**: Real-time project statistics, active sprints, and recent team activity.
* **📋 Kanban Board**: Drag-and-drop or status-filtered Kanban columns (`Backlog`, `To Do`, `In Progress`, `Review`, `Testing`, `Done`).
* **🚀 Projects & Gantt Charts**: Track multi-stage team projects with timeline visualizations, progress bars, and due dates.
* **📂 Document Vault & Files**: File upload and management for sharing project documents and assets securely.
* **📜 Activity Audit Logs**: Full historical audit trail tracking workspace actions, project updates, and file uploads.
* **👥 Workspace Invites & Roles**: Invite teammates via secure links and manage role permissions (`Owner`, `Admin`, `Member`).

### 🎨 Themes & Custom Aesthetics
* **Cozy Lavender 🌸** (Default soft pastel aesthetic)
* **Blush Pink 🎀**
* **Sky Blue 🌊**
* **Peach Sunset 🍊**
* **Midnight Dark 🌙**
* **GTA Los Santos City Ops 🌆** (Action-oriented dark HUD aesthetic)
* **Strange World 🌌** (1980s supernatural small-town mystery aesthetic)

---

## 🛠️ Tech Stack

### Frontend
* **Core**: React 18, Vite
* **Styling**: Tailwind CSS, CSS Custom Properties
* **State & Data Fetching**: TanStack React Query (v5), Axios
* **Real-Time Engine**: Socket.io Client
* **Animations**: Framer Motion
* **Icons**: Lucide React

### Backend
* **Runtime & Framework**: Node.js, Express.js
* **Database**: MongoDB with Mongoose ORM
* **Real-Time Engine**: Socket.io Server
* **Email & Scheduler**: Nodemailer, Node-Cron
* **Authentication**: JWT (JSON Web Tokens) & bcryptjs
* **Deployment**: Vercel Serverless Compatible

---

## 🚀 Quick Start Guide

### Prerequisites
* [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
* [MongoDB](https://www.mongodb.com/) (Local MongoDB server or MongoDB Atlas URI)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/harshitabisht05/myplanner.git
   cd myplanner
   ```

2. **Install all dependencies** (root, client, and server):
   ```bash
   npm run install:all
   ```

3. **Configure Environment Variables**:

   Create a `.env` file inside the `server/` directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/myplanner
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=http://localhost:5173

   # Optional Email Provider Configuration (Gmail SMTP or Resend)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_16_char_gmail_app_password
   EMAIL_FROM=your_email@gmail.com
   ```

4. **Run the Application**:

   - **Start Backend API Server**:
     ```bash
     npm run dev:server
     ```
   - **Start Frontend Vite Client**:
     ```bash
     npm run dev:client
     ```
   - Open your browser at `http://localhost:5173`.

---

## 📁 Repository Structure

```text
myplanner/
├── client/                     # Frontend React + Vite Application
│   ├── public/                 # Favicons, Web Manifest & Service Worker
│   ├── src/
│   │   ├── api/                # Axios API modules (tasks, goals, habits, workspaces, etc.)
│   │   ├── assets/             # Images, backgrounds & decorative vectors
│   │   ├── components/         # Design System components
│   │   │   ├── common/         # Card, Button, Input, Modal, Skeleton, EmptyState, etc.
│   │   │   ├── layout/         # Sidebar, DesktopHeader, MobileBottomNav, etc.
│   │   │   ├── modals/         # TaskModal, GoalModal, HabitModal, EventModal, etc.
│   │   │   └── quickadd/       # Global QuickAdd modal
│   │   ├── context/            # Auth, Theme, Workspace, Focus, Toast & Notification contexts
│   │   ├── hooks/              # Socket.io & custom utility hooks
│   │   ├── pages/              # App routes (Home, Today, Tasks, Calendar, Focus, etc.)
│   │   │   └── workspace/      # Workspace pages (HQ, Kanban, Projects, Files, etc.)
│   │   └── utils/              # Date formatters & helpers
│   └── package.json
├── server/                     # Backend Express API Server
│   ├── src/
│   │   ├── config/             # Database setup (db.js)
│   │   ├── controllers/        # Controllers (task, habit, workspace, notification, etc.)
│   │   ├── middleware/         # Auth, Workspace permissions & Error middlewares
│   │   ├── models/             # Mongoose schemas (Task, User, Workspace, WorkspaceTask, etc.)
│   │   ├── routes/             # Express API routers
│   │   ├── services/           # Nodemailer (emailService) & Node-Cron (cronService)
│   │   └── socket.js           # Real-Time Socket.io event engine
│   └── package.json
└── package.json                # Root automation scripts
```

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).