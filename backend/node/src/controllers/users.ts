import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

// Get current user profile
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    res.json(profile);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching profile' });
  }
};

// Update current user profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const updates = req.body;
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    res.json(profile);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Error updating profile' });
  }
};

// Admin: Get all users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' });

    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;

    const { data: users, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    res.json({
      data: users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching users' });
  }
};

// Admin: Get user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: user, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching user' });
  }
};

// Admin: Update user role
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const { data: user, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to update user role' });
  }
};

// Admin: Toggle user active status
export const toggleUserActive = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // First get current status
    const { data: user, error: fetchError } = await supabase
      .from('profiles')
      .select('is_active')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Update to opposite status
    const { data: updatedUser, error } = await supabase
      .from('profiles')
      .update({ is_active: !user.is_active })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(updatedUser);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to toggle user status' });
  }
};
