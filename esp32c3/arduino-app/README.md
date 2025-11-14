# ESP32-C3 Arduino 펌웨어

Arduino 프레임워크를 사용한 ESP32-C3 AHT20 센서 애플리케이션

---

## 🚀 빠른 시작 (Arduino CLI 사용)

### 1. Arduino CLI 설치

```bash
# Mac/Linux
curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh

# 또는 Homebrew (Mac)
brew install arduino-cli
```

### 2. ESP32 보드 설치

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

### 3. 라이브러리 설치 (필요한 경우)

```bash
# Wire 라이브러리는 ESP32 코어에 포함되어 있음
```

### 4. 컴파일

```bash
cd esp32c3/arduino-app

# ESP32-C3 DevKitM용 컴파일 (USB CDC 활성화 필수!)
arduino-cli compile --fqbn esp32:esp32:esp32c3:CDCOnBoot=cdc aht20_sensor
```

**⚠️ 중요: USB CDC On Boot 설정**
- **반드시 CDCOnBoot=cdc 옵션을 추가해야 합니다!**
- 이 옵션이 없으면 USB Serial 출력이 작동하지 않습니다.

### 5. 업로드

```bash
# 포트 확인
arduino-cli board list

# 업로드 (Raspberry Pi에서) - USB CDC 옵션 포함!
arduino-cli upload --fqbn esp32:esp32:esp32c3:CDCOnBoot=cdc --port /dev/ttyACM0 aht20_sensor

# 또는 Mac에서
arduino-cli upload --fqbn esp32:esp32:esp32c3:CDCOnBoot=cdc --port /dev/cu.usbmodem* aht20_sensor
```

**⚠️ 주의:**
- 컴파일과 업로드 모두 `CDCOnBoot=cdc` 옵션이 필요합니다
- 이 옵션을 빼먹으면 Serial 통신이 작동하지 않습니다!

### 6. 시리얼 모니터

```bash
# Arduino CLI
arduino-cli monitor --port /dev/ttyACM0 --config baudrate=115200

# 또는 screen
screen /dev/ttyACM0 115200
```

---

## 📦 Arduino IDE 사용 (GUI)

### 1. Arduino IDE 설치
- https://www.arduino.cc/en/software 다운로드

### 2. ESP32 보드 추가
1. **File → Preferences**
2. **Additional Board Manager URLs**에 추가:
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
3. **Tools → Board → Boards Manager**
4. "ESP32" 검색 후 설치

### 3. 보드 선택
- **Tools → Board → ESP32 Arduino → ESP32C3 Dev Module**

### 4. 포트 선택
- **Tools → Port → /dev/ttyACM0** (또는 자동 감지된 포트)

### 5. 업로드
- **Sketch → Upload** 또는 Ctrl+U

---

## 🔧 핀 설정

| ESP32-C3 | AHT20 | 코드 |
|----------|-------|------|
| GPIO6    | SDA   | `#define SDA_PIN 6` |
| GPIO7    | SCL   | `#define SCL_PIN 7` |
| 3.3V     | VCC   | - |
| GND      | GND   | - |

---

## 📊 시리얼 출력 예시

```
=================================
ESP32-C3 AHT20 Sensor Application
=================================
I2C initialized
SDA: GPIO8
SCL: GPIO9
AHT20 initialized successfully

ESP32-C3 AHT20 Sensor Ready
Data format: TEMP:xx.xx,HUMIDITY:xx.xx
=================================

TEMP:23.45,HUMIDITY:65.20
DEBUG: Temp=23.45°C, Humidity=65.20%
TEMP:23.50,HUMIDITY:65.18%
DEBUG: Temp=23.50°C, Humidity=65.18%
```

---

## 🐛 문제 해결

### 컴파일 오류

**Error: "esp32:esp32:esp32c3" not found**
```bash
arduino-cli core install esp32:esp32
```

### 업로드 오류

**Error: "Failed to connect"**
1. ESP32-C3의 BOOT 버튼을 누른 상태로 업로드 시도
2. USB 케이블 재연결
3. 포트 권한 확인:
   ```bash
   sudo chmod 666 /dev/ttyACM0
   ```

**Error: "Port not found"**
```bash
# 포트 확인
ls -l /dev/ttyACM* /dev/ttyUSB*

# 사용자를 dialout 그룹에 추가
sudo usermod -a -G dialout $USER
```

### 센서 읽기 오류

**"ERROR: Failed to read sensor data"**
1. I2C 연결 확인 (SDA, SCL, VCC, GND)
2. AHT20 주소 확인 (0x38)
3. 시리얼 모니터에서 디버그 메시지 확인

---

## 🔄 수정 후 재업로드

```bash
# 1. 코드 수정
# 2. 재컴파일
arduino-cli compile --fqbn esp32:esp32:esp32c3 aht20_sensor

# 3. 재업로드
arduino-cli upload --fqbn esp32:esp32:esp32c3 --port /dev/ttyACM0 aht20_sensor
```

---

## 📝 코드 설명

### 주요 함수

- `setup()`: 초기화 (Serial, I2C, AHT20)
- `loop()`: 5분마다 센서 읽기 및 데이터 전송
- `aht20_init()`: AHT20 센서 초기화
- `aht20_read_data()`: 센서 데이터 읽기
- `send_data_serial()`: 표준 포맷으로 Serial 출력

### 데이터 포맷

```
TEMP:23.45,HUMIDITY:65.20
```

이 포맷은 Raspberry Pi의 `esp32_serial_reader.py`가 파싱합니다.

---

© 2025 Weather Monitoring Project
