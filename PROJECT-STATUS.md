# 라즈베리파이 온습도 모니터링 시스템 - 프로젝트 상태

**마지막 업데이트**: 2025-11-14
**버전**: 1.0
**작성자**: Claude Code Session

---

## 📋 프로젝트 개요

라즈베리파이의 AHT20 센서로 온도/습도 데이터를 수집하여 AWS EC2의 웹 서버로 전송하고, Chart.js로 시각화하는 IoT 모니터링 시스템

---

## 🎯 확정된 사양

### 하드웨어
- **센서**: AHT20 (온도/습도)
- **보드**: 라즈베리파이
- **네트워크**: 연결 양호

### 서버
- **EC2 IP**: 3.35.139.224
- **포트**: 4000 (날씨 모니터링 전용)
- **데이터베이스**: MySQL

### 웹 접속
- **URL**: `http://3.35.139.224:4000/`
- **인증**: 공개 (로그인 없음)

### 데이터 수집
- **주기**: 5분마다
- **시각화**: 온도/습도 분리된 2개 차트
- **기본 표시**: 최근 24시간

---

## 🗂️ 프로젝트 파일 구조

```
raspberry-weather-monitor/
├── raspberry/                    # 라즈베리파이용 코드
│   ├── sensor_reader.py         # AHT20 센서 데이터 읽기
│   ├── data_sender.py           # EC2로 데이터 전송
│   ├── config.json              # 설정 (API URL, 인증키)
│   ├── requirements.txt         # Python 패키지
│   └── install.sh               # 센서 라이브러리 설치 스크립트
│
├── server/                      # EC2 서버용 코드
│   ├── app.js                   # Express 서버 (포트 4000)
│   ├── routes/
│   │   ├── weather-api.js       # API 라우트
│   │   └── auth.js              # API Key 인증 미들웨어
│   ├── models/
│   │   └── weather.js           # MySQL 모델
│   ├── config/
│   │   └── database.js          # MySQL 연결 설정
│   ├── package.json
│   └── .env                     # 환경변수
│
├── public/                      # 웹 클라이언트
│   ├── index.html               # 메인 대시보드
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── app.js               # 메인 로직
│   │   └── chart-config.js      # Chart.js 설정
│   └── assets/
│
├── 📄 문서모음.html               # 전체 문서 인덱스 (시각화)
├── 📄 프로젝트완료보고서.html      # 완료 보고서 (시각화)
├── 📄 배포가이드.html             # 배포 및 운영 (시각화)
├── 📄 라즈베리파이설정가이드.html  # 라즈베리파이 설정 (시각화)
├── PROJECT-STATUS.md            # 이 파일
├── PROJECT-SUMMARY.md           # 프로젝트 요약
├── PROJECT-PLAN.md              # 전체 계획서
├── DEPLOYMENT.md                # 배포 가이드 (텍스트)
└── README.md                    # 빠른 시작 가이드
```

---

## 🔧 기술 스택

### 라즈베리파이
- Python 3
- `adafruit-circuitpython-aht20` (센서)
- `requests` (HTTP 통신)
- `cron` (주기적 실행)

### EC2 백엔드
- Node.js + Express.js
- MySQL (mysql2 패키지)
- PM2 (프로세스 관리)
- 포트: 4000

### 웹 프론트엔드
- HTML5, CSS3, JavaScript
- Chart.js 4.x
- Fetch API

---

## 🗄️ 데이터베이스 스키마

### MySQL 데이터베이스: `weather_db`

#### 테이블: `weather_data`

