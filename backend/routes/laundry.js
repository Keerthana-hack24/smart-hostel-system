const express = require('express');
const router  = express.Router();
const { getDB }          = require('../db/mysql');
const LaundryLog          = require('../models/LaundryLog');
const LaundryNotification = require('../models/LaundryNotification');
const Notification        = require('../models/Notification');

// get all machines
router.get('/machines', async (req, res) => {
    try {
        const db = getDB();
        const [rows] = await db.query('SELECT * FROM Laundry_Machines');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// get available machines only
router.get('/machines/available', async (req, res) => {
    try {
        const db = getDB();
        const [rows] = await db.query("SELECT * FROM Laundry_Machines WHERE status = 'Available'");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// get currently running laundry sessions
router.get('/running', async (req, res) => {
    try {
        const db = getDB();
        const [rows] = await db.query('SELECT * FROM Running_Laundry');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// start laundry — calls mysql stored procedure
router.post('/start', async (req, res) => {
    const { machine_id, student_id, duration } = req.body;
    if (!machine_id || !student_id || !duration) {
        return res.status(400).json({ error: 'machine_id, student_id and duration are required' });
    }
    try {
        const db = getDB();
        await db.query('CALL StartLaundry(?, ?, ?)', [machine_id, student_id, duration]);

        await LaundryLog.create({ machine_id, student_id, event: 'STARTED', duration_min: duration });

        await LaundryNotification.create({
            student_id,
            message: `Laundry started on Machine ${machine_id}. Duration: ${duration} mins`,
            type: 'Laundry Alert',
        });

        res.json({ message: 'Laundry started' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// complete laundry — calls mysql stored procedure
router.post('/complete', async (req, res) => {
  const { usage_id } = req.body;
  if (!usage_id) {
    return res.status(400).json({ error: 'Usage ID is required' });
  }

  try {
    const db = getDB();
    
    // Check if the laundry session exists
    const [rows] = await db.query(
      'SELECT * FROM Laundry_Usage WHERE usage_id = ?',
      [usage_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Laundry session not found' });
    }

    // Mark the session as completed
    await db.query(
      'UPDATE Laundry_Usage SET status = "Completed" WHERE usage_id = ?',
      [usage_id]
    );

    // Freeing up the machine
    await db.query(
      'UPDATE Laundry_Machines SET status = "Available" WHERE machine_id = ?',
      [rows[0].machine_id]
    );

    // Optionally, you can add to a LaundryLog or any other logging system
    await LaundryLog.create({
      machine_id: rows[0].machine_id,
      student_id: rows[0].student_id,
      event: 'COMPLETED',
      duration_min: rows[0].duration_min,
    });

    // Send success response
    res.json({ message: 'Laundry completed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// get laundry logs for a machine (mongo)
router.get('/logs/:machine_id', async (req, res) => {
    try {
        const logs = await LaundryLog
            .find({ machine_id: req.params.machine_id })
            .sort({ timestamp: -1 })
            .lean();
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// get laundry notifications for a student (mongo)
router.get('/notifications/:student_id', async (req, res) => {
    try {
        const notifs = await LaundryNotification
            .find({ student_id: req.params.student_id })
            .sort({ timestamp: -1 })
            .lean();
        res.json(notifs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// mark laundry notification as read
router.patch('/notifications/:id/read', async (req, res) => {
    try {
        const updated = await LaundryNotification.findByIdAndUpdate(
            req.params.id,
            { is_read: true },
            { new: true }
        );
        if (!updated) return res.status(404).json({ error: 'Notification not found' });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;