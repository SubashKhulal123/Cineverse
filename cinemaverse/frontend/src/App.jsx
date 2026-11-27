import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { fetchMe } from './store/slices/authSlice';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import TrailerModal from './components/common/TrailerModal';
import PageLoader from './components/common/PageLoader';

// Lazy pages
const Home        = lazy(() => import('./pages/public/Home'));
const Movies      = lazy(() => import('./pages/public/Movies'));
const TVShows     = lazy(() => import('./pages/public/TVShows'));
const Search      = lazy(() => import('./pages/public/Search'));
const MovieDetail = lazy(() => import('./pages/public/MovieDetail'));
const Login       = lazy(() => import('./pages/public/Login'));
const Register    = lazy(() => import('./pages/public/Register'));
const ForgotPw    = lazy(() => import('./pages/public/ForgotPassword'));
const ResetPw     = lazy(() => import('./pages/public/ResetPassword'));

const Watchlist   = lazy(() => import('./pages/protected/Watchlist'));
const Profile     = lazy(() => import('./pages/protected/Profile'));
const Diary       = lazy(() => import('./pages/protected/Diary'));
const MyLists     = lazy(() => import('./pages/protected/MyLists'));
const Subscription= lazy(() => import('./pages/protected/Subscription'));

const AdminDash   = lazy(() => import('./pages/admin/Dashboard'));
const AdminUsers  = lazy(() => import('./pages/admin/Users'));
const AdminReviews= lazy(() => import('./pages/admin/Reviews'));
const AdminAnalytics = lazy(() => import('./pages/admin/Analytics'));

// Route guards
const PrivateRoute = ({ children }) => {
  const { user } = useSelector((s) => s.auth);
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user } = useSelector((s) => s.auth);
  return user?.role === 'admin' ? children : <Navigate to="/" replace />;
};

const GuestRoute = ({ children }) => {
  const { user } = useSelector((s) => s.auth);
  return !user ? children : <Navigate to="/" replace />;
};

export default function App() {
  const dispatch = useDispatch();
  const { token } = useSelector((s) => s.auth);

  useEffect(() => {
    if (token) dispatch(fetchMe());
  }, [token, dispatch]);

  return (
    <div className="min-h-screen bg-brand-dark text-white font-sans">
      <Navbar />
      <TrailerModal />
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1C1C1C', color: '#fff', border: '1px solid #2A2A2A' },
          success: { iconTheme: { primary: '#E50914', secondary: '#fff' } },
        }}
      />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public */}
          <Route path="/"                    element={<Home />} />
          <Route path="/movies"              element={<Movies />} />
          <Route path="/tv"                  element={<TVShows />} />
          <Route path="/search"              element={<Search />} />
          <Route path="/movie/:id"           element={<MovieDetail />} />
          <Route path="/tv/:id"              element={<MovieDetail mediaType="tv" />} />

          {/* Auth */}
          <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
          <Route path="/forgot-password" element={<GuestRoute><ForgotPw /></GuestRoute>} />
          <Route path="/reset-password/:token" element={<GuestRoute><ResetPw /></GuestRoute>} />

          {/* Protected */}
          <Route path="/watchlist"    element={<PrivateRoute><Watchlist /></PrivateRoute>} />
          <Route path="/profile"      element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/profile/:id"  element={<Profile />} />
          <Route path="/diary"        element={<PrivateRoute><Diary /></PrivateRoute>} />
          <Route path="/lists"        element={<PrivateRoute><MyLists /></PrivateRoute>} />
          <Route path="/subscription" element={<PrivateRoute><Subscription /></PrivateRoute>} />

          {/* Admin */}
          <Route path="/admin"          element={<AdminRoute><AdminDash /></AdminRoute>} />
          <Route path="/admin/users"    element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/reviews"  element={<AdminRoute><AdminReviews /></AdminRoute>} />
          <Route path="/admin/analytics"element={<AdminRoute><AdminAnalytics /></AdminRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      <Footer />
    </div>
  );
}
