# NFT CAMERA
## HARDWARE
### MATERIALS
Raspberry Pi 3 Model B (1)  
Raspberry Pi Camera V2 (1)  
Anker Power Core 10000 PD Redux (1)  
Adafruit Soft Tactile Button (2)  
TACT Switch SKHHLPA010 (1)  
Machine Screw M2x4 (4)  
Machine Screw M2.6x6 (4)  
Self-tapping screw M3x6 (10) 
Lauwan board 600x300mm 5.5mm thick (1)  
Polyurethane Wire  
Universal Prototype Board 1.6mm thick  
Toshiba Exceria 16GB Class 10 UHS-I Micro SDHC Memory Card  
OSOYOO Raspberry Pi Touch Screen 3.5"
### TOOLS
3D Printer  
Laser cutter  
PCB Cutter  
Soldering Iron  
Plier  
Screwdriver  
Tweezer  
### BUILD YOUR NFT CAMERA
1.  
## SOFTWARE
### 1.Raspberry Pi OS
Install Raspberry Pi OS (32-bit) using Raspberry Pi Imager.  
### 2.Raspberry Pi Camera V2
Make sure the Raspberry Pi recognizes the camera.  
```
vcgencmd get_camera  
```

### 3.Touch Screen
Download and unzip LCD_show_35hdmi.tar.gz.
http://osoyoo.com/driver/LCD_show_35hdmi.tar.gz

cd
cd Desktop
mv LCD_show_35hdmi.tar.gz ../
cd
sudo chmod 777 LCD_show_35hdni.tar.gz
tar -xzvf LCD_show_35hdmi.tar.gz
cd LCD_show_35hdmi
sudo apt-get update

まとめると
./LCD35_720*480実行後に実行前のconfig.txtに戻して、その末尾に./LCD35_720*480実行後のconfig.txtで追記された行を追加する。
そしてsudo raspi-configでLegacy Cameraをenableにして再起動。
これでLegacy Cameraも使えてタッチスクリーンも映るようになった。

/boot/config.txtの末尾に
display_hdmi_rotate=1
を追記して再起動。
画面が右へ90度回転して表示された。

以下を実行してタッチを縦表示に対応させる
cd /usr/share/X11/xorg.conf.d
sudo cp -p 40-libinput.conf 40-libinput.conf.230505
sudo vi 40-libinput.conf
  MatchIsTouchscreen "on"の下に以下行を追加
  Option "TransformationMatrix" "0 1 0 -1 0 1 0 0 1"
再起動。
タッチ位置とカーソル位置が合った。

### 4.Increase swap space
swapon -s
102396 -> 現在102Mbyte

/etc/dphys-swapfileの CONF_SWAPSIZE=100 を CONF_SWAPSIZE=2024に変更。
sudo /etc/init.d/dphys-swapfile restart
swapon -s
2072572 -> スワップが2072Mbyteに変更された。

### 5.Chromium

sudo apt install chromium

### 6.Metamask

### 7.ERC721 Minting Boilerplate

### 8.Software keyboard

###









## TEAM
This is my first time programming with blockchain.
I always want to make things that entertain people all over the world.






