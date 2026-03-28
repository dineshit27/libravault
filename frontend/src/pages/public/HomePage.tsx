import { motion, useInView, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Users,
  TrendingUp,
  Search,
  Star,
  Clock,
  CalendarDays,
  Sparkles,
  PlayCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import ThreeDSlider, { type SliderItemData } from '../../components/ui/ThreeDSlider';
import type { Announcement, Book, Genre } from '../../types';
import { announcementApi, bookApi, borrowalApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { getApiErrorMessage } from '../../utils/helpers';
import { connectSocket, getSocket } from '../../lib/socket';

const GENRES: Genre[] = [
  { id: '1', name: 'Fiction', color: '#0066FF', description: 'Literary and contemporary fiction' },
  { id: '2', name: 'Science Fiction', color: '#00FF88', description: 'Futuristic and speculative fiction' },
  { id: '3', name: 'Mystery', color: '#FF4D4D', description: 'Thriller and detective stories' },
  { id: '4', name: 'Romance', color: '#FFE500', description: 'Love stories and romantic fiction' },
  { id: '5', name: 'Non-Fiction', color: '#0066FF', description: 'Factual and educational books' },
  { id: '6', name: 'Biography', color: '#FF4D4D', description: 'Life stories of remarkable people' },
  { id: '7', name: 'History', color: '#00FF88', description: 'Historical accounts and analysis' },
  { id: '8', name: 'Fantasy', color: '#FFE500', description: 'Magical worlds and epic adventures' },
];

const GENRE_IMAGES: Record<string, string> = {
  '1': 'https://i.pinimg.com/736x/20/97/1c/20971cf70c00ecaea02ef1e96016de32.jpg',
  '2': 'https://i.pinimg.com/1200x/e9/82/2f/e9822f287d757bc8746390007d8b9716.jpg',
  '3': 'https://i.pinimg.com/736x/20/c6/71/20c67122551e55012ae1dcec3ad7e0dd.jpg',
  '4': 'https://i.pinimg.com/736x/d3/40/a5/d340a54070fab35946cd28c5723de6ad.jpg',
  '5': 'https://i.pinimg.com/1200x/67/f5/91/67f591e1c39df7f0bdbeff1b54d89c8c.jpg',
  '6': 'https://i.pinimg.com/1200x/ae/ba/ff/aebaff293ebbb4b2401a08ffa4694e8b.jpg',
  '7': 'https://i.pinimg.com/1200x/c8/93/6e/c8936e84e8e2980bac5f70f9b5654ea3.jpg',
  '8': 'https://i.pinimg.com/736x/bb/46/e6/bb46e661013c14c320a407665723d26d.jpg',
};

const MOST_BORROWED_FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400&h=600&fit=crop',
];

const ANNOUNCEMENTS = [
  'New arrivals: 50+ books added this month!',
  'Summer reading program starts June 1st',
  'Extended hours on weekends: Open until 8 PM',
  'Author talk: Margaret Atwood — March 30th',
  'Free coding workshops every Saturday',
  'Book donation drive: Share your stories',
];

const TESTIMONIALS = [
  {
    name: 'Sarah Mitchell',
    role: 'Avid Reader',
    text: 'Naan daily inga book eduthu padikaren. Search super easy, borrow process romba smooth ah irukku.',
  },
  {
    name: 'Dr. James Chen',
    role: 'University Professor',
    text: 'Research ku thevaiyana books ellam quick ah kidaikkuthu. Admin team fast response kudukranga, helpful ah irukanga.',
  },
  {
    name: 'Maria Rodriguez',
    role: 'Book Club Organizer',
    text: 'Enga book club ku reservation feature semma use. Availability live ah theriyum, so ellarum time ku book vaangikalam.',
  },
  {
    name: 'Aisha Patel',
    role: 'Graduate Student',
    text: 'Exam time la intha library life saver. Online reserve pannitu vandha odane collect pannalam, stress kammi.',
  },
  {
    name: 'Liam O Connor',
    role: 'Parent',
    text: 'Weekend la kids ku reading corner romba pidikkum. Munadiye check panni vandha process easy ah mudinjidum.',
  },
  {
    name: 'Emma Thompson',
    role: 'High School Student',
    text: 'School project ku week ku week use panren. Mobile la reserve panna time save aagudhu, romba useful.',
  },
  {
    name: 'Daniel Brooks',
    role: 'Small Business Owner',
    text: 'Audiobook um digital books um super ah irukku. Travel panumbothum learn panna mudiyudhu, return reminder um miss aagadhu.',
  },
];

const MEMBER_AVATARS = [
  {
    src: 'https://pbs.twimg.com/profile_images/1948770261848756224/oPwqXMD6_400x400.jpg',
    fallback: 'SK',
    tooltip: 'Skyleen',
  },
  {
    src: 'https://pbs.twimg.com/profile_images/1593304942210478080/TUYae5z7_400x400.jpg',
    fallback: 'CN',
    tooltip: 'Shadcn',
  },
  {
    src: 'https://pbs.twimg.com/profile_images/1677042510839857154/Kq4tpySA_400x400.jpg',
    fallback: 'AW',
    tooltip: 'Adam Wathan',
  },
  {
    src: 'https://pbs.twimg.com/profile_images/1783856060249595904/8TfcCN0r_400x400.jpg',
    fallback: 'GR',
    tooltip: 'Guillermo Rauch',
  },
  {
    src: 'https://pbs.twimg.com/profile_images/1534700564810018816/anAuSfkp_400x400.jpg',
    fallback: 'JH',
    tooltip: 'Jhey',
  },
  {
    src: 'https://pbs.twimg.com/profile_images/1927474594102784000/Al0g-I6o_400x400.jpg',
    fallback: 'DH',
    tooltip: 'David Haz',
  },
];

const EVENT_PROGRAMS = [
  {
    title: 'City Book Club',
    date: 'Sat, Mar 30',
    time: '5:00 PM',
    tag: 'Adults',
    color: 'yellow' as const,
    blurb: 'Discuss this month\'s pick with local readers and facilitators.',
  },
  {
    title: 'Author Talk: A. Winters',
    date: 'Tue, Apr 2',
    time: '6:30 PM',
    tag: 'Talk',
    color: 'coral' as const,
    blurb: 'Live Q&A on storytelling craft and publishing journey.',
  },
  {
    title: 'Kids Reading Hour',
    date: 'Sun, Apr 7',
    time: '11:00 AM',
    tag: 'Kids',
    color: 'green' as const,
    blurb: 'Interactive stories, games, and read-aloud fun for families.',
  },
  {
    title: 'Digital Skills Lab',
    date: 'Wed, Apr 10',
    time: '4:00 PM',
    tag: 'Workshop',
    color: 'blue' as const,
    blurb: 'Hands-on sessions on search, citations, and research tools.',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Browse',
    desc: 'Search the catalog, filter by genre, and find your next read.',
    href: '/books',
    icon: Search,
  },
  {
    step: '02',
    title: 'Borrow',
    desc: 'Place a request online and track approval in real time.',
    href: '/books',
    icon: BookOpen,
  },
  {
    step: '03',
    title: 'Return',
    desc: 'Drop off at any branch or extend with one-click renewals.',
    href: '/login',
    icon: Clock,
  },
];

function AnimatedCounter({ end, label, icon: Icon }: { end: number; label: string; icon: typeof BookOpen }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="text-center">
      <Icon size={32} className="mx-auto mb-2 text-brutal-black" />
      <motion.span
        className="font-heading font-bold text-4xl sm:text-5xl block"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
      >
        {isInView ? (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {end.toLocaleString()}+
          </motion.span>
        ) : '0'}
      </motion.span>
      <span className="font-heading font-bold text-sm uppercase tracking-widest mt-1 block">
        {label}
      </span>
    </div>
  );
}

