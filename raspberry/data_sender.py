#!/usr/bin/env python3
"""
온습도 데이터를 EC2 서버로 전송하는 메인 스크립트
AHT20 센서에서 데이터를 읽어 HTTP POST로 전송합니다.
"""

import json
import time
import requests
from datetime import datetime
from sensor_reader import AHT20Sensor

class WeatherDataSender:
    """날씨 데이터 전송 클래스"""

    def __init__(self, config_file='config.json'):
        """
        초기화

        Args:
            config_file (str): 설정 파일 경로
        """
        # 설정 파일 로드
        with open(config_file, 'r') as f:
            self.config = json.load(f)

        # 센서 초기화
        self.sensor = AHT20Sensor()

        print("✅ WeatherDataSender 초기화 완료")
        print(f"📡 API URL: {self.config['api_url']}")
        print(f"🔑 센서 ID: {self.config['sensor_id']}")
        print(f"⏱️  전송 주기: {self.config['interval_minutes']}분\n")

    def send_data(self, temperature, humidity):
        """
        데이터를 서버로 전송

        Args:
            temperature (float): 온도 (°C)
            humidity (float): 습도 (%)

        Returns:
            bool: 전송 성공 여부
        """
        # 요청 데이터 구성
        data = {
            'temperature': temperature,
            'humidity': humidity,
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'sensor_id': self.config['sensor_id']
        }

        # 요청 헤더 (API Key 포함)
        headers = {
            'Content-Type': 'application/json',
            'X-API-Key': self.config['api_key']
        }

        # 재시도 로직
        for attempt in range(self.config['retry_attempts']):
            try:
                print(f"📤 서버로 데이터 전송 중... (시도 {attempt + 1}/{self.config['retry_attempts']})")

                response = requests.post(
                    self.config['api_url'],
                    json=data,
                    headers=headers,
                    timeout=10
                )

                if response.status_code in [200, 201]:
                    result = response.json()
                    print(f"✅ 전송 성공! 데이터 ID: {result.get('data_id')}")
                    print(f"   온도: {temperature}°C, 습도: {humidity}%")
                    return True
                else:
                    print(f"❌ 전송 실패: HTTP {response.status_code}")
                    print(f"   응답: {response.text}")

            except requests.exceptions.Timeout:
                print(f"⏱️  타임아웃 발생 (시도 {attempt + 1})")
            except requests.exceptions.ConnectionError:
                print(f"🔌 연결 오류 (시도 {attempt + 1})")
            except Exception as e:
                print(f"❌ 전송 오류: {e}")

            # 재시도 전 대기
            if attempt < self.config['retry_attempts'] - 1:
                print(f"⏳ {self.config['retry_delay_seconds']}초 후 재시도...\n")
                time.sleep(self.config['retry_delay_seconds'])

        print("❌ 모든 재시도 실패\n")
        return False

    def run_once(self):
        """한 번 실행 (센서 읽기 + 전송)"""
        print(f"\n{'='*60}")
        print(f"🔄 데이터 수집 시작: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print('='*60)

        # 센서 데이터 읽기
        data = self.sensor.read_data()

        if data['success']:
            print(f"📊 측정값:")
            print(f"   🌡️  온도: {data['temperature']}°C")
            print(f"   💧 습도: {data['humidity']}%\n")

            # 서버로 전송
            self.send_data(data['temperature'], data['humidity'])
        else:
            print(f"❌ 센서 읽기 실패: {data.get('error', '알 수 없는 오류')}\n")

        print('='*60 + '\n')

    def run_continuous(self):
        """연속 실행 (주기적으로 데이터 수집 및 전송)"""
        print("\n🚀 연속 모드 시작 (Ctrl+C로 중단)\n")

        interval_seconds = self.config['interval_minutes'] * 60

        try:
            while True:
                self.run_once()

                print(f"⏳ 다음 측정까지 {self.config['interval_minutes']}분 대기...\n")
                time.sleep(interval_seconds)

        except KeyboardInterrupt:
            print("\n\n⚠️  사용자에 의해 중단됨")
            print("👋 프로그램을 종료합니다.\n")

# 메인 실행
if __name__ == "__main__":
    import sys

    try:
        sender = WeatherDataSender()

        # 명령행 인자 확인
        if len(sys.argv) > 1 and sys.argv[1] == '--once':
            # 한 번만 실행
            sender.run_once()
        else:
            # 연속 실행
            sender.run_continuous()

    except FileNotFoundError:
        print("❌ config.json 파일을 찾을 수 없습니다.")
        print("   현재 디렉토리에 config.json 파일이 있는지 확인하세요.")
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        import traceback
        traceback.print_exc()
