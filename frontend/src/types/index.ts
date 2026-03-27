// ==================== AUTH ====================
export type UserRole = 'admin' | 'user';

export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  email: string;
  role: UserRole;
  membership_number: string;
  phone: string | null;
  address: string | null;
  is_active: boolean;
  theme_preference_user?: 'neo-brutalist' | 'pastel-riot' | 'ghost-protocol';
  theme_preference_admin?: 'neo-brutalist' | 'pastel-riot' | 'ghost-protocol';
  created_at: string;
  updated_at: string;
}

// ==================== BOOKS ====================
export interface Genre {
  id: string;
  name: string;
  color: string;
  description: string;
}

export interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  description: string;
  genre_id: string;
  genre?: Genre;
  cover_url: string | null;
  publisher: string;
  published_year: number;
  pages: number;
  language: string;
  total_copies: number;
  available_copies: number;
  average_rating: number;
  borrow_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type CopyCondition = 'excellent' | 'good' | 'fair' | 'poor';

export interface BookCopy {
  id: string;
  book_id: string;
  copy_number: number;
  condition: CopyCondition;
  is_available: boolean;
  current_borrowal_id: string | null;
}

// ==================== BORROWALS ====================
export type BorrowalStatus = 'pending' | 'approved' | 'active' | 'returned' | 'rejected' | 'cancelled';

export interface Borrowal {
  id: string;
  user_id: string;
  book_id: string;
  copy_id: string | null;
  status: BorrowalStatus;
  borrowed_at: string | null;
  due_date: string | null;
  returned_at: string | null;
  renewal_count: number;
  return_condition: CopyCondition | null;
  approved_by: string | null;
  created_at: string;
  user?: Profile;
  book?: Book;
}

// ==================== RESERVATIONS ====================
export type ReservationStatus = 'active' | 'fulfilled' | 'expired' | 'cancelled';

export interface Reservation {
  id: string;
  user_id: string;
  book_id: string;
  queue_position: number;
  status: ReservationStatus;
  notified_at: string | null;
  expires_at: string | null;
  created_at: string;
  user?: Profile;
  book?: Book;
}

// ==================== FINES ====================
export type FineStatus = 'unpaid' | 'paid' | 'waived';

export interface Fine {
  id: string;
  borrowal_id: string;
  user_id: string;
  amount: number;
  reason: string;
  status: FineStatus;
  issued_at: string;
  paid_at: string | null;
  waived_by: string | null;
  waive_reason: string | null;
  borrowal?: Borrowal;
  user?: Profile;
}

// ==================== REVIEWS ====================
export interface Review {
  id: string;
  user_id: string;
  book_id: string;
  borrowal_id: string | null;
  rating: number;
  review_text: string;
  is_spoiler: boolean;
  helpful_count: number;
  is_approved: boolean;
  created_at: string;
  user?: Profile;
  book?: Book;
}

// ==================== NOTIFICATIONS ====================
export type NotificationType =
  | 'due_soon'
  | 'overdue'
  | 'reservation_ready'
  | 'request_approved'
  | 'request_rejected'
  | 'fine_issued'
  | 'new_arrival'
  | 'announcement'
  | 'welcome';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  action_url: string | null;
  created_at: string;
}

// ==================== READING LIST ====================
export type ReadingStatus = 'want_to_read' | 'reading' | 'finished';

export interface ReadingListItem {
  id: string;
  user_id: string;
  book_id: string;
  status: ReadingStatus;
  added_at: string;
  finished_at: string | null;
  book?: Book;
}

// ==================== ANNOUNCEMENTS ====================
export interface Announcement {
  id: string;
  title: string;
  content: string;
  admin_id: string;
  is_pinned: boolean;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  admin?: Profile;
}

// ==================== LIBRARY SETTINGS ====================
export interface LibrarySettings {
  id: string;
  library_name: string;
  address: string;
  contact_email: string;
  contact_phone: string;
  logo_url: string | null;
  default_borrow_days: number;
  max_renewals: number;
  max_concurrent_borrows: number;
  fine_per_day: number;
  auto_approve_borrows: boolean;
  open_hours: string;
  close_hours: string;
  reservation_expiry_hours: number;
}

// ==================== API & UI ====================
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface DashboardStats {
  totalBooks: number;
  activeMembers: number;
  borrowedToday: number;
  overdueCount: number;
  finesCollectedThisMonth: number;
  newMembersThisWeek: number;
}

export interface BookFilters {
  search?: string;
  genre?: string[];
  availability?: 'all' | 'available' | 'borrowed';
  rating?: number;
  yearFrom?: number;
  yearTo?: number;
  language?: string;
  sortBy?: 'title' | 'newest' | 'popular' | 'rating' | 'most_borrowed';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
