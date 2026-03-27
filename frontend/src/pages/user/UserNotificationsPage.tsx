import { useMutation, useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Bell, CheckCircle, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { notificationApi } from '../../services/api';

export default function UserNotificationsPage() {
  const notificationsQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.getMine(),
  });

  const markAllRead = useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: async () => {
      toast.success('Marked all as read.');
      await notificationsQuery.refetch();
    },
    onError: () => toast.error('Failed to mark all as read.'),
  });

  const markRead = useMutation({
    mutationFn: (id: string) => notificationApi.markRead(id),
    onSuccess: async () => {
      toast.success('Marked as read.');
      await notificationsQuery.refetch();
    },
    onError: () => toast.error('Failed to mark as read.'),
  });

  const del = useMutation({
    mutationFn: (id: string) => notificationApi.delete(id),
    onSuccess: async () => {
      toast.success('Deleted.');
      await notificationsQuery.refetch();
    },
    onError: () => toast.error('Failed to delete notification.'),
  });

  const items = notificationsQuery.data || [];

  return (
    <>
      <Helmet><title>Notifications — LibraVault</title></Helmet>

      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <Badge variant="blue" size="md" className="mb-2">Inbox</Badge>
          <h1 className="font-heading font-bold text-3xl uppercase">Notifications</h1>
        </div>
        <Button
          variant="outline"
          onClick={() => markAllRead.mutate()}
          isLoading={markAllRead.isPending}
          icon={<CheckCircle size={18} />}
        >
          Mark all read
        </Button>
      </div>

      {notificationsQuery.isLoading ? (
        <Card color="white" padding="lg" hoverable={false}>
          <p className="font-heading font-bold uppercase">Loading…</p>
        </Card>
      ) : notificationsQuery.isError ? (
        <Card color="coral" padding="lg" hoverable={false}>
          <p className="font-heading font-bold uppercase text-white">Failed to load notifications.</p>
          <p className="text-white/90 text-sm mt-1">
            Make sure the Node backend is running and you are logged in.
          </p>
        </Card>
      ) : items.length === 0 ? (
        <Card color="yellow" padding="lg" hoverable={false}>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-brutal-white border-3 border-brutal-black shadow-brutal-sm">
              <Bell size={20} />
            </div>
            <div>
              <p className="font-heading font-bold uppercase">No notifications</p>
              <p className="text-sm text-brutal-dark-gray">You’re all caught up.</p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((n) => (
            <Card key={n.id} color="white" padding="md" hoverable={false}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-heading font-bold uppercase">{(n as any).title || 'Notification'}</p>
                  <p className="text-sm text-brutal-dark-gray">
                    {(n as any).message || (n as any).content || '—'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => markRead.mutate(n.id)}
                    isLoading={markRead.isPending}
                    icon={<CheckCircle size={16} />}
                  >
                    Read
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => del.mutate(n.id)}
                    isLoading={del.isPending}
                    icon={<Trash2 size={16} />}
                  >
                    Delete
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

