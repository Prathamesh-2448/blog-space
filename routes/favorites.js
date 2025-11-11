const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Add to favorites
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { blogId } = req.body;
        const userId = req.user.userId;

        await db.query(
            'INSERT INTO favorites (user_id, blog_id) VALUES (?, ?)',
            [userId, blogId]
        );

        res.status(201).json({ message: 'Added to favorites' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Already in favorites' });
        }
        console.error('Add favorite error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Remove from favorites
router.delete('/:blogId', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const blogId = req.params.blogId;

        await db.query(
            'DELETE FROM favorites WHERE user_id = ? AND blog_id = ?',
            [userId, blogId]
        );

        res.json({ message: 'Removed from favorites' });
    } catch (error) {
        console.error('Remove favorite error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user's favorites
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        const [favorites] = await db.query(`
            SELECT b.*, u.first_name, u.last_name, f.created_at as favorited_at
            FROM favorites f
            JOIN blogs b ON f.blog_id = b.blog_id
            JOIN users u ON b.author_id = u.user_id
            WHERE f.user_id = ?
            ORDER BY f.created_at DESC
        `, [userId]);

        res.json(favorites);
    } catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Check if blog is favorited by user
router.get('/check/:blogId', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const blogId = req.params.blogId;

        const [result] = await db.query(
            'SELECT * FROM favorites WHERE user_id = ? AND blog_id = ?',
            [userId, blogId]
        );

        res.json({ isFavorited: result.length > 0 });
    } catch (error) {
        console.error('Check favorite error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;