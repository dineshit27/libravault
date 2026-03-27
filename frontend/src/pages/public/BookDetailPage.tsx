import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, BookOpen, Calendar, FileText, Globe, Users, ArrowLeft, Share2, Heart, Clock } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import { bookApi, borrowalApi, readingListApi, reservationApi, reviewApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { getApiErrorMessage } from '../../utils/helpers';
import { connectSocket, getSocket } from '../../lib/socket';

export default function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const [myRating, setMyRating] = useState<number>(5);
  const [myText, setMyText] = useState<string>('');

  const bookQuery = useQuery({
    queryKey: ['public', 'book', id],
    queryFn: async () => {
      if (!id) throw new Error('Book id is missing');
      return bookApi.getById(id);
    },
    enabled: !!id,
  });

  const book = bookQuery.data;

  const reviewsQuery = useQuery({
    queryKey: ['public', 'book', id, 'reviews'],
    queryFn: async () => {
      if (!id) throw new Error('Book id is missing');
      return reviewApi.getByBook(id);
    },
    enabled: !!id,
  });

  const reviews = useMemo(() => (Array.isArray(reviewsQuery.data) ? reviewsQuery.data : []), [reviewsQuery.data]);

  const isAvailable = (book?.available_copies || 0) > 0;
  const ensureAuth = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to continue.');
      navigate('/login', { state: { from: `/books/${id}` } });
      return false;
    }
    return true;
  };

  const handlePrimaryAction = async () => {
    if (!book) return;
    if (!ensureAuth()) return;
    try {
      if (isAvailable) {
        await borrowalApi.request(book.id);
        toast.success('Borrow request sent.');
      } else {
        await reservationApi.create(book.id);
        toast.success('Reserved.');
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['public', 'book', book.id] }),
        queryClient.invalidateQueries({ queryKey: ['public', 'books'] }),
      ]);
    } catch (e: unknown) {
      toast.error(getApiErrorMessage(e, 'Action failed.'));
    }
  };

  const handleFavorite = async () => {
    if (!book) return;
    if (!ensureAuth()) return;
    try {
      await readingListApi.add(book.id);
      toast.success('Added to reading list.');
    } catch (e: unknown) {
      toast.error(getApiErrorMessage(e, 'Failed to add to reading list.'));
    }
  };

  const handleSubmitReview = async () => {
    if (!id) return;
    if (!ensureAuth()) return;
    try {
      await reviewApi.create({ book_id: id, rating: myRating, review_text: myText });
      toast.success('Review submitted.');
      setMyText('');
      await queryClient.invalidateQueries({ queryKey: ['public', 'book', id, 'reviews'] });
    } catch (e: unknown) {
      toast.error(getApiErrorMessage(e, 'Failed to submit review.'));
    }
  };

  useEffect(() => {
    if (!id) return;
    connectSocket();
    const socket = getSocket();
    const onBookRequested = (event: { bookId?: string }) => {
      if (event?.bookId === id) {
        queryClient.invalidateQueries({ queryKey: ['public', 'book', id] });
      }
      queryClient.invalidateQueries({ queryKey: ['public', 'books'] });
    };
    socket.on('book_requested', onBookRequested);
    return () => {
      socket.off('book_requested', onBookRequested);
    };
  }, [id, queryClient]);

  if (bookQuery.isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card color="white" padding="lg">
          <p className="font-heading font-bold uppercase">Loading book details...</p>
        </Card>
      </div>
    );
  }

  if (bookQuery.isError || !book) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card color="coral" padding="lg">
          <p className="font-heading font-bold uppercase text-white">Book not found or failed to load.</p>
        </Card>
      </div>
    );
  }

  const safeTitle = book.title || 'Book';
  const safeAuthor = book.author || 'Unknown author';
  const safeDescription = (book.description ?? '').toString();
  const safeRating = Number.isFinite(Number(book.average_rating)) ? Number(book.average_rating) : 0;
  const safeBorrowCount = Number.isFinite(Number(book.borrow_count)) ? Number(book.borrow_count) : 0;
  const safeTotalCopies = Number.isFinite(Number(book.total_copies)) ? Number(book.total_copies) : 0;
  const safeAvailableCopies = Number.isFinite(Number(book.available_copies)) ? Number(book.available_copies) : 0;

  return (
    <>
      <Helmet>
        <title>{safeTitle} — LibraVault</title>
        <meta name="description" content={`${safeTitle} by ${safeAuthor}. ${safeDescription.slice(0, 150)}`} />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/books" className="inline-flex items-center gap-2 font-heading font-bold text-sm uppercase mb-6 hover:text-brutal-coral">
          <ArrowLeft size={16} /> Back to Catalog
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
            <div className="border-3 border-brutal-black shadow-brutal-lg overflow-hidden sticky top-24">
              <div className="aspect-[3/4] bg-brutal-gray">
                {book.cover_url ? (
                  <img src={book.cover_url} alt={safeTitle} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brutal-yellow to-brutal-coral">
                    <BookOpen size={64} className="text-brutal-black opacity-50" />
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2">
            <Badge variant="blue" color={book.genre?.color} className="mb-3">{book.genre?.name || 'General'}</Badge>
            <h1 className="font-heading font-bold text-3xl sm:text-5xl uppercase leading-tight mb-2">{safeTitle}</h1>
            <p className="text-xl text-brutal-dark-gray mb-4">by {safeAuthor}</p>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex gap-1">
                {[1,2,3,4,5].map(s => <Star key={s} size={20} className={s <= Math.round(safeRating) ? 'fill-brutal-yellow text-brutal-yellow' : 'text-brutal-gray'} />)}
              </div>
              <span className="font-bold text-lg">{safeRating}</span>
              <span className="text-brutal-dark-gray">({safeBorrowCount} borrows)</span>
            </div>

            <Card color={isAvailable ? 'green' : 'coral'} padding="md" hoverable={false} className="mb-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="font-heading font-bold text-lg uppercase">{isAvailable ? 'Available Now' : 'Unavailable'}</h3>
                  <p>{safeAvailableCopies} of {safeTotalCopies} copies available</p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    size="lg"
                    icon={isAvailable ? <BookOpen size={20} /> : <Clock size={20} />}
                    onClick={handlePrimaryAction}
                  >
                    {isAvailable ? 'Borrow' : 'Reserve'}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    icon={<Heart size={20} />}
                    onClick={handleFavorite}
                    aria-label="Add to reading list"
                  />
                </div>
              </div>
            </Card>

            <h2 className="font-heading font-bold text-xl uppercase mb-3 border-b-3 border-brutal-black pb-2">Description</h2>
            <p className="text-brutal-dark-gray leading-relaxed mb-8">{safeDescription || 'No description available.'}</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              {[
                { icon: FileText, label: 'ISBN', value: book.isbn },
                { icon: BookOpen, label: 'Pages', value: `${book.pages}` },
                { icon: Calendar, label: 'Published', value: String(book.published_year) },
                { icon: Globe, label: 'Language', value: book.language },
                { icon: Users, label: 'Publisher', value: book.publisher },
                { icon: Share2, label: 'Borrows', value: book.borrow_count.toLocaleString() },
              ].map(item => (
                <Card key={item.label} color="white" padding="sm" hoverable={false}>
                  <div className="flex items-center gap-2 mb-1">
                    <item.icon size={14} className="text-brutal-dark-gray" />
                    <span className="font-heading font-bold text-xs uppercase text-brutal-dark-gray">{item.label}</span>
                  </div>
                  <p className="font-bold text-sm">{item.value}</p>
                </Card>
              ))}
            </div>

            <h2 className="font-heading font-bold text-xl uppercase mb-4 border-b-3 border-brutal-black pb-2">Reviews ({reviews.length})</h2>

            <Card color="white" padding="md" hoverable={false} className="mb-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <p className="font-heading font-bold uppercase">Write a review</p>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setMyRating(s)}
                        className="p-1"
                        aria-label={`Set rating to ${s}`}
                      >
                        <Star size={18} className={s <= myRating ? 'fill-brutal-yellow text-brutal-yellow' : 'text-brutal-gray'} />
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  value={myText}
                  onChange={(e) => setMyText(e.target.value)}
                  rows={3}
                  className="w-full border-3 border-brutal-black p-3 font-medium"
                  placeholder={isAuthenticated ? 'Share your thoughts…' : 'Log in to write a review.'}
                  disabled={!isAuthenticated}
                />
                <div className="flex justify-end">
                  <Button variant="primary" size="sm" onClick={handleSubmitReview}>
                    Submit
                  </Button>
                </div>
              </div>
            </Card>

            {reviewsQuery.isLoading ? (
              <Card color="white" padding="md" hoverable={false}>
                <p className="font-heading font-bold uppercase">Loading reviews...</p>
              </Card>
            ) : reviewsQuery.isError ? (
              <Card color="coral" padding="md" hoverable={false}>
                <p className="font-heading font-bold uppercase text-white">Failed to load reviews.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {reviews.map((review: any) => {
                  const name = review?.profile?.full_name || 'Member';
                  const date = typeof review?.created_at === 'string' ? review.created_at.slice(0, 10) : '';
                  const rating = Number(review?.rating) || 0;
                  const text = review?.review_text || '';

                  return (
                    <Card key={review.id} color="white" padding="md" hoverable={false}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-brutal-yellow border-3 border-brutal-black flex items-center justify-center font-bold">
                          {name[0] || 'M'}
                        </div>
                        <div>
                          <p className="font-heading font-bold text-sm uppercase">{name}</p>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} size={12} className={s <= rating ? 'fill-brutal-yellow text-brutal-yellow' : 'text-brutal-gray'} />
                            ))}
                            {date ? <span className="text-xs text-brutal-dark-gray ml-2">{date}</span> : null}
                          </div>
                        </div>
                      </div>
                      {text ? <p className="text-brutal-dark-gray text-sm leading-relaxed">{text}</p> : null}
                    </Card>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}
