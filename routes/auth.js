const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Register endpoint
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password, userType, category } = req.body;

        // Validate password strength
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ 
                message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character' 
            });
        }

        // Check if user already exists
        const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Insert user
        const [result] = await db.query(
            'INSERT INTO users (first_name, last_name, email, password_hash, user_type, category) VALUES (?, ?, ?, ?, ?, ?)',
            [firstName, lastName, email, passwordHash, userType, category || null]
        );

        res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login endpoint
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = users[0];

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create JWT token
        const token = jwt.sign(
            { 
                userId: user.user_id, 
                email: user.email, 
                userType: user.user_type,
                category: user.category 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Send token as cookie
        res.cookie('token', token, { 
            httpOnly: true, 
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        res.json({ 
            message: 'Login successful', 
            user: {
                userId: user.user_id,
                firstName: user.first_name,
                lastName: user.last_name,
                userType: user.user_type,
                category: user.category
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Logout endpoint
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
});

// Check authentication status
router.get('/check', async (req, res) => {
    try {
        const token = req.cookies.token;
        
        if (!token) {
            return res.json({ authenticated: false });
        }

        const verified = jwt.verify(token, process.env.JWT_SECRET);
        const [users] = await db.query(
            'SELECT user_id, first_name, last_name, user_type, category FROM users WHERE user_id = ?',
            [verified.userId]
        );

        if (users.length === 0) {
            return res.json({ authenticated: false });
        }

        res.json({ 
            authenticated: true, 
            user: {
                userId: users[0].user_id,
                firstName: users[0].first_name,
                lastName: users[0].last_name,
                userType: users[0].user_type,
                category: users[0].category
            }
        });
    } catch (error) {
        res.json({ authenticated: false });
    }
});

module.exports = router;