const express = require('express');
const router  = express.Router();
const Notification = require('../models/Notification');

// get all notifications for a user
router.get('/:user_id', async (req, res) => {
    try {
        const notifs = await Notification
            .find({ user_id: String(req.params.user_id) })
            .sort({ created_at: -1 })
            .lean();
        res.json(notifs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// mark one notification as read
router.patch('/:id/read', async (req, res) => {
    try {
        const updated = await Notification.findByIdAndUpdate(
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

// mark all notifications as read for a user
router.patch('/user/:user_id/read-all', async (req, res) => {
    try {
        await Notification.updateMany(
            { user_id: String(req.params.user_id) },
            { is_read: true }
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;