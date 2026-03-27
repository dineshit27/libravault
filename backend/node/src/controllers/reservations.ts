import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export const getReservations = async (req: Request, res: Response) => {
  try {
    const { status, page = '1', limit = '20' } = req.query as {
      status?: string;
      page?: string;
      limit?: string;
    };

    let query = supabase
      .from('reservations')
      .select('*, book:books(*), user:profiles(*)', { count: 'exact' });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    res.json({
      data: data || [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
      },
    });
  } catch (error: unknown) {
    res.status(500).json({ error: errorMessage(error, 'Error fetching reservations') });
  }
};

export const getMyReservations = async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { user?: { id: string } }).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data, error } = await supabase
      .from('reservations')
      .select('*, book:books(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data || []);
  } catch (error: unknown) {
    res.status(500).json({ error: errorMessage(error, 'Error fetching reservations') });
  }
};

export const createReservation = async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { user?: { id: string } }).user?.id;
    const { book_id } = req.body as { book_id?: string };

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!book_id) {
      return res.status(400).json({ error: 'book_id is required' });
    }

    const { data, error } = await supabase
      .from('reservations')
      .insert([{ user_id: userId, book_id, status: 'pending' }])
      .select('*, book:books(*), user:profiles(*)')
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error: unknown) {
    res.status(400).json({ error: errorMessage(error, 'Error creating reservation') });
  }
};

export const cancelReservation = async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { user?: { id: string } }).user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data, error } = await supabase
      .from('reservations')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error: unknown) {
    res.status(400).json({ error: errorMessage(error, 'Error cancelling reservation') });
  }
};

export const fulfillReservation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('reservations')
      .update({
        status: 'fulfilled',
        fulfilled_date: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*, book:books(*), user:profiles(*)')
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error: unknown) {
    res.status(400).json({ error: errorMessage(error, 'Error fulfilling reservation') });
  }
};

export const expireReservation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('reservations')
      .update({ status: 'expired' })
      .eq('id', id)
      .select('*, book:books(*), user:profiles(*)')
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error: unknown) {
    res.status(400).json({ error: errorMessage(error, 'Error expiring reservation') });
  }
};
