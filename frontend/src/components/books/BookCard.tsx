import { motion } from 'framer-motion';
import { Star, BookOpen, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import Badge from '../ui/Badge';
import type { Book } from '../../types';

interface BookCardProps {
  book: Book;
  index?: number;
  showBorrowButton?: boolean;
  onBorrow?: (bookId: string) => void;
}

export default function BookCard({ book, index = 0, showBorrowButton, onBorrow }: BookCardProps) {
  const isAvailable = book.available_copies > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ x: -4, y: -4 }}
      className="group border-3 border-brutal-black bg-brutal-white shadow-brutal
        hover:shadow-brutal-lg active:shadow-brutal-active active:translate-x-1 active:translate-y-1
        transition-shadow duration-150 flex flex-col"
    >
      {/* Cover Image */}
      <Link to={`/books/${book.id}`} className="block relative overflow-hidden border-b-3 border-brutal-black">
        <div className="aspect-[3/4] bg-brutal-gray relative">
          {book.cover_url ? (
            <img
              src={book.cover_url}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brutal-yellow to-brutal-coral">
              <BookOpen size={48} className="text-brutal-black opacity-50" />
            </div>
          )}

          {/* Availability Badge */}
          <div className="absolute top-3 left-3">
            <Badge variant={isAvailable ? 'green' : 'coral'} size="sm">
              {isAvailable ? 'Available' : 'Borrowed'}
            </Badge>
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-brutal-black/0 group-hover:bg-brutal-black/20 transition-colors flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileHover={{ opacity: 1, scale: 1 }}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <div className="bg-brutal-yellow border-3 border-brutal-black p-3 shadow-brutal">
                <Eye size={24} />
              </div>
            </motion.div>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        {/* Genre Badge */}
        {book.genre && (
          <Badge variant="blue" size="sm" color={book.genre.color} className="self-start mb-2">
            {book.genre.name}
          </Badge>
        )}

        {/* Title */}
        <Link to={`/books/${book.id}`}>
          <h3 className="font-heading font-bold text-lg uppercase leading-tight mb-1 hover:text-brutal-coral transition-colors line-clamp-2">
            {book.title}
          </h3>
        </Link>

        {/* Author */}
        <p className="text-sm text-brutal-dark-gray mb-3">{book.author}</p>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={14}
              className={star <= Math.round(book.average_rating)
                ? 'fill-brutal-yellow text-brutal-yellow'
                : 'text-brutal-gray'
              }
            />
          ))}
          <span className="text-xs font-bold text-brutal-dark-gray ml-1">
            ({book.average_rating.toFixed(1)})
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-brutal-dark-gray mt-auto mb-3">
          <span className="font-bold">{book.borrow_count} borrows</span>
          <span>•</span>
          <span>{book.available_copies}/{book.total_copies} available</span>
        </div>

        {/* Borrow Button */}
        {showBorrowButton && (
          <button
            onClick={() => onBorrow?.(book.id)}
            disabled={!isAvailable}
            className={`w-full py-2.5 font-heading font-bold text-sm uppercase tracking-wider
              border-3 border-brutal-black shadow-brutal-sm
              hover:shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5
              active:shadow-brutal-active active:translate-x-1 active:translate-y-1
              transition-all duration-150
              ${isAvailable
                ? 'bg-brutal-green text-brutal-black'
                : 'bg-brutal-gray text-brutal-dark-gray cursor-not-allowed'
              }
            `}
          >
            {isAvailable ? 'Borrow Now' : 'Not Available'}
          </button>
        )}
      </div>
    </motion.div>
  );
}
