# 라즈베리파이 온습도 모니터링 시스템 - 프로젝트 완료 요약

**완료 날짜**: 2025-11-14
**개발 시간**: 약 3시간
**상태**: ✅ MVP 개발 완료 (라즈베리파이 설정 대기 중)

---

## 🎯 프로젝트 개요

라즈베리파이의 AHT20 센서로 온도/습도를 5분마다 측정하여 AWS EC2 서버로 전송하고, 웹 브라우저에서 Chart.js로 시각화하는 IoT 모니터링 시스템

---

## ✅ 완료된 작업

### 1. 프로젝트 문서화
- [x] PROJECT-PLAN.md - 전체 계획 및 질문사항 정리
- [x] PROJECT-STATUS.md - 실시간 프로젝트 상태 추적
- [x] README.md - 빠른 시작 가이드
- [x] DEPLOYMENT.md - 배포 및 운영 가이드
- [x] raspberry/README.md - 라즈베리파이 설정 가이드

### 2. EC2 서버 (3.35.139.224)
- [x] MariaDB 10.5.29 설치
- [x] weather_db 데이터베이스 생성
- [x] weather_data 테이블 생성
- [x] MySQL 사용자 생성 (weather_user)
- [x] Node.js 서버 개발 (포트 4000)
- [x] PM2 프로세스 관리 설정
- [x] 자동 시작 등록

### 3. 백엔드 API (Node.js + Express)
- [x] POST /api/weather/data - 센서 데이터 수신
- [x] GET /api/weather/data - 기간별 데이터 조회
- [x] GET /api/weather/latest - 최신 데이터
- [x] GET /api/weather/stats - 통계 정보
- [x] GET /api/health - 서버 상태 확인
- [x] API Key 인증 (X-API-Key 헤더)
- [x] MySQL 연결 풀
- [x] 에러 핸들링

### 4. 라즈베리파이 코드 (Python)
- [x] sensor_reader.py - AHT20 센서 읽기
- [x] data_sender.py - EC2로 데이터 전송
- [x] config.json - 설정 파일
- [x] install.sh - 자동 설치 스크립트
- [x] requirements.txt - Python 패키지
- [x] 재시도 로직 (3회)
- [x] Cron 작업 가이드

### 5. 웹 클라이언트
- [x] 반응형 대시보드 (HTML/CSS/JS)
- [x] 현재 온도/습도 표시
- [x] Chart.js 온도 차트 (라인 차트)
- [x] Chart.js 습도 차트 (라인 차트)
- [x] 통계 정보 (평균, 최대, 최소)
- [x] 날짜 범위 선택 (24시간, 48시간, 1주일, 사용자 정의)
- [x] 5분 자동 새로고침
- [x] 서버 상태 표시

---

## 📊 시스템 구성

```
┌─────────────────────┐
│  라즈베리파이         │
│  AHT20 센서          │
│  Python (5분 주기)   │
└──────────┬──────────┘
           │ HTTP POST (API Key)
           │ {"temperature": 23.5, "humidity": 65.2}
           ▼
┌─────────────────────┐
│  AWS EC2            │
│  3.35.139.224:4000  │
│                     │
│  Node.js + Express  │
│  MariaDB 10.5.29    │
│  PM2 (자동 시작)    │
└──────────┬──────────┘
           │ HTTP GET (JSON)
           │ [{temp, humidity, timestamp}, ...]
           ▼
┌─────────────────────┐
│  웹 브라우저         │
│  Chart.js 차트      │
│  실시간 대시보드     │
└─────────────────────┘
```

---

## 🌐 접속 정보

### 웹 대시보드
- **URL**: http://3.35.139.224:4000/
- **상태**: ⚠️ AWS Security Group 포트 4000 오픈 후 접속 가능

### API 테스트
```bash
# 서버 상태 확인
curl http://3.35.139.224:4000/api/health

# 테스트 데이터 전송
curl -X POST http://3.35.139.224:4000/api/weather/data \
  -H "Content-Type: application/json" \
  -H "X-API-Key: raspberry-weather-key-2025-secure" \
  -d '{"temperature": 23.5, "humidity": 65.2}'
```

---

## 📁 프로젝트 파일 구조

