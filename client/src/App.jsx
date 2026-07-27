import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import LoadingSpinner from './components/common/LoadingSpinner';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

import Home from './pages/Home';
import Today from './pages/Today';
import Tasks from './pages/Tasks';
import CalendarPage from './pages/CalendarPage';
import Notes from './pages/Notes';
import Focus from './pages/Focus';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import WorkspaceHome from './pages/workspace/WorkspaceHome';
import Projects from './pages/workspace/Projects';
import KanbanBoard from './pages/workspace/KanbanBoard';
import Members from './pages/workspace/Members';
import TeamCalendar from './pages/workspace/TeamCalendar';
import FilesManager from './pages/workspace/FilesManager';
import ActivityTimeline from './pages/workspace/ActivityTimeline';
import WorkspaceSettings from './pages/workspace/WorkspaceSettings';
import AcceptInvite from './pages/AcceptInvite';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner message="Checking authentication session..." fullPage />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Loading..." fullPage />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const App = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <Register />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicOnlyRoute>
            <ForgotPassword />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/reset-password/:token"
        element={
          <PublicOnlyRoute>
            <ResetPassword />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/accept-invite"
        element={
          <ProtectedRoute>
            <AcceptInvite />
          </ProtectedRoute>
        }
      />

      {/* Protected Planner Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="today" element={<Today />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="notes" element={<Notes />} />
        <Route path="focus" element={<Focus />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />

        {/* Protected Workspace Module Routes */}
        <Route path="workspace" element={<WorkspaceHome />} />
        <Route path="workspace/projects" element={<Projects />} />
        <Route path="workspace/kanban" element={<KanbanBoard />} />
        <Route path="workspace/members" element={<Members />} />
        <Route path="workspace/calendar" element={<TeamCalendar />} />
        <Route path="workspace/files" element={<FilesManager />} />
        <Route path="workspace/activity" element={<ActivityTimeline />} />
        <Route path="workspace/settings" element={<WorkspaceSettings />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
