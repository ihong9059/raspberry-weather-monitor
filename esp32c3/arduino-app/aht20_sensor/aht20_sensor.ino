/*
 * ESP32-C3 AHT20 Temperature & Humidity Sensor
 * Arduino Framework
 *
 * Reads temperature and humidity from AHT20 sensor via I2C
 * Outputs data to USB Serial every 5 minutes
 *
 * Hardware:
 * - ESP32-C3 DevKitM
 * - AHT20 Sensor
 *   - SDA: GPIO8
 *   - SCL: GPIO9
 *
 * IMPORTANT: Arduino IDE Settings
 * - Board: "ESP32C3 Dev Module"
 * - USB CDC On Boot: "Enabled"  <-- MUST BE ENABLED!
 * - Upload Speed: 921600
 * - USB Mode: "Hardware CDC and JTAG"
 */

#include <Wire.h>

// Enable USB CDC for Serial output
#if ARDUINO_USB_CDC_ON_BOOT
#warning "USB CDC On Boot Enabled"
#else
#error "USB CDC On Boot must be Enabled! Go to Tools -> USB CDC On Boot -> Enabled"
#endif

// AHT20 I2C Address
#define AHT20_ADDR 0x38

// AHT20 Commands
#define AHT20_CMD_INIT      0xBE
#define AHT20_CMD_TRIGGER   0xAC
#define AHT20_CMD_SOFT_RESET 0xBA

// Data sampling interval (5 minutes in milliseconds)
#define SAMPLE_INTERVAL_MS (5 * 60 * 1000)

// I2C Pins for ESP32-C3
#define SDA_PIN 8
#define SCL_PIN 9

// Function prototypes
bool aht20_init();
bool aht20_read_data(float *temperature, float *humidity);
void send_data_serial(float temperature, float humidity);

void setup() {
  // Initialize Serial
  Serial.begin(115200);
  while (!Serial) {
    delay(10); // Wait for Serial to be ready
  }

  delay(1000);
  Serial.println("\n\n=================================");
  Serial.println("ESP32-C3 AHT20 Sensor Application");
  Serial.println("=================================");

  // Initialize I2C
  Wire.begin(SDA_PIN, SCL_PIN);
  Serial.println("I2C initialized");
  Serial.print("SDA: GPIO");
  Serial.println(SDA_PIN);
  Serial.print("SCL: GPIO");
  Serial.println(SCL_PIN);

  // Initialize AHT20
  if (aht20_init()) {
    Serial.println("AHT20 initialized successfully");
  } else {
    Serial.println("ERROR: Failed to initialize AHT20");
    Serial.println("Check I2C connections:");
    Serial.println("  - SDA: GPIO8");
    Serial.println("  - SCL: GPIO9");
    Serial.println("  - VCC: 3.3V");
    Serial.println("  - GND: GND");
  }

  Serial.println("\nESP32-C3 AHT20 Sensor Ready");
  Serial.println("Data format: TEMP:xx.xx,HUMIDITY:xx.xx");
  Serial.println("=================================\n");
}

void loop() {
  float temperature, humidity;

  // Read sensor data
  if (aht20_read_data(&temperature, &humidity)) {
    // Send data via Serial
    send_data_serial(temperature, humidity);

    Serial.print("DEBUG: Temp=");
    Serial.print(temperature, 2);
    Serial.print("°C, Humidity=");
    Serial.print(humidity, 2);
    Serial.println("%");
  } else {
    Serial.println("ERROR: Failed to read sensor data");
  }

  // Wait 5 minutes before next reading
  delay(SAMPLE_INTERVAL_MS);
}

/**
 * Initialize AHT20 Sensor
 */
bool aht20_init() {
  uint8_t init_cmd[3] = {AHT20_CMD_INIT, 0x08, 0x00};

  // Wait for sensor to be ready
  delay(40);

  // Send initialization command
  Wire.beginTransmission(AHT20_ADDR);
  Wire.write(init_cmd, 3);
  uint8_t error = Wire.endTransmission();

  if (error != 0) {
    Serial.print("I2C Error: ");
    Serial.println(error);
    return false;
  }

  delay(10);
  return true;
}

/**
 * Trigger measurement and read data from AHT20
 */
bool aht20_read_data(float *temperature, float *humidity) {
  uint8_t trigger_cmd[3] = {AHT20_CMD_TRIGGER, 0x33, 0x00};
  uint8_t data[7];
  uint32_t raw_humidity, raw_temperature;

  // Trigger measurement
  Wire.beginTransmission(AHT20_ADDR);
  Wire.write(trigger_cmd, 3);
  if (Wire.endTransmission() != 0) {
    return false;
  }

  // Wait for measurement to complete (80ms typical)
  delay(100);

  // Read measurement data
  Wire.requestFrom(AHT20_ADDR, 7);

  if (Wire.available() < 7) {
    return false;
  }

  for (int i = 0; i < 7; i++) {
    data[i] = Wire.read();
  }

  // Check if data is ready (bit 7 of status byte should be 0)
  if (data[0] & 0x80) {
    Serial.println("Sensor busy, data not ready");
    return false;
  }

  // Parse humidity data (20 bits)
  raw_humidity = ((uint32_t)data[1] << 12) |
                 ((uint32_t)data[2] << 4) |
                 ((uint32_t)data[3] >> 4);

  // Parse temperature data (20 bits)
  raw_temperature = (((uint32_t)data[3] & 0x0F) << 16) |
                    ((uint32_t)data[4] << 8) |
                    ((uint32_t)data[5]);

  // Convert to actual values
  *humidity = ((float)raw_humidity / 1048576.0) * 100.0;
  *temperature = (((float)raw_temperature / 1048576.0) * 200.0) - 50.0;

  return true;
}

/**
 * Send data to Serial in standardized format
 */
void send_data_serial(float temperature, float humidity) {
  // Format: TEMP:23.45,HUMIDITY:65.20
  Serial.print("TEMP:");
  Serial.print(temperature, 2);
  Serial.print(",HUMIDITY:");
  Serial.println(humidity, 2);
}
