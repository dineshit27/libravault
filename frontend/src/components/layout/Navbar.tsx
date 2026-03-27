import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, BookOpen, Bell, User, LogOut, Shield } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import Button from '../ui/Button';

export default function Navbar() {
  const { user, isAuthenticated, logout, role } = useAuthStore();
  const { mobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUIStore();
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    closeMobileMenu();
  }, [location.pathname, closeMobileMenu]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isAdmin = role === 'admin';
  const isAdminRoute = location.pathname.startsWith('/admin');

  const publicLinks = [
    { to: '/', label: 'Home' },
    { to: '/books', label: 'Catalog' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-200
          ${scrolled
            ? 'bg-brutal-white border-b-3 border-brutal-black shadow-brutal-sm'
            : isAdminRoute ? 'bg-brutal-black text-white' : 'bg-transparent'
          }
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group" aria-label="Library Home">
              <div className={`p-2 border-3 border-brutal-black ${isAdminRoute && !scrolled ? 'bg-brutal-coral' : 'bg-brutal-yellow'} shadow-brutal-sm group-hover:shadow-brutal transition-shadow`}>
                <BookOpen size={24} className="text-brutal-black" />
              </div>
              <div className="hidden sm:block">
                <span className="font-heading font-bold text-xl uppercase tracking-tight">
                  {isAdminRoute ? 'LMS Admin' : 'LibraVault'}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {!isAdminRoute && publicLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`brutal-underline px-4 py-2 font-heading font-bold text-sm uppercase tracking-wider transition-colors
                    ${location.pathname === link.to
                      ? (scrolled ? 'text-brutal-coral' : isAdminRoute ? 'text-brutal-yellow' : 'text-brutal-coral')
                      : (scrolled ? 'text-brutal-black' : isAdminRoute && !scrolled ? 'text-white' : 'text-brutal-black')
                    }
                  `}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Auth Actions */}
            <div className="hidden lg:flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  {isAdmin && !isAdminRoute && (
                    <Link to="/admin/dashboard">
                      <Button variant="danger" size="sm" icon={<Shield size={16} />}>
                        Admin Panel
                      </Button>
                    </Link>
                  )}
                  {!isAdminRoute && (
                    <Link to="/user/notifications">
                      <button className="relative p-2 border-3 border-brutal-black bg-brutal-white shadow-brutal-sm hover:shadow-brutal transition-shadow" aria-label="Notifications">
                        <Bell size={20} />
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-brutal-coral border-2 border-brutal-black text-white text-[10px] font-bold flex items-center justify-center">
                          3
                        </span>
                      </button>
                    </Link>
                  )}
                  <Link to={isAdminRoute ? '/admin/dashboard' : '/user/profile'}>
                    <button className="flex items-center gap-2 p-2 border-3 border-brutal-black bg-brutal-yellow shadow-brutal-sm hover:shadow-brutal transition-shadow" aria-label="Profile">
                      <User size={20} />
                      <span className="font-heading font-bold text-sm uppercase hidden xl:block">
                        {user?.full_name?.split(' ')[0] || 'Profile'}
                      </span>
                    </button>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 border-3 border-brutal-black bg-brutal-coral text-white shadow-brutal-sm hover:shadow-brutal transition-shadow"
                    aria-label="Logout"
                  >
                    <LogOut size={20} />
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="outline" size="sm">Login</Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="primary" size="sm">Register</Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 border-3 border-brutal-black bg-brutal-yellow shadow-brutal-sm"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-brutal-black/50 z-[101] lg:hidden"
              onClick={closeMobileMenu}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 w-80 bg-brutal-white border-l-3 border-brutal-black z-[102] lg:hidden overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <span className="font-heading font-bold text-xl uppercase">Menu</span>
                  <button
                    onClick={closeMobileMenu}
                    className="p-2 border-3 border-brutal-black bg-brutal-coral text-white shadow-brutal-sm"
                    aria-label="Close menu"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-2">
                  {publicLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`block px-4 py-3 font-heading font-bold uppercase border-3 border-brutal-black shadow-brutal-sm
                        ${location.pathname === link.to ? 'bg-brutal-yellow' : 'bg-brutal-white hover:bg-brutal-gray'}
                      `}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                <div className="mt-8 space-y-3">
                  {isAuthenticated ? (
                    <>
                      <Link to={isAdmin ? '/admin/dashboard' : '/user/dashboard'}>
                        <Button fullWidth icon={<User size={18} />}>Dashboard</Button>
                      </Link>
                      <Button fullWidth variant="danger" onClick={handleLogout} icon={<LogOut size={18} />}>
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link to="/login"><Button fullWidth variant="outline">Login</Button></Link>
                      <Link to="/register"><Button fullWidth>Register</Button></Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className="h-16 sm:h-20" />
    </>
  );
}
