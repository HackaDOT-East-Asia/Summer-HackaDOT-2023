import RPi.GPIO as GPIO		# RPi.GPIOモジュールを使用
import time
import os

gpio_shutdown = 16	# GNDに接続でシャットダウン

# GPIO番号指定の準備
GPIO.setmode(GPIO.BCM)	# GPIO○○でGPIO番号指定するモード
			# ピン番号で指定する場合はGPIO.BOARD

# GPIOを入力、プルアップに設定
GPIO.setup(gpio_shutdown, GPIO.IN, pull_up_down=GPIO.PUD_UP)

while True:

    # シャットダウン
    sw = GPIO.input(gpio_shutdown)

    if 0==sw:
        os.system("sh shutdown.sh")

    time.sleep(0.01)	# 10ミリ秒待機