function EventSpringCard({ event }: { event: (typeof EVENT_PROGRAMS)[number] }) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 260, damping: 24 });
  const springY = useSpring(y, { stiffness: 260, damping: 24 });

  const rotateX = useTransform(springY, [-0.5, 0.5], ['7deg', '-7deg']);
  const rotateY = useTransform(springX, [-0.5, 0.5], ['-9deg', '9deg']);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(px);
    y.set(py);
  };

  const resetTilt = () => {
    x.set(0);
    y.set(0);
  };

  const eventPalette: Record<(typeof EVENT_PROGRAMS)[number]['color'], { bg: string; text: string; muted: string; icon: string }> = {
    yellow: { bg: '#ffe500', text: '#111111', muted: '#2f2f2f', icon: '#111111' },
    coral: { bg: '#ff7aa3', text: '#1b1020', muted: '#3a2342', icon: '#1b1020' },
    green: { bg: '#9de7c2', text: '#1b1020', muted: '#3a2342', icon: '#1b1020' },
    blue: { bg: '#0066ff', text: '#f8fbff', muted: '#d4e5ff', icon: '#f8fbff' },
  };

  const palette = eventPalette[event.color];

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMove}
      onMouseLeave={resetTilt}
      whileHover={{ y: -10, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 260, damping: 18 }}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      className="group relative"
    >
      <div
        className="h-full overflow-hidden border-3 border-brutal-black shadow-brutal p-8"
        style={{ backgroundColor: palette.bg, color: palette.text }}
      >
        <div style={{ transform: 'translateZ(38px)' }} className="relative z-20">
          <div className="flex items-center justify-between">
            <CalendarDays size={20} style={{ color: palette.icon }} />
            <Badge variant="black" size="sm">{event.tag}</Badge>
          </div>
          <h3 className="font-heading font-bold uppercase mt-4">{event.title}</h3>
          <p className="text-sm mt-2">{event.date}</p>
          <p className="text-sm font-bold">{event.time}</p>
          <p className="text-xs mt-3" style={{ color: palette.muted }}>{event.blurb}</p>
        </div>

        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100"
          style={{
            background:
              'radial-gradient(circle at 25% 20%, rgba(255,255,255,0.45), rgba(255,255,255,0) 55%)',
          }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  );
}

