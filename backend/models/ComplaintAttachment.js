const mongoose = require('mongoose');

const complaintAttachmentSchema = new mongoose.Schema({
    complaint_id:  { type: Number, required: true, index: true },
    student_id:    { type: Number, required: true },
    storage_type:  { type: String, enum: ['cloudinary', 'local'], required: true },
    cloudinary_id: { type: String },
    url:           { type: String, required: true },
    thumbnail_url: { type: String },
    original_name: { type: String },
    mimetype:      { type: String },
    size_bytes:    { type: Number },
    uploaded_at:   { type: Date, default: Date.now, index: true },
    deleted_at:    { type: Date, default: null },
}, { collection: 'complaint_attachments' });

complaintAttachmentSchema.index({ complaint_id: 1, uploaded_at: -1 });

module.exports = mongoose.model('ComplaintAttachment', complaintAttachmentSchema);