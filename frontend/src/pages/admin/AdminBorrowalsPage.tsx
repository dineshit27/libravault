import { useMutation, useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { borrowalApi } from '../../services/api';

export default function AdminBorrowalsPage() {
  const reqQuery = useQuery({
    queryKey: ['admin', 'borrowals', 'pending'],
    queryFn: () => borrowalApi.getAll({ status: 'pending' }),
  });

  const approve = useMutation({
    mutationFn: (id: string) => borrowalApi.approve(id),
    onSuccess: async () => {
      toast.success('Approved.');
      await reqQuery.refetch();
    },
    onError: () => toast.error('Failed to approve.'),
  });

  const reject = useMutation({
    mutationFn: (id: string) => borrowalApi.reject(id),
    onSuccess: async () => {
      toast.success('Rejected.');
      await reqQuery.refetch();
    },
    onError: () => toast.error('Failed to reject.'),
  });

  const items = (reqQuery.data as any)?.data || (reqQuery.data as any) || [];

  return (
    <>
      <Helmet><title>Borrowals - Admin - LibraVault</title></Helmet>
      <div className="mb-6">
        <Badge variant="blue" size="md" className="mb-2">Admin</Badge>
        <h1 className="font-heading font-bold text-3xl uppercase">Borrowals</h1>
      </div>

      {reqQuery.isLoading ? (
        <Card color="white" padding="lg" hoverable={false}>
          <p className="font-heading font-bold uppercase">Loading...</p>
        </Card>
      ) : reqQuery.isError ? (
        <Card color="coral" padding="lg" hoverable={false}>
          <p className="font-heading font-bold uppercase text-white">Failed to load borrowals.</p>
        </Card>
      ) : items.length === 0 ? (
        <Card color="green" padding="lg" hoverable={false}>
          <p className="font-heading font-bold uppercase">No pending requests.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((r: any) => (
            <Card key={r.id} color="white" padding="md" hoverable={false}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-heading font-bold uppercase">{r.books?.title || 'Request'}</p>
                  <p className="text-sm text-brutal-dark-gray">User: <span className="font-bold">{r.user_id || '-'}</span></p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="success" onClick={() => approve.mutate(r.id)} isLoading={approve.isPending}>Approve</Button>
                  <Button size="sm" variant="danger" onClick={() => reject.mutate(r.id)} isLoading={reject.isPending}>Reject</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
