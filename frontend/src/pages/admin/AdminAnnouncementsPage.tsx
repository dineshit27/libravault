import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input, { TextArea } from '../../components/ui/Input';
import { announcementApi } from '../../services/api';

export default function AdminAnnouncementsPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const announcementsQuery = useQuery({
    queryKey: ['admin', 'announcements'],
    queryFn: () => announcementApi.getAll(),
  });

  const createAnnouncement = useMutation({
    mutationFn: () => announcementApi.create({ title, content }),
    onSuccess: async () => {
      toast.success('Announcement published.');
      setTitle('');
      setContent('');
      await announcementsQuery.refetch();
    },
    onError: () => toast.error('Failed to publish announcement.'),
  });

  const deleteAnnouncement = useMutation({
    mutationFn: (id: string) => announcementApi.delete(id),
    onSuccess: async () => {
      toast.success('Announcement deleted.');
      await announcementsQuery.refetch();
    },
    onError: () => toast.error('Failed to delete announcement.'),
  });

  const toggleAnnouncement = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      announcementApi.update(id, { is_active: !isActive }),
    onSuccess: async () => {
      toast.success('Announcement updated.');
      await announcementsQuery.refetch();
    },
    onError: () => toast.error('Failed to update announcement.'),
  });

  const items = announcementsQuery.data || [];

  return (
    <>
      <Helmet><title>Announcements - Admin - LibraVault</title></Helmet>
      <div className="mb-6">
        <Badge variant="blue" size="md" className="mb-2">Admin</Badge>
        <h1 className="font-heading font-bold text-3xl uppercase">Announcements</h1>
      </div>

      <Card color="white" padding="lg" hoverable={false} className="mb-6">
        <div className="grid grid-cols-1 gap-4">
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Library notice title"
          />
          <TextArea
            label="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write announcement content"
            rows={4}
          />
          <div>
            <Button
              onClick={() => createAnnouncement.mutate()}
              isLoading={createAnnouncement.isPending}
              disabled={!title.trim() || !content.trim()}
            >
              Publish Announcement
            </Button>
          </div>
        </div>
      </Card>

      {announcementsQuery.isLoading ? (
        <Card color="white" padding="lg" hoverable={false}>
          <p className="font-heading font-bold uppercase">Loading...</p>
        </Card>
      ) : announcementsQuery.isError ? (
        <Card color="coral" padding="lg" hoverable={false}>
          <p className="font-heading font-bold uppercase text-white">Failed to load announcements.</p>
        </Card>
      ) : items.length === 0 ? (
        <Card color="green" padding="lg" hoverable={false}>
          <p className="font-heading font-bold uppercase">No announcements yet.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item: any) => (
            <Card key={item.id} color="white" padding="md" hoverable={false}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <p className="font-heading font-bold uppercase">{item.title}</p>
                  <p className="text-sm text-brutal-dark-gray mt-1">{item.content}</p>
                  <p className="text-xs text-brutal-dark-gray mt-2">
                    Status: <span className="font-bold uppercase">{item.is_active ? 'active' : 'inactive'}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleAnnouncement.mutate({ id: item.id, isActive: !!item.is_active })}
                    isLoading={toggleAnnouncement.isPending}
                  >
                    {item.is_active ? 'Disable' : 'Enable'}
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => deleteAnnouncement.mutate(item.id)}
                    isLoading={deleteAnnouncement.isPending}
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