```
raspberry-weather-monitor/
├── PROJECT-SUMMARY.md          # 이 파일
├── PROJECT-PLAN.md             # 전체 계획서
├── PROJECT-STATUS.md           # 상태 추적
├── README.md                   # 빠른 시작
├── DEPLOYMENT.md               # 배포 가이드
│
├── raspberry/                  # 라즈베리파이 코드
│   ├── sensor_reader.py        # 센서 읽기
│   ├── data_sender.py          # 데이터 전송
│   ├── config.json             # 설정
│   ├── requirements.txt        # Python 패키지
│   ├── install.sh              # 설치 스크립트
│   └── README.md               # 라즈베리파이 가이드
│
├── server/                     # EC2 서버 코드
│   ├── app.js                  # Express 서버
│   ├── package.json
│   ├── .env                    # 환경변수
│   ├── config/
│   │   └── database.js         # MySQL 연결
│   └── routes/
│       ├── weather-api.js      # API 라우트
│       └── auth.js             # API Key 인증
│
└── public/                     # 웹 클라이언트
    ├── index.html              # 대시보드
    ├── css/style.css
    └── js/
        ├── app.js              # 메인 로직
        └── chart-config.js     # Chart.js 설정
```

---

## 🔧 기술 스택

| 구성요소 | 기술 |
|---------|------|
| 센서 | AHT20 (I2C) |
| 라즈베리파이 | Python 3, adafruit-circuitpython-aht20, requests |
| 서버 | AWS EC2 Amazon Linux 2023 |
| 백엔드 | Node.js v20.19.5, Express.js 4.18 |
| 데이터베이스 | MariaDB 10.5.29 (MySQL 호환) |
| 프로세스 관리 | PM2 |
| 웹 프론트엔드 | HTML5, CSS3, Vanilla JavaScript |
| 차트 | Chart.js 4.4.0 |
| 인증 | API Key (HTTP Header) |
| 배포 포트 | 4000 |

---

## ⚠️ 남은 작업 (수동)

### 1. AWS Security Group 설정 (필수!)

**포트 4000을 열어야 웹 접속 가능**

1. AWS EC2 Console 접속
2. 인스턴스 선택 → Security 탭
3. Security Groups 클릭
4. Inbound rules 편집
5. Add rule:
   - Type: Custom TCP
   - Port: 4000
   - Source: 0.0.0.0/0
6. Save rules

### 2. 라즈베리파이 설정

```bash
# 1. 코드 전송
scp -r raspberry/ pi@<라즈베리파이IP>:/home/pi/weather-monitor/

# 2. SSH 접속
ssh pi@<라즈베리파이IP>

# 3. 설치
cd /home/pi/weather-monitor/raspberry
./install.sh

# 4. 센서 테스트
python3 sensor_reader.py

# 5. 데이터 전송 테스트
python3 data_sender.py --once

# 6. Cron 자동 실행 (5분마다)
crontab -e
# 추가: */5 * * * * cd /home/pi/weather-monitor/raspberry && python3 data_sender.py --once >> /tmp/weather.log 2>&1
```

---

## 📊 데이터베이스 스키마

### weather_data 테이블

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | INT AUTO_INCREMENT | 기본 키 |
| temperature | DECIMAL(5,2) | 온도 (°C) |
| humidity | DECIMAL(5,2) | 습도 (%) |
| timestamp | DATETIME | 측정 시각 (UTC) |
| sensor_id | VARCHAR(50) | 센서 ID (기본: raspberry-pi-001) |
| created_at | TIMESTAMP | 레코드 생성 시각 |

**인덱스**: idx_timestamp (조회 성능 최적화)

---

## 🔐 보안 설정

### API Key
- **키**: `raspberry-weather-key-2025-secure`
- **위치**:
  - 서버: `/home/ec2-user/weather-server/server/.env`
  - 라즈베리파이: `raspberry/config.json`
- **사용**: HTTP 헤더 `X-API-Key`

### MySQL 접속 정보
- **호스트**: localhost
- **사용자**: weather_user
- **비밀번호**: WeatherPass2025!
- **데이터베이스**: weather_db

---

## 🚀 서버 관리

### PM2 명령어

