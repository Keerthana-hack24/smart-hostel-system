const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user_id:    { type: String, required: true, index: true },
    message:    { type: String, required: true },
    type:       { type: String, default: 'General' },
    is_read:    { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now, index: true },
}, { collection: 'notifications' });

notificationSchema.index({ user_id: 1, created_at: -1 });

module.exports = mongoose.model('Notification', notificationSchema);