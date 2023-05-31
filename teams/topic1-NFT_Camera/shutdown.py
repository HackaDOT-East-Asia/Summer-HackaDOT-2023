import RPi.GPIO as GPIO
import time
import os

gpio_shutdown = 16

GPIO.setmode(GPIO.BCM)

GPIO.setup(gpio_shutdown, GPIO.IN, pull_up_down=GPIO.PUD_UP)

while True:

    sw = GPIO.input(gpio_shutdown)

    if 0==sw:
        os.system("sh shutdown.sh")

    time.sleep(0.01)
