const express = require('express');
const router  = express.Router();
const path    = require('path');
const fs      = require('fs');

const { getDB }             = require('../db/mysql');
const { uploadMiddleware, cloudinary, useCloudinary } = require('../middleware/upload');
const ComplaintHistory      = require('../models/ComplaintHistory');
const ComplaintAttachment   = require('../models/ComplaintAttachment');
const Notification          = require('../models/Notification');

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────

async function saveAttachments(files, complaint_id, student_id) {
    if (!files || files.length === 0) return [];

    const docs = files.map(file => {
        if (useCloudinary) {
            const thumb = cloudinary.url(file.filename, {
                width: 200, height: 200, crop: 'fill', quality: 'auto', fetch_format: 'auto',
            });
            return {
                complaint_id, student_id,
                storage_type:  'cloudinary',
                cloudinary_id: file.filename,
                url:           file.path,
                thumbnail_url: thumb,
                original_name: file.originalname,
                mimetype:      file.mimetype,
                size_bytes:    file.size,
            };
        } else {
            const url = `/uploads/complaints/${file.filename}`;
            return {
                complaint_id, student_id,
                storage_type:  'local',
                url,
                thumbnail_url: url,
                original_name: file.originalname,
                mimetype:      file.mimetype,
                size_bytes:    file.size,
            };
        }
    });

    return ComplaintAttachment.insertMany(docs);
}

async function removeAttachment(attachment_id) {
    const doc = await ComplaintAttachment.findById(attachment_id);
    if (!doc) throw new Error('Attachment not found');

    if (doc.storage_type === 'cloudinary' && doc.cloudinary_id) {
        await cloudinary.uploader.destroy(doc.cloudinary_id);
    }
    if (doc.storage_type === 'local') {
        const filepath = path.join(__dirname, '..', doc.url);
        if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    }

    doc.deleted_at = new Date();
    return doc.save();
}

// ─────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────

