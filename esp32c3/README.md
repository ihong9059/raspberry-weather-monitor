# ESP32-C3 Zephyr 펌웨어 가이드

ESP32-C3에서 Zephyr RTOS를 사용하여 AHT20 센서로부터 온도/습도 데이터를 읽고 USB Serial로 출력하는 펌웨어

---

## 📋 개요

이 펌웨어는 ESP32-C3에서 실행되며:
- AHT20 센서로부터 온도/습도 측정 (I2C)
- 5분마다 자동 측정
- USB Serial로 데이터 출력 (`TEMP:23.5,HUMIDITY:65.2`)

---

## 🔧 하드웨어 연결

### ESP32-C3 핀 연결

| ESP32-C3 | AHT20 | 설명 |
|----------|-------|------|
| GPIO8    | SDA   | I2C 데이터 |
| GPIO9    | SCL   | I2C 클럭 |
| 3.3V     | VCC   | 전원 |
| GND      | GND   | 접지 |

### USB 연결
- ESP32-C3 USB → Raspberry Pi USB (Serial + 전원)

---

## 🛠️ 빌드 환경 구축

### EC2에서 Zephyr 설치

```bash
# 1. 의존성 설치
sudo apt update
sudo apt install --no-install-recommends git cmake ninja-build gperf \
  ccache dfu-util device-tree-compiler wget \
  python3-dev python3-pip python3-setuptools python3-tk python3-wheel xz-utils file \
  make gcc gcc-multilib g++-multilib libsdl2-dev libmagic1

# 2. West 설치
pip3 install west

# 3. Zephyr workspace 초기화
west init ~/zephyrproject
cd ~/zephyrproject
west update

# 4. Zephyr SDK 설치
cd ~
wget https://github.com/zephyrproject-rtos/sdk-ng/releases/download/v0.16.5/zephyr-sdk-0.16.5_linux-x86_64.tar.xz
tar xvf zephyr-sdk-0.16.5_linux-x86_64.tar.xz
cd zephyr-sdk-0.16.5
./setup.sh

# 5. Python 의존성
pip3 install -r ~/zephyrproject/zephyr/scripts/requirements.txt

# 6. ESP32 도구 설치
west espressif install
west espressif update
```

---

## 🏗️ 빌드 방법

### 옵션 1: EC2에서 빌드 (권장)

```bash
# 1. 프로젝트 복제
cd ~
git clone https://github.com/ihong9059/raspberry-weather-monitor.git

# 2. Zephyr 환경 설정
cd ~/zephyrproject
source zephyr/zephyr-env.sh

# 3. 빌드
cd ~/raspberry-weather-monitor/esp32c3/zephyr-app
west build -b esp32c3_devkitm -p

# 4. 빌드 결과
# build/zephyr/zephyr.bin
```

### 옵션 2: 로컬 Mac에서 빌드

Mac에서는 Docker를 사용하는 것이 편리합니다:

```bash
docker run --rm -v $(pwd):/workdir \
  zephyrprojectrtos/ci:latest \
  /bin/bash -c "west build -b esp32c3_devkitm"
```

---

## 🔥 플래싱 방법

### Raspberry Pi에서 플래싱

```bash
# 1. 펌웨어 다운로드 (EC2에서 빌드한 경우)
scp -i ~/.ssh/uttec-first-ec2.pem \
  ec2-user@3.35.139.224:~/raspberry-weather-monitor/esp32c3/zephyr-app/build/zephyr/zephyr.bin \
  ~/esp32_firmware.bin

# 2. 플래싱 스크립트 실행
cd ~/raspberry-weather-monitor/raspberry
python3 esp32_flasher.py ~/esp32_firmware.bin

# 또는 직접 esptool 사용
esptool.py --chip esp32c3 --port /dev/ttyACM0 --baud 460800 \
  write_flash 0x0 ~/esp32_firmware.bin
```

### 플래싱 후
- ESP32-C3를 리셋하거나 USB 재연결
- 시리얼 모니터로 확인: `screen /dev/ttyACM0 115200`

---

## 📊 시리얼 출력 포맷

```
ESP32-C3 AHT20 Sensor Ready
TEMP:23.45,HUMIDITY:65.20
TEMP:23.50,HUMIDITY:65.18
...
```

---

## 🧪 테스트

### 1. 시리얼 모니터로 확인

```bash
# 리눅스/Mac
screen /dev/ttyACM0 115200

# 또는 minicom
minicom -D /dev/ttyACM0 -b 115200

# 종료: Ctrl+A, K (screen)
```

### 2. Python으로 확인

```bash
cd raspberry
python3 esp32_serial_reader.py
```

출력 예시:
```
2025-11-15 12:00:00 - INFO - Serial port opened: /dev/ttyACM0 @ 115200 baud
2025-11-15 12:00:05 - INFO - ESP32: ESP32-C3 AHT20 Sensor Ready
2025-11-15 12:05:00 - INFO - Received: Temp=23.5°C, Humidity=65.2%
2025-11-15 12:05:01 - INFO - ✓ Data sent successfully
```

---

## 🐛 문제 해결

### 빌드 오류

**오류**: `west: command not found`
```bash
pip3 install west
```

**오류**: `Could not find toolchain`
```bash
west espressif install
west espressif update
```

### 플래싱 오류

**오류**: `Failed to connect to ESP32`
1. ESP32-C3의 BOOT 버튼을 누른 상태로 플래싱 시작
2. USB 케이블 재연결
3. 포트 권한 확인: `sudo chmod 666 /dev/ttyACM0`

**오류**: `Serial port not found`
```bash
# 포트 확인
ls -l /dev/ttyACM* /dev/ttyUSB*

# 사용자를 dialout 그룹에 추가
sudo usermod -a -G dialout $USER
# 로그아웃 후 다시 로그인
```

### 센서 오류

**증상**: 데이터가 출력되지 않음
1. I2C 연결 확인 (SDA, SCL, VCC, GND)
2. AHT20 주소 확인 (0x38)
3. Serial 모니터에서 에러 메시지 확인

---

## 📚 참고 자료

- [Zephyr Documentation](https://docs.zephyrproject.org/)
- [ESP32-C3 Datasheet](https://www.espressif.com/sites/default/files/documentation/esp32-c3_datasheet_en.pdf)
- [AHT20 Datasheet](http://www.aosong.com/userfiles/files/media/AHT20%20%E8%A7%84%E6%A0%BC%E4%B9%A6%E4%B8%AD%E6%96%87%E7%89%88.pdf)

---

## 🔄 펌웨어 업데이트

코드 수정 후:
1. EC2에서 재빌드
2. Raspberry Pi로 전송
3. 플래싱 스크립트 실행
4. ESP32-C3 리셋

---

© 2025 Weather Monitoring Project
