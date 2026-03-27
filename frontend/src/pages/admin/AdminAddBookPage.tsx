import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { BookPlus } from 'lucide-react';
import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { bookApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function AdminAddBookPage() {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const user = useAuthStore((state) => state.user);

  const onCreate = async () => {
    if (!title.trim() || !author.trim()) {
      toast.error('Title and author are required.');
      return;
    }

    if (user?.id?.startsWith('guest-')) {
      toast.error('Guest mode is read-only. Sign in with a real admin account to add books.');
      return;
    }

    setIsSaving(true);
    try {
      await bookApi.create({
        title,
        author,
        isbn,
        cover_url: coverUrl.trim() || null,
      });
      toast.success('Book created.');
      setTitle('');
      setAuthor('');
      setIsbn('');
      setCoverUrl('');
    } catch (e: unknown) {
      if (isAxiosError(e) && e.response?.status === 401) {
        const message = (e.response.data as { error?: string } | undefined)?.error;
        toast.error(message || 'Unauthorized. Please sign in again with an admin account.');
      } else if (isAxiosError(e)) {
        const message = (e.response?.data as { error?: string } | undefined)?.error;
        toast.error(message || e.message || 'Failed to create book.');
      } else {
        toast.error('Failed to create book.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Helmet><title>Add Book — Admin — LibraVault</title></Helmet>
      <div className="mb-6">
        <Badge variant="blue" size="md" className="mb-2">Admin</Badge>
        <h1 className="font-heading font-bold text-3xl uppercase">Add Book</h1>
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
          <Button onClick={onCreate} isLoading={isSaving} icon={<BookPlus size={18} />}>
            Create Book
          </Button>
        </div>
      </Card>
    </>
  );
}

