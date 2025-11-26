import ViewTopics from './pages/ViewTopics';
import SuperAdminTopics from './pages/SuperAdminTopics';
import Profile from './pages/Profile';

import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Register from './pages/Register';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Welcome from './pages/Welcome';
import BottomNavbar from './components/BottomNavbar';

function PrivateRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token || !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" />;
  }
  return children;
}

function AppContent() {
  const location = useLocation();

  // pages where bottom navbar should NOT appear
  const hideBottomNav = ["/login", "/register"].includes(location.pathname);

  return (
    <>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/view-topics" element={<ViewTopics />} />
        <Route path="/profile" element={<Profile />} />

        <Route
          path="/admin"
          element={
            <PrivateRoute allowedRoles={[0, 1]}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/main"
          element={
            <PrivateRoute allowedRoles={[0]}>
              <SuperAdminTopics />
            </PrivateRoute>
          }
        />

        <Route path="/" element={<Login />} />
      </Routes>

      {/* Bottom navbar ONLY if NOT on login/register */}
      {!hideBottomNav && <BottomNavbar />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
