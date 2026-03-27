import { useMutation, useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { BookOpen, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { readingListApi } from '../../services/api';

export default function UserReadingListPage() {
  const listQuery = useQuery({
    queryKey: ['reading-list'],
    queryFn: () => readingListApi.getMine(),
  });

  const remove = useMutation({
    mutationFn: (id: string) => readingListApi.remove(id),
    onSuccess: async () => {
      toast.success('Removed from reading list.');
      await listQuery.refetch();
    },
    onError: () => toast.error('Failed to remove item.'),
  });

  const items = listQuery.data || [];

  return (
    <>
      <Helmet><title>Reading List — LibraVault</title></Helmet>
      <div className="mb-6">
        <Badge variant="blue" size="md" className="mb-2">Personal</Badge>
        <h1 className="font-heading font-bold text-3xl uppercase">My Reading List</h1>
      </div>

      {listQuery.isLoading ? (
        <Card color="white" padding="lg" hoverable={false}>
          <p className="font-heading font-bold uppercase">Loading…</p>
        </Card>
      ) : listQuery.isError ? (
        <Card color="coral" padding="lg" hoverable={false}>
          <p className="font-heading font-bold uppercase text-white">Failed to load reading list.</p>
        </Card>
      ) : items.length === 0 ? (
        <Card color="yellow" padding="lg" hoverable={false}>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-brutal-white border-3 border-brutal-black shadow-brutal-sm">
              <BookOpen size={20} />
            </div>
            <div>
              <p className="font-heading font-bold uppercase">Nothing here yet</p>
              <p className="text-sm text-brutal-dark-gray">Tap the heart on a book to add it.</p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item: any) => (
            <Card key={item.id} color="white" padding="md" hoverable={false}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-heading font-bold uppercase">{item.books?.title || item.book?.title || 'Book'}</p>
                  <p className="text-sm text-brutal-dark-gray">{item.books?.author || item.book?.author || ''}</p>
                </div>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => remove.mutate(item.id)}
                  isLoading={remove.isPending}
                  icon={<Trash2 size={16} />}
                >
                  Remove
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

