const express = require('express');
const router  = express.Router();
const { getDB } = require('../db/mysql');

// get all students
router.get('/', async (req, res) => {
    try {
        const db = getDB();
        const [rows] = await db.query(
            'SELECT student_id, name, email, phone, room_id, nickname FROM Students'
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// student registration
router.post('/register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                error: 'Name, email and password are required'
            });
        }

        const db = getDB();

        // check existing email
        const [existing] = await db.query(
            'SELECT student_id FROM Students WHERE email = ?',
            [email]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                error: 'Email already registered'
            });
        }

        // insert student
        const [result] = await db.query(
            `INSERT INTO Students
            (name, email, phone, password)
            VALUES (?, ?, ?, ?)`,
            [name, email, phone || null, password]
        );

        // return created student
        const [rows] = await db.query(
            `SELECT student_id, name, email, phone
             FROM Students
             WHERE student_id = ?`,
            [result.insertId]
        );

        res.status(201).json(rows[0]);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// get one student with room info
router.get('/:id', async (req, res) => {
    try {
        const db = getDB();
        const [rows] = await db.query(
            `SELECT s.student_id, s.name, s.email, s.phone, s.nickname,
                    r.room_number, r.floor, r.block
             FROM Students s
             LEFT JOIN Rooms r ON s.room_id = r.room_id
             WHERE s.student_id = ?`,
            [req.params.id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Student not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// student login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const db = getDB();

        const [rows] = await db.query(
            'SELECT student_id, name, email, phone, room_id, nickname FROM Students WHERE email = ? AND password = ?',
            [email, password]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;