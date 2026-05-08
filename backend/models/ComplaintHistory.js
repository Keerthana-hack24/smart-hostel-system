const mongoose = require('mongoose');

const complaintHistorySchema = new mongoose.Schema({
    complaint_id: { type: Number, required: true, index: true },
    status: {
        type: String,
        enum: ['Pending', 'Assigned', 'In Progress', 'Resolved'],
        required: true,
    },
    updated_by: {
        role: { type: String, enum: ['admin', 'staff', 'student', 'system'], required: true },
        id:   { type: Number },
        name: { type: String },
    },
    remarks:   { type: String, default: '' },
    timestamp: { type: Date, default: Date.now, index: true },
}, { collection: 'complaint_history' });

complaintHistorySchema.index({ complaint_id: 1, timestamp: 1 });

module.exports = mongoose.model('ComplaintHistory', complaintHistorySchema);