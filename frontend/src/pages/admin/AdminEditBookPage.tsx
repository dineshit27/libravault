import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { isAxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { bookApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function AdminEditBookPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const bookQuery = useQuery({
    queryKey: ['admin', 'book', id],
    queryFn: () => bookApi.getById(id as string),
    enabled: Boolean(id),
  });

  useEffect(() => {
    if (!bookQuery.data) return;
    setTitle(bookQuery.data.title || '');
    setAuthor(bookQuery.data.author || '');
    setIsbn(bookQuery.data.isbn || '');
    setCoverUrl(bookQuery.data.cover_url || '');
  }, [bookQuery.data]);

  const onSave = async () => {
    if (!id) return;

    if (!title.trim() || !author.trim()) {
      toast.error('Title and author are required.');
      return;
    }

    if (user?.id?.startsWith('guest-')) {
      toast.error('Guest mode is read-only. Sign in with a real admin account to edit books.');
      return;
    }

    setIsSaving(true);
    try {
      await bookApi.update(id, {
        title: title.trim(),
        author: author.trim(),
        isbn: isbn.trim(),
        cover_url: coverUrl.trim() || null,
      });
      toast.success('Book updated.');
      navigate('/admin/books');
    } catch (e: unknown) {
      if (isAxiosError(e) && e.response?.status === 401) {
        const message = (e.response.data as { error?: string } | undefined)?.error;
        toast.error(message || 'Unauthorized. Please sign in again with an admin account.');
      } else if (isAxiosError(e)) {
        const message = (e.response?.data as { error?: string } | undefined)?.error;
        toast.error(message || e.message || 'Failed to update book.');
      } else {
        toast.error('Failed to update book.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!id) {
    return (
      <Card color="coral" padding="lg" hoverable={false}>
        <p className="font-heading font-bold uppercase text-white">Invalid book id.</p>
      </Card>
    );
  }

  if (bookQuery.isLoading) {
    return (
      <Card color="white" padding="lg" hoverable={false}>
        <p className="font-heading font-bold uppercase">Loading book...</p>
      </Card>
    );
  }

  if (bookQuery.isError || !bookQuery.data) {
    return (
      <Card color="coral" padding="lg" hoverable={false}>
        <p className="font-heading font-bold uppercase text-white">Failed to load this book.</p>
      </Card>
    );
  }

  return (
    <>
      <Helmet><title>Edit Book — Admin — LibraVault</title></Helmet>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <Badge variant="blue" size="md" className="mb-2">Admin</Badge>
          <h1 className="font-heading font-bold text-3xl uppercase">Edit Book</h1>
        </div>
        <Button variant="outline" icon={<ArrowLeft size={18} />} onClick={() => navigate('/admin/books')}>
          Back to Books
        </Button>
      </div>

      <Card color="white" padding="lg" hoverable={false}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Book title" />
          <Input label="Author" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author name" />
          <Input label="ISBN (optional)" value={isbn} onChange={(e) => setIsbn(e.target.value)} placeholder="978-..." />
          <Input
            label="Image Link (optional)"
            type="url"
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            placeholder="https://example.com/book-cover.jpg"
          />
        </div>
        <div className="mt-6">
          <Button onClick={onSave} isLoading={isSaving} icon={<Save size={18} />}>
            Save Changes
          </Button>
        </div>
      </Card>
    </>
  );
}