// get all categories
router.get('/categories', async (req, res) => {
    try {
        const db = getDB();
        const [rows] = await db.query('SELECT * FROM Complaint_Category WHERE Is_active = 1');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// get all complaints
router.get('/', async (req, res) => {
    try {
        const db = getDB();
        const [rows] = await db.query(
            `SELECT c.*, cc.category_name, s.name AS student_name
             FROM Complaints c
             JOIN Complaint_Category cc ON c.category_id = cc.category_id
             JOIN Students s ON c.student_id = s.student_id
             ORDER BY c.date_submitted DESC`
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// get complaints by student
router.get('/student/:student_id', async (req, res) => {
    try {
        const db = getDB();
        const [rows] = await db.query(
            `SELECT c.*, cc.category_name
             FROM Complaints c
             JOIN Complaint_Category cc ON c.category_id = cc.category_id
             WHERE c.student_id = ?
             ORDER BY c.date_submitted DESC`,
            [req.params.student_id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// get feedback for a complaint
router.get('/feedback/:complaint_id', async (req, res) => {
    try {
        const db = getDB();
        const [rows] = await db.query(
            `SELECT f.*, s.name AS student_name
             FROM Feedback f
             JOIN Students s ON f.student_id = s.student_id
             WHERE f.complaint_id = ?`,
            [req.params.complaint_id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// get one complaint — includes attachments + timeline from mongo
router.get('/:id', async (req, res) => {
    try {
        const db = getDB();
        const id = req.params.id;

        const [rows] = await db.query(
            `SELECT c.*, cc.category_name, s.name AS student_name
             FROM Complaints c
             JOIN Complaint_Category cc ON c.category_id = cc.category_id
             JOIN Students s ON c.student_id = s.student_id
             WHERE c.complaint_id = ?`,
            [id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Complaint not found' });

        const [attachments, timeline] = await Promise.all([
            ComplaintAttachment.find({ complaint_id: id, deleted_at: null }).sort({ uploaded_at: 1 }).lean(),
            ComplaintHistory.find({ complaint_id: id }).sort({ timestamp: 1 }).lean(),
        ]);

        res.json({ ...rows[0], attachments, timeline });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// submit a new complaint (with optional images)
router.post('/', (req, res) => {
    uploadMiddleware(req, res, async (err) => {
        if (err) return res.status(400).json({ error: err.message });

        const { student_id, category_id, description, priority } = req.body;
        if (!student_id || !category_id || !description) {
            return res.status(400).json({ error: 'student_id, category_id and description are required' });
        }

        try {
            const db = getDB();
            const [result] = await db.query(
                `INSERT INTO Complaints(student_id, category_id, description, priority)
                 VALUES (?, ?, ?, ?)`,
                [student_id, category_id, description, priority || 'Medium']
            );

            const complaint_id = result.insertId;

            if (req.files && req.files.length > 0) {
                await saveAttachments(req.files, complaint_id, student_id);
            }

            await ComplaintHistory.create({
                complaint_id,
                status: 'Pending',
                updated_by: { role: 'student', id: Number(student_id) },
                remarks: 'Complaint submitted',
            });

            await Notification.create({
                user_id: String(student_id),
                message: `Complaint #${complaint_id} submitted successfully`,
                type:    'Complaint Update',
            });

            res.status(201).json({ message: 'Complaint submitted', complaint_id });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });
});

// update complaint status
router.patch('/:id/status', async (req, res) => {
    const { status, remarks, updated_by } = req.body;
    const complaint_id = req.params.id;

    if (!status) return res.status(400).json({ error: 'status is required' });

    try {
        const db = getDB();
        const [rows] = await db.query('SELECT * FROM Complaints WHERE complaint_id = ?', [complaint_id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Complaint not found' });

        await db.query(
            'UPDATE Complaints SET status = ?, resolution_remarks = ? WHERE complaint_id = ?',
            [status, remarks || rows[0].resolution_remarks, complaint_id]
        );

        await ComplaintHistory.create({
            complaint_id: Number(complaint_id),
            status,
            updated_by: updated_by || { role: 'system' },
            remarks: remarks || '',
        });

        await Notification.create({
            user_id: String(rows[0].student_id),
            message: `Your complaint #${complaint_id} is now: ${status}`,
            type:    'Complaint Update',
        });

        res.json({ message: 'Status updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// assign complaint to staff
router.post('/assign', async (req, res) => {
    const { complaint_id, staff_id } = req.body;
    if (!complaint_id || !staff_id) {
        return res.status(400).json({ error: 'complaint_id and staff_id are required' });
    }
    try {
        const db = getDB();

        // mysql trigger auto-sets status to Assigned
        await db.query(
            'INSERT INTO Assignments(complaint_id, staff_id) VALUES (?, ?)',
            [complaint_id, staff_id]
        );

        const [staffRows] = await db.query('SELECT name FROM Staff WHERE staff_id = ?', [staff_id]);
        const staffName   = staffRows[0]?.name || '';

        const [compRows]  = await db.query('SELECT student_id FROM Complaints WHERE complaint_id = ?', [complaint_id]);
        const student_id  = compRows[0]?.student_id;

        await ComplaintHistory.create({
            complaint_id: Number(complaint_id),
            status: 'Assigned',
            updated_by: { role: 'admin', id: Number(staff_id), name: staffName },
            remarks: `Assigned to ${staffName}`,
        });

        if (student_id) {
            await Notification.create({
                user_id: String(student_id),
                message: `Your complaint #${complaint_id} has been assigned to ${staffName}`,
                type:    'Complaint Update',
            });
        }

        res.status(201).json({ message: 'Complaint assigned' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Complaint is already assigned' });
        }
        res.status(500).json({ error: err.message });
    }
});

// delete one attachment
router.delete('/attachments/:attachment_id', async (req, res) => {
    try {
        await removeAttachment(req.params.attachment_id);
        res.json({ message: 'Attachment deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// submit feedback (mysql trigger checks complaint is resolved)
router.post('/feedback', async (req, res) => {
    const { complaint_id, student_id, rating, comments } = req.body;
    if (!complaint_id || !student_id || !rating) {
        return res.status(400).json({ error: 'complaint_id, student_id and rating are required' });
    }
    try {
        const db = getDB();
        await db.query(
            'INSERT INTO Feedback(complaint_id, student_id, rating, comments) VALUES (?, ?, ?, ?)',
            [complaint_id, student_id, rating, comments || '']
        );
        res.status(201).json({ message: 'Feedback submitted' });
    } catch (err) {
        if (err.message.includes('Feedback can be added only')) {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;