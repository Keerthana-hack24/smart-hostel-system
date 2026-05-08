const mongoose = require('mongoose');

const laundryLogSchema = new mongoose.Schema({
    machine_id:   { type: Number, required: true, index: true },
    student_id:   { type: Number, required: true },
    event:        { type: String, enum: ['STARTED', 'COMPLETED', 'RUNNING'], required: true },
    duration_min: { type: Number },
    timestamp:    { type: Date, default: Date.now, index: true },
}, { collection: 'laundry_logs' });

laundryLogSchema.index({ machine_id: 1, timestamp: -1 });

module.exports = mongoose.model('LaundryLog', laundryLogSchema);