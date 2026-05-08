const mysql = require('mysql2/promise');
 
let db;
 
async function connectMySQL() {
    db = await mysql.createConnection({
        host:     process.env.MYSQL_HOST     || 'localhost',
        user:     process.env.MYSQL_USER     || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DB       || 'smart_hostel',
    });
    console.log('MySQL Connected');
}
 
function getDB() {
    return db;
}
 
module.exports = { connectMySQL, getDB };