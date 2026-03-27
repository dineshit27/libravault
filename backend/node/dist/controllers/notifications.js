"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotification = exports.markAllNotificationsRead = exports.markNotificationRead = exports.getMyNotifications = void 0;
const supabase_1 = require("../config/supabase");
function errorMessage(error, fallback) {
    return error instanceof Error ? error.message : fallback;
}
const NOTIFICATION_SELECT = 'id, user_id, type, title, message, is_read, link_url, created_at';
function mapNotificationRow(row) {
    return {
        ...row,
        action_url: row.link_url ?? null,
    };
}
const getMyNotifications = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { data, error } = await supabase_1.supabase
            .from('notifications')
            .select(NOTIFICATION_SELECT)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        const mapped = (data || []).map((row) => mapNotificationRow(row));
        res.json(mapped);
    }
    catch (error) {
        res.status(500).json({ error: errorMessage(error, 'Error fetching notifications') });
    }
};
exports.getMyNotifications = getMyNotifications;
const markNotificationRead = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { data, error } = await supabase_1.supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id)
            .eq('user_id', userId)
            .select(NOTIFICATION_SELECT)
            .single();
        if (error)
            throw error;
        res.json(mapNotificationRow(data));
    }
    catch (error) {
        res.status(400).json({ error: errorMessage(error, 'Error marking notification as read') });
    }
};
exports.markNotificationRead = markNotificationRead;
const markAllNotificationsRead = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { error } = await supabase_1.supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', userId)
            .eq('is_read', false);
        if (error)
            throw error;
        res.status(204).send();
    }
    catch (error) {
        res.status(400).json({ error: errorMessage(error, 'Error marking all notifications as read') });
    }
};
exports.markAllNotificationsRead = markAllNotificationsRead;
const deleteNotification = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { error } = await supabase_1.supabase
            .from('notifications')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);
        if (error)
            throw error;
        res.status(204).send();
    }
    catch (error) {
        res.status(400).json({ error: errorMessage(error, 'Error deleting notification') });
    }
};
exports.deleteNotification = deleteNotification;
