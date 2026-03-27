import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export const getAllFines = async (req: Request, res: Response) => {
  try {
    const { status, page = '1', limit = '20' } = req.query as {
      status?: string;
      page?: string;
      limit?: string;
    };

    let query = supabase
      .from('fines')
      .select('*, borrowal:borrowals(*), user:profiles(*)', { count: 'exact' });

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
    res.status(500).json({ error: errorMessage(error, 'Error fetching fines') });
  }
};

export const getMyFines = async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { user?: { id: string } }).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data, error } = await supabase
      .from('fines')
      .select('*, borrowal:borrowals(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data || []);
  } catch (error: unknown) {
    res.status(500).json({ error: errorMessage(error, 'Error fetching fines') });
  }
};

export const payFine = async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { user?: { id: string } }).user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data, error } = await supabase
      .from('fines')
      .update({
        status: 'paid',
        paid_date: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select('*, borrowal:borrowals(*)')
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error: unknown) {
    res.status(400).json({ error: errorMessage(error, 'Error paying fine') });
  }
};

export const waiveFine = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('fines')
      .update({
        status: 'waived',
      })
      .eq('id', id)
      .select('*, borrowal:borrowals(*), user:profiles(*)')
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error: unknown) {
    res.status(400).json({ error: errorMessage(error, 'Error waiving fine') });
  }
};
