import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { Layout } from './components/Layout';

import { StudentLogin } from './pages/student/Login';
import { Onboarding } from './pages/student/Onboarding';
import { StudentHome } from './pages/student/Home';
import { SearchPage } from './pages/student/Search';
import { EventDetail } from './pages/student/EventDetail';
import { SocietiesList, SocietyProfile } from './pages/student/Societies';

import { AdminLogin } from './pages/admin/Login';
import { AdminDashboard } from './pages/admin/Dashboard';
import { CreateEvent } from './pages/admin/CreateEvent';

const protect = (element) => <ProtectedRoute>{element}</ProtectedRoute>;
const admin = (element) => <AdminRoute>{element}</AdminRoute>;

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Student Routes */}
            <Route path="/login" element={<StudentLogin />} />
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute requireOnboarded={false}>
                  <Onboarding />
                </ProtectedRoute>
              }
            />
            <Route path="/home" element={protect(<StudentHome />)} />
            <Route path="/search" element={protect(<SearchPage />)} />
            <Route path="/events/:id" element={protect(<EventDetail />)} />
            <Route path="/societies" element={protect(<SocietiesList />)} />
            <Route path="/societies/:id" element={protect(<SocietyProfile />)} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={admin(<AdminDashboard />)} />
            <Route path="/admin/create-event" element={admin(<CreateEvent />)} />
            <Route path="/admin/events/:id/edit" element={admin(<CreateEvent key="edit" />)} />

            {/* Default Catch-all Redirect */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