```sql
CREATE TABLE weather_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    temperature DECIMAL(5,2) NOT NULL,
    humidity DECIMAL(5,2) NOT NULL,
    timestamp DATETIME NOT NULL,
    sensor_id VARCHAR(50) DEFAULT 'raspberry-pi-001',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 🔌 API 설계

### 1. 데이터 수신 (라즈베리파이 → EC2)

**POST** `/api/weather/data`

**Headers**:
```
Content-Type: application/json
X-API-Key: YOUR_API_KEY
```

**Body**:
```json
{
  "temperature": 23.5,
  "humidity": 65.2,
  "timestamp": "2025-11-14T12:00:00Z",
  "sensor_id": "raspberry-pi-001"
}
```

---

### 2. 데이터 조회 (웹 → EC2)

**GET** `/api/weather/data?start=2025-11-13T00:00:00Z&end=2025-11-14T00:00:00Z`

**Response**:
```json
{
  "success": true,
  "count": 288,
  "data": [
    {
      "id": 1,
      "temperature": 23.5,
      "humidity": 65.2,
      "timestamp": "2025-11-14T00:00:00Z"
    }
  ]
}
```

---

### 3. 최신 데이터

**GET** `/api/weather/latest`

**Response**:
```json
{
  "success": true,
  "data": {
    "temperature": 24.1,
    "humidity": 63.5,
    "timestamp": "2025-11-14T14:30:00Z"
  }
}
```

---

## ✅ 구현 상태

### Phase 1: 문서화 및 계획
- [x] PROJECT-PLAN.md 작성
- [x] 사용자 요구사항 확인
- [x] PROJECT-STATUS.md 작성
- [x] README.md 작성

### Phase 2: EC2 서버 설정
- [x] Node.js 버전 확인 (v20.19.5)
- [x] MySQL 설치 및 DB 생성 (MariaDB 10.5.29)
- [x] 프로젝트 폴더 생성 (/home/ec2-user/weather-server)
- [x] npm 패키지 설치

### Phase 3: 백엔드 개발
- [x] Express 서버 기본 구조
- [x] MySQL 연결 설정
- [x] API 라우트 구현 (data, latest, stats)
- [x] API Key 인증 미들웨어
- [x] 에러 핸들링

### Phase 4: 라즈베리파이 개발
- [x] AHT20 센서 읽기 코드 (sensor_reader.py)
- [x] 데이터 전송 스크립트 (data_sender.py)
- [x] 설치 스크립트 작성 (install.sh)
- [x] 네트워크 재연결 로직

### Phase 5: 웹 클라이언트 개발
- [x] HTML 레이아웃 (index.html)
- [x] Chart.js 통합 (온도/습도 분리 차트)
- [x] API 연동
- [x] 날짜 범위 선택 UI
- [x] 반응형 디자인

### Phase 6: 배포 및 테스트
- [x] EC2에 서버 배포
- [x] PM2 등록 및 자동 시작
- [ ] **포트 4000 AWS Security Group 오픈** ⚠️ (수동 작업 필요)
- [ ] 웹 브라우저 접속 테스트
- [x] DEPLOYMENT.md 작성

---

## 🚀 EC2 서버 포트 현황

| 포트 | 서비스 | 용도 |
|------|--------|------|
| 80 | Apache | UTTEC IoT 교육 시스템 |
| 3000 | Node.js | 채팅 서버 (Socket.io) |
| **4000** | **Node.js** | **날씨 모니터링 API (신규)** |
| 22 | SSH | 서버 관리 |

---

## 📝 개발 작업 기록

### 2025-11-14 - MVP 개발 완료
- ✅ 프로젝트 계획서 작성 (PROJECT-PLAN.md, README.md)
- ✅ 사용자 요구사항 확인 (센서: AHT20, DB: MySQL, 포트: 4000, URL: 옵션A)
- ✅ EC2 서버 환경 구축
  - MariaDB 10.5.29 설치 및 weather_db 생성
  - weather_data 테이블 생성 (온도, 습도, 타임스탬프)
  - MySQL 사용자 생성 (weather_user)
- ✅ Node.js Express 백엔드 개발
  - API 서버 구현 (포트 4000)
  - REST API 엔드포인트 (POST /data, GET /data, /latest, /stats)
  - API Key 인증 미들웨어
  - MySQL 연결 풀 설정
- ✅ 라즈베리파이 Python 코드 개발
  - AHT20 센서 읽기 모듈 (sensor_reader.py)
  - 데이터 전송 스크립트 (data_sender.py)
  - 자동 설치 스크립트 (install.sh)
  - Cron 작업 가이드
- ✅ 웹 클라이언트 개발
  - 반응형 대시보드 (HTML/CSS/JavaScript)
  - Chart.js 온도/습도 차트
  - 날짜 범위 선택 기능
  - 통계 정보 표시
  - 5분 자동 새로고침
- ✅ EC2 배포
  - 서버 코드 업로드
  - PM2로 프로세스 관리 설정
  - 자동 시작 등록
  - 배포 가이드 작성 (DEPLOYMENT.md)

---

## 🔐 보안 설정

### API Key (생성 예정)
- 라즈베리파이 → EC2 데이터 전송 시 인증
- 환경변수로 관리 (.env)
- 예: `WEATHER_API_KEY=your-secret-key-here`

### MySQL 접속 정보
```env
DB_HOST=localhost
DB_USER=weather_user
DB_PASSWORD=secure_password_here
DB_NAME=weather_db
```

---

## 🐛 알려진 이슈

- 없음 (개발 시작 전)

---

## 📅 향후 작업 계획

### MVP 완성 후 (Phase 2)
- [ ] 실시간 자동 업데이트 (Socket.io)
- [ ] 통계 정보 (평균, 최대, 최소)
- [ ] 데이터 내보내기 (CSV)
- [ ] 반응형 디자인 개선

### 고급 기능 (Phase 3)
- [ ] 알람 시스템 (이메일/푸시)
- [ ] 여러 센서 지원
- [ ] 사용자 인증
- [ ] HTTPS 적용

---

## 🔄 다음 세션 시작 방법

### Claude에게 이렇게 말하세요:

```
raspberry-weather-monitor/ 폴더의 PROJECT-STATUS.md 파일을 읽고,
현재 프로젝트 상태를 파악한 후 작업을 계속해주세요.
```

### 로컬 파일 확인
```bash
cd /Users/maeg/todo/raspberry-weather-monitor/
ls -la
```

### 서버 상태 확인
```bash
ssh -i ~/.ssh/uttec-first-ec2.pem ec2-user@3.35.139.224
ps aux | grep node
sudo netstat -tlnp | grep 4000
```

---

## 📞 참고 정보

- **EC2 IP**: 3.35.139.224
- **SSH Key**: `~/.ssh/uttec-first-ec2.pem`
- **프로젝트 폴더 (로컬)**: `/Users/maeg/todo/raspberry-weather-monitor/`
- **프로젝트 폴더 (EC2)**: `/home/ec2-user/weather-server/` (예정)

---

**이 파일을 항상 최신으로 유지하세요!**
작업 완료 시마다 상태를 업데이트해주세요.
