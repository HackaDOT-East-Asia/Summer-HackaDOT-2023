import asyncio
import websockets
import RPi.GPIO as GPIO
import time
import io
from PIL import Image
import os

gpio_shoot = 26

GPIO.setmode(GPIO.BCM)

GPIO.setup(gpio_shoot, GPIO.IN, pull_up_down=GPIO.PUD_UP)

async def handler(websockets):

    print("Connected")

    send_flg = False

    while websockets.open:

        sw = GPIO.input(gpio_shoot)

        if 0==sw and send_flg==False:
            os.system("sh photo_shoot.sh")

            tmpimg = Image.open("./photo.jpg")
            with io.BytesIO() as output:
                tmpimg.save(output,format="JPEG")
                contents = output.getvalue()
                await websockets.send(contents)

            send_flg = True
            print("ON")
            await asyncio.sleep(1)

        elif send_flg==True:
            send_flg=False
            print("OFF")

        await asyncio.sleep(0.01)

    print("Disconnected")


async def main():
    async with websockets.serve(handler, "localhost", 8001):
        await asyncio.Future()  # run forever

asyncio.run(main())
