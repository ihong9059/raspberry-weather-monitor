# 배포 가이드

라즈베리파이 온습도 모니터링 시스템 배포 완료 가이드

---

## ✅ 배포 완료 상태

### EC2 서버
- **IP**: 3.35.139.224
- **포트**: 4000
- **웹 대시보드**: http://3.35.139.224:4000/
- **상태**: ✅ 실행 중

### 서비스 구성
- **Node.js**: v20.19.5
- **PM2**: 프로세스 관리 활성화
- **MySQL**: MariaDB 10.5.29 (weather_db)
- **자동 시작**: 시스템 재부팅 시 자동 시작

---

## 🚨 중요: AWS 보안 그룹 설정 필요!

### 포트 4000 오픈

현재 서버는 실행 중이지만, **외부에서 접속하려면 AWS Security Group에서 포트 4000을 열어야 합니다.**

#### AWS Console 설정 방법:

1. **EC2 대시보드** 접속
2. 인스턴스 선택
3. **Security** 탭 클릭
4. **Security Groups** 링크 클릭
5. **Inbound rules** 탭에서 **Edit inbound rules** 클릭
6. **Add rule** 클릭:
   - **Type**: Custom TCP
   - **Port range**: 4000
   - **Source**: 0.0.0.0/0 (또는 특정 IP)
   - **Description**: Weather monitoring API
7. **Save rules** 클릭

---

## 📊 서버 관리 명령어

### PM2 명령어

```bash
# 서버 상태 확인
ssh -i ~/.ssh/uttec-first-ec2.pem ec2-user@3.35.139.224
pm2 status

# 로그 확인
pm2 logs weather-api

# 서버 재시작
pm2 restart weather-api

# 서버 중지
pm2 stop weather-api

# 서버 시작
pm2 start weather-api

# 프로세스 목록에서 제거
pm2 delete weather-api
```

### MySQL 명령어

```bash
# MySQL 접속
sudo mysql weather_db

# 데이터 확인
SELECT * FROM weather_data ORDER BY timestamp DESC LIMIT 10;

# 데이터 개수 확인
SELECT COUNT(*) FROM weather_data;

# 통계 확인
SELECT
    ROUND(AVG(temperature), 2) as avg_temp,
    ROUND(AVG(humidity), 2) as avg_humidity,
    COUNT(*) as total_records
FROM weather_data;
```

---

## 🔧 서버 파일 위치

```
/home/ec2-user/weather-server/
├── server/              # Node.js 백엔드
│   ├── app.js
│   ├── routes/
│   ├── config/
│   ├── .env            # 환경변수
│   └── package.json
└── public/              # 웹 프론트엔드
    ├── index.html
    ├── css/
    └── js/
```

---

## 🔄 코드 업데이트 방법

### 로컬에서 수정 후:

```bash
# 1. 로컬에서 압축
cd /Users/maeg/todo/raspberry-weather-monitor
tar -czf weather-server.tar.gz server public

# 2. EC2로 업로드
scp -i ~/.ssh/uttec-first-ec2.pem weather-server.tar.gz ec2-user@3.35.139.224:/home/ec2-user/

# 3. EC2에서 압축 해제 및 재시작
ssh -i ~/.ssh/uttec-first-ec2.pem ec2-user@3.35.139.224
cd /home/ec2-user
tar -xzf weather-server.tar.gz -C weather-server --strip-components=0
cd weather-server/server
npm install
pm2 restart weather-api
pm2 logs weather-api
```

---

## 🧪 테스트 방법

### 1. 서버 상태 확인

```bash
curl http://3.35.139.224:4000/api/health
```

**예상 응답**:
```json
{
  "success": true,
  "message": "Weather Monitoring API is running",
  "timestamp": "2025-11-14T14:20:00.000Z",
  "version": "1.0.0"
}
```

### 2. 테스트 데이터 전송 (라즈베리파이 없이)

```bash
curl -X POST http://3.35.139.224:4000/api/weather/data \
  -H "Content-Type: application/json" \
  -H "X-API-Key: raspberry-weather-key-2025-secure" \
  -d '{
    "temperature": 23.5,
    "humidity": 65.2,
    "timestamp": "2025-11-14T12:00:00Z",
    "sensor_id": "test-sensor"
  }'
```

**예상 응답**:
```json
{
  "success": true,
  "message": "데이터가 성공적으로 저장되었습니다.",
  "data_id": 1
}
```

### 3. 데이터 조회

```bash
curl http://3.35.139.224:4000/api/weather/latest
```

### 4. 웹 브라우저 테스트

http://3.35.139.224:4000/ 접속

---

## 🍓 라즈베리파이 설정

### 파일 전송

```bash
# 로컬에서 라즈베리파이로 전송
cd /Users/maeg/todo/raspberry-weather-monitor
scp -r raspberry/ pi@<라즈베리파이IP>:/home/pi/raspberry-weather-monitor/
```

### 라즈베리파이에서 설치

```bash
ssh pi@<라즈베리파이IP>

cd /home/pi/raspberry-weather-monitor/raspberry
chmod +x install.sh
./install.sh

# 센서 테스트
python3 sensor_reader.py

# 한 번 전송 테스트
python3 data_sender.py --once
```

### Cron 자동 실행 (5분마다)

```bash
crontab -e
```

추가:
```
*/5 * * * * cd /home/pi/raspberry-weather-monitor/raspberry && /usr/bin/python3 data_sender.py --once >> /tmp/weather.log 2>&1
```

---

## 📋 체크리스트

### EC2 서버
- [x] MySQL 설치 및 DB 생성
- [x] Node.js 서버 코드 배포
- [x] npm 패키지 설치
- [x] PM2로 서버 시작
- [x] PM2 자동 시작 설정
- [ ] **AWS Security Group 포트 4000 오픈** ⚠️
- [ ] 웹 브라우저 접속 테스트

### 라즈베리파이
- [ ] I2C 활성화
- [ ] AHT20 센서 연결
- [ ] Python 패키지 설치
- [ ] 센서 읽기 테스트
- [ ] 데이터 전송 테스트
- [ ] Cron 자동 실행 설정

---

## 🐛 문제 해결

### "Connection refused" 오류

**원인**: AWS Security Group에서 포트 4000이 열려있지 않음

**해결**: 위의 "AWS 보안 그룹 설정" 참조

### 서버가 시작되지 않음

```bash
# 로그 확인
pm2 logs weather-api --lines 100

# MySQL 연결 확인
sudo mysql -u weather_user -p weather_db
```

### 라즈베리파이에서 전송 실패

1. config.json의 API URL 확인
2. API Key 일치 확인
3. 네트워크 연결 확인

---

## 📞 다음 단계

1. **AWS Security Group에서 포트 4000 열기** ⚠️
2. 웹 브라우저에서 http://3.35.139.224:4000/ 접속
3. 테스트 데이터 전송해보기
4. 라즈베리파이 설정
5. 실제 센서 데이터 수집 시작

---

© 2025 Weather Monitoring Project
