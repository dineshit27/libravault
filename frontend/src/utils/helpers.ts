import { format, formatDistanceToNow, differenceInDays, isPast, addDays } from 'date-fns';

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM dd, yyyy');
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'MMM dd, yyyy HH:mm');
}

export function timeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function daysUntilDue(dueDate: string | Date): number {
  return differenceInDays(new Date(dueDate), new Date());
}

export function isOverdue(dueDate: string | Date): boolean {
  return isPast(new Date(dueDate));
}

export function calculateDueDate(borrowDate: string | Date, daysAllowed: number): Date {
  return addDays(new Date(borrowDate), daysAllowed);
}

export function calculateFine(dueDate: string | Date, ratePerDay: number): number {
  const overdueDays = differenceInDays(new Date(), new Date(dueDate));
  if (overdueDays <= 0) return 0;
  return overdueDays * ratePerDay;
}

export function generateMembershipNumber(): string {
  const prefix = 'LMS';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getAvailabilityColor(available: number, total: number): string {
  if (available === 0) return 'bg-brutal-coral';
  if (available / total < 0.3) return 'bg-brutal-yellow';
  return 'bg-brutal-green';
}

export function getRatingStars(rating: number): string[] {
  const stars: string[] = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) stars.push('full');
    else if (i - 0.5 <= rating) stars.push('half');
    else stars.push('empty');
  }
  return stars;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (typeof error === 'string' && error.trim().length > 0) return error;

  if (error && typeof error === 'object') {
    const err = error as {
      response?: { data?: { error?: unknown; message?: unknown } };
      message?: unknown;
    };

    const apiError = err.response?.data?.error;
    if (typeof apiError === 'string' && apiError.trim().length > 0) return apiError;

    const apiMessage = err.response?.data?.message;
    if (typeof apiMessage === 'string' && apiMessage.trim().length > 0) return apiMessage;

    if (typeof err.message === 'string' && err.message.trim().length > 0) return err.message;
  }

  return fallback;
}
