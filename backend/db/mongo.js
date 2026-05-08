const mongoose = require('mongoose');
 
async function connectMongo() {
    await mongoose.connect(
        process.env.MONGO_URI || 'mongodb://localhost:27017/hostel_db'
    );
    console.log('MongoDB Connected');
}
 
module.exports = { connectMongo };