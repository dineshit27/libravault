"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAnnouncement = exports.updateAnnouncement = exports.createAnnouncement = exports.getActiveAnnouncements = exports.getAllAnnouncements = void 0;
const supabase_1 = require("../config/supabase");
function errorMessage(error, fallback) {
    return error instanceof Error ? error.message : fallback;
}
const getAllAnnouncements = async (_req, res) => {
    try {
        const { data, error } = await supabase_1.supabase
            .from('announcements')
            .select('*, admin:profiles(*)')
            .order('is_pinned', { ascending: false })
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        res.json(data || []);
    }
    catch (error) {
        res.status(500).json({ error: errorMessage(error, 'Error fetching announcements') });
    }
};
exports.getAllAnnouncements = getAllAnnouncements;
const getActiveAnnouncements = async (_req, res) => {
    try {
        const now = new Date().toISOString();
        const { data, error } = await supabase_1.supabase
            .from('announcements')
            .select('*, admin:profiles(*)')
            .eq('is_active', true)
            .or(`expires_at.is.null,expires_at.gt.${now}`)
            .order('is_pinned', { ascending: false })
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        res.json(data || []);
    }
    catch (error) {
        res.status(500).json({ error: errorMessage(error, 'Error fetching active announcements') });
    }
};
exports.getActiveAnnouncements = getActiveAnnouncements;
const createAnnouncement = async (req, res) => {
    try {
        const adminId = req.user?.id;
        const { title, content, is_pinned = false, expires_at = null, is_active = true, } = req.body;
        if (!adminId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        if (!title || !content) {
            return res.status(400).json({ error: 'title and content are required' });
        }
        const { data, error } = await supabase_1.supabase
            .from('announcements')
            .insert([{ title, content, admin_id: adminId, is_pinned, expires_at, is_active }])
            .select('*, admin:profiles(*)')
            .single();
        if (error)
            throw error;
        res.status(201).json(data);
    }
    catch (error) {
        res.status(400).json({ error: errorMessage(error, 'Error creating announcement') });
    }
};
exports.createAnnouncement = createAnnouncement;
const updateAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, is_pinned, expires_at, is_active } = req.body;
        const updates = {};
        if (title !== undefined)
            updates.title = title;
        if (content !== undefined)
            updates.content = content;
        if (is_pinned !== undefined)
            updates.is_pinned = is_pinned;
        if (expires_at !== undefined)
            updates.expires_at = expires_at;
        if (is_active !== undefined)
            updates.is_active = is_active;
        const { data, error } = await supabase_1.supabase
            .from('announcements')
            .update(updates)
            .eq('id', id)
            .select('*, admin:profiles(*)')
            .single();
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        res.status(400).json({ error: errorMessage(error, 'Error updating announcement') });
    }
};
exports.updateAnnouncement = updateAnnouncement;
const deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase_1.supabase
            .from('announcements')
            .delete()
            .eq('id', id);
        if (error)
            throw error;
        res.status(204).send();
    }
    catch (error) {
        res.status(400).json({ error: errorMessage(error, 'Error deleting announcement') });
    }
};
exports.deleteAnnouncement = deleteAnnouncement;
