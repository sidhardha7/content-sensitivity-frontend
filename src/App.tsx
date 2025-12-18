import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { SocketProvider } from '@/context/SocketContext';
import { ThemeProvider } from '@/context/ThemeContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import VideoLibrary from '@/pages/VideoLibrary';
import VideoUpload from '@/pages/VideoUpload';
import VideoDetail from '@/pages/VideoDetail';
import AdminUsers from '@/pages/AdminUsers';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/videos"
              element={
                <ProtectedRoute>
                  <Layout>
                    <VideoLibrary />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/videos/upload"
              element={
                <ProtectedRoute requiredRole="editor">
                  <Layout>
                    <VideoUpload />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/videos/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <VideoDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Layout>
                    <AdminUsers />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
