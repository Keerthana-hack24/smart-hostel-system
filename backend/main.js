const express = require('express');
const cors = require('cors');
const path = require('path');           // ← ADD THIS
require('dotenv').config();

const { connectMySQL, getDB } = require('./db/mysql');
const { connectMongo } = require('./db/mongo');

const studentRoutes      = require('./routes/students');
const laundryRoutes      = require('./routes/laundry');
const complaintRoutes    = require('./routes/complaints');
const staffRoutes        = require('./routes/staff');
const notificationRoutes = require('./routes/notifications');
const LaundryLog         = require('./models/LaundryLog');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/students',      studentRoutes);
app.use('/api/laundry',       laundryRoutes);
app.use('/api/complaints',    complaintRoutes);
app.use('/api/staff',         staffRoutes);
app.use('/api/notifications', notificationRoutes);

// AUTO-COMPLETE LAUNDRY
async function autoCompleteLaundry() {
    try {
        const db = getDB();
        // Fix: status = 'Running' (not 'In Use')
        const [expired] = await db.query(`
            SELECT usage_id, machine_id, student_id
            FROM Laundry_Usage 
            WHERE status = 'Running' 
            AND end_time <= NOW()
        `);

        for (const session of expired) {
            await db.query('CALL CompleteLaundry(?)', [session.usage_id]); // use stored procedure
            // Log (duration_min not needed)
            await LaundryLog.create({
                machine_id: session.machine_id,
                student_id: session.student_id,
                event: 'COMPLETED_AUTO',
            });
            console.log(`Auto-completed session ${session.usage_id} for machine ${session.machine_id}`);
        }
    } catch (err) {
        console.error('Auto-complete error:', err.message);
    }
}

const PORT = process.env.PORT || 5000;

async function start() {
    await connectMySQL();
    await connectMongo();
    setInterval(autoCompleteLaundry, 60 * 1000); // check every minute
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

start().catch(console.error);