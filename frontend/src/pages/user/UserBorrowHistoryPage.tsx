import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Clock } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { borrowalApi } from '../../services/api';

export default function UserBorrowHistoryPage() {
  const historyQuery = useQuery({
    queryKey: ['borrowals', 'mine'],
    queryFn: () => borrowalApi.getMyBorrowals(),
  });

  const items = historyQuery.data || [];

  return (
    <>
      <Helmet><title>Borrow History — LibraVault</title></Helmet>
      <div className="mb-6">
        <Badge variant="blue" size="md" className="mb-2">Activity</Badge>
        <h1 className="font-heading font-bold text-3xl uppercase">Borrow History</h1>
      </div>

      {historyQuery.isLoading ? (
        <Card color="white" padding="lg" hoverable={false}>
          <p className="font-heading font-bold uppercase">Loading…</p>
        </Card>
      ) : historyQuery.isError ? (
        <Card color="coral" padding="lg" hoverable={false}>
          <p className="font-heading font-bold uppercase text-white">Failed to load borrow history.</p>
        </Card>
      ) : items.length === 0 ? (
        <Card color="yellow" padding="lg" hoverable={false}>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-brutal-white border-3 border-brutal-black shadow-brutal-sm">
              <Clock size={20} />
            </div>
            <div>
              <p className="font-heading font-bold uppercase">No borrowals yet</p>
              <p className="text-sm text-brutal-dark-gray">Borrow a book to see it appear here.</p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((b: any) => (
            <Card key={b.id} color="white" padding="md" hoverable={false}>
              <p className="font-heading font-bold uppercase">{b.books?.title || b.book?.title || 'Borrowal'}</p>
              <p className="text-sm text-brutal-dark-gray">
                Status: <span className="font-bold">{b.status || '—'}</span>
              </p>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

