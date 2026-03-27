"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyRole = exports.registerAdmin = void 0;
const supabase_1 = require("../config/supabase");
const registerAdmin = async (req, res) => {
    try {
        const { email, password, fullName, role, adminInviteCode } = req.body;
        if (!email || !password || !fullName) {
            return res.status(400).json({ error: 'Email, password, and full name are required.' });
        }
        if (role !== 'admin') {
            return res.status(400).json({ error: 'Invalid registration role for this endpoint.' });
        }
        const serverInviteCode = process.env.ADMIN_REGISTER_CODE;
        if (!serverInviteCode) {
            return res.status(500).json({ error: 'Admin registration is disabled on server.' });
        }
        if (adminInviteCode !== serverInviteCode) {
            return res.status(403).json({ error: 'Invalid admin invite code.' });
        }
        const { data, error } = await supabase_1.supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: false,
            user_metadata: {
                full_name: fullName,
                role: 'admin',
            },
        });
        if (error) {
            return res.status(400).json({ error: error.message || 'Failed to create admin account.' });
        }
        const userId = data.user?.id;
        if (!userId) {
            return res.status(500).json({ error: 'Admin account created but user id was missing from response.' });
        }
        // Ensure the profiles row is created/updated as admin.
        // Some environments may not have the auth.users -> profiles trigger installed, so we upsert here.
        const membershipSuffix = Math.floor(Math.random() * 900000 + 100000).toString();
        const { error: profileUpsertError } = await supabase_1.supabase
            .from('profiles')
            .upsert({
            id: userId,
            full_name: fullName,
            email,
            membership_number: `LV-${membershipSuffix}`,
            avatar_url: null,
            role: 'admin',
            is_active: true,
        }, { onConflict: 'id' });
        if (profileUpsertError) {
            return res.status(500).json({
                error: `Admin created but failed to set profile role: ${profileUpsertError.message}`,
                userId,
            });
        }
        return res.status(201).json({
            message: 'Admin account created. Please verify email if required by your auth settings.',
            userId,
        });
    }
    catch (error) {
        return res.status(500).json({ error: error.message || 'Internal server error creating admin account.' });
    }
};
exports.registerAdmin = registerAdmin;
const getMyRole = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const normalize = (rawRole) => String(rawRole || '').trim().toLowerCase() === 'admin' ? 'admin' : 'user';
        const { data: profile, error } = await supabase_1.supabase
            .from('profiles')
            .select('role, email')
            .eq('id', req.user.id)
            .single();
        if (!error && profile) {
            return res.status(200).json({ role: normalize(profile.role) });
        }
        // Recovery path for deployed environments where auth user IDs changed or
        // profile trigger wasn't applied: resolve role by verified auth email.
        const authEmail = String(req.user.email || '').trim().toLowerCase();
        if (!authEmail) {
            return res.status(404).json({ error: 'Profile role not found' });
        }
        const { data: byEmail, error: byEmailError } = await supabase_1.supabase
            .from('profiles')
            .select('role, email')
            .ilike('email', authEmail)
            .maybeSingle();
        if (byEmailError || !byEmail) {
            return res.status(404).json({ error: 'Profile role not found' });
        }
        return res.status(200).json({ role: normalize(byEmail.role) });
    }
    catch (error) {
        return res.status(500).json({ error: error.message || 'Failed to resolve user role' });
    }
};
exports.getMyRole = getMyRole;
