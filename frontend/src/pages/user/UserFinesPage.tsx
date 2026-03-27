import { useMutation, useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { fineApi } from '../../services/api';

export default function UserFinesPage() {
  const finesQuery = useQuery({
    queryKey: ['fines', 'mine'],
    queryFn: () => fineApi.getMyFines(),
  });

  const pay = useMutation({
    mutationFn: (id: string) => fineApi.pay(id),
    onSuccess: async () => {
      toast.success('Fine paid.');
      await finesQuery.refetch();
    },
    onError: () => toast.error('Failed to pay fine.'),
  });

  const items = finesQuery.data || [];

  return (
    <>
      <Helmet><title>Fines — LibraVault</title></Helmet>
      <div className="mb-6">
        <Badge variant="blue" size="md" className="mb-2">Billing</Badge>
        <h1 className="font-heading font-bold text-3xl uppercase">My Fines</h1>
      </div>

      {finesQuery.isLoading ? (
        <Card color="white" padding="lg" hoverable={false}>
          <p className="font-heading font-bold uppercase">Loading…</p>
        </Card>
      ) : finesQuery.isError ? (
        <Card color="coral" padding="lg" hoverable={false}>
          <p className="font-heading font-bold uppercase text-white">Failed to load fines.</p>
        </Card>
      ) : items.length === 0 ? (
        <Card color="green" padding="lg" hoverable={false}>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-brutal-white border-3 border-brutal-black shadow-brutal-sm">
              <DollarSign size={20} />
            </div>
            <div>
              <p className="font-heading font-bold uppercase">No outstanding fines</p>
              <p className="text-sm text-brutal-dark-gray">You’re good to go.</p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((f: any) => (
            <Card key={f.id} color="white" padding="md" hoverable={false}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-heading font-bold uppercase">Fine</p>
                  <p className="text-sm text-brutal-dark-gray">
                    Amount: <span className="font-bold">${Number(f.amount || 0).toFixed(2)}</span>
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => pay.mutate(f.id)}
                  isLoading={pay.isPending}
                  icon={<DollarSign size={16} />}
                >
                  Pay
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

