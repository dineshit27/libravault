"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expireReservation = exports.fulfillReservation = exports.cancelReservation = exports.createReservation = exports.getMyReservations = exports.getReservations = void 0;
const supabase_1 = require("../config/supabase");
function errorMessage(error, fallback) {
    return error instanceof Error ? error.message : fallback;
}
const getReservations = async (req, res) => {
    try {
        const { status, page = '1', limit = '20' } = req.query;
        let query = supabase_1.supabase
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
        if (error)
            throw error;
        res.json({
            data: data || [],
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: count || 0,
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: errorMessage(error, 'Error fetching reservations') });
    }
};
exports.getReservations = getReservations;
const getMyReservations = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { data, error } = await supabase_1.supabase
            .from('reservations')
            .select('*, book:books(*)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        res.json(data || []);
    }
    catch (error) {
        res.status(500).json({ error: errorMessage(error, 'Error fetching reservations') });
    }
};
exports.getMyReservations = getMyReservations;
const createReservation = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { book_id } = req.body;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        if (!book_id) {
            return res.status(400).json({ error: 'book_id is required' });
        }
        const { data, error } = await supabase_1.supabase
            .from('reservations')
            .insert([{ user_id: userId, book_id, status: 'pending' }])
            .select('*, book:books(*), user:profiles(*)')
            .single();
        if (error)
            throw error;
        res.status(201).json(data);
    }
    catch (error) {
        res.status(400).json({ error: errorMessage(error, 'Error creating reservation') });
    }
};
exports.createReservation = createReservation;
const cancelReservation = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { data, error } = await supabase_1.supabase
            .from('reservations')
            .update({ status: 'cancelled' })
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        res.status(400).json({ error: errorMessage(error, 'Error cancelling reservation') });
    }
};
exports.cancelReservation = cancelReservation;
const fulfillReservation = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase_1.supabase
            .from('reservations')
            .update({
            status: 'fulfilled',
            fulfilled_date: new Date().toISOString(),
        })
            .eq('id', id)
            .select('*, book:books(*), user:profiles(*)')
            .single();
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        res.status(400).json({ error: errorMessage(error, 'Error fulfilling reservation') });
    }
};
exports.fulfillReservation = fulfillReservation;
const expireReservation = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase_1.supabase
            .from('reservations')
            .update({ status: 'expired' })
            .eq('id', id)
            .select('*, book:books(*), user:profiles(*)')
            .single();
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        res.status(400).json({ error: errorMessage(error, 'Error expiring reservation') });
    }
};
exports.expireReservation = expireReservation;
