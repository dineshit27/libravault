"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.waiveFine = exports.payFine = exports.getMyFines = exports.getAllFines = void 0;
const supabase_1 = require("../config/supabase");
function errorMessage(error, fallback) {
    return error instanceof Error ? error.message : fallback;
}
const getAllFines = async (req, res) => {
    try {
        const { status, page = '1', limit = '20' } = req.query;
        let query = supabase_1.supabase
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
        res.status(500).json({ error: errorMessage(error, 'Error fetching fines') });
    }
};
exports.getAllFines = getAllFines;
const getMyFines = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { data, error } = await supabase_1.supabase
            .from('fines')
            .select('*, borrowal:borrowals(*)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        res.json(data || []);
    }
    catch (error) {
        res.status(500).json({ error: errorMessage(error, 'Error fetching fines') });
    }
};
exports.getMyFines = getMyFines;
const payFine = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { data, error } = await supabase_1.supabase
            .from('fines')
            .update({
            status: 'paid',
            paid_date: new Date().toISOString(),
        })
            .eq('id', id)
            .eq('user_id', userId)
            .select('*, borrowal:borrowals(*)')
            .single();
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        res.status(400).json({ error: errorMessage(error, 'Error paying fine') });
    }
};
exports.payFine = payFine;
const waiveFine = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase_1.supabase
            .from('fines')
            .update({
            status: 'waived',
        })
            .eq('id', id)
            .select('*, borrowal:borrowals(*), user:profiles(*)')
            .single();
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        res.status(400).json({ error: errorMessage(error, 'Error waiving fine') });
    }
};
exports.waiveFine = waiveFine;