```bash
ssh -i ~/.ssh/uttec-first-ec2.pem ec2-user@3.35.139.224

# 상태 확인
pm2 status

# 로그 보기
pm2 logs weather-api

# 재시작
pm2 restart weather-api

# 중지
pm2 stop weather-api
```

### MySQL 명령어

```bash
# 데이터베이스 접속
sudo mysql weather_db

# 최근 10개 데이터 조회
SELECT * FROM weather_data ORDER BY timestamp DESC LIMIT 10;

# 통계
SELECT
    COUNT(*) as total,
    ROUND(AVG(temperature), 2) as avg_temp,
    ROUND(AVG(humidity), 2) as avg_humidity
FROM weather_data;
```

---

## 📈 성능 및 용량

### 데이터 수집
- **주기**: 5분 (하루 288회)
- **월간 데이터**: 약 8,640개 레코드
- **연간 데이터**: 약 105,120개 레코드
- **예상 DB 크기**: ~10MB/년

### 서버 리소스
- **CPU**: 최소 (Node.js 단일 프로세스)
- **메모리**: ~30MB (PM2 포함)
- **네트워크**: 최소 (HTTP POST/GET)

---

## 🎨 웹 대시보드 기능

### 현재 상태
- 실시간 온도 표시
- 실시간 습도 표시
- 최종 측정 시간

### 차트
- 온도 변화 그래프 (라인 차트, 빨간색)
- 습도 변화 그래프 (라인 차트, 청록색)
- 호버 시 상세 정보 표시

### 기간 선택
- 최근 24시간 (기본)
- 최근 48시간
- 최근 1주일
- 사용자 정의 (시작/종료 날짜 선택)

### 통계
- 평균 온도/습도
- 최고 온도/습도
- 최저 온도/습도

### 기타
- 5분마다 자동 새로고침
- 서버 상태 표시
- 반응형 디자인 (모바일 지원)

---

## 📝 다음 단계 체크리스트

- [ ] AWS Security Group에서 포트 4000 열기
- [ ] 웹 브라우저에서 http://3.35.139.224:4000/ 접속 확인
- [ ] 라즈베리파이에 코드 전송
- [ ] I2C 활성화 및 AHT20 센서 연결
- [ ] Python 패키지 설치
- [ ] 센서 읽기 테스트
- [ ] 데이터 전송 테스트
- [ ] Cron 작업 등록
- [ ] 24시간 모니터링 테스트
- [ ] (선택) HTTPS 적용
- [ ] (선택) 도메인 연결

---

## 🎓 이 프로젝트에서 배운 것

### 새로운 세션 재개 패턴
이 프로젝트는 **"프로젝트 시작 가이드"**에서 제안한 방법을 실제로 적용한 첫 사례입니다:

1. ✅ 프로젝트 시작 시 즉시 문서화
2. ✅ PROJECT-PLAN.md로 질문사항 정리
3. ✅ PROJECT-STATUS.md로 진행 상황 추적
4. ✅ 각 단계별 체크리스트 활용
5. ✅ 배포 가이드 별도 작성

**결과**: 세션이 중단되어도 바로 재개 가능! 🎉

### 문서 구조
```
PROJECT-PLAN.md      → 전체 계획, 질문사항, 아키텍처
PROJECT-STATUS.md    → 실시간 상태, 체크리스트, 다음 세션 가이드
README.md            → 빠른 시작, 개요
DEPLOYMENT.md        → 배포 및 운영
PROJECT-SUMMARY.md   → 완료 후 요약 (이 파일)
```

---

## 🔗 참고 링크

- [Chart.js 공식 문서](https://www.chartjs.org/)
- [AHT20 센서 가이드](https://learn.adafruit.com/adafruit-aht20)
- [Express.js 가이드](https://expressjs.com/)
- [PM2 문서](https://pm2.keymetrics.io/)

---

## 📞 지원

문제 발생 시 확인할 문서:
1. **DEPLOYMENT.md** - 배포 및 운영
2. **raspberry/README.md** - 라즈베리파이 설정
3. **PROJECT-STATUS.md** - 전체 프로젝트 상태

---

**🎉 프로젝트 MVP 개발 완료!**

AWS Security Group 설정과 라즈베리파이 연결만 하면 바로 사용 가능합니다.

© 2025 Weather Monitoring Project
