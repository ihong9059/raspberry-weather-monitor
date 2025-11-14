require('dotenv').config();

// API Key 인증 미들웨어
function authenticateApiKey(req, res, next) {
    const apiKey = req.headers['x-api-key'];

    // API Key 확인
    if (!apiKey) {
        return res.status(401).json({
            success: false,
            error: 'API Key가 필요합니다. X-API-Key 헤더를 추가해주세요.'
        });
    }

    if (apiKey !== process.env.API_KEY) {
        return res.status(403).json({
            success: false,
            error: 'API Key가 유효하지 않습니다.'
        });
    }

    // 인증 성공
    next();
}

module.exports = authenticateApiKey;
