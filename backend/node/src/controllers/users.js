"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleUserActive = exports.updateUserRole = exports.getUserById = exports.getAllUsers = exports.updateProfile = exports.getProfile = void 0;
const supabase_1 = require("../config/supabase");
// Get current user profile
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { data: profile, error } = await supabase_1.supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        if (error)
            throw error;
        res.json(profile);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Error fetching profile' });
    }
};
exports.getProfile = getProfile;
// Update current user profile
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const updates = req.body;
        const { data: profile, error } = await supabase_1.supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();
        if (error)
            throw error;
        res.json(profile);
    }
    catch (error) {
        res.status(400).json({ error: error.message || 'Error updating profile' });
    }
};
exports.updateProfile = updateProfile;
// Admin: Get all users
const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        let query = supabase_1.supabase
            .from('profiles')
            .select('*', { count: 'exact' });
        const from = (Number(page) - 1) * Number(limit);
        const to = from + Number(limit) - 1;
        const { data: users, error, count } = await query
            .order('created_at', { ascending: false })
            .range(from, to);
        if (error)
            throw error;
        res.json({
            data: users,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: count,
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Error fetching users' });
    }
};
exports.getAllUsers = getAllUsers;
// Admin: Get user by ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const { data: user, error } = await supabase_1.supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();
        if (error)
            throw error;
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Error fetching user' });
    }
};
exports.getUserById = getUserById;
// Admin: Update user role
const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        if (!['admin', 'user'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }
        const { data: user, error } = await supabase_1.supabase
            .from('profiles')
            .update({ role })
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw error;
        res.json(user);
    }
    catch (error) {
        res.status(400).json({ error: error.message || 'Failed to update user role' });
    }
};
exports.updateUserRole = updateUserRole;
// Admin: Toggle user active status
const toggleUserActive = async (req, res) => {
    try {
        const { id } = req.params;
        // First get current status
        const { data: user, error: fetchError } = await supabase_1.supabase
            .from('profiles')
            .select('is_active')
            .eq('id', id)
            .single();
        if (fetchError)
            throw fetchError;
        // Update to opposite status
        const { data: updatedUser, error } = await supabase_1.supabase
            .from('profiles')
            .update({ is_active: !user.is_active })
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw error;
        res.json(updatedUser);
    }
    catch (error) {
        res.status(400).json({ error: error.message || 'Failed to toggle user status' });
    }
};
exports.toggleUserActive = toggleUserActive;
