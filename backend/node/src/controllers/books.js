"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBookReviews = exports.updateBook = exports.createBook = exports.getBookById = exports.getBooks = void 0;
const supabase_1 = require("../config/supabase");
const getBooks = async (req, res) => {
    try {
        const { genre, search, page = 1, limit = 20 } = req.query;
        let query = supabase_1.supabase
            .from('books')
            .select('*, genre:genres(*)')
            .eq('is_active', true);
        if (genre)
            query = query.eq('genre_id', genre);
        if (search) {
            query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%,isbn.ilike.%${search}%`);
        }
        const from = (Number(page) - 1) * Number(limit);
        const to = from + Number(limit) - 1;
        const { data: books, error, count } = await query
            .range(from, to)
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        res.json({
            data: books,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: count,
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to fetch books' });
    }
};
exports.getBooks = getBooks;
const getBookById = async (req, res) => {
    try {
        const { id } = req.params;
        const { data: book, error } = await supabase_1.supabase
            .from('books')
            .select('*, genre:genres(*)')
            .eq('id', id)
            .single();
        if (error)
            return res.status(404).json({ error: 'Book not found' });
        res.json(book);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Error fetching book details' });
    }
};
exports.getBookById = getBookById;
const createBook = async (req, res) => {
    try {
        const bookData = req.body;
        // Admins only (handled by middleware)
        const { data: book, error } = await supabase_1.supabase
            .from('books')
            .insert([bookData])
            .select()
            .single();
        if (error)
            throw error;
        res.status(201).json(book);
    }
    catch (error) {
        res.status(400).json({ error: error.message || 'Failed to create book' });
    }
};
exports.createBook = createBook;
const updateBook = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };
        // Prevent changing primary key via payload.
        delete updateData.id;
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: 'No fields provided for update' });
        }
        const { data: book, error } = await supabase_1.supabase
            .from('books')
            .update(updateData)
            .eq('id', id)
            .select('*, genre:genres(*)')
            .single();
        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Book not found' });
            }
            throw error;
        }
        res.json(book);
    }
    catch (error) {
        res.status(400).json({ error: error.message || 'Failed to update book' });
    }
};
exports.updateBook = updateBook;
const getBookReviews = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase_1.supabase
            .from('reviews')
            .select('*, profile:profiles(full_name, avatar_url)')
            .eq('book_id', id)
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to fetch reviews' });
    }
};
exports.getBookReviews = getBookReviews;
