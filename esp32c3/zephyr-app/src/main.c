/*
 * ESP32-C3 AHT20 Temperature & Humidity Sensor
 * Zephyr RTOS Application
 *
 * Reads temperature and humidity from AHT20 sensor via I2C
 * Outputs data to USB Serial every 5 minutes
 */

#include <zephyr/kernel.h>
#include <zephyr/device.h>
#include <zephyr/drivers/i2c.h>
#include <zephyr/drivers/uart.h>
#include <zephyr/usb/usb_device.h>
#include <zephyr/logging/log.h>

LOG_MODULE_REGISTER(aht20_sensor, LOG_LEVEL_INF);

/* AHT20 I2C Address */
#define AHT20_ADDR 0x38

/* AHT20 Commands */
#define AHT20_CMD_INIT      0xBE
#define AHT20_CMD_TRIGGER   0xAC
#define AHT20_CMD_SOFT_RESET 0xBA

/* I2C Device */
#define I2C_NODE DT_NODELABEL(i2c0)

/* Data sampling interval (5 minutes in milliseconds) */
#define SAMPLE_INTERVAL_MS (5 * 60 * 1000)

/* I2C Device Structure */
static const struct device *i2c_dev;
static const struct device *uart_dev;

/**
 * Initialize AHT20 Sensor
 */
static int aht20_init(void)
{
    uint8_t init_cmd[3] = {AHT20_CMD_INIT, 0x08, 0x00};
    int ret;

    /* Wait for sensor to be ready */
    k_sleep(K_MSEC(40));

    /* Send initialization command */
    ret = i2c_write(i2c_dev, init_cmd, sizeof(init_cmd), AHT20_ADDR);
    if (ret < 0) {
        LOG_ERR("Failed to initialize AHT20: %d", ret);
        return ret;
    }

    k_sleep(K_MSEC(10));
    LOG_INF("AHT20 initialized successfully");

    return 0;
}

/**
 * Trigger measurement and read data from AHT20
 */
static int aht20_read_data(float *temperature, float *humidity)
{
    uint8_t trigger_cmd[3] = {AHT20_CMD_TRIGGER, 0x33, 0x00};
    uint8_t data[7];
    uint32_t raw_humidity, raw_temperature;
    int ret;

    /* Trigger measurement */
    ret = i2c_write(i2c_dev, trigger_cmd, sizeof(trigger_cmd), AHT20_ADDR);
    if (ret < 0) {
        LOG_ERR("Failed to trigger measurement: %d", ret);
        return ret;
    }

    /* Wait for measurement to complete (80ms typical) */
    k_sleep(K_MSEC(100));

    /* Read measurement data */
    ret = i2c_read(i2c_dev, data, sizeof(data), AHT20_ADDR);
    if (ret < 0) {
        LOG_ERR("Failed to read data: %d", ret);
        return ret;
    }

    /* Check if data is ready (bit 7 of status byte should be 0) */
    if (data[0] & 0x80) {
        LOG_WRN("Sensor busy, data not ready");
        return -EBUSY;
    }

    /* Parse humidity data (20 bits) */
    raw_humidity = ((uint32_t)data[1] << 12) |
                   ((uint32_t)data[2] << 4) |
                   ((uint32_t)data[3] >> 4);

    /* Parse temperature data (20 bits) */
    raw_temperature = (((uint32_t)data[3] & 0x0F) << 16) |
                      ((uint32_t)data[4] << 8) |
                      ((uint32_t)data[5]);

    /* Convert to actual values */
    *humidity = ((float)raw_humidity / 1048576.0f) * 100.0f;
    *temperature = (((float)raw_temperature / 1048576.0f) * 200.0f) - 50.0f;

    return 0;
}

/**
 * Send data to UART (USB Serial)
 */
static void send_data_uart(float temperature, float humidity)
{
    char buffer[64];
    int len;

    /* Format: TEMP:23.5,HUMIDITY:65.2\n */
    len = snprintf(buffer, sizeof(buffer),
                   "TEMP:%.2f,HUMIDITY:%.2f\n",
                   temperature, humidity);

    if (len > 0 && len < sizeof(buffer)) {
        for (int i = 0; i < len; i++) {
            uart_poll_out(uart_dev, buffer[i]);
        }

        LOG_INF("Sent: TEMP:%.2f, HUMIDITY:%.2f", temperature, humidity);
    }
}

/**
 * Main application entry point
 */
void main(void)
{
    float temperature, humidity;
    int ret;

    LOG_INF("ESP32-C3 AHT20 Sensor Application Starting...");

    /* Initialize USB Serial */
    uart_dev = DEVICE_DT_GET(DT_CHOSEN(zephyr_console));
    if (!device_is_ready(uart_dev)) {
        LOG_ERR("UART device not ready");
        return;
    }

#ifdef CONFIG_USB_DEVICE_STACK
    ret = usb_enable(NULL);
    if (ret != 0) {
        LOG_ERR("Failed to enable USB: %d", ret);
        return;
    }
    LOG_INF("USB Serial enabled");
    k_sleep(K_SECONDS(2)); /* Wait for USB enumeration */
#endif

    /* Initialize I2C */
    i2c_dev = DEVICE_DT_GET(I2C_NODE);
    if (!device_is_ready(i2c_dev)) {
        LOG_ERR("I2C device not ready");
        return;
    }
    LOG_INF("I2C device ready");

    /* Initialize AHT20 Sensor */
    ret = aht20_init();
    if (ret < 0) {
        LOG_ERR("Failed to initialize AHT20 sensor");
        return;
    }

    LOG_INF("System initialized. Starting measurements...");
    printk("ESP32-C3 AHT20 Sensor Ready\n");

    /* Main loop - read sensor every 5 minutes */
    while (1) {
        ret = aht20_read_data(&temperature, &humidity);

        if (ret == 0) {
            /* Send data via Serial */
            send_data_uart(temperature, humidity);
        } else {
            LOG_ERR("Failed to read sensor data: %d", ret);
            printk("ERROR: Failed to read sensor\n");
        }

        /* Wait 5 minutes before next reading */
        k_sleep(K_MSEC(SAMPLE_INTERVAL_MS));
    }
}
