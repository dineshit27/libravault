"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReview = exports.updateReview = exports.createReview = exports.getMyReviews = void 0;
const supabase_1 = require("../config/supabase");
function requireUserId(req) {
    const userId = req?.user?.id;
    if (!userId)
        throw new Error('Authentication required');
    return userId;
}
const getMyReviews = async (req, res) => {
    try {
        const userId = requireUserId(req);
        const { data, error } = await supabase_1.supabase
            .from('reviews')
            .select('*, book:books(*)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        res.json(data);
    }
    catch (e) {
        res.status(400).json({ error: e?.message || 'Failed to fetch reviews' });
    }
};
exports.getMyReviews = getMyReviews;
const createReview = async (req, res) => {
    try {
        const userId = requireUserId(req);
        const { book_id, rating, review_text } = req.body || {};
        if (!book_id)
            return res.status(400).json({ error: 'book_id is required' });
        const ratingNum = Number(rating);
        if (!Number.isFinite(ratingNum) || ratingNum < 1 || ratingNum > 5) {
            return res.status(400).json({ error: 'rating must be between 1 and 5' });
        }
        const { data, error } = await supabase_1.supabase
            .from('reviews')
            .upsert([{ user_id: userId, book_id, rating: ratingNum, review_text: review_text ?? null }], { onConflict: 'user_id,book_id' })
            .select()
            .single();
        if (error)
            throw error;
        // Optional: emit socket event
        const io = req.app.get('io');
        if (io)
            io.emit('review_created', { bookId: book_id, userId });
        res.status(201).json(data);
    }
    catch (e) {
        res.status(400).json({ error: e?.message || 'Failed to create review' });
    }
};
exports.createReview = createReview;
const updateReview = async (req, res) => {
    try {
        const userId = requireUserId(req);
        const { id } = req.params;
        const { rating, review_text } = req.body || {};
        const patch = {};
        if (rating !== undefined) {
            const ratingNum = Number(rating);
            if (!Number.isFinite(ratingNum) || ratingNum < 1 || ratingNum > 5) {
                return res.status(400).json({ error: 'rating must be between 1 and 5' });
            }
            patch.rating = ratingNum;
        }
        if (review_text !== undefined)
            patch.review_text = review_text;
        const { data, error } = await supabase_1.supabase
            .from('reviews')
            .update(patch)
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();
        if (error)
            throw error;
        res.json(data);
    }
    catch (e) {
        res.status(400).json({ error: e?.message || 'Failed to update review' });
    }
};
exports.updateReview = updateReview;
const deleteReview = async (req, res) => {
    try {
        const userId = requireUserId(req);
        const { id } = req.params;
        const { data, error } = await supabase_1.supabase
            .from('reviews')
            .delete()
            .eq('id', id)
            .eq('user_id', userId)
            .select('id')
            .maybeSingle();
        if (error)
            throw error;
        if (!data)
            return res.status(404).json({ error: 'Review not found' });
        res.status(204).send();
    }
    catch (e) {
        res.status(400).json({ error: e?.message || 'Failed to delete review' });
    }
};
exports.deleteReview = deleteReview;
