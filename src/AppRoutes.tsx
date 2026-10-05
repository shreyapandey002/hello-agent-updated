import { Navigate, Route, Routes } from 'react-router-dom';
import App from './App';
import { ProtectedRoute } from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import MailboxPage from './pages/MailboxPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<Navigate to="/login" replace />} />
      <Route
        path="/mailbox"
        element={
          <ProtectedRoute>
            <MailboxPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mailbox/:threadId"
        element={
          <ProtectedRoute>
            <MailboxPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
