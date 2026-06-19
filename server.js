require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// --- Middleware ---
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json("Unauthorized");
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json("Forbidden");
        req.user = user;
        next();
    });
};

// --- Auth Routes ---
app.post('/auth/register', async (req, res) => {
    const { email, password } = req.body;
    const hash = await bcrypt.hash(password, 12);
    try {
        await pool.query('INSERT INTO users (email, password_hash) VALUES ($1, $2)', [email, hash]);
        res.status(201).json("Registered");
    } catch (e) { res.status(400).json("Error"); }
});

app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (rows.length && await bcrypt.compare(password, rows[0].password_hash)) {
        const token = jwt.sign({ id: rows[0].id }, process.env.JWT_SECRET);
        res.json({ token });
    } else res.status(401).json("Invalid");
});

// --- Service & Request Routes ---
app.get('/services', async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM services');
    res.json(rows);
});

app.post('/requests', authenticate, async (req, res) => {
    const { service_id, details } = req.body;
    await pool.query('INSERT INTO requests (user_id, service_id, details) VALUES ($1, $2, $3)', 
        [req.user.id, service_id, details]);
    res.status(201).json("Requested");
});

app.get('/requests', authenticate, async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM requests WHERE user_id = $1', [req.user.id]);
    res.json(rows);
});

app.listen(5000, () => console.log("Server running on port 5000"));
