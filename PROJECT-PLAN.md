# 라즈베리파이 온습도 모니터링 시스템 - 프로젝트 계획서

**프로젝트명**: Raspberry Pi Weather Monitoring System
**작성일**: 2025-11-14
**작성자**: Claude Code Session

---

## 📋 프로젝트 개요

라즈베리파이에서 온도/습도 센서 데이터를 수집하여 AWS EC2의 웹 서버로 전송하고, 웹 클라이언트에서 실시간 및 과거 데이터를 차트로 시각화하는 IoT 모니터링 시스템

---

## 🎯 주요 기능

### 1. 데이터 수집 (라즈베리파이)
- [ ] DHT11/DHT22 센서로 온도/습도 측정
- [ ] 일정 주기(예: 5분)마다 데이터 수집
- [ ] HTTP/HTTPS POST로 EC2 서버에 데이터 전송
- [ ] 네트워크 장애 시 로컬 임시 저장 및 재전송

### 2. 데이터 수신 및 저장 (EC2 백엔드)
- [ ] REST API 서버 (Express.js)
- [ ] 데이터베이스에 타임스탬프와 함께 저장
- [ ] 데이터 유효성 검증
- [ ] API 인증/보안 (API Key 또는 JWT)

### 3. 데이터 조회 및 시각화 (웹 클라이언트)
- [ ] 최근 24시간 데이터 기본 표시
- [ ] 사용자 정의 기간 선택 (날짜 범위)
- [ ] Chart.js로 온도/습도 그래프
- [ ] 실시간 최신 데이터 표시
- [ ] 반응형 웹 디자인

---

## 🏗️ 시스템 아키텍처

```
┌─────────────────────┐
│  라즈베리파이         │
│  - DHT 센서          │
│  - Python 스크립트   │
│  - Cron Job (5분)   │
└──────────┬──────────┘
           │ HTTP POST
           │ (온도, 습도, 타임스탬프)
           ▼
┌─────────────────────┐
│  AWS EC2            │
│  IP: 3.35.139.224   │
│                     │
│  포트 80: Apache    │  ← 기존 UTTEC 시스템
│  포트 3000: Socket  │  ← 기존 채팅 서버
│  포트 4000: 날씨 API│  ← 새로운 프로젝트 (제안)
│                     │
│  Node.js + Express  │
│  SQLite/MySQL       │
└──────────┬──────────┘
           │ HTTP GET
           │ (JSON 데이터)
           ▼
┌─────────────────────┐
│  웹 브라우저         │
│  - HTML/CSS/JS      │
│  - Chart.js         │
│  - 날짜 선택기      │
└─────────────────────┘
```

---

## 🖥️ EC2 서버 현재 상태

### 실행 중인 서비스
- **포트 80**: Apache HTTP Server (UTTEC IoT 교육 시스템)
- **포트 3000**: Node.js Socket.io (채팅 서버)
- **포트 22**: SSH

### 사용 가능한 포트 (제안)
- **포트 4000**: 날씨 모니터링 API 서버 (신규)
- **포트 5000**: 대안 (필요 시)

---

## 🔧 기술 스택

### 라즈베리파이 (데이터 수집)
- **OS**: Raspberry Pi OS (Debian 기반)
- **언어**: Python 3
- **라이브러리**:
  - `Adafruit_DHT` 또는 `adafruit-circuitpython-dht` (센서)
  - `requests` (HTTP 통신)
  - `cron` (주기적 실행)

### EC2 백엔드 (데이터 저장 및 API)
- **런타임**: Node.js
- **프레임워크**: Express.js
- **데이터베이스**: SQLite (초기) → MySQL/PostgreSQL (확장 시)
- **프로세스 관리**: PM2 (자동 재시작)
- **보안**: API Key 인증

### 웹 프론트엔드 (시각화)
- **HTML5, CSS3, JavaScript (Vanilla)**
- **차트**: Chart.js
- **날짜 선택**: Flatpickr 또는 HTML5 date input
- **HTTP 통신**: Fetch API

---

## 📁 프로젝트 구조 (제안)

