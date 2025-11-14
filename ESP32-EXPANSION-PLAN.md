# ESP32-C3 확장 계획서

**작성일**: 2025-11-15
**버전**: 2.0
**GitHub**: https://github.com/ihong9059/raspberry-weather-monitor

---

## 📋 확장 개요

기존 라즈베리파이 직접 연결 방식에서 **ESP32-C3 + Zephyr RTOS** 기반 시스템으로 확장

---

## 🏗️ 새로운 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│  ESP32-C3 (Zephyr RTOS)                                     │
│  - AHT20 센서 (I2C)                                         │
│  - 온도/습도 측정 (5분 주기)                                │
│  - USB Serial 출력                                          │
└──────────────────┬──────────────────────────────────────────┘
                   │ USB Serial (UART)
                   │ "TEMP:23.5,HUMIDITY:65.2"
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  Raspberry Pi (192.168.0.3)                                 │
│  - Python 시리얼 리더                                       │
│  - 데이터 파싱 및 전송                                      │
│  - ESP32-C3 플래싱 자동화                                   │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTP POST (WiFi)
                   │ {"temperature": 23.5, "humidity": 65.2}
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  AWS EC2 (3.35.139.224:4000)                                │
│  - Node.js API 서버 (기존)                                  │
│  - MySQL 데이터베이스                                       │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTP GET (JSON)
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  웹 브라우저                                                │
│  - Chart.js 실시간 차트                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 하드웨어 구성

### ESP32-C3
- **MCU**: ESP32-C3 (RISC-V)
- **센서**: AHT20 (I2C)
  - SDA: GPIO8
  - SCL: GPIO9
- **통신**: USB Serial (CDC ACM)
- **OS**: Zephyr RTOS

### 연결 상태
```
Raspberry Pi (192.168.0.3)
    └─ USB ─┬─ ESP32-C3
            └─ I2C ─ AHT20
```

---

## 📁 확장된 프로젝트 구조

```
raspberry-weather-monitor/
├── esp32c3/                          # ESP32-C3 펌웨어 (신규)
│   ├── zephyr-workspace/
│   │   ├── src/
│   │   │   └── main.c               # Zephyr 메인 애플리케이션
│   │   ├── prj.conf                 # Zephyr 프로젝트 설정
│   │   ├── CMakeLists.txt
│   │   └── boards/
│   │       └── esp32c3_devkitm.overlay  # 디바이스 트리 오버레이
│   ├── README.md                    # ESP32-C3 빌드 가이드
│   └── build/                       # 빌드 출력 (gitignore)
│
├── raspberry/                        # 라즈베리파이 코드 (수정)
│   ├── esp32_serial_reader.py       # ESP32 시리얼 데이터 읽기 (신규)
│   ├── esp32_flasher.py             # ESP32 플래싱 자동화 (신규)
│   ├── data_sender.py               # EC2로 데이터 전송 (기존)
│   ├── config.json                  # 설정 파일 (확장)
│   ├── requirements.txt             # Python 패키지 (확장)
│   └── install_esp32.sh             # ESP32 도구 설치 (신규)
│
├── server/                           # EC2 서버 (기존 유지)
├── public/                           # 웹 클라이언트 (기존 유지)
└── docs/                             # 문서 (신규)
    ├── ESP32-EXPANSION-PLAN.md      # 이 파일
    └── ESP32-SETUP-GUIDE.md         # ESP32 설정 가이드
```

---

## 🔧 기술 스택 (확장)

### ESP32-C3 펌웨어
- **RTOS**: Zephyr v3.5+
- **언어**: C
- **빌드 시스템**: West (Zephyr meta-tool)
- **센서 드라이버**: Zephyr I2C + AHT20 커스텀 드라이버
- **통신**: USB CDC ACM (Serial)

### Raspberry Pi (추가)
- **시리얼 통신**: `pyserial`
- **플래싱**: `esptool.py`
- **빌드**: SSH로 EC2에서 빌드 또는 로컬 빌드

### EC2 (변경 없음)
- Node.js + Express.js
- MySQL

---

## 🚀 구현 단계

### Phase 1: ESP32-C3 Zephyr 펌웨어 개발
- [ ] EC2에 Zephyr 개발 환경 구축
- [ ] AHT20 I2C 드라이버 구현
- [ ] USB Serial 출력 구현
- [ ] 5분 주기 타이머 구현
- [ ] 빌드 및 테스트

### Phase 2: Raspberry Pi 통합
- [ ] 시리얼 리더 Python 스크립트 작성
- [ ] 데이터 파싱 및 EC2 전송 로직
- [ ] ESP32 플래싱 자동화 스크립트
- [ ] systemd 서비스 등록 (자동 시작)

### Phase 3: 테스트 및 문서화
- [ ] 엔드투엔드 테스트
- [ ] 에러 핸들링
- [ ] 문서 작성 (설치, 빌드, 배포)
- [ ] 히스토리 업데이트

---

## 📊 데이터 포맷

### ESP32-C3 Serial 출력
```
TEMP:23.5,HUMIDITY:65.2\n
```

### Raspberry Pi → EC2 API
```json
{
  "temperature": 23.5,
  "humidity": 65.2,
  "timestamp": "2025-11-15T12:00:00Z",
  "sensor_id": "esp32c3-001"
}
```

---

## 🔌 ESP32-C3 핀 매핑

| 핀 | 기능 | 연결 |
|----|------|------|
| GPIO8 | I2C SDA | AHT20 SDA |
| GPIO9 | I2C SCL | AHT20 SCL |
| 3.3V | 전원 | AHT20 VCC |
| GND | 접지 | AHT20 GND |
| USB | Serial + 전원 | Raspberry Pi USB |

---

## ⚙️ Zephyr 프로젝트 설정 (prj.conf)

```ini
# Logging
CONFIG_LOG=y
CONFIG_SERIAL=y
CONFIG_UART_CONSOLE=y

# I2C
CONFIG_I2C=y

# USB CDC ACM
CONFIG_USB_DEVICE_STACK=y
CONFIG_USB_CDC_ACM=y

# Scheduling
CONFIG_SYSTEM_WORKQUEUE_STACK_SIZE=2048
```

---

## 🧪 테스트 계획

### 1. ESP32-C3 단위 테스트
- I2C 통신 확인 (i2cdetect)
- AHT20 센서 읽기 테스트
- Serial 출력 확인

### 2. Raspberry Pi 통합 테스트
- Serial 데이터 수신 확인
- 파싱 로직 검증
- EC2 API 전송 확인

### 3. 엔드투엔드 테스트
- 전체 데이터 흐름 확인
- 웹 대시보드 업데이트 확인
- 5분 주기 동작 확인

---

## 📝 필요한 도구

### EC2 (Zephyr 빌드 환경)
```bash
# Zephyr 설치
sudo apt update
sudo apt install --no-install-recommends git cmake ninja-build gperf \
  ccache dfu-util device-tree-compiler wget \
  python3-dev python3-pip python3-setuptools python3-tk python3-wheel xz-utils file \
  make gcc gcc-multilib g++-multilib libsdl2-dev libmagic1

# West 설치
pip3 install west

# Zephyr SDK 설치
```

### Raspberry Pi
```bash
# Python 패키지
pip3 install pyserial esptool

# USB 권한 설정
sudo usermod -a -G dialout $USER
```

---

## 🔐 보안 고려사항

- ESP32-C3는 인증 없이 Serial 출력만 담당
- Raspberry Pi가 API Key 관리
- 기존 API 인증 방식 유지

---

## 📅 예상 일정

| Phase | 작업 | 예상 시간 |
|-------|------|-----------|
| 1 | ESP32-C3 펌웨어 개발 | 3-4시간 |
| 2 | Raspberry Pi 통합 | 2-3시간 |
| 3 | 테스트 및 문서화 | 1-2시간 |
| **합계** | **전체 확장** | **6-9시간** |

---

## 🎯 다음 단계

1. ✅ 이 계획서 작성
2. ⬜ EC2에 Zephyr 개발 환경 구축
3. ⬜ ESP32-C3 펌웨어 개발
4. ⬜ Raspberry Pi 스크립트 개발
5. ⬜ 통합 테스트
6. ⬜ 문서화 및 히스토리 업데이트

---

**이 확장은 시스템을 더 모듈화하고 확장 가능하게 만듭니다!**

© 2025 Weather Monitoring Project
