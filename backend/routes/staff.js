const express = require('express');
const router  = express.Router();
const { getDB } = require('../db/mysql');

// get all active staff
router.get('/', async (req, res) => {
    try {
        const db = getDB();
        const [rows] = await db.query(
            'SELECT staff_id, name, email, phone, specialization, is_active FROM Staff WHERE is_active = 1'
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// staff login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const db = getDB();

        const [rows] = await db.query(
            `SELECT staff_id, name, email, phone, specialization, is_active
             FROM Staff
             WHERE email = ? AND password = ? AND is_active = 1`,
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

// get one staff member
router.get('/:id', async (req, res) => {
    try {
        const db = getDB();
        const [rows] = await db.query(
            'SELECT staff_id, name, email, phone, specialization, is_active FROM Staff WHERE staff_id = ?',
            [req.params.id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Staff not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// get all complaints assigned to a staff member
router.get('/:id/assignments', async (req, res) => {
    try {
        const db = getDB();
        const [rows] = await db.query(
            `SELECT c.*, cc.category_name, a.assigned_date
             FROM Assignments a
             JOIN Complaints c ON a.complaint_id = c.complaint_id
             JOIN Complaint_Category cc ON c.category_id = cc.category_id
             WHERE a.staff_id = ?
             ORDER BY a.assigned_date DESC`,
            [req.params.id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;