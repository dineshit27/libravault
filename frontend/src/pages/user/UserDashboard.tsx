import { motion } from 'framer-motion';
import { BookOpen, Clock, AlertTriangle, Calendar, Award } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { borrowalApi } from '../../services/api';

export default function UserDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const borrowalsQuery = useQuery({
    queryKey: ['user', 'borrowals', 'me'],
    queryFn: () => borrowalApi.getMyBorrowals(),
  });

  const activeBorrowals = (borrowalsQuery.data || []).filter((b: any) =>
    b?.status === 'borrowed' || b?.status === 'overdue'
  );

  const overdueCount = activeBorrowals.filter((b: any) => {
    if (b?.status === 'overdue') return true;
    const due = b?.due_date ? new Date(b.due_date) : null;
    return due ? due.getTime() < Date.now() : false;
  }).length;

  const handleRenew = async (borrowalId: string) => {
    try {
      await borrowalApi.renew(borrowalId);
      toast.success('Renewal requested.');
      await borrowalsQuery.refetch();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to renew.');
    }
  };

  const handleReturn = async (borrowalId: string) => {
    try {
      await borrowalApi.return(borrowalId, 'good');
      toast.success('Return initiated.');
      await borrowalsQuery.refetch();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to return.');
    }
  };

  return (
    <>
      <Helmet><title>Dashboard — LibraVault</title></Helmet>

      {/* Welcome Banner */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <Card color="yellow" padding="lg" hoverable={false}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-brutal-white border-3 border-brutal-black shadow-brutal-sm flex items-center justify-center font-heading font-bold text-4xl uppercase">
                {user?.full_name?.[0] || 'U'}
              </div>
              <div>
                <h1 className="font-heading font-bold text-3xl uppercase mb-1">Welcome back, {user?.full_name?.split(' ')[0]}</h1>
                <div className="flex items-center gap-3">
                  <Badge variant="black">Member #{user?.membership_number || '12345'}</Badge>
                  <span className="text-sm font-bold text-brutal-dark-gray">Active since {user?.created_at?.split('T')[0] || '2024'}</span>
                </div>
              </div>
            </div>
            <div className="text-center sm:text-right">
              <p className="font-heading font-bold text-sm uppercase text-brutal-dark-gray mb-1">Total Books Read</p>
              <p className="font-heading font-bold text-4xl">42</p>
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Activity */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Currently Borrowed */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-2xl uppercase border-b-3 border-brutal-black pb-2 flex-1">Currently Borrowed</h2>
            </div>

            {borrowalsQuery.isLoading ? (
              <Card color="white" padding="lg" hoverable={false}>
                <p className="font-heading font-bold uppercase">Loading...</p>
              </Card>
            ) : borrowalsQuery.isError ? (
              <Card color="coral" padding="lg" hoverable={false}>
                <p className="font-heading font-bold uppercase text-white">Failed to load your borrowals.</p>
              </Card>
            ) : activeBorrowals.length === 0 ? (
              <Card color="green" padding="lg" hoverable={false}>
                <p className="font-heading font-bold uppercase">No active borrowals.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {activeBorrowals.map((borrowal: any, i: number) => {
                  const title = borrowal?.book?.title || borrowal?.books?.title || 'Book';
                  const author = borrowal?.book?.author || borrowal?.books?.author || 'Unknown author';
                  const dueIso = borrowal?.due_date;
                  const dueDate = dueIso ? new Date(dueIso) : null;
                  const dueText = dueDate ? dueDate.toISOString().slice(0, 10) : '-';
                  const isOverdue = borrowal?.status === 'overdue' || (dueDate ? dueDate.getTime() < Date.now() : false);

                  return (
                    <motion.div key={borrowal.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                      <Card color="white" padding="md">
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="w-16 h-24 bg-brutal-gray border-2 border-brutal-black flex items-center justify-center shrink-0">
                              <BookOpen size={24} className="text-brutal-dark-gray" />
                            </div>
                            <div>
                              <Badge variant={isOverdue ? 'coral' : 'green'} size="sm" className="mb-2">
                                {isOverdue ? 'Overdue' : 'Borrowed'}
                              </Badge>
                              <h3 className="font-heading font-bold text-lg uppercase leading-tight">{title}</h3>
                              <p className="text-sm text-brutal-dark-gray mb-2">{author}</p>
                              <div className="flex items-center gap-2 text-sm font-bold">
                                <Calendar size={14} className={isOverdue ? 'text-brutal-coral' : ''} />
                                <span className={isOverdue ? 'text-brutal-coral' : ''}>Due: {dueText}</span>
                              </div>
                            </div>
                          </div>
                          <div className="w-full sm:w-auto flex flex-col gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleRenew(borrowal.id)}>Renew</Button>
                            <Button variant="primary" size="sm" onClick={() => handleReturn(borrowal.id)}>Return</Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Right Column - Widgets */}
        <div className="space-y-6">
          <Card color="black" padding="lg">
            <h3 className="font-heading font-bold text-xl uppercase mb-4 text-brutal-yellow">Action Center</h3>
            {overdueCount > 0 ? (
              <div className="bg-brutal-coral border-2 border-white p-4 text-white mb-4">
                <div className="flex items-center gap-2 mb-2 font-bold uppercase text-sm"><AlertTriangle size={16} /> Overdue Items</div>
                <p className="text-sm mb-3">You have {overdueCount} overdue items with pending fines.</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white border-white hover:bg-transparent hover:text-white w-full"
                  onClick={() => navigate('/user/fines')}
                >
                  Pay Fines
                </Button>
              </div>
            ) : (
              <div className="bg-brutal-green border-2 border-brutal-black p-4 text-brutal-black mb-4 font-bold">
                No overdue items! Great job.
              </div>
            )}
            <div className="space-y-2">
              <Button
                fullWidth
                variant="ghost"
                className="text-white hover:bg-brutal-dark-gray justify-start"
                icon={<BookOpen size={18} />}
                onClick={() => navigate('/user/reading-list')}
              >
                My Reading List
              </Button>
              <Button
                fullWidth
                variant="ghost"
                className="text-white hover:bg-brutal-dark-gray justify-start"
                icon={<Clock size={18} />}
                onClick={() => navigate('/user/borrow-history')}
              >
                Borrow History
              </Button>
              <Button
                fullWidth
                variant="ghost"
                className="text-white hover:bg-brutal-dark-gray justify-start"
                icon={<Award size={18} />}
                onClick={() => navigate('/user/reviews')}
              >
                My Reviews
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
