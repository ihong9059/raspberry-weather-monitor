#!/usr/bin/env python3
"""
AHT20 센서 데이터 읽기 모듈
온도와 습도를 측정하여 반환합니다.
"""

import time
import board
import adafruit_aht20

class AHT20Sensor:
    """AHT20 온습도 센서 클래스"""

    def __init__(self):
        """센서 초기화"""
        try:
            # I2C 버스 초기화
            i2c = board.I2C()

            # AHT20 센서 초기화
            self.sensor = adafruit_aht20.AHTx20(i2c)
            print("✅ AHT20 센서 초기화 성공")

        except Exception as e:
            print(f"❌ 센서 초기화 실패: {e}")
            raise

    def read_temperature(self):
        """
        온도 읽기

        Returns:
            float: 온도 (°C), 실패 시 None
        """
        try:
            temperature = self.sensor.temperature
            return round(temperature, 2)
        except Exception as e:
            print(f"❌ 온도 읽기 실패: {e}")
            return None

    def read_humidity(self):
        """
        습도 읽기

        Returns:
            float: 습도 (%), 실패 시 None
        """
        try:
            humidity = self.sensor.relative_humidity
            return round(humidity, 2)
        except Exception as e:
            print(f"❌ 습도 읽기 실패: {e}")
            return None

    def read_data(self):
        """
        온도와 습도를 함께 읽기

        Returns:
            dict: {'temperature': float, 'humidity': float, 'success': bool}
        """
        try:
            temperature = self.read_temperature()
            humidity = self.read_humidity()

            if temperature is not None and humidity is not None:
                return {
                    'success': True,
                    'temperature': temperature,
                    'humidity': humidity
                }
            else:
                return {
                    'success': False,
                    'error': '센서 데이터 읽기 실패'
                }

        except Exception as e:
            print(f"❌ 데이터 읽기 실패: {e}")
            return {
                'success': False,
                'error': str(e)
            }

# 테스트 코드
if __name__ == "__main__":
    print("AHT20 센서 테스트 시작\n")

    try:
        # 센서 초기화
        sensor = AHT20Sensor()

        # 10번 측정 (5초 간격)
        for i in range(10):
            print(f"\n[{i+1}/10] 측정 중...")
            data = sensor.read_data()

            if data['success']:
                print(f"🌡️  온도: {data['temperature']}°C")
                print(f"💧 습도: {data['humidity']}%")
            else:
                print(f"❌ 오류: {data.get('error', '알 수 없는 오류')}")

            if i < 9:  # 마지막 측정 후에는 대기 안 함
                time.sleep(5)

        print("\n✅ 테스트 완료!")

    except KeyboardInterrupt:
        print("\n\n⚠️  사용자에 의해 중단됨")
    except Exception as e:
        print(f"\n❌ 테스트 실패: {e}")