function HowItWorksHoverCard({
  step,
  title,
  desc,
  href,
  icon: Icon,
}: {
  step: string;
  title: string;
  desc: string;
  href: string;
  icon: LucideIcon;
}) {
  return (
    <Link
      to={href}
      className="w-full p-5 rounded-none border-3 border-brutal-black relative overflow-hidden group bg-brutal-white shadow-brutal h-full block"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-brutal-coral to-brutal-yellow translate-y-[102%] group-hover:translate-y-[0%] transition-transform duration-300" />

      <Icon className="absolute z-10 -top-12 -right-12 text-[112px] text-black/5 group-hover:text-black/20 group-hover:rotate-12 transition-all duration-300" />

      <p className="font-heading font-bold text-xs tracking-[0.2em] text-[var(--accent-secondary)] group-hover:text-brutal-black relative z-10 duration-300">
        STEP {step}
      </p>
      <Icon className="mt-2 mb-3 text-2xl text-[var(--accent-secondary)] group-hover:text-brutal-black transition-colors relative z-10 duration-300" />
      <h3 className="font-heading font-bold text-2xl uppercase text-[var(--text-primary)] group-hover:text-brutal-black relative z-10 duration-300">
        {title}
      </h3>
      <p className="text-sm text-[var(--text-secondary)] group-hover:text-black/80 relative z-10 duration-300 mt-2">
        {desc}
      </p>
    </Link>
  );
}

