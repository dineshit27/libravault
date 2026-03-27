import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

function requireUserId(req: Request): string {
  const userId = (req as any)?.user?.id;
  if (!userId) throw new Error('Authentication required');
  return userId;
}

export const getMyReviews = async (req: Request, res: Response) => {
  try {
    const userId = requireUserId(req);

    const { data, error } = await supabase
      .from('reviews')
      .select('*, book:books(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (e: any) {
    res.status(400).json({ error: e?.message || 'Failed to fetch reviews' });
  }
};

export const createReview = async (req: Request, res: Response) => {
  try {
    const userId = requireUserId(req);
    const { book_id, rating, review_text } = req.body || {};

    if (!book_id) return res.status(400).json({ error: 'book_id is required' });
    const ratingNum = Number(rating);
    if (!Number.isFinite(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ error: 'rating must be between 1 and 5' });
    }

    const { data, error } = await supabase
      .from('reviews')
      .upsert(
        [{ user_id: userId, book_id, rating: ratingNum, review_text: review_text ?? null }],
        { onConflict: 'user_id,book_id' }
      )
      .select()
      .single();

    if (error) throw error;

    // Optional: emit socket event
    const io = req.app.get('io');
    if (io) io.emit('review_created', { bookId: book_id, userId });

    res.status(201).json(data);
  } catch (e: any) {
    res.status(400).json({ error: e?.message || 'Failed to create review' });
  }
};

export const updateReview = async (req: Request, res: Response) => {
  try {
    const userId = requireUserId(req);
    const { id } = req.params;
    const { rating, review_text } = req.body || {};

    const patch: any = {};
    if (rating !== undefined) {
      const ratingNum = Number(rating);
      if (!Number.isFinite(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        return res.status(400).json({ error: 'rating must be between 1 and 5' });
      }
      patch.rating = ratingNum;
    }
    if (review_text !== undefined) patch.review_text = review_text;

    const { data, error } = await supabase
      .from('reviews')
      .update(patch)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (e: any) {
    res.status(400).json({ error: e?.message || 'Failed to update review' });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const userId = requireUserId(req);
    const { id } = req.params;

    const { data, error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .select('id')
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Review not found' });

    res.status(204).send();
  } catch (e: any) {
    res.status(400).json({ error: e?.message || 'Failed to delete review' });
  }
};
