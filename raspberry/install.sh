#!/bin/bash
# AHT20 센서 라이브러리 설치 스크립트

echo "=========================================="
echo "AHT20 센서 환경 설정 시작"
echo "=========================================="
echo ""

# Python 버전 확인
echo "1. Python 버전 확인..."
python3 --version
echo ""

# pip 업그레이드
echo "2. pip 업그레이드..."
python3 -m pip install --upgrade pip
echo ""

# 필수 시스템 패키지 설치
echo "3. 시스템 패키지 설치..."
sudo apt-get update
sudo apt-get install -y python3-pip python3-dev i2c-tools
echo ""

# I2C 활성화 확인
echo "4. I2C 활성화 확인..."
if [ -e /dev/i2c-1 ]; then
    echo "✅ I2C가 활성화되어 있습니다."
else
    echo "⚠️  I2C가 비활성화되어 있습니다."
    echo "   sudo raspi-config 명령으로 I2C를 활성화하세요."
    echo "   Interface Options > I2C > Enable"
fi
echo ""

# Python 패키지 설치
echo "5. Python 패키지 설치..."
pip3 install -r requirements.txt
echo ""

# 권한 설정
echo "6. 실행 권한 설정..."
chmod +x sensor_reader.py
chmod +x data_sender.py
echo ""

# 센서 연결 테스트
echo "7. I2C 장치 확인..."
echo "   AHT20 센서는 주소 0x38에 표시되어야 합니다."
sudo i2cdetect -y 1
echo ""

echo "=========================================="
echo "✅ 설치 완료!"
echo "=========================================="
echo ""
echo "다음 명령으로 센서를 테스트하세요:"
echo "  python3 sensor_reader.py"
echo ""
echo "데이터 전송을 시작하려면:"
echo "  python3 data_sender.py"
echo ""
