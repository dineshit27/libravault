import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Star } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

export default function UserReviewsPage() {
  const reviewsQuery = useQuery({
    queryKey: ['reviews', 'mine'],
    queryFn: async () => {
      // No dedicated "mine" endpoint in api.ts; fall back to empty list gracefully.
      // If you add an endpoint later, swap it in here.
      return [] as any[];
    },
  });

  const items = reviewsQuery.data || [];

  return (
    <>
      <Helmet><title>My Reviews — LibraVault</title></Helmet>
      <div className="mb-6">
        <Badge variant="blue" size="md" className="mb-2">Community</Badge>
        <h1 className="font-heading font-bold text-3xl uppercase">My Reviews</h1>
      </div>

      {reviewsQuery.isLoading ? (
        <Card color="white" padding="lg" hoverable={false}>
          <p className="font-heading font-bold uppercase">Loading…</p>
        </Card>
      ) : items.length === 0 ? (
        <Card color="yellow" padding="lg" hoverable={false}>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-brutal-white border-3 border-brutal-black shadow-brutal-sm">
              <Star size={20} />
            </div>
            <div>
              <p className="font-heading font-bold uppercase">No reviews yet</p>
              <p className="text-sm text-brutal-dark-gray">Review a book to see it here.</p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((r: any) => (
            <Card key={r.id} color="white" padding="md" hoverable={false}>
              <p className="font-heading font-bold uppercase">{r.books?.title || 'Book'}</p>
              <p className="text-sm text-brutal-dark-gray">{r.content || r.comment || '—'}</p>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

