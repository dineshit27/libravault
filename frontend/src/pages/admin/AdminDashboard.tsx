import { motion } from 'framer-motion';
import { BookOpen, Users, TrendingUp, AlertCircle, DollarSign, Clock } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { borrowalApi } from '../../services/api';

const STATS = [
  { label: 'Total Books', value: '—', icon: BookOpen, color: 'white' },
  { label: 'Active Members', value: '—', icon: Users, color: 'white' },
  { label: 'Borrowed Today', value: '—', icon: TrendingUp, color: 'yellow' },
  { label: 'Overdue Items', value: '—', icon: AlertCircle, color: 'coral' },
  { label: 'Pending Requests', value: '—', icon: Clock, color: 'blue' },
  { label: 'Fines Collected', value: '—', icon: DollarSign, color: 'green' },
];

const RECENT_ACTIVITY = [
  { id: 1, action: 'Borrow Request', user: 'Emma T.', book: '1984 by George Orwell', time: '10 mins ago', status: 'pending' },
  { id: 2, action: 'Returned', user: 'Michael C.', book: 'The Great Gatsby', time: '1 hour ago', status: 'completed' },
  { id: 3, action: 'New Member', user: 'John D.', book: '', time: '2 hours ago', status: 'info' },
  { id: 4, action: 'Fine Paid', user: 'Sofia R.', book: '$5.50 for To Kill a Mockingbird', time: '3 hours ago', status: 'completed' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();

  const pendingQuery = useQuery({
    queryKey: ['admin', 'borrowals', 'pending', 'dashboard'],
    queryFn: () => borrowalApi.getAll({ status: 'pending', limit: '5' }),
  });

  const pendingItems = (pendingQuery.data as any)?.data || (pendingQuery.data as any) || [];
  const pendingCount = Number((pendingQuery.data as any)?.pagination?.total ?? pendingItems.length ?? 0);

  const stats = STATS.map((s) =>
    s.label === 'Pending Requests' ? { ...s, value: String(pendingCount) } : s
  );

  return (
    <>
      <Helmet><title>Admin Dashboard — LibraVault</title></Helmet>

      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <Badge variant="blue" size="md" className="mb-2">Admin Panel</Badge>
          <h1 className="font-heading font-bold text-3xl sm:text-4xl uppercase">Dashboard Overview</h1>
        </div>
        <div className="flex gap-3">
          <Button icon={<BookOpen size={18} />} onClick={() => navigate('/admin/books/new')}>Add Book</Button>
          <Button variant="secondary" icon={<Users size={18} />} onClick={() => navigate('/admin/members')}>Manage Members</Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card color={stat.color as any} padding="md" className="h-full">
              <div className="flex items-center gap-3 mb-3">
                <stat.icon size={20} className={stat.color === 'coral' || stat.color === 'blue' ? 'text-white' : 'text-brutal-black'} />
                <span className={`font-heading font-bold text-xs uppercase ${stat.color === 'coral' || stat.color === 'blue' ? 'text-white/80' : 'text-brutal-dark-gray'}`}>
                  {stat.label}
                </span>
              </div>
              <p className="font-heading font-bold text-3xl">{stat.value}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area - Charts & Tables */}
        <div className="lg:col-span-2 space-y-8">
          <Card color="white" padding="lg">
            <h2 className="font-heading font-bold text-xl uppercase border-b-3 border-brutal-black pb-2 mb-4">Pending Borrowal Requests</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-body">
                <thead>
                  <tr className="border-b-3 border-brutal-black uppercase text-sm font-bold bg-brutal-gray">
                    <th className="p-3">User</th>
                    <th className="p-3">Book</th>
                    <th className="p-3">Date</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingQuery.isLoading ? (
                    <tr>
                      <td className="p-3 font-bold" colSpan={4}>Loading...</td>
                    </tr>
                  ) : pendingQuery.isError ? (
                    <tr>
                      <td className="p-3 font-bold" colSpan={4}>Failed to load pending requests.</td>
                    </tr>
                  ) : pendingItems.length === 0 ? (
                    <tr>
                      <td className="p-3 font-bold" colSpan={4}>No pending requests.</td>
                    </tr>
                  ) : (
                    pendingItems.map((r: any) => (
                      <tr key={r.id} className="border-b-2 border-brutal-black hover:bg-brutal-yellow/20">
                        <td className="p-3 font-bold">{r.profiles?.full_name || r.profiles?.email || r.user_id || 'Member'}</td>
                        <td className="p-3">{r.books?.title || 'Request'}</td>
                        <td className="p-3 text-sm text-brutal-dark-gray">{typeof r.created_at === 'string' ? r.created_at.slice(0, 10) : '-'}</td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="success" onClick={() => navigate('/admin/requests')}>Approve</Button>
                            <Button size="sm" variant="danger" onClick={() => navigate('/admin/requests')}>Reject</Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-center">
              <Button variant="outline" fullWidth onClick={() => navigate('/admin/requests')}>View All Requests</Button>
            </div>
          </Card>
        </div>

        {/* Sidebar Area - Activity Feed */}
        <div className="space-y-8">
          <Card color="yellow" padding="lg">
            <h2 className="font-heading font-bold text-xl uppercase border-b-3 border-brutal-black pb-2 mb-4">Live Activity</h2>
            <div className="space-y-4">
              {RECENT_ACTIVITY.map((activity) => (
                <div key={activity.id} className="relative pl-6 border-l-3 border-brutal-black py-1">
                  <div className={`absolute left-[-11px] top-2 w-5 h-5 border-3 border-brutal-black rounded-full
                    ${activity.status === 'pending' ? 'bg-white' : activity.status === 'completed' ? 'bg-brutal-green' : 'bg-brutal-blue'}
                  `} />
                  <p className="font-heading font-bold uppercase text-sm">{activity.action}</p>
                  <p className="text-sm font-bold">{activity.user}</p>
                  {activity.book && <p className="text-sm border-l-3 border-brutal-black pl-2 ml-1 mt-1 text-brutal-dark-gray">{activity.book}</p>}
                  <p className="text-xs text-brutal-dark-gray mt-1">{activity.time}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
