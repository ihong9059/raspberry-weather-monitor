# 라즈베리파이 센서 코드

AHT20 센서로 온도/습도를 측정하고 EC2 서버로 전송하는 Python 스크립트

---

## 📋 필수 요구사항

- 라즈베리파이 (모든 모델)
- AHT20 온습도 센서
- Python 3.7 이상
- I2C 활성화

---

## 🔧 설치 방법

### 1. I2C 활성화 (처음 한 번만)

```bash
sudo raspi-config
```

- `Interface Options` → `I2C` → `Enable` 선택
- 재부팅: `sudo reboot`

### 2. 센서 라이브러리 설치

```bash
cd /home/pi/raspberry-weather-monitor/raspberry
chmod +x install.sh
./install.sh
```

### 3. 센서 연결 확인

```bash
sudo i2cdetect -y 1
```

AHT20이 주소 `0x38`에 표시되어야 합니다.

---

## 🚀 사용 방법

### 센서 테스트

```bash
python3 sensor_reader.py
```

10회 측정하여 센서가 정상 작동하는지 확인합니다.

### 한 번만 전송 (테스트용)

```bash
python3 data_sender.py --once
```

센서 데이터를 읽고 EC2로 한 번만 전송합니다.

### 연속 전송 (실제 운영)

```bash
python3 data_sender.py
```

5분마다 자동으로 데이터를 수집하고 전송합니다.
(Ctrl+C로 중단)

---

## ⏰ Cron 자동 실행 설정

5분마다 자동 실행하려면:

```bash
crontab -e
```

다음 줄 추가:

```
*/5 * * * * cd /home/pi/raspberry-weather-monitor/raspberry && /usr/bin/python3 data_sender.py --once >> /tmp/weather.log 2>&1
```

Cron 작업 확인:

```bash
crontab -l
```

로그 확인:

```bash
tail -f /tmp/weather.log
```

---

## 📁 파일 설명

| 파일 | 설명 |
|------|------|
| `sensor_reader.py` | AHT20 센서 데이터 읽기 모듈 |
| `data_sender.py` | 데이터를 EC2로 전송하는 메인 스크립트 |
| `config.json` | API URL, API Key 등 설정 |
| `requirements.txt` | Python 패키지 목록 |
| `install.sh` | 설치 스크립트 |

---

## ⚙️ 설정 변경 (config.json)

```json
{
  "api_url": "http://3.35.139.224:4000/api/weather/data",
  "api_key": "raspberry-weather-key-2025-secure",
  "sensor_id": "raspberry-pi-001",
  "interval_minutes": 5,
  "retry_attempts": 3,
  "retry_delay_seconds": 10
}
```

- `interval_minutes`: 데이터 수집 주기 (분)
- `retry_attempts`: 전송 실패 시 재시도 횟수
- `sensor_id`: 여러 라즈베리파이 구분용 ID

---

## 🐛 문제 해결

### "No module named 'adafruit_aht20'"

```bash
pip3 install adafruit-circuitpython-aht20
```

### "I2C device not found"

1. I2C가 활성화되어 있는지 확인
2. 센서 연결 상태 확인 (VCC, GND, SDA, SCL)
3. `sudo i2cdetect -y 1`로 센서 확인

### "API Key가 유효하지 않습니다"

`config.json`의 `api_key`가 EC2 서버의 `.env` 파일과 일치하는지 확인

---

## 📊 AHT20 센서 사양

- 온도 범위: -40°C ~ +80°C
- 습도 범위: 0% ~ 100%
- 정확도: ±0.3°C (온도), ±2% RH (습도)
- I2C 주소: 0x38

---

© 2025 Weather Monitoring Project
