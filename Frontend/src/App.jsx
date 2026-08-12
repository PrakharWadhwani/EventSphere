import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { Layout } from './components/Layout';

import { StudentLogin } from './pages/student/Login';
import { Onboarding } from './pages/student/Onboarding';
import { StudentHome } from './pages/student/Home';

import { AdminLogin } from './pages/admin/Login';
import { CreateEvent } from './pages/admin/CreateEvent';

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
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              }
            />
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <StudentHome />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/create-event"
              element={
                <AdminRoute>
                  <CreateEvent />
                </AdminRoute>
              }
            />

            {/* Default Catch-all Redirect */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
