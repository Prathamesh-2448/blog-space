const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get all blogs (with optional filters)
router.get('/', async (req, res) => {
    try {
        const { category, search, authorId } = req.query;
        
        let query = `
                SELECT b.*, u.first_name, u.last_name,
                (SELECT COUNT(*) FROM favorites WHERE blog_id = b.blog_id) as favorite_count,
                (SELECT image_data FROM blog_images WHERE blog_id = b.blog_id ORDER BY image_order LIMIT 1) as image_url
                FROM blogs b
                JOIN users u ON b.author_id = u.user_id
                WHERE 1=1
        `;

        // let query = `
        //     SELECT b.*, u.first_name, u.last_name,
        //     (SELECT COUNT(*) FROM favorites WHERE blog_id = b.blog_id) as favorite_count
        //     FROM blogs b
        //     JOIN users u ON b.author_id = u.user_id
        //     WHERE 1=1
        // `;
        const params = [];

        if (category) {
            query += ' AND b.category = ?';
            params.push(category);
        }

        if (search) {
            query += ' AND (b.title LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        if (authorId) {
            query += ' AND b.author_id = ?';
            params.push(authorId);
        }

        query += ' ORDER BY b.created_at DESC';

        const [blogs] = await db.query(query, params);
        res.json(blogs);
    } catch (error) {
        console.error('Get blogs error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single blog with images
router.get('/:id', async (req, res) => {
    try {
        const [blogs] = await db.query(`
            SELECT b.*, u.first_name, u.last_name,
            (SELECT COUNT(*) FROM favorites WHERE blog_id = b.blog_id) as favorite_count
            FROM blogs b
            JOIN users u ON b.author_id = u.user_id
            WHERE b.blog_id = ?
        `, [req.params.id]);

        if (blogs.length === 0) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        const [images] = await db.query(
            'SELECT image_data, image_order FROM blog_images WHERE blog_id = ? ORDER BY image_order',
            [req.params.id]
        );

        res.json({ ...blogs[0], images: images.map(img => img.image_data) });
    } catch (error) {
        console.error('Get blog error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create blog (requires authentication)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { title, content, category, images } = req.body;
        const authorId = req.user.userId;

        // Check if user is a creator
        if (req.user.userType !== 'creator') {
            return res.status(403).json({ message: 'Only creators can post blogs' });
        }

        // Insert blog
        const [result] = await db.query(
            'INSERT INTO blogs (title, content, category, author_id) VALUES (?, ?, ?, ?)',
            [title, content, category, authorId]
        );

        const blogId = result.insertId;

        // Insert images if provided
        if (images && images.length > 0) {
            for (let i = 0; i < images.length; i++) {
                await db.query(
                    'INSERT INTO blog_images (blog_id, image_data, image_order) VALUES (?, ?, ?)',
                    [blogId, images[i], i]
                );
            }
        }

        res.status(201).json({ message: 'Blog created successfully', blogId });
    } catch (error) {
        console.error('Create blog error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update blog
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { title, content, category, images } = req.body;
        const blogId = req.params.id;

        // Check if user is the author
        const [blogs] = await db.query('SELECT author_id FROM blogs WHERE blog_id = ?', [blogId]);
        if (blogs.length === 0) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        if (blogs[0].author_id !== req.user.userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Update blog
        await db.query(
            'UPDATE blogs SET title = ?, content = ?, category = ? WHERE blog_id = ?',
            [title, content, category, blogId]
        );

        // Delete old images and insert new ones
        await db.query('DELETE FROM blog_images WHERE blog_id = ?', [blogId]);
        if (images && images.length > 0) {
            for (let i = 0; i < images.length; i++) {
                await db.query(
                    'INSERT INTO blog_images (blog_id, image_data, image_order) VALUES (?, ?, ?)',
                    [blogId, images[i], i]
                );
            }
        }

        res.json({ message: 'Blog updated successfully' });
    } catch (error) {
        console.error('Update blog error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete blog
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const blogId = req.params.id;

        // Check if user is the author
        const [blogs] = await db.query('SELECT author_id FROM blogs WHERE blog_id = ?', [blogId]);
        if (blogs.length === 0) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        if (blogs[0].author_id !== req.user.userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await db.query('DELETE FROM blogs WHERE blog_id = ?', [blogId]);
        res.json({ message: 'Blog deleted successfully' });
    } catch (error) {
        console.error('Delete blog error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;