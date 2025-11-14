# ESP32-C3 빠른 시작 가이드

ESP32-C3를 사용하여 웹 모니터링까지 완성하는 단계별 가이드

---

## 📋 준비물

- ✅ ESP32-C3 DevKitM (USB로 Raspberry Pi에 연결됨)
- ✅ AHT20 센서 (I2C로 ESP32-C3에 연결됨)
- ✅ Raspberry Pi (192.168.0.3)
- ✅ AWS EC2 서버 (3.35.139.224:4000)

---

## 🔌 하드웨어 연결 확인

### ESP32-C3 ↔ AHT20
| ESP32-C3 | AHT20 |
|----------|-------|
| GPIO6    | SDA   |
| GPIO7    | SCL   |
| 3.3V     | VCC   |
| GND      | GND   |

### ESP32-C3 ↔ Raspberry Pi
- USB 케이블로 연결 (전원 + 시리얼 통신)

---

## 🚀 Step 1: Raspberry Pi 설정

### 1-1. Raspberry Pi SSH 접속

```bash
ssh pi@192.168.0.3
# 비밀번호 입력
```

### 1-2. 프로젝트 복제

```bash
cd ~
git clone https://github.com/ihong9059/raspberry-weather-monitor.git
cd raspberry-weather-monitor
```

### 1-3. Arduino CLI 설치 (Raspberry Pi에서)

```bash
# Arduino CLI 설치
curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh

# PATH에 추가
echo 'export PATH=$PATH:$HOME/bin' >> ~/.bashrc
source ~/.bashrc

# 확인
arduino-cli version
```

### 1-4. ESP32 보드 설정

```bash
# Config 초기화
arduino-cli config init

# ESP32 보드 URL 추가
arduino-cli config add board_manager.additional_urls https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json

# 코어 업데이트
arduino-cli core update-index

# ESP32 설치
arduino-cli core install esp32:esp32
```

### 1-5. Python 패키지 설치

```bash
cd ~/raspberry-weather-monitor/raspberry
pip3 install -r requirements.txt
```

---

## 🔥 Step 2: ESP32-C3 펌웨어 업로드

### 2-1. USB 포트 확인

```bash
ls -l /dev/ttyACM* /dev/ttyUSB*
# 예상 출력: /dev/ttyACM0
```

### 2-2. 권한 설정

```bash
sudo usermod -a -G dialout pi
# 로그아웃 후 다시 로그인
```

### 2-3. 펌웨어 컴파일 및 업로드

```bash
cd ~/raspberry-weather-monitor/esp32c3/arduino-app

# 컴파일 (USB CDC On Boot 활성화 필수!)
arduino-cli compile --fqbn esp32:esp32:esp32c3:CDCOnBoot=cdc aht20_sensor

# 업로드 (USB CDC On Boot 활성화 필수!)
arduino-cli upload --fqbn esp32:esp32:esp32c3:CDCOnBoot=cdc --port /dev/ttyACM0 aht20_sensor
```

**⚠️ 매우 중요:**
- **`CDCOnBoot=cdc` 옵션을 반드시 포함해야 합니다!**
- 이 옵션이 없으면 ESP32-C3의 USB Serial 출력이 작동하지 않습니다
- 컴파일과 업로드 모두에 이 옵션이 필요합니다

**업로드 중 문제 발생 시:**
- ESP32-C3의 BOOT 버튼을 누른 상태로 업로드 시도
- USB 재연결 후 다시 시도

### 2-4. 시리얼 모니터로 확인

```bash
# Arduino CLI 모니터
arduino-cli monitor --port /dev/ttyACM0 --config baudrate=115200

# 또는 screen
screen /dev/ttyACM0 115200

# 종료: Ctrl+A, K (screen)
```

**예상 출력:**
```
ESP32-C3 AHT20 Sensor Ready
TEMP:23.45,HUMIDITY:65.20
DEBUG: Temp=23.45°C, Humidity=65.20%
```

---

## 📡 Step 3: Raspberry Pi 시리얼 리더 실행

### 3-1. 시리얼 모니터 종료

위에서 실행한 시리얼 모니터를 종료합니다.

### 3-2. 설정 파일 확인

```bash
cd ~/raspberry-weather-monitor/raspberry
cat config.json
```

다음 내용이 있는지 확인:
```json
{
  "serial_port": "/dev/ttyACM0",
  "sensor_id_esp32": "esp32c3-001",
  "api_url": "http://3.35.139.224:4000/api/weather/data",
  "api_key": "raspberry-weather-key-2025-secure"
}
```

### 3-3. 시리얼 리더 실행 (테스트)

```bash
python3 esp32_serial_reader.py
```

**예상 출력:**
```
2025-11-15 12:00:00 - INFO - Serial port opened: /dev/ttyACM0 @ 115200 baud
2025-11-15 12:00:05 - INFO - ESP32: ESP32-C3 AHT20 Sensor Ready
2025-11-15 12:05:00 - INFO - Received: Temp=23.5°C, Humidity=65.2%
2025-11-15 12:05:01 - INFO - Sending data (attempt 1/3): Temp=23.5°C, Humidity=65.2%
2025-11-15 12:05:02 - INFO - ✓ Data sent successfully: {...}
```

정상 동작 확인 후 **Ctrl+C**로 종료

---

## 🔄 Step 4: 자동 시작 설정 (systemd)

### 4-1. systemd 서비스 파일 생성

```bash
sudo nano /etc/systemd/system/esp32-weather.service
```

내용 입력:
```ini
[Unit]
Description=ESP32-C3 Weather Monitor
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/raspberry-weather-monitor/raspberry
ExecStart=/usr/bin/python3 /home/pi/raspberry-weather-monitor/raspberry/esp32_serial_reader.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

저장: **Ctrl+X**, **Y**, **Enter**

### 4-2. 서비스 활성화

```bash
# 서비스 리로드
sudo systemctl daemon-reload

# 자동 시작 활성화
sudo systemctl enable esp32-weather

# 서비스 시작
sudo systemctl start esp32-weather

# 상태 확인
sudo systemctl status esp32-weather
```

### 4-3. 로그 확인

```bash
# 실시간 로그 보기
sudo journalctl -u esp32-weather -f

# 최근 로그 50줄
sudo journalctl -u esp32-weather -n 50
```

---

## 🌐 Step 5: 웹 모니터링 확인

### 5-1. 웹 브라우저에서 접속

```
http://3.35.139.224:4000/
```

### 5-2. 확인 사항

- ✅ 현재 온도/습도 표시
- ✅ 차트에 데이터 표시
- ✅ 5분마다 새로운 데이터 추가
- ✅ 센서 ID: esp32c3-001

### 5-3. API 직접 확인

```bash
# 최신 데이터 조회
curl http://3.35.139.224:4000/api/weather/latest

# 최근 데이터 조회
curl "http://3.35.139.224:4000/api/weather/data?hours=1"
```

---

## 🧪 문제 해결

### ESP32-C3 업로드 실패

**증상:** "Failed to connect to ESP32-C3"

**해결:**
1. BOOT 버튼을 누른 상태로 업로드 시도
2. USB 케이블 재연결
3. 포트 확인: `ls -l /dev/ttyACM*`

### 시리얼 데이터 수신 안 됨

**증상:** "No data received"

**해결:**
1. ESP32-C3가 정상 동작하는지 시리얼 모니터로 확인
2. USB 케이블 재연결
3. 포트 권한: `sudo chmod 666 /dev/ttyACM0`

### API 전송 실패

**증상:** "Failed to send data"

**해결:**
1. 네트워크 확인: `ping 3.35.139.224`
2. API Key 확인: `config.json`
3. EC2 서버 상태 확인

### 센서 읽기 오류

**증상:** "ERROR: Failed to read sensor data"

**해결:**
1. I2C 연결 확인:
   - SDA: GPIO6
   - SCL: GPIO7
   - VCC: 3.3V
   - GND: GND
2. AHT20 주소 확인 (0x38)
3. ESP32-C3 재부팅

---

## 📊 데이터 흐름 확인

```
ESP32-C3 (AHT20 센서 읽기)
  ↓ USB Serial
Raspberry Pi (esp32_serial_reader.py)
  ↓ HTTP POST
EC2 서버 (3.35.139.224:4000)
  ↓ MySQL
데이터베이스 (weather_data)
  ↓ HTTP GET
웹 브라우저 (Chart.js)
```

각 단계에서 데이터가 정상적으로 전달되는지 확인하세요!

---

## ✅ 완료 체크리스트

- [ ] Raspberry Pi SSH 접속
- [ ] Arduino CLI 설치
- [ ] ESP32 보드 설정
- [ ] Python 패키지 설치
- [ ] ESP32-C3 펌웨어 업로드
- [ ] 시리얼 모니터로 동작 확인
- [ ] 시리얼 리더 테스트
- [ ] systemd 서비스 등록
- [ ] 웹 모니터링 확인
- [ ] 5분 주기 데이터 수집 확인

---

**🎉 모든 단계 완료 후 웹에서 실시간 모니터링을 즐기세요!**

문제가 발생하면 로그를 확인하세요:
```bash
# ESP32 시리얼 리더 로그
sudo journalctl -u esp32-weather -f

# EC2 서버 로그
ssh -i ~/.ssh/uttec-first-ec2.pem ec2-user@3.35.139.224
pm2 logs weather-api
```

© 2025 Weather Monitoring Project
