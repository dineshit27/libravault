import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Pencil, Plus } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { bookApi } from '../../services/api';

export default function AdminBooksPage() {
  const navigate = useNavigate();

  const booksQuery = useQuery({
    queryKey: ['admin', 'books'],
    queryFn: () => bookApi.getAll(),
  });

  const items = booksQuery.data?.data || [];

  return (
    <>
      <Helmet><title>Books - Admin - LibraVault</title></Helmet>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <Badge variant="blue" size="md" className="mb-2">Admin</Badge>
          <h1 className="font-heading font-bold text-3xl uppercase">Books</h1>
        </div>
        <Button icon={<Plus size={18} />} onClick={() => navigate('/admin/books/new')}>
          Add Book
        </Button>
      </div>

      {booksQuery.isLoading ? (
        <Card color="white" padding="lg" hoverable={false}>
          <p className="font-heading font-bold uppercase">Loading books...</p>
        </Card>
      ) : booksQuery.isError ? (
        <Card color="coral" padding="lg" hoverable={false}>
          <p className="font-heading font-bold uppercase text-white">Failed to load books.</p>
        </Card>
      ) : items.length === 0 ? (
        <Card color="yellow" padding="lg" hoverable={false}>
          <div className="flex items-center gap-3">
            <BookOpen size={20} />
            <p className="font-heading font-bold uppercase">No books found</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((book) => (
            <Card key={book.id} color="white" padding="md" hoverable={false}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-heading font-bold uppercase">{book.title}</p>
                  <p className="text-sm text-brutal-dark-gray">{book.author}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  icon={<Pencil size={14} />}
                  onClick={() => navigate(`/admin/books/${book.id}/edit`)}
                >
                  Edit
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
