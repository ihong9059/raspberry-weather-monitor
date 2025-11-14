#!/usr/bin/env python3
"""
ESP32-C3 Firmware Flasher
Automatically flashes compiled Zephyr firmware to ESP32-C3

Usage:
    python3 esp32_flasher.py <firmware.bin>
"""

import os
import sys
import subprocess
import logging
import json

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load configuration
try:
    with open('config.json', 'r') as f:
        config = json.load(f)
except FileNotFoundError:
    logger.warning("config.json not found, using defaults")
    config = {}

SERIAL_PORT = config.get('serial_port', '/dev/ttyACM0')
FLASH_BAUDRATE = config.get('flash_baudrate', 460800)


def find_esptool():
    """
    Find esptool.py in the system
    """
    # Try common locations
    common_paths = [
        'esptool.py',
        '/usr/local/bin/esptool.py',
        os.path.expanduser('~/.local/bin/esptool.py'),
    ]

    for path in common_paths:
        if subprocess.run(['which', path], capture_output=True).returncode == 0:
            logger.info(f"Found esptool: {path}")
            return path

    logger.error("esptool.py not found! Install with: pip3 install esptool")
    return None


def flash_firmware(firmware_path, port=SERIAL_PORT, baudrate=FLASH_BAUDRATE):
    """
    Flash firmware to ESP32-C3

    Args:
        firmware_path (str): Path to zephyr.bin file
        port (str): Serial port
        baudrate (int): Flash baudrate
    """
    if not os.path.exists(firmware_path):
        logger.error(f"Firmware file not found: {firmware_path}")
        return False

    esptool = find_esptool()
    if not esptool:
        return False

    logger.info(f"Flashing {firmware_path} to {port}...")

    # ESP32-C3 flash command
    cmd = [
        esptool,
        '--chip', 'esp32c3',
        '--port', port,
        '--baud', str(baudrate),
        'write_flash',
        '0x0',  # Flash offset
        firmware_path
    ]

    try:
        logger.info(f"Command: {' '.join(cmd)}")
        result = subprocess.run(cmd, check=True, capture_output=False)

        logger.info("✓ Firmware flashed successfully!")
        logger.info("Please reset ESP32-C3 or unplug/replug USB")
        return True

    except subprocess.CalledProcessError as e:
        logger.error(f"Flashing failed: {e}")
        return False


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 esp32_flasher.py <firmware.bin>")
        print("\nExample:")
        print("  python3 esp32_flasher.py ../esp32c3/zephyr-app/build/zephyr/zephyr.bin")
        sys.exit(1)

    firmware_path = sys.argv[1]

    # Optional: port and baudrate from command line
    port = sys.argv[2] if len(sys.argv) > 2 else SERIAL_PORT
    baudrate = int(sys.argv[3]) if len(sys.argv) > 3 else FLASH_BAUDRATE

    success = flash_firmware(firmware_path, port, baudrate)
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