function normalizeBooksResponse(payload: unknown): Book[] {
  if (Array.isArray(payload)) return payload as Book[];
  if (payload && typeof payload === 'object' && Array.isArray((payload as { data?: unknown }).data)) {
    return (payload as { data: Book[] }).data;
  }
  return [];
}

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [brokenCovers, setBrokenCovers] = useState<Record<string, boolean>>({});
  const featuredCarouselRef = useRef<HTMLElement | null>(null);
  const [liveStats, setLiveStats] = useState({
    totalBooks: 52847,
    activeMembers: 18234,
    borrowedToday: 342,
    citiesServed: 42,
  });

  const booksQuery = useQuery({
    queryKey: ['public', 'books', 'homepage'],
    queryFn: async () => {
      const payload = await bookApi.getAll({ limit: 50 });
      return normalizeBooksResponse(payload);
    },
  });

  const announcementsQuery = useQuery({
    queryKey: ['public', 'announcements', 'homepage'],
    queryFn: async () => {
      try {
        const data = await announcementApi.getActive();
        return Array.isArray(data) ? data : [];
      } catch {
        return [];
      }
    },
  });

  const allBooks = booksQuery.data || [];
  const liveAnnouncements = announcementsQuery.data || [];
  const { scrollYProgress: featuredScrollProgress } = useScroll({
    target: featuredCarouselRef,
    offset: ['start start', 'end end'],
  });
  const featuredCarouselX = useTransform(featuredScrollProgress, [0, 1], ['2%', '-72%']);

  const featuredBooks = useMemo(
    () => [...allBooks].sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0)).slice(0, 6),
    [allBooks]
  );
  const mostBorrowed = useMemo(
    () => [...allBooks].sort((a, b) => (b.borrow_count || 0) - (a.borrow_count || 0)).slice(0, 5),
    [allBooks]
  );
  const mostBorrowedSliderItems = useMemo<SliderItemData[]>(
    () => mostBorrowed.map((book, i) => ({
      title: book.title,
      num: String(i + 1).padStart(2, '0'),
      imageUrl: (!brokenCovers[book.id] && book.cover_url) || MOST_BORROWED_FALLBACK_IMAGES[i % MOST_BORROWED_FALLBACK_IMAGES.length],
      data: book,
    })),
    [mostBorrowed, brokenCovers]
  );
  const marqueeAnnouncements = useMemo(() => {
    if (liveAnnouncements.length === 0) return ANNOUNCEMENTS;
    return liveAnnouncements.map((item: Announcement) => item.title);
  }, [liveAnnouncements]);

  useEffect(() => {
    const booksAvailable = allBooks.reduce((acc, book) => acc + Math.max(0, book.available_copies || 0), 0);
    const timer = window.setInterval(() => {
      setLiveStats((prev) => ({
        totalBooks: Math.max(booksAvailable, prev.totalBooks + Math.floor(Math.random() * 2)),
        activeMembers: prev.activeMembers + Math.floor(Math.random() * 3),
        borrowedToday: prev.borrowedToday + Math.floor(Math.random() * 2),
        citiesServed: prev.citiesServed + (Math.random() > 0.96 ? 1 : 0),
      }));
    }, 5000);

    return () => window.clearInterval(timer);
  }, [allBooks]);

  const handleBorrow = async (bookId: string) => {
    if (!isAuthenticated) {
      toast.error('Please log in to borrow books.');
      navigate('/login', { state: { from: `/books/${bookId}` } });
      return;
    }
    try {
      await borrowalApi.request(bookId);
      toast.success('Borrow request sent.');
      await queryClient.invalidateQueries({ queryKey: ['public', 'books'] });
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

  const handleSubscribe = () => {
    const email = newsletterEmail.trim();
    if (!email || !email.includes('@')) {
      toast.error('Enter a valid email.');
      return;
    }
    toast.success('Subscribed!');
    setNewsletterEmail('');
  };


  return (
    <>
      <Helmet>
        <title>LibraVault — Your Next Read Awaits</title>
        <meta name="description" content="LibraVault Public Library — Browse over 50,000 books, borrow online, join reading programs, and discover your next favorite read." />
      </Helmet>

      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center bg-[var(--bg-primary)] noise-overlay overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="black" size="md" className="mb-6">
                Public Library System
              </Badge>
              <h1 className="font-heading font-bold text-5xl sm:text-6xl lg:text-7xl xl:text-8xl uppercase leading-[0.9] mb-6 text-[var(--text-primary)]">
                Your
                <br />
                <span className="text-[var(--accent-secondary)]">Next Read</span>
                <br />
                Awaits
              </h1>
              <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-lg mb-8 font-body">
                Access over 50,000 books, digital resources, and community programs.
                Your gateway to knowledge, open to everyone.
              </p>
              <div className="flex flex-wrap gap-4">
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Link to="/books">
                    <Button size="lg" icon={<Search size={20} />}>
                      Browse Catalog
                    </Button>
                  </Link>
                </motion.div>
                <Link to="/register">
                  <Button size="lg" variant="secondary" iconRight={<ArrowRight size={20} />}>
                    Join Library
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:grid grid-cols-2 gap-4"
            >
              {featuredBooks.slice(0, 4).map((book, i) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className={`border-3 border-brutal-black shadow-brutal-lg bg-brutal-white overflow-hidden
                    ${i % 2 === 0 ? 'mt-8' : ''}
                  `}
                >
                  <div className="aspect-[3/4]">
                    <img
                      src={book.cover_url || ''}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-20 h-20 border-5 border-brutal-black bg-brutal-coral rotate-12 hidden xl:block" />
        <div className="absolute bottom-20 left-10 w-16 h-16 border-5 border-brutal-black bg-brutal-blue -rotate-6 hidden xl:block" />
      </section>

      {/* MARQUEE ANNOUNCEMENT STRIP */}
      <section className="bg-brutal-black border-y-3 border-brutal-yellow py-3 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...marqueeAnnouncements, ...marqueeAnnouncements].map((text, i) => (
            <span key={i} className="mx-8 font-heading font-bold text-brutal-yellow uppercase tracking-wider text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-brutal-coral inline-block" />
              {text}
            </span>
          ))}
        </div>
      </section>

      {/* LIVE STATS */}
      <section className="bg-brutal-green border-b-3 border-brutal-black py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <AnimatedCounter end={liveStats.totalBooks} label="Total Books" icon={BookOpen} />
            <AnimatedCounter end={liveStats.activeMembers} label="Active Members" icon={Users} />
            <AnimatedCounter end={liveStats.borrowedToday} label="Borrowed Today" icon={TrendingUp} />
            <AnimatedCounter end={liveStats.citiesServed} label="Cities Served" icon={Star} />
          </div>
        </div>
      </section>

      {/* FEATURED BOOKS */}
      <section className="bg-brutal-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <Badge variant="coral" size="md" className="mb-3">Popular</Badge>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl uppercase">
                Featured Books
              </h2>
            </div>
            <Link to="/books" className="hidden sm:block">
              <Button variant="outline" iconRight={<ArrowRight size={18} />}>
                View All
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:hidden max-w-6xl mx-auto">
            {featuredBooks.map((book, index) => (
              <motion.article
                key={book.id}
                className="w-full"
                initial={{ opacity: 0, y: 28, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.35, delay: index * 0.08 }}
                viewport={{ once: true, amount: 0.2 }}
              >
                <div className="border-3 border-[var(--border-color)] shadow-brutal bg-[var(--bg-card)] overflow-hidden h-[470px] flex flex-col">
                  <div className="aspect-[3/4] border-b-3 border-[var(--border-color)] overflow-hidden">
                    {book.cover_url && !brokenCovers[book.id] ? (
                      <img
                        src={book.cover_url}
                        alt={book.title}
                        className="h-full w-full object-cover"
                        onError={() => setBrokenCovers((prev) => ({ ...prev, [book.id]: true }))}
                      />
                    ) : (
                      <div className="h-full w-full bg-[var(--bg-secondary)] flex items-center justify-center">
                        <div className="text-center px-4">
                          <BookOpen size={34} className="mx-auto mb-2 text-[var(--text-secondary)]" />
                          <p className="font-heading font-bold uppercase text-xs text-[var(--text-secondary)]">{book.title}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <p className="font-heading font-bold uppercase text-sm text-[var(--accent-tertiary)]">#{index + 1} Featured</p>
                    <h3 className="font-heading font-bold uppercase text-lg leading-tight mt-1">{book.title}</h3>
                    <p className="text-sm text-[var(--text-secondary)]">{book.author}</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-2">{(book.borrow_count || 0).toLocaleString()} borrows</p>
                    <Button className="mt-auto" size="sm" fullWidth onClick={() => handleBorrow(book.id)}>
                      Borrow Now
                    </Button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          <section ref={featuredCarouselRef} className="relative hidden lg:block h-[260vh]">
            <div className="sticky top-0 flex h-screen items-center overflow-hidden">
              <motion.div style={{ x: featuredCarouselX }} className="flex gap-6 pl-4 pr-20 xl:pr-40">
                {featuredBooks.map((book, index) => (
                  <article key={book.id} className="w-[320px] xl:w-[360px] shrink-0">
                    <div className="border-3 border-[var(--border-color)] shadow-brutal bg-[var(--bg-card)] overflow-hidden h-[520px] flex flex-col">
                      <div className="aspect-[3/4] border-b-3 border-[var(--border-color)] overflow-hidden">
                        {book.cover_url && !brokenCovers[book.id] ? (
                          <img
                            src={book.cover_url}
                            alt={book.title}
                            className="h-full w-full object-cover"
                            onError={() => setBrokenCovers((prev) => ({ ...prev, [book.id]: true }))}
                          />
                        ) : (
                          <div className="h-full w-full bg-[var(--bg-secondary)] flex items-center justify-center">
                            <div className="text-center px-4">
                              <BookOpen size={34} className="mx-auto mb-2 text-[var(--text-secondary)]" />
                              <p className="font-heading font-bold uppercase text-xs text-[var(--text-secondary)]">{book.title}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <p className="font-heading font-bold uppercase text-sm text-[var(--accent-tertiary)]">#{index + 1} Featured</p>
                        <h3 className="font-heading font-bold uppercase text-lg leading-tight mt-1">{book.title}</h3>
                        <p className="text-sm text-[var(--text-secondary)]">{book.author}</p>
                        <p className="text-xs text-[var(--text-secondary)] mt-2">{(book.borrow_count || 0).toLocaleString()} borrows</p>
                        <Button className="mt-auto" size="sm" fullWidth onClick={() => handleBorrow(book.id)}>
                          Borrow Now
                        </Button>
                      </div>
                    </div>
                  </article>
                ))}
              </motion.div>
            </div>
          </section>

          <div className="mt-8 sm:hidden text-center">
            <Link to="/books">
              <Button fullWidth variant="outline" iconRight={<ArrowRight size={18} />}>
                View All Books
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-brutal-white py-16 sm:py-20 border-y-3 border-brutal-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <Badge variant="green" size="md" className="mb-3">How It Works</Badge>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl uppercase">Browse → Borrow → Return</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((item, i) => (
              <motion.div key={item.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} viewport={{ once: true }}>
                <HowItWorksHoverCard
                  step={item.step}
                  title={item.title}
                  desc={item.desc}
                  href={item.href}
                  icon={item.icon}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* MOST BORROWED */}
      <section className="bg-brutal-yellow py-16 sm:py-20 border-y-3 border-brutal-black">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <Badge variant="black" size="md" className="mb-3">Trending</Badge>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl uppercase">Most Borrowed This Week</h2>
          </div>
          {mostBorrowedSliderItems.length > 0 ? (
            <ThreeDSlider
              items={mostBorrowedSliderItems}
              speedWheel={0.05}
              speedDrag={-0.14}
              onItemClick={(item) => {
                const selected = item.data as Book | undefined;
                if (selected?.id) {
                  navigate(`/books/${selected.id}`);
                }
              }}
            />
          ) : (
            <Card color="white" padding="lg" hoverable={false}>
              <p className="font-heading font-bold uppercase text-center">No borrowed-book data available yet.</p>
            </Card>
          )}
        </div>
      </section>

      {/* EVENTS & PROGRAMS */}
      <section className="bg-brutal-blue py-16 sm:py-20 border-y-3 border-brutal-yellow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <Badge variant="yellow" size="md" className="mb-3">Community</Badge>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl uppercase text-white">Library Events & Programs</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {EVENT_PROGRAMS.map((event) => (
              <EventSpringCard key={event.title} event={event} />
            ))}
          </div>
        </div>
      </section>

      {/* GENRE EXPLORER */}
      <section className="bg-brutal-black py-16 sm:py-20 border-y-3 border-brutal-yellow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="yellow" size="md" className="mb-3">Explore</Badge>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl uppercase text-white">
              Browse by Genre
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {GENRES.map((genre, i) => (
              <motion.div
                key={genre.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
              >
                <Link to={`/books?genre=${genre.id}`}>
                  <Card
                    color="white"
                    padding="md"
                    className="text-center group h-full"
                    hoverable
                  >
                    <div className="h-28 w-full mb-3 border-3 border-brutal-black shadow-brutal-sm overflow-hidden">
                      <img
                        src={GENRE_IMAGES[genre.id]}
                        alt={`${genre.name} genre`}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <h3 className="font-heading font-bold text-sm uppercase">{genre.name}</h3>
                    <p className="text-xs text-brutal-dark-gray mt-1">{genre.description}</p>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-brutal-coral py-16 sm:py-20 noise-overlay">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="black" size="md" className="mb-3">Testimonials</Badge>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl uppercase text-white">
              What Our Members Say
            </h2>
          </div>

          <div className="relative overflow-hidden flex justify-center">
            <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-12 bg-gradient-to-r from-brutal-coral to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-brutal-coral to-transparent" />

            <div className="flex w-max gap-6 animate-marquee pause-animation-on-hover py-1 mx-auto">
              {[...TESTIMONIALS, ...TESTIMONIALS].map((testimonial, i) => (
                <div key={`${testimonial.name}-${i}`} className="w-[300px] sm:w-[360px] md:w-[420px] shrink-0">
                  <Card color="white" padding="lg" className="h-full">
                    <div className="text-4xl font-heading text-brutal-coral mb-3">"</div>
                    <p className="text-brutal-dark-gray leading-relaxed mb-4">{testimonial.text}</p>
                    <div className="border-t-3 border-brutal-black pt-3 mt-auto">
                      <p className="font-heading font-bold uppercase">{testimonial.name}</p>
                      <p className="text-sm text-brutal-dark-gray">{testimonial.role}</p>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          <motion.div
            className="mt-10 flex flex-col items-center justify-center gap-3"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >
            <motion.p
              className="font-heading font-bold uppercase tracking-wide text-white"
              animate={{ opacity: [0.75, 1, 0.75] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              Loved By Readers
            </motion.p>

            <div className="flex items-center">
              {MEMBER_AVATARS.map((avatar, index) => (
                <motion.div
                  key={`${avatar.tooltip}-${index}`}
                  className="group relative -ml-3 first:ml-0 h-12 w-12 rounded-full border-3 border-brutal-white bg-brutal-black overflow-hidden shadow-brutal-sm"
                  title={avatar.tooltip}
                  initial={{ opacity: 0, y: 12, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08, duration: 0.25 }}
                  animate={{ y: [0, -3, 0] }}
                  whileHover={{ y: -7, scale: 1.08, zIndex: 20 }}
                >
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-heading font-bold uppercase text-white">
                    {avatar.fallback}
                  </span>
                  <img
                    src={avatar.src}
                    alt={avatar.tooltip}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <span className="pointer-events-none absolute -top-10 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded border-2 border-brutal-black bg-brutal-white px-2 py-1 text-[10px] font-heading font-bold uppercase text-brutal-black opacity-0 shadow-brutal-sm transition-opacity duration-150 group-hover:opacity-100">
                    {avatar.tooltip}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* DIGITAL LIBRARY PREVIEW */}
      <section className="bg-brutal-white py-16 sm:py-20 border-y-3 border-brutal-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <Badge variant="blue" size="md" className="mb-3">Digital Library</Badge>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl uppercase mb-4">E-books & Audiobooks Anytime</h2>
              <p className="text-brutal-dark-gray mb-6">
                Preview our digital shelves with instant access titles, narrated collections, and curated learning tracks.
                Your membership unlocks content across mobile, desktop, and tablet.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button icon={<PlayCircle size={18} />}>Preview Digital Catalog</Button>
                <Button variant="outline" icon={<Sparkles size={18} />}>View Staff Picks</Button>
              </div>
            </div>
            <Card color="blue" padding="lg" className="text-white">
              <h3 className="font-heading font-bold uppercase text-xl mb-3">Inside Digital Access</h3>
              <ul className="space-y-3 text-sm">
                <li>• 12,000+ e-books available instantly</li>
                <li>• Audiobook playlists for commutes</li>
                <li>• Offline reading mode</li>
                <li>• Personalized recommendation lanes</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA / NEWSLETTER */}
      <section className="bg-brutal-blue py-16 sm:py-20 noise-overlay">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading font-bold text-3xl sm:text-4xl uppercase text-white mb-4">
              Stay in the Loop
            </h2>
            <p className="text-white/80 text-lg mb-8">
              Get notifications about new arrivals, reading events, and exclusive member benefits.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Enter your email..."
                className="flex-1 px-4 py-3 border-3 border-brutal-black bg-brutal-white font-body text-base shadow-brutal-sm focus:shadow-brutal focus:outline-none"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
              />
              <Button variant="primary" size="md" onClick={handleSubscribe}>
                Subscribe
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* LIBRARY HOURS QUICK INFO */}
      <section className="bg-brutal-yellow border-t-3 border-brutal-black py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card color="white" padding="md">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-brutal-green border-3 border-brutal-black shadow-brutal-sm">
                  <Clock size={24} />
                </div>
                <div>
                  <h3 className="font-heading font-bold uppercase">Open Now</h3>
                  <p className="text-sm text-brutal-dark-gray">Mon–Fri: 8 AM – 9 PM</p>
                </div>
              </div>
            </Card>
            <Card color="white" padding="md">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-brutal-coral border-3 border-brutal-black shadow-brutal-sm">
                  <BookOpen size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-heading font-bold uppercase">New Arrivals</h3>
                  <p className="text-sm text-brutal-dark-gray">{allBooks.length}+ titles in catalog</p>
                </div>
              </div>
            </Card>
            <Card color="white" padding="md">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-brutal-blue border-3 border-brutal-black shadow-brutal-sm">
                  <Users size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-heading font-bold uppercase">Community</h3>
                  <p className="text-sm text-brutal-dark-gray">Join 18,000+ members</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
