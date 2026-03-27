import { useMutation, useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { fineApi } from '../../services/api';

export default function AdminFinesPage() {
  const finesQuery = useQuery({
    queryKey: ['admin', 'fines'],
    queryFn: () => fineApi.getAll(),
  });

  const waiveFine = useMutation({
    mutationFn: (id: string) => fineApi.waive(id, 'Waived by admin'),
    onSuccess: async () => {
      toast.success('Fine waived.');
      await finesQuery.refetch();
    },
    onError: () => toast.error('Failed to waive fine.'),
  });

  const items = finesQuery.data || [];

  return (
    <>
      <Helmet><title>Fines - Admin - LibraVault</title></Helmet>
      <div className="mb-6">
        <Badge variant="blue" size="md" className="mb-2">Admin</Badge>
        <h1 className="font-heading font-bold text-3xl uppercase">Fines</h1>
      </div>

      {finesQuery.isLoading ? (
        <Card color="white" padding="lg" hoverable={false}>
          <p className="font-heading font-bold uppercase">Loading...</p>
        </Card>
      ) : finesQuery.isError ? (
        <Card color="coral" padding="lg" hoverable={false}>
          <p className="font-heading font-bold uppercase text-white">Failed to load fines.</p>
        </Card>
      ) : items.length === 0 ? (
        <Card color="green" padding="lg" hoverable={false}>
          <p className="font-heading font-bold uppercase">No fines found.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item: any) => (
            <Card key={item.id} color="white" padding="md" hoverable={false}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-heading font-bold uppercase">{item.user?.full_name || item.user_id || 'Member Fine'}</p>
                  <p className="text-sm text-brutal-dark-gray">
                    Amount: <span className="font-bold">${Number(item.amount || 0).toFixed(2)}</span>
                  </p>
                  <p className="text-sm text-brutal-dark-gray">
                    Status: <span className="font-bold uppercase">{item.status || '-'}</span>
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => waiveFine.mutate(item.id)}
                  isLoading={waiveFine.isPending}
                  disabled={item.status === 'waived' || item.status === 'paid'}
                >
                  Waive
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
