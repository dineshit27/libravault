import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import AdminLayout from './components/layout/AdminLayout';
import UserLayout from './components/layout/UserLayout';
import { AdminRoute, UserRoute } from './components/auth/ProtectedRoute';

// Public Pages
import HomePage from './pages/public/HomePage';
import BooksPage from './pages/public/BooksPage';
import BookDetailPage from './pages/public/BookDetailPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// User Pages
import UserDashboard from './pages/user/UserDashboard';
import UserNotificationsPage from './pages/user/UserNotificationsPage';
import UserReadingListPage from './pages/user/UserReadingListPage';
import UserBorrowHistoryPage from './pages/user/UserBorrowHistoryPage';
import UserReviewsPage from './pages/user/UserReviewsPage';
import UserFinesPage from './pages/user/UserFinesPage';
import UserProfilePage from './pages/user/UserProfilePage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAddBookPage from './pages/admin/AdminAddBookPage';
import AdminEditBookPage from './pages/admin/AdminEditBookPage';
import AdminMembersPage from './pages/admin/AdminMembersPage';
import AdminRequestsPage from './pages/admin/AdminRequestsPage';
import AdminBooksPage from './pages/admin/AdminBooksPage';
import AdminBorrowalsPage from './pages/admin/AdminBorrowalsPage';
import AdminReservationsPage from './pages/admin/AdminReservationsPage';
import AdminFinesPage from './pages/admin/AdminFinesPage';
import AdminAnnouncementsPage from './pages/admin/AdminAnnouncementsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminStaffPage from './pages/admin/AdminStaffPage';

// Components
import CustomCursor from './components/cursor/CustomCursor';

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <CustomCursor />
        
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/books" element={<BooksPage />} />
            <Route path="/books/:id" element={<BookDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Route>

          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* User Protected Routes */}
          <Route element={<UserRoute />}>
            <Route element={<UserLayout />}>
              <Route path="/user/dashboard" element={<UserDashboard />} />
              <Route path="/user/notifications" element={<UserNotificationsPage />} />
              <Route path="/user/reading-list" element={<UserReadingListPage />} />
              <Route path="/user/borrow-history" element={<UserBorrowHistoryPage />} />
              <Route path="/user/reviews" element={<UserReviewsPage />} />
              <Route path="/user/fines" element={<UserFinesPage />} />
              <Route path="/user/profile" element={<UserProfilePage />} />
            </Route>
          </Route>

          {/* Admin Protected Routes */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/books" element={<AdminBooksPage />} />
              <Route path="/admin/books/new" element={<AdminAddBookPage />} />
              <Route path="/admin/books/:id/edit" element={<AdminEditBookPage />} />
              <Route path="/admin/members" element={<AdminMembersPage />} />
              <Route path="/admin/borrowals" element={<AdminBorrowalsPage />} />
              <Route path="/admin/reservations" element={<AdminReservationsPage />} />
              <Route path="/admin/fines" element={<AdminFinesPage />} />
              <Route path="/admin/announcements" element={<AdminAnnouncementsPage />} />
              <Route path="/admin/reports" element={<AdminReportsPage />} />
              <Route path="/admin/settings" element={<AdminSettingsPage />} />
              <Route path="/admin/staff" element={<AdminStaffPage />} />
              <Route path="/admin/requests" element={<AdminRequestsPage />} />
            </Route>
          </Route>

          {/* 404 Catch-all */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center bg-brutal-yellow">
              <div className="text-center">
                <h1 className="font-heading font-bold text-9xl uppercase tracking-tighter border-b-8 border-brutal-black inline-block px-4">404</h1>
                <p className="font-heading font-bold text-2xl uppercase mt-4 mb-8">Page Not Found</p>
                <a href="/" className="inline-block px-8 py-4 bg-brutal-white border-4 border-brutal-black font-heading font-bold uppercase text-xl shadow-brutal hover:shadow-brutal-hover hover:-translate-x-1 hover:-translate-y-1 transition-all">Go Home</a>
              </div>
            </div>
          } />
        </Routes>

        <Toaster 
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '3px solid var(--accent-primary)',
              borderRadius: '0px',
              fontFamily: 'var(--font-heading)',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              boxShadow: 'var(--shadow)',
            },
            success: {
              iconTheme: { primary: 'var(--success)', secondary: 'var(--bg-card)' },
            },
            error: {
              style: { borderColor: 'var(--error)', boxShadow: 'var(--shadow)' },
              iconTheme: { primary: 'var(--error)', secondary: 'var(--bg-card)' },
            },
          }}
        />
      </BrowserRouter>
    </HelmetProvider>
  );
}