```
raspberry-weather-monitor/
├── raspberry/                    # 라즈베리파이용 코드
│   ├── sensor_reader.py         # 센서 데이터 읽기
│   ├── data_sender.py           # EC2로 데이터 전송
│   ├── config.json              # 설정 (API URL, 인증키)
│   └── install.sh               # 센서 라이브러리 설치
│
├── server/                      # EC2 서버용 코드
│   ├── app.js                   # Express 서버
│   ├── routes/
│   │   ├── weather-api.js       # API 라우트
│   │   └── auth.js              # 인증 미들웨어
│   ├── models/
│   │   └── weather.js           # DB 모델
│   ├── config/
│   │   └── database.js          # DB 설정
│   ├── package.json
│   └── .env                     # 환경변수 (DB, API Key)
│
├── public/                      # 웹 클라이언트
│   ├── index.html               # 메인 페이지
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── app.js               # 메인 로직
│   │   └── chart-config.js      # Chart.js 설정
│   └── assets/
│
├── PROJECT-STATUS.md            # 프로젝트 상태 문서
├── README.md                    # 프로젝트 README
└── DEPLOYMENT.md                # 배포 가이드
```

---

## 🗄️ 데이터베이스 스키마

### weather_data 테이블

| 컬럼명        | 타입          | 설명                    |
|--------------|--------------|------------------------|
| id           | INTEGER      | PK, Auto Increment     |
| temperature  | REAL         | 온도 (°C)              |
| humidity     | REAL         | 습도 (%)               |
| timestamp    | DATETIME     | 측정 시각 (UTC)         |
| sensor_id    | VARCHAR(50)  | 센서 식별자 (옵션)      |
| created_at   | DATETIME     | 레코드 생성 시각        |

### 인덱스
- `idx_timestamp` ON timestamp (시간 범위 조회 최적화)

---

## 🔌 API 설계

### 1. 데이터 수신 API (라즈베리파이 → EC2)

**Endpoint**: `POST /api/weather/data`

**Request Headers**:
```
Content-Type: application/json
X-API-Key: YOUR_API_KEY
```

**Request Body**:
```json
{
  "temperature": 23.5,
  "humidity": 65.2,
  "timestamp": "2025-11-14T12:00:00Z",
  "sensor_id": "raspberry-pi-001"
}
```

**Response** (성공):
```json
{
  "success": true,
  "message": "Data saved successfully",
  "data_id": 12345
}
```

---

### 2. 데이터 조회 API (웹 클라이언트 → EC2)

**Endpoint**: `GET /api/weather/data`

**Query Parameters**:
- `start`: 시작 날짜/시간 (ISO 8601)
- `end`: 종료 날짜/시간 (ISO 8601)
- `limit`: 최대 레코드 수 (기본: 288 = 24시간 * 12/시간)

**Example**:
```
GET /api/weather/data?start=2025-11-13T00:00:00Z&end=2025-11-14T00:00:00Z
```

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
    },
    {
      "id": 2,
      "temperature": 23.3,
      "humidity": 66.1,
      "timestamp": "2025-11-14T00:05:00Z"
    }
  ]
}
```

---

### 3. 최신 데이터 조회 API

**Endpoint**: `GET /api/weather/latest`

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

## 🚀 배포 계획

### Phase 1: EC2 서버 설정
1. [ ] Node.js 환경 확인/설치
2. [ ] SQLite 설치 (또는 MySQL)
3. [ ] 프로젝트 폴더 생성: `/home/ec2-user/weather-server/`
4. [ ] npm 패키지 설치
5. [ ] 환경변수 설정 (.env)
6. [ ] PM2로 서버 등록 및 자동 시작 설정
7. [ ] 포트 4000 방화벽 오픈 (AWS Security Group)

### Phase 2: 라즈베리파이 설정
1. [ ] Python 환경 확인
2. [ ] DHT 센서 라이브러리 설치
3. [ ] 데이터 전송 스크립트 작성
4. [ ] Cron Job 등록 (5분마다 실행)
5. [ ] 네트워크 연결 테스트

### Phase 3: 웹 클라이언트 개발
1. [ ] HTML/CSS 레이아웃
2. [ ] Chart.js 통합
3. [ ] API 연동
4. [ ] 날짜 범위 선택 기능
5. [ ] Apache 웹 디렉토리에 배포

### Phase 4: 테스트 및 최적화
1. [ ] 엔드투엔드 테스트
2. [ ] 성능 최적화 (인덱스, 쿼리)
3. [ ] 에러 핸들링
4. [ ] 로깅 설정

---

## ❓ 질문 사항 (구현 전 확인 필요)

### 1. 라즈베리파이 관련
- [ ] **Q1-1**: 사용하실 센서 모델이 무엇인가요? (DHT11, DHT22, BME280 등)
- [ ] **Q1-2**: 라즈베리파이 모델은 무엇인가요? (3B+, 4, Zero 등)
- [ ] **Q1-3**: 라즈베리파이가 현재 네트워크에 연결되어 있나요?
- [ ] **Q1-4**: 라즈베리파이 SSH 접속이 가능한가요?
- [ ] **Q1-5**: 데이터 전송 주기는 5분이 적당한가요? (조정 가능)

### 2. EC2 서버 관련
- [ ] **Q2-1**: 새 프로젝트 포트를 4000으로 사용해도 되나요? (다른 포트 선호 시 변경 가능)
- [ ] **Q2-2**: 데이터베이스는 SQLite로 시작할까요, 아니면 MySQL을 처음부터 사용할까요?
  - SQLite: 설정 간단, 소규모 데이터에 적합
  - MySQL: 확장성 좋음, 대용량 데이터 처리
- [ ] **Q2-3**: API 인증 방식은 간단한 API Key로 할까요, 아니면 JWT를 사용할까요?
  - API Key: 구현 간단
  - JWT: 더 안전, 복잡도 증가

### 3. 웹 인터페이스 관련
- [ ] **Q3-1**: 웹 페이지 URL은 어떻게 할까요?
  - 옵션 A: `http://3.35.139.224:4000/` (독립 포트)
  - 옵션 B: `http://3.35.139.224/weather/` (Apache 리버스 프록시)
  - 옵션 C: 별도 도메인/서브도메인 사용
