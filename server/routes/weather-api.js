const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const authenticateApiKey = require('./auth');

// POST /api/weather/data - 라즈베리파이에서 데이터 수신
router.post('/data', authenticateApiKey, async (req, res) => {
    try {
        const { temperature, humidity, timestamp, sensor_id } = req.body;

        // 데이터 유효성 검증
        if (temperature === undefined || humidity === undefined) {
            return res.status(400).json({
                success: false,
                error: '온도(temperature)와 습도(humidity) 값이 필요합니다.'
            });
        }

        // 온도 범위 검증 (-40°C ~ 80°C for AHT20)
        if (temperature < -40 || temperature > 80) {
            return res.status(400).json({
                success: false,
                error: '온도 값이 유효 범위를 벗어났습니다 (-40 ~ 80°C).'
            });
        }

        // 습도 범위 검증 (0% ~ 100%)
        if (humidity < 0 || humidity > 100) {
            return res.status(400).json({
                success: false,
                error: '습도 값이 유효 범위를 벗어났습니다 (0 ~ 100%).'
            });
        }

        // timestamp 처리 (없으면 현재 시각 사용)
        const dataTimestamp = timestamp ? new Date(timestamp) : new Date();
        const sensorId = sensor_id || 'raspberry-pi-001';

        // MySQL에 데이터 저장
        const [result] = await pool.query(
            'INSERT INTO weather_data (temperature, humidity, timestamp, sensor_id) VALUES (?, ?, ?, ?)',
            [temperature, humidity, dataTimestamp, sensorId]
        );

        console.log(`📊 새 데이터 저장: 온도 ${temperature}°C, 습도 ${humidity}%, ID: ${result.insertId}`);

        res.status(201).json({
            success: true,
            message: '데이터가 성공적으로 저장되었습니다.',
            data_id: result.insertId,
            timestamp: dataTimestamp
        });

    } catch (error) {
        console.error('데이터 저장 오류:', error);
        res.status(500).json({
            success: false,
            error: '서버 오류가 발생했습니다.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// GET /api/weather/data - 기간별 데이터 조회
router.get('/data', async (req, res) => {
    try {
        const { start, end, limit, sensor_id } = req.query;

        let query = 'SELECT id, temperature, humidity, timestamp, sensor_id FROM weather_data WHERE 1=1';
        let params = [];

        // 센서 ID 필터
        if (sensor_id) {
            query += ' AND sensor_id = ?';
            params.push(sensor_id);
        }

        // 시작 날짜 필터
        if (start) {
            query += ' AND timestamp >= ?';
            params.push(new Date(start));
        }

        // 종료 날짜 필터
        if (end) {
            query += ' AND timestamp <= ?';
            params.push(new Date(end));
        }

        // 정렬 및 제한
        query += ' ORDER BY timestamp DESC';

        if (limit) {
            query += ' LIMIT ?';
            params.push(parseInt(limit));
        } else {
            // 기본값: 최근 24시간 (5분 간격 = 288개)
            query += ' LIMIT 288';
        }

        const [rows] = await pool.query(query, params);

        // 시간 순서대로 정렬 (차트 표시용)
        const data = rows.reverse();

        res.json({
            success: true,
            count: data.length,
            data: data
        });

    } catch (error) {
        console.error('데이터 조회 오류:', error);
        res.status(500).json({
            success: false,
            error: '서버 오류가 발생했습니다.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// GET /api/weather/latest - 최신 데이터 조회
router.get('/latest', async (req, res) => {
    try {
        const { sensor_id } = req.query;

        let query = 'SELECT temperature, humidity, timestamp, sensor_id FROM weather_data';
        let params = [];

        if (sensor_id) {
            query += ' WHERE sensor_id = ?';
            params.push(sensor_id);
        }

        query += ' ORDER BY timestamp DESC LIMIT 1';

        const [rows] = await pool.query(query, params);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: '데이터가 없습니다.'
            });
        }

        res.json({
            success: true,
            data: rows[0]
        });

    } catch (error) {
        console.error('최신 데이터 조회 오류:', error);
        res.status(500).json({
            success: false,
            error: '서버 오류가 발생했습니다.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// GET /api/weather/stats - 통계 정보 조회
router.get('/stats', async (req, res) => {
    try {
        const { start, end, sensor_id } = req.query;

        let query = `
            SELECT
                COUNT(*) as total_records,
                ROUND(AVG(temperature), 2) as avg_temperature,
                ROUND(MIN(temperature), 2) as min_temperature,
                ROUND(MAX(temperature), 2) as max_temperature,
                ROUND(AVG(humidity), 2) as avg_humidity,
                ROUND(MIN(humidity), 2) as min_humidity,
                ROUND(MAX(humidity), 2) as max_humidity
            FROM weather_data
            WHERE 1=1
        `;
        let params = [];

        if (sensor_id) {
            query += ' AND sensor_id = ?';
            params.push(sensor_id);
        }

        if (start) {
            query += ' AND timestamp >= ?';
            params.push(new Date(start));
        }

        if (end) {
            query += ' AND timestamp <= ?';
            params.push(new Date(end));
        }

        const [rows] = await pool.query(query, params);

        res.json({
            success: true,
            stats: rows[0]
        });

    } catch (error) {
        console.error('통계 조회 오류:', error);
        res.status(500).json({
            success: false,
            error: '서버 오류가 발생했습니다.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;
