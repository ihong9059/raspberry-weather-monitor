const mysql = require('mysql2/promise');
require('dotenv').config();

// MySQL 연결 풀 생성
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'weather_user',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'weather_db',
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
    waitForConnections: true,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// 데이터베이스 연결 테스트
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ MySQL 데이터베이스 연결 성공!');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ MySQL 데이터베이스 연결 실패:', error.message);
        return false;
    }
}

module.exports = {
    pool,
    testConnection
};
