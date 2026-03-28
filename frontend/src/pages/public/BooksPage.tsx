import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Filter, SlidersHorizontal, Grid3X3, List } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import BookCard from '../../components/books/BookCard';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Select } from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import type { Book } from '../../types';
import Modal from '../../components/ui/Modal';
import { bookApi, borrowalApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { getApiErrorMessage } from '../../utils/helpers';
import { connectSocket, getSocket } from '../../lib/socket';

function normalizeBooksResponse(payload: unknown): Book[] {
  if (Array.isArray(payload)) return payload as Book[];
  if (payload && typeof payload === 'object' && Array.isArray((payload as { data?: unknown }).data)) {
    return (payload as { data: Book[] }).data;
  }
  return [];
}

export default function BooksPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('popular');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [availability, setAvailability] = useState('all');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const booksQuery = useQuery({
    queryKey: ['public', 'books', 'catalog'],
    queryFn: async () => {
      const payload = await bookApi.getAll({ limit: 200 });
      return normalizeBooksResponse(payload);
    },
  });

  const allBooks = booksQuery.data || [];

  const genres = useMemo(() => {
    const unique = new Map<string, string>();
    allBooks.forEach((b) => {
      if (b.genre_id && b.genre?.name) unique.set(b.genre_id, b.genre.name);
    });
    return Array.from(unique.entries()).map(([id, name]) => ({ id, name }));
  }, [allBooks]);

  useEffect(() => {
    const genreFromUrl = searchParams.get('genre');
    if (genreFromUrl) {
      setSelectedGenre(genreFromUrl);
    }
  }, [searchParams]);

  const filteredBooks = allBooks.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'all' || book.genre_id === selectedGenre;
    const matchesAvailability = availability === 'all' ||
      (availability === 'available' && book.available_copies > 0) ||
      (availability === 'borrowed' && book.available_copies === 0);
    return matchesSearch && matchesGenre && matchesAvailability;
  });

  const sortedBooks = useMemo(() => {
    const copy = [...filteredBooks];
    switch (sortBy) {
      case 'rating':
        copy.sort((a, b) => b.average_rating - a.average_rating);
        break;
      case 'title':
        copy.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'newest':
        copy.sort((a, b) => (b.published_year || 0) - (a.published_year || 0));
        break;
      case 'popular':
      default:
        copy.sort((a, b) => (b.borrow_count || 0) - (a.borrow_count || 0));
        break;
    }
    return copy;
  }, [filteredBooks, sortBy]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, sortBy, selectedGenre, availability, viewMode]);

  const totalPages = Math.max(1, Math.ceil(sortedBooks.length / pageSize));
  const pagedBooks = sortedBooks.slice((page - 1) * pageSize, page * pageSize);

  const handleBorrow = async (bookId: string) => {
    if (!isAuthenticated) {
      toast.error('Please log in to borrow books.');
      navigate('/login', { state: { from: `/books/${bookId}` } });
      return;
    }
    try {
      await borrowalApi.request(bookId);
      toast.success('Borrow request sent.');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['public', 'books'] }),
        queryClient.invalidateQueries({ queryKey: ['public', 'book', bookId] }),
      ]);
    } catch (e: unknown) {
      toast.error(getApiErrorMessage(e, 'Borrow request failed.'));
    }
  };

  useEffect(() => {
    connectSocket();
    const socket = getSocket();
    const onBookRequested = () => {
      queryClient.invalidateQueries({ queryKey: ['public', 'books'] });
    };
    socket?.on('book_requested', onBookRequested);
    return () => {
      socket?.off('book_requested', onBookRequested);
    };
  }, [queryClient]);

  const clearFilters = () => {
    setSelectedGenre('all');
    setAvailability('all');
    setSearchQuery('');
    setSortBy('popular');
    setFiltersOpen(false);
  };

  return (
    <>
      <Helmet>
        <title>Book Catalog — LibraVault</title>
        <meta name="description" content="Browse our extensive catalog of over 50,000 books. Search, filter, and discover your next great read at LibraVault." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Badge variant="blue" size="md" className="mb-3">Catalog</Badge>
          <h1 className="font-heading font-bold text-4xl sm:text-5xl uppercase mb-2">
            Book Catalog
          </h1>
          <p className="text-brutal-dark-gray text-lg">
            Discover from our collection of {allBooks.length.toLocaleString()} titles
          </p>
        </motion.div>

        {/* Search & Filters */}
        <div className="bg-brutal-yellow border-3 border-brutal-black p-4 sm:p-6 shadow-brutal mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search by title, author, or ISBN..."
                icon={<Search size={18} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="secondary" icon={<SlidersHorizontal size={18} />} onClick={() => setFiltersOpen(true)}>
              Filters
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Genre filter */}
            <Select
              options={[
                { value: 'all', label: 'All Genres' },
                ...genres.map(g => ({ value: g.id, label: g.name })),
              ]}
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-40"
            />

            {/* Availability filter */}
            <Select
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'available', label: 'Available' },
                { value: 'borrowed', label: 'Borrowed' },
              ]}
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="w-40"
            />

            {/* Sort */}
            <Select
              options={[
                { value: 'popular', label: 'Most Popular' },
                { value: 'newest', label: 'Newest' },
                { value: 'rating', label: 'Highest Rated' },
                { value: 'title', label: 'Title A–Z' },
              ]}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-40"
            />

            <div className="ml-auto flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 border-3 border-brutal-black shadow-brutal-sm ${viewMode === 'grid' ? 'bg-brutal-black text-white' : 'bg-brutal-white'}`}
                aria-label="Grid view"
              >
                <Grid3X3 size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 border-3 border-brutal-black shadow-brutal-sm ${viewMode === 'list' ? 'bg-brutal-black text-white' : 'bg-brutal-white'}`}
                aria-label="List view"
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {booksQuery.isLoading && (
          <Card color="white" padding="lg" className="mb-6">
            <p className="font-heading font-bold uppercase">Loading books...</p>
          </Card>
        )}

        {booksQuery.isError && (
          <Card color="coral" padding="lg" className="mb-6">
            <p className="font-heading font-bold uppercase text-white">Failed to load books from server.</p>
          </Card>
        )}

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="font-heading font-bold text-sm uppercase tracking-wider">
            Showing {sortedBooks.length} results
          </p>
          <div className="flex gap-2">
            {selectedGenre !== 'all' && (
              <Badge variant="blue" className="cursor-pointer" onClick={() => setSelectedGenre('all')}>
                {genres.find(g => g.id === selectedGenre)?.name || 'Genre'} ✕
              </Badge>
            )}
          </div>
        </div>

        {/* Book Grid */}
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
          {pagedBooks.map((book, i) => (
            <BookCard key={book.id} book={book} index={i} showBorrowButton onBorrow={handleBorrow} />
          ))}
        </div>

        {sortedBooks.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-block p-6 border-3 border-brutal-black bg-brutal-yellow shadow-brutal mb-4">
              <Filter size={48} />
            </div>
            <h3 className="font-heading font-bold text-2xl uppercase mb-2">No Books Found</h3>
            <p className="text-brutal-dark-gray">Try adjusting your search or filters.</p>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 mt-12">
          {Array.from({ length: totalPages }, (_, idx) => idx + 1).slice(0, 7).map((p) => (
            <button
              key={p}
              className={`w-10 h-10 font-heading font-bold border-3 border-brutal-black shadow-brutal-sm
                hover:shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5
                transition-all duration-150
                ${p === page ? 'bg-brutal-yellow' : 'bg-brutal-white'}
              `}
              onClick={() => setPage(p)}
              aria-label={`Go to page ${p}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <Modal isOpen={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filters" size="md">
        <div className="space-y-4">
          <Select
            options={[
              { value: 'all', label: 'All Genres' },
              ...genres.map(g => ({ value: g.id, label: g.name })),
            ]}
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
          />
          <Select
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'available', label: 'Available' },
              { value: 'borrowed', label: 'Borrowed' },
            ]}
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
          />
          <Select
            options={[
              { value: 'popular', label: 'Most Popular' },
              { value: 'newest', label: 'Newest' },
              { value: 'rating', label: 'Highest Rated' },
              { value: 'title', label: 'Title A–Z' },
            ]}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          />
          <div className="flex gap-3 pt-2">
            <Button fullWidth variant="outline" onClick={clearFilters}>Clear</Button>
            <Button fullWidth onClick={() => setFiltersOpen(false)}>Apply</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
