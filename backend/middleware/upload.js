const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const fs   = require('fs');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const useCloudinary = !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY    &&
    process.env.CLOUDINARY_API_SECRET
);

const cloudinaryStorage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
        folder:          'hostel/complaints',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'heic'],
        transformation:  [{ width: 1920, height: 1080, crop: 'limit', quality: 'auto' }],
        public_id: `complaint_${req.body.complaint_id || 'new'}_${Date.now()}`,
    }),
});

const localStorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/complaints';
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `complaint_${Date.now()}${ext}`);
    },
});

const imageFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|heic/;
    const extOk   = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeOk  = allowed.test(file.mimetype);
    if (extOk && mimeOk) return cb(null, true);
    cb(new Error('Only image files are allowed'));
};

const uploadMiddleware = multer({
    storage:    useCloudinary ? cloudinaryStorage : localStorageEngine,
    fileFilter: imageFilter,
    limits:     { fileSize: 10 * 1024 * 1024, files: 5 },
}).array('images', 5);

module.exports = { uploadMiddleware, cloudinary, useCloudinary };