"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportReport = exports.updateSettings = exports.getSettings = exports.getDashboardStats = void 0;
const supabase_1 = require("../config/supabase");
const DEFAULT_LIBRARY_SETTINGS = {
    library_name: 'LibraVault Library',
    address: '',
    contact_email: '',
    contact_phone: '',
    default_borrow_days: 14,
    max_renewals: 2,
    max_concurrent_borrows: 5,
    fine_per_day: 1,
    auto_approve_borrows: false,
    open_hours: '09:00',
    close_hours: '18:00',
    reservation_expiry_hours: 48,
};
function isMissingLibrarySettingsTable(error) {
    if (!error || typeof error !== 'object')
        return false;
    const err = error;
    return err.code === 'PGRST205' || err.message?.includes('public.library_settings') === true;
}
function errorMessage(error, fallback) {
    return error instanceof Error ? error.message : fallback;
}
function getStartOfMonthIso() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return start.toISOString();
}
function toCsv(rows) {
    if (rows.length === 0) {
        return 'No data';
    }
    const headers = Object.keys(rows[0]);
    const escape = (value) => {
        if (value === null || value === undefined)
            return '';
        const text = typeof value === 'string' ? value : JSON.stringify(value);
        if (text.includes(',') || text.includes('"') || text.includes('\n')) {
            return `"${text.replace(/"/g, '""')}"`;
        }
        return text;
    };
    const lines = [headers.join(',')];
    for (const row of rows) {
        lines.push(headers.map((header) => escape(row[header])).join(','));
    }
    return lines.join('\n');
}
async function getOrCreateSettings() {
    const { data, error } = await supabase_1.supabase
        .from('library_settings')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();
    if (error) {
        if (isMissingLibrarySettingsTable(error)) {
            return { id: null, ...DEFAULT_LIBRARY_SETTINGS };
        }
        throw error;
    }
    if (data)
        return data;
    const { data: created, error: createError } = await supabase_1.supabase
        .from('library_settings')
        .insert(DEFAULT_LIBRARY_SETTINGS)
        .select('*')
        .single();
    if (createError) {
        if (isMissingLibrarySettingsTable(createError)) {
            return { id: null, ...DEFAULT_LIBRARY_SETTINGS };
        }
        throw createError;
    }
    return created;
}
const getDashboardStats = async (_req, res) => {
    try {
        const monthStart = getStartOfMonthIso();
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 7);
        const [booksRes, membersRes, borrowalsRes, overdueRes, finesRes, newMembersRes] = await Promise.all([
            supabase_1.supabase.from('books').select('*', { count: 'exact', head: true }),
            supabase_1.supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'active'),
            supabase_1.supabase.from('borrowals').select('*', { count: 'exact', head: true }).gte('borrow_date', new Date().toISOString().slice(0, 10)),
            supabase_1.supabase.from('borrowals').select('*', { count: 'exact', head: true }).eq('status', 'overdue'),
            supabase_1.supabase.from('fines').select('amount').eq('status', 'paid').gte('paid_date', monthStart),
            supabase_1.supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', weekStart.toISOString()),
        ]);
        const finesCollectedThisMonth = (finesRes.data || []).reduce((sum, row) => {
            const amount = Number(row.amount || 0);
            return sum + amount;
        }, 0);
        res.json({
            totalBooks: booksRes.count || 0,
            activeMembers: membersRes.count || 0,
            borrowedToday: borrowalsRes.count || 0,
            overdueCount: overdueRes.count || 0,
            finesCollectedThisMonth,
            newMembersThisWeek: newMembersRes.count || 0,
        });
    }
    catch (error) {
        res.status(500).json({ error: errorMessage(error, 'Error fetching dashboard stats') });
    }
};
exports.getDashboardStats = getDashboardStats;
const getSettings = async (_req, res) => {
    try {
        const settings = await getOrCreateSettings();
        res.json(settings);
    }
    catch (error) {
        res.status(500).json({ error: errorMessage(error, 'Error fetching settings') });
    }
};
exports.getSettings = getSettings;
const updateSettings = async (req, res) => {
    try {
        const updates = req.body;
        const existing = await getOrCreateSettings();
        const settingsId = existing.id;
        if (!settingsId) {
            return res.status(503).json({ error: 'Settings storage is not initialized. Run database/init.sql.' });
        }
        const { data, error } = await supabase_1.supabase
            .from('library_settings')
            .update(updates)
            .eq('id', settingsId)
            .select('*')
            .single();
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        res.status(400).json({ error: errorMessage(error, 'Error updating settings') });
    }
};
exports.updateSettings = updateSettings;
const exportReport = async (req, res) => {
    try {
        const typeParam = req.params.type;
        const type = Array.isArray(typeParam) ? typeParam[0] : typeParam;
        const { from, to } = req.query;
        const config = {
            borrowals: { table: 'borrowals', select: '*, book:books(title), user:profiles(full_name,email)', dateField: 'created_at' },
            fines: { table: 'fines', select: '*, borrowal:borrowals(id), user:profiles(full_name,email)', dateField: 'created_at' },
            reservations: { table: 'reservations', select: '*, book:books(title), user:profiles(full_name,email)', dateField: 'created_at' },
            members: { table: 'profiles', select: '*', dateField: 'created_at' },
            books: { table: 'books', select: '*', dateField: 'created_at' },
        };
        if (!config[type]) {
            return res.status(400).json({ error: 'Unsupported report type' });
        }
        const selected = config[type];
        let query = supabase_1.supabase
            .from(selected.table)
            .select(selected.select)
            .order(selected.dateField, { ascending: false });
        if (from) {
            query = query.gte(selected.dateField, from);
        }
        if (to) {
            query = query.lte(selected.dateField, to);
        }
        const { data, error } = await query.limit(5000);
        if (error)
            throw error;
        const csv = toCsv((data || []));
        const fileName = `${type}-report-${new Date().toISOString().slice(0, 10)}.csv`;
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        res.status(200).send(csv);
    }
    catch (error) {
        res.status(500).json({ error: errorMessage(error, 'Error exporting report') });
    }
};
exports.exportReport = exportReport;
