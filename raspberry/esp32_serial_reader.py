#!/usr/bin/env python3
"""
ESP32-C3 Serial Reader
Reads temperature and humidity data from ESP32-C3 via USB Serial
and sends it to EC2 API server

Data Format: TEMP:23.5,HUMIDITY:65.2
"""

import serial
import serial.tools.list_ports
import time
import json
import requests
import logging
from datetime import datetime
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load configuration
try:
    with open('config.json', 'r') as f:
        config = json.load(f)
except FileNotFoundError:
    logger.error("config.json not found!")
    sys.exit(1)

API_URL = config.get('api_url', 'http://3.35.139.224:4000/api/weather/data')
API_KEY = config.get('api_key', 'raspberry-weather-key-2025-secure')
SENSOR_ID = config.get('sensor_id_esp32', 'esp32c3-001')
SERIAL_PORT = config.get('serial_port', '/dev/ttyACM0')
BAUD_RATE = config.get('baud_rate', 115200)
RETRY_ATTEMPTS = config.get('retry_attempts', 3)
RETRY_DELAY = config.get('retry_delay_seconds', 10)


def find_esp32_serial_port():
    """
    Automatically find ESP32-C3 USB Serial port
    """
    ports = serial.tools.list_ports.comports()

    for port in ports:
        # ESP32-C3 usually appears as /dev/ttyACM* on Linux
        if 'ACM' in port.device or 'USB' in port.device:
            logger.info(f"Found potential ESP32 port: {port.device} - {port.description}")
            return port.device

    logger.warning("ESP32-C3 serial port not found automatically")
    return None


def parse_serial_data(line):
    """
    Parse serial data line
    Format: TEMP:23.5,HUMIDITY:65.2

    Returns:
        dict: {'temperature': 23.5, 'humidity': 65.2} or None if parsing fails
    """
    try:
        line = line.strip()

        if not line.startswith('TEMP:'):
            return None

        # Split by comma
        parts = line.split(',')
        if len(parts) != 2:
            return None

        # Parse temperature
        temp_part = parts[0].split(':')
        if len(temp_part) != 2 or temp_part[0] != 'TEMP':
            return None
        temperature = float(temp_part[1])

        # Parse humidity
        humidity_part = parts[1].split(':')
        if len(humidity_part) != 2 or humidity_part[0] != 'HUMIDITY':
            return None
        humidity = float(humidity_part[1])

        return {
            'temperature': temperature,
            'humidity': humidity
        }

    except (ValueError, IndexError) as e:
        logger.error(f"Failed to parse line '{line}': {e}")
        return None


def send_data_to_api(temperature, humidity):
    """
    Send sensor data to EC2 API

    Args:
        temperature (float): Temperature in Celsius
        humidity (float): Humidity in percentage

    Returns:
        bool: True if successful, False otherwise
    """
    payload = {
        'temperature': temperature,
        'humidity': humidity,
        'timestamp': datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ'),
        'sensor_id': SENSOR_ID
    }

    headers = {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
    }

    for attempt in range(RETRY_ATTEMPTS):
        try:
            logger.info(f"Sending data (attempt {attempt + 1}/{RETRY_ATTEMPTS}): "
                       f"Temp={temperature}°C, Humidity={humidity}%")

            response = requests.post(
                API_URL,
                json=payload,
                headers=headers,
                timeout=10
            )

            if response.status_code == 200 or response.status_code == 201:
                logger.info(f"✓ Data sent successfully: {response.json()}")
                return True
            else:
                logger.error(f"API error {response.status_code}: {response.text}")

        except requests.exceptions.RequestException as e:
            logger.error(f"Network error: {e}")

        if attempt < RETRY_ATTEMPTS - 1:
            logger.info(f"Retrying in {RETRY_DELAY} seconds...")
            time.sleep(RETRY_DELAY)

    logger.error("Failed to send data after all retry attempts")
    return False


def main():
    """
    Main loop - read from serial and send to API
    """
    logger.info("ESP32-C3 Serial Reader Starting...")

    # Find serial port
    port = SERIAL_PORT
    if not port or port == 'auto':
        port = find_esp32_serial_port()
        if not port:
            logger.error("Could not find ESP32-C3 serial port. Please specify in config.json")
            sys.exit(1)

    logger.info(f"Using serial port: {port}")

    # Open serial connection
    try:
        ser = serial.Serial(
            port=port,
            baudrate=BAUD_RATE,
            timeout=1
        )
        logger.info(f"Serial port opened: {port} @ {BAUD_RATE} baud")
    except serial.SerialException as e:
        logger.error(f"Failed to open serial port: {e}")
        sys.exit(1)

    # Main loop
    logger.info("Waiting for data from ESP32-C3...")

    try:
        while True:
            try:
                # Read line from serial
                if ser.in_waiting > 0:
                    line = ser.readline().decode('utf-8', errors='ignore')

                    # Log all output for debugging
                    logger.debug(f"Raw: {line.strip()}")

                    # Parse data
                    data = parse_serial_data(line)

                    if data:
                        logger.info(f"Received: Temp={data['temperature']}°C, "
                                   f"Humidity={data['humidity']}%")

                        # Send to API
                        send_data_to_api(data['temperature'], data['humidity'])
                    else:
                        # Print other messages (debug, info)
                        stripped = line.strip()
                        if stripped and not stripped.startswith('TEMP:'):
                            logger.info(f"ESP32: {stripped}")

                # Small delay to prevent CPU overload
                time.sleep(0.1)

            except UnicodeDecodeError:
                # Ignore decode errors
                pass

    except KeyboardInterrupt:
        logger.info("\nStopping...")

    finally:
        if ser.is_open:
            ser.close()
            logger.info("Serial port closed")


if __name__ == '__main__':
    main()
