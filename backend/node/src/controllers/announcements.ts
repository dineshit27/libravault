import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export const getAllAnnouncements = async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*, admin:profiles(*)')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data || []);
  } catch (error: unknown) {
    res.status(500).json({ error: errorMessage(error, 'Error fetching announcements') });
  }
};

export const getActiveAnnouncements = async (_req: Request, res: Response) => {
  try {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('announcements')
      .select('*, admin:profiles(*)')
      .eq('is_active', true)
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data || []);
  } catch (error: unknown) {
    res.status(500).json({ error: errorMessage(error, 'Error fetching active announcements') });
  }
};

export const createAnnouncement = async (req: Request, res: Response) => {
  try {
    const adminId = (req as Request & { user?: { id: string } }).user?.id;
    const {
      title,
      content,
      is_pinned = false,
      expires_at = null,
      is_active = true,
    } = req.body as {
      title?: string;
      content?: string;
      is_pinned?: boolean;
      expires_at?: string | null;
      is_active?: boolean;
    };

    if (!adminId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!title || !content) {
      return res.status(400).json({ error: 'title and content are required' });
    }

    const { data, error } = await supabase
      .from('announcements')
      .insert([{ title, content, admin_id: adminId, is_pinned, expires_at, is_active }])
      .select('*, admin:profiles(*)')
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error: unknown) {
    res.status(400).json({ error: errorMessage(error, 'Error creating announcement') });
  }
};

export const updateAnnouncement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, is_pinned, expires_at, is_active } = req.body as {
      title?: string;
      content?: string;
      is_pinned?: boolean;
      expires_at?: string | null;
      is_active?: boolean;
    };

    const updates: {
      title?: string;
      content?: string;
      is_pinned?: boolean;
      expires_at?: string | null;
      is_active?: boolean;
    } = {};

    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (is_pinned !== undefined) updates.is_pinned = is_pinned;
    if (expires_at !== undefined) updates.expires_at = expires_at;
    if (is_active !== undefined) updates.is_active = is_active;

    const { data, error } = await supabase
      .from('announcements')
      .update(updates)
      .eq('id', id)
      .select('*, admin:profiles(*)')
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error: unknown) {
    res.status(400).json({ error: errorMessage(error, 'Error updating announcement') });
  }
};

export const deleteAnnouncement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(204).send();
  } catch (error: unknown) {
    res.status(400).json({ error: errorMessage(error, 'Error deleting announcement') });
  }
};
