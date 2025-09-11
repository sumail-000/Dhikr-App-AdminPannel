import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import {
  Dashboard,
  Users,
  Groups,
  Verses,
  Analytics,
  UserDetails,
  Profile,
} from './pages';
import { GroupDetails } from './pages/GroupDetails';
import { validateConfig } from './utils/config';

// Validate configuration on app start
try {
  validateConfig();
} catch (error) {
  console.error('Configuration error:', error);
}

function AppRoutes() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/users/:id" element={<UserDetails />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/groups/:type/:id" element={<GroupDetails />} />
        <Route path="/verses" element={<Verses />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/profile" element={<Profile />} />
        {/* Catch-all route for 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

function NotFound() {
  return (
    <div className="text-center py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-gray-600 mb-8">Page not found</p>
      <a href="/" className="btn-primary">
        Go to Dashboard
      </a>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <ProtectedRoute>
          <AppRoutes />
        </ProtectedRoute>
      </Router>
    </AuthProvider>
  );
}

export default App;