- [ ] **Q3-2**: 차트 스타일 선호도가 있나요? (라인 차트, 영역 차트 등)
- [ ] **Q3-3**: 온도와 습도를 하나의 차트에 표시할까요, 아니면 분리할까요?

### 4. 데이터 관리 관련
- [ ] **Q4-1**: 오래된 데이터 자동 삭제 정책이 필요한가요? (예: 1년 이상 데이터 삭제)
- [ ] **Q4-2**: 데이터 백업이 필요한가요?
- [ ] **Q4-3**: 데이터 내보내기 기능(CSV, Excel)이 필요한가요?

### 5. 보안 관련
- [ ] **Q5-1**: 웹 페이지 접근을 누구나 가능하게 할까요, 아니면 로그인이 필요한가요?
- [ ] **Q5-2**: HTTPS 적용이 필요한가요? (Let's Encrypt 무료 SSL)

### 6. 추가 기능 관련
- [ ] **Q6-1**: 알람 기능이 필요한가요? (온도/습도가 특정 범위를 벗어날 때 이메일 또는 푸시)
- [ ] **Q6-2**: 여러 센서(여러 라즈베리파이)를 지원해야 하나요?
- [ ] **Q6-3**: 실시간 자동 업데이트가 필요한가요? (Socket.io 또는 주기적 폴링)

---

## 📊 우선순위별 기능 분류

### MVP (Minimum Viable Product) - Phase 1
- ✅ 라즈베리파이에서 센서 데이터 읽기
- ✅ EC2로 데이터 전송
- ✅ SQLite에 데이터 저장
- ✅ 웹에서 최근 24시간 차트 표시
- ✅ 기간 선택 기능

### 추가 기능 - Phase 2
- ⭐ 실시간 자동 업데이트
- ⭐ 통계 정보 (평균, 최대, 최소)
- ⭐ 데이터 내보내기 (CSV)
- ⭐ 반응형 디자인

### 고급 기능 - Phase 3
- 🚀 알람 시스템
- 🚀 여러 센서 지원
- 🚀 사용자 인증
- 🚀 HTTPS 적용
- 🚀 MySQL 마이그레이션

---

## ⏱️ 예상 일정

| Phase | 작업 내용 | 예상 시간 |
|-------|----------|-----------|
| Phase 1 | EC2 서버 설정 및 API 개발 | 2-3시간 |
| Phase 2 | 라즈베리파이 센서 연동 | 1-2시간 |
| Phase 3 | 웹 클라이언트 개발 | 2-3시간 |
| Phase 4 | 테스트 및 디버깅 | 1-2시간 |
| **합계** | **MVP 완성** | **6-10시간** |

---

## 📝 다음 단계

1. **위 질문사항에 답변해주세요** (우선순위 높은 것부터)
2. 답변을 바탕으로 상세 구현 계획 수립
3. PROJECT-STATUS.md 파일 생성
4. 코드 개발 시작

---

## 🔗 참고 자료

- Chart.js 공식 문서: https://www.chartjs.org/
- Express.js 가이드: https://expressjs.com/
- Adafruit DHT 센서 가이드: https://learn.adafruit.com/dht
- PM2 프로세스 관리: https://pm2.keymetrics.io/

---

**이 계획서를 북마크하세요!**
구현 중 변경사항은 이 문서에 반영하겠습니다.
