import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

type AuthReq = Request & { user?: { id?: string } };

const NOTIFICATION_SELECT = 'id, user_id, type, title, message, is_read, link_url, created_at';

function mapNotificationRow(row: Record<string, unknown>) {
  return {
    ...row,
    action_url: row.link_url ?? null,
  };
}

export const getMyNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthReq).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data, error } = await supabase
      .from('notifications')
      .select(NOTIFICATION_SELECT)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const mapped = (data || []).map((row) => mapNotificationRow(row as Record<string, unknown>));
    res.json(mapped);
  } catch (error: unknown) {
    res.status(500).json({ error: errorMessage(error, 'Error fetching notifications') });
  }
};

export const markNotificationRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthReq).user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', userId)
      .select(NOTIFICATION_SELECT)
      .single();

    if (error) throw error;

    res.json(mapNotificationRow(data as Record<string, unknown>));
  } catch (error: unknown) {
    res.status(400).json({ error: errorMessage(error, 'Error marking notification as read') });
  }
};

export const markAllNotificationsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthReq).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;

    res.status(204).send();
  } catch (error: unknown) {
    res.status(400).json({ error: errorMessage(error, 'Error marking all notifications as read') });
  }
};

export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthReq).user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    res.status(204).send();
  } catch (error: unknown) {
    res.status(400).json({ error: errorMessage(error, 'Error deleting notification') });
  }
};
