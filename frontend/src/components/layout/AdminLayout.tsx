import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, Users, ArrowLeftRight,
  Bookmark, DollarSign, Megaphone, BarChart3,
  Settings, Shield, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import Navbar from './Navbar';

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/books', label: 'Books', icon: BookOpen },
  { to: '/admin/members', label: 'Members', icon: Users },
  { to: '/admin/borrowals', label: 'Borrowals', icon: ArrowLeftRight },
  { to: '/admin/reservations', label: 'Reservations', icon: Bookmark },
  { to: '/admin/fines', label: 'Fines', icon: DollarSign },
  { to: '/admin/announcements', label: 'Announcements', icon: Megaphone },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
  { to: '/admin/staff', label: 'Staff', icon: Shield },
];

export default function AdminLayout() {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-brutal-gray">
      <Navbar />
      <div className="flex">
        {/* Sidebar */}
        <motion.aside
          animate={{ width: sidebarOpen ? 260 : 68 }}
          transition={{ duration: 0.2 }}
          className="fixed left-0 top-16 sm:top-20 bottom-0 bg-brutal-black border-r-3 border-brutal-yellow z-50 overflow-hidden"
        >
          <div className="flex flex-col h-full">
            <div className="p-3">
              <button
                onClick={toggleSidebar}
                className="w-full flex items-center justify-center p-2 border-2 border-brutal-yellow text-brutal-yellow hover:bg-brutal-yellow hover:text-brutal-black transition-colors"
                aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              >
                {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
              </button>
            </div>

            <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto">
              {adminLinks.map((link) => {
                const isActive = location.pathname === link.to || location.pathname.startsWith(link.to + '/');
                const Icon = link.icon;

                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-3 px-3 py-2.5 transition-all duration-150 border-2
                      ${isActive
                        ? 'bg-brutal-coral text-white border-brutal-coral shadow-brutal-sm'
                        : 'text-brutal-gray border-transparent hover:bg-brutal-dark-gray hover:border-brutal-yellow'
                      }
                    `}
                    title={!sidebarOpen ? link.label : undefined}
                  >
                    <Icon size={20} className="shrink-0" />
                    {sidebarOpen && (
                      <span className="font-heading font-bold text-sm uppercase tracking-wider whitespace-nowrap">
                        {link.label}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main
          className="flex-1 transition-all duration-200 min-h-[calc(100vh-5rem)]"
          style={{ marginLeft: sidebarOpen ? 260 : 68 }}
        >
          <div className="p-6 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
