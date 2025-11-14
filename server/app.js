const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./config/database');
const weatherApi = require('./routes/weather-api');

const app = express();
const PORT = process.env.PORT || 4000;

// 미들웨어 설정
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*'
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 정적 파일 제공 (웹 클라이언트)
app.use(express.static(path.join(__dirname, '..', 'public')));

// 요청 로깅 미들웨어
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// 라우트 설정
app.use('/api/weather', weatherApi);

// 루트 경로
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// API 상태 확인
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Weather Monitoring API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// 404 핸들러
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: '요청한 리소스를 찾을 수 없습니다.',
        path: req.path
    });
});

// 에러 핸들러
app.use((err, req, res, next) => {
    console.error('서버 오류:', err);
    res.status(err.status || 500).json({
        success: false,
        error: '서버 내부 오류가 발생했습니다.',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 서버 시작
async function startServer() {
    try {
        // 데이터베이스 연결 테스트
        const dbConnected = await testConnection();

        if (!dbConnected) {
            console.error('⚠️  데이터베이스 연결 실패. 서버를 종료합니다.');
            process.exit(1);
        }

        // 서버 시작
        app.listen(PORT, () => {
            console.log('\n' + '='.repeat(60));
            console.log('🌡️  라즈베리파이 온습도 모니터링 서버 시작!');
            console.log('='.repeat(60));
            console.log(`📍 서버 주소: http://localhost:${PORT}`);
            console.log(`🌐 웹 대시보드: http://3.35.139.224:${PORT}/`);
            console.log(`🔌 API 엔드포인트:`);
            console.log(`   - POST /api/weather/data (데이터 수신)`);
            console.log(`   - GET  /api/weather/data (데이터 조회)`);
            console.log(`   - GET  /api/weather/latest (최신 데이터)`);
            console.log(`   - GET  /api/weather/stats (통계)`);
            console.log(`   - GET  /api/health (상태 확인)`);
            console.log(`🔐 API Key 인증 활성화됨`);
            console.log(`💾 MySQL 데이터베이스: ${process.env.DB_NAME}`);
            console.log('='.repeat(60) + '\n');
        });

    } catch (error) {
        console.error('서버 시작 오류:', error);
        process.exit(1);
    }
}

// 우아한 종료
process.on('SIGTERM', () => {
    console.log('\n서버를 종료합니다...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n서버를 종료합니다...');
    process.exit(0);
});

// 서버 시작
startServer();

module.exports = app;
