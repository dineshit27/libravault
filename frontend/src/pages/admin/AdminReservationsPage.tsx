import { useMutation, useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { reservationApi } from '../../services/api';

export default function AdminReservationsPage() {
  const reservationsQuery = useQuery({
    queryKey: ['admin', 'reservations'],
    queryFn: () => reservationApi.getAll(),
  });

  const fulfillReservation = useMutation({
    mutationFn: (id: string) => reservationApi.fulfill(id),
    onSuccess: async () => {
      toast.success('Reservation fulfilled.');
      await reservationsQuery.refetch();
    },
    onError: () => toast.error('Failed to fulfill reservation.'),
  });

  const expireReservation = useMutation({
    mutationFn: (id: string) => reservationApi.expire(id),
    onSuccess: async () => {
      toast.success('Reservation expired.');
      await reservationsQuery.refetch();
    },
    onError: () => toast.error('Failed to expire reservation.'),
  });

  const items = reservationsQuery.data || [];

  return (
    <>
      <Helmet><title>Reservations - Admin - LibraVault</title></Helmet>
      <div className="mb-6">
        <Badge variant="blue" size="md" className="mb-2">Admin</Badge>
        <h1 className="font-heading font-bold text-3xl uppercase">Reservations</h1>
      </div>

      {reservationsQuery.isLoading ? (
        <Card color="white" padding="lg" hoverable={false}>
          <p className="font-heading font-bold uppercase">Loading...</p>
        </Card>
      ) : reservationsQuery.isError ? (
        <Card color="coral" padding="lg" hoverable={false}>
          <p className="font-heading font-bold uppercase text-white">Failed to load reservations.</p>
        </Card>
      ) : items.length === 0 ? (
        <Card color="green" padding="lg" hoverable={false}>
          <p className="font-heading font-bold uppercase">No reservations found.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item: any) => (
            <Card key={item.id} color="white" padding="md" hoverable={false}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-heading font-bold uppercase">{item.book?.title || 'Reserved Book'}</p>
                  <p className="text-sm text-brutal-dark-gray">
                    User: <span className="font-bold">{item.user?.full_name || item.user_id || '-'}</span>
                  </p>
                  <p className="text-sm text-brutal-dark-gray">
                    Status: <span className="font-bold uppercase">{item.status || '-'}</span>
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => fulfillReservation.mutate(item.id)}
                    isLoading={fulfillReservation.isPending}
                  >
                    Fulfill
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => expireReservation.mutate(item.id)}
                    isLoading={expireReservation.isPending}
                  >
                    Expire
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
