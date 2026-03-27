import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

const MEMBERSHIP_PREFIX = 'LV-TEMP-';

function toDisplayName(user: any): string {
  const fromMeta = user?.user_metadata?.full_name;
  if (typeof fromMeta === 'string' && fromMeta.trim().length > 0) {
    return fromMeta.trim();
  }
  const fromEmail = user?.email;
  if (typeof fromEmail === 'string' && fromEmail.trim().length > 0) {
    return fromEmail.trim();
  }
  return 'Library Member';
}

async function ensureProfileExists(user: any): Promise<void> {
  const userId = user?.id;
  if (!userId) return;

  const { data: existing, error: findError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (findError) throw findError;
  if (existing) return;

  const email = typeof user?.email === 'string' && user.email.trim().length > 0
    ? user.email.trim()
    : `${userId}@local`;

  const membershipNumber = `${MEMBERSHIP_PREFIX}${String(userId).slice(0, 8).toUpperCase()}`;

  const { error: insertError } = await supabase
    .from('profiles')
    .insert([
      {
        id: userId,
        full_name: toDisplayName(user),
        email,
        role: 'user',
        membership_number: membershipNumber,
      },
    ]);

  if (insertError) throw insertError;
}

// Get user's borrowals
export const getUserBorrowals = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    const { data: borrowals, error } = await supabase
      .from('borrowals')
      .select('*, book:books(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(borrowals);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching borrowals' });
  }
};

// Admin: Get all borrowals with optional status filter
export const getAllBorrowals = async (req: Request, res: Response) => {
  try {
    const { status = 'borrowed', page = 1, limit = 20 } = req.query;
    
    let query = supabase
      .from('borrowals')
      .select('*, books(*), profiles(*)', { count: 'exact' });

    if (status && status !== 'all') {
      const statusValue = String(status).toLowerCase();

      // Compatibility: some deployments store newly requested borrowals as "borrowed"
      // while admin views ask for "pending". Include both so requests are visible.
      if (statusValue === 'pending') {
        query = query.in('status', ['pending', 'borrowed']);
      } else {
        query = query.eq('status', statusValue);
      }
    }

    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;

    const { data: borrowals, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    res.json({
      data: borrowals,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching all borrowals' });
  }
};

// Request to borrow a book
export const borrowBook = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;
    const userId = authUser.id;
    const { bookId, book_id } = req.body;
    const finalBookId = bookId || book_id;

    if (!finalBookId) {
      return res.status(400).json({ error: 'book_id is required' });
    }

    await ensureProfileExists(authUser);

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // 2 weeks borrow period

    const { data: borrowal, error } = await supabase
      .from('borrowals')
      .insert([{
        user_id: userId,
        book_id: finalBookId,
        borrow_date: new Date().toISOString(),
        due_date: dueDate.toISOString(),
        // DB constraint only allows borrowed|returned|overdue|lost.
        // A borrowal row represents a borrow request awaiting admin action.
        status: 'borrowed'
      }])
      .select()
      .single();

    if (error) throw error;

    // Optional: emit socket event
    const io = req.app.get('io');
    if (io) io.emit('book_requested', { bookId: finalBookId, userId });

    res.status(201).json(borrowal);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Error requesting book' });
  }
};

// Admin: Approve borrowal request
export const approveBorrowRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: borrowal, error } = await supabase
      .from('borrowals')
      .update({ 
        status: 'borrowed',
        borrow_date: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(borrowal);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to approve request' });
  }
};

// Admin: Reject borrowal request
export const rejectBorrowRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // With current schema, "rejected" is not a valid borrowal status.
    // Rejecting a request removes the pending borrowal record.
    const { data: deleted, error } = await supabase
      .from('borrowals')
      .delete()
      .eq('id', id)
      .select('id, book_id, user_id')
      .maybeSingle();

    if (error) throw error;
    if (!deleted) return res.status(404).json({ error: 'Request not found' });

    // Optional: emit socket event so UIs refresh
    const io = req.app.get('io');
    if (io) io.emit('request_rejected', { borrowalId: id, bookId: deleted.book_id, userId: deleted.user_id, reason });

    res.json({ ...deleted, rejected: true, reason: reason || null });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to reject request' });
  }
};

// User/Admin: Return a borrowed book
export const returnBorrowedBook = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { condition } = req.body;

    const { data: borrowal, error } = await supabase
      .from('borrowals')
      .update({
        status: 'returned',
        return_date: new Date().toISOString(),
        ...(condition ? { notes: `Return condition: ${String(condition)}` } : {}),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(borrowal);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to return book' });
  }
};

// User: Renew borrowal
export const renewBorrowal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // Extend 2 weeks

    const { data: borrowal, error } = await supabase
      .from('borrowals')
      .update({ due_date: dueDate.toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(borrowal);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to renew borrowal' });
  }
};
