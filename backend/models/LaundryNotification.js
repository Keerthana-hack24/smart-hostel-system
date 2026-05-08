const mongoose = require('mongoose');

const laundryNotificationSchema = new mongoose.Schema({
    student_id: { type: Number, required: true, index: true },
    message:    { type: String, required: true },
    type:       { type: String, enum: ['Laundry Alert', 'Machine Update'], default: 'Laundry Alert' },
    is_read:    { type: Boolean, default: false },
    timestamp:  { type: Date, default: Date.now },
}, { collection: 'laundry_notifications' });

laundryNotificationSchema.index({ student_id: 1, timestamp: -1 });

module.exports = mongoose.model('LaundryNotification', laundryNotificationSchema);