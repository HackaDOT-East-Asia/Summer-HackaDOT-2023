![1920x1080](https://github.com/humancontroller/Summer-HackaDOT-2023/assets/131235865/f800ef65-029d-4288-ab05-e1b380cb9b2a)
# NFT CAMERA
This is a camera for creating NFT art collections.  

## DEMO


TOFUNFT



## WARNING
I didn't add a preview feature to NFT Camera.  
So shoot carefully.  
When you press the Mint button, a photo will be shot and the photo will be stored in IPFS at the same time.  
Next, when you touch Confirm on Metamask displayed on the touch panel, the NFT will be minted.  

## SOFTWARE
### 1.Equipment
Raspberry Pi 3 Model B  
Raspberry Pi Camera V2  
SanDisk microSD 32GB Extreme Pro U3 V30 A1  
OSOYOO Raspberry Pi Touch Screen 3.5"  
 
The NFT camera does not require 32GB of microSD capacity, but the faster the read/write speed, the better.  
Depending on the read/write speed of the microSD, the startup time of NFT Camera will change by a few minutes.

### 2.Raspberry Pi OS Installation 
Install Raspberry Pi OS (32-bit) on microSD using Raspberry Pi Imager on PC. 

Insert the microSD into the Raspberry Pi and boot.  
Add a user, set the password, configure and connect to the WiFi network.  

The version of the Linux OS when I installed it is as follows.  
```
$ lsb_release -a
No LSB modules are available.
Distributor ID:	Raspbian
Description:	Raspbian GNU/Linux 11 (bullseye)
Release:	11
Codename:	bullseye
$
$ uname -a
Linux raspberrypi 4.15.18-v7 #1 SMP Mon May 7 16:35:40 CST 2018 armv7l GNU/Linux
```

### 3.Enable Raspberry Pi Camera
```
$ sudo raspi-config
```
3 Inter face Options -> I1 Legacy Camera Enable/disable legacy camera support -> Yes -> OK -> Finish -> Yes -> Reboot  
Make sure the Raspberry Pi recognizes the camera.  
```
$ vcgencmd get_camera
supported=1 detected=1, libcamera interfaces=0
```

### 4.Increase Swap Space
Increase the swap space to prevent memory shortage.  
Check current swap space.  
```
$ swapon -s
```
Change CONF_SWAPSIZE in /etc/dphys-swapfile from 100 to 2048.  
```
CONF_SWAPSIZE=2048
```
Check that the swap space has increased.  
```
$ sudo /etc/init.d/dphys-swapfile restart
$ swapon -s
```

### 5.Touch Screen Settings
Use OSOYOO Raspberry Pi Touch Screen 3.5".  
Change screen resolution to 810x540.
When you run the shell to enable the touchscreen, the camera is not recognized.  
Therefore, save /boot/config.txt.  
```
$ cd /boot
$ sudo cp -p config.txt config.txt.bak
```
Download and unzip LCD_show_35hdmi.tar.gz.    
```
$ cd $HOME
$ curl -OL http://osoyoo.com/driver/LCD_show_35hdmi.tar.gz
$ tar -xzvf LCD_show_35hdmi.tar.gz
```
Change screen resolution to 810x540.  
```
$ cd LCD_show_35hdmi
$ sudo ./LCD35_810*540
```
Overwrite the saved config.txt to /boot/config.txt.
```
$ cd /boot
$ sudo cp -p config.txt.bak config.txt
```
Add the following lines to the end of /boot/config.txt.
```
hdmi_force_hotplug=1
hdmi_drive=2
hdmi_group=2
hdmi_mode=87
hdmi_cvt 810 540 60 6 0 0 0 
dtoverlay=ads7846,cs=0,penirq=25,penirq_pull=2,speed=10000,keep_vref_on=0,swapxy=0,pmax=255,xohms=150,xmin=199,xmax=3999,ymin=199,ymax=3999
```
Add the following line to the end of /boot/config.txt to rotate the display 90 degrees.  
```
display_hdmi_rotate=1
```
Add Option "TransformationMatrix" "0 1 0 -1 0 1 0 0 1" to /usr/share/X11/xorg.conf.d/40-libinput.conf as follows to rotate touch recognition by 90 degrees To do.  
```
        Identifier "libinput touchscreen catchall"
        MatchIsTouchscreen "on"
        Option "TransformationMatrix" "0 1 0 -1 0 1 0 0 1"
        MatchDevicePath "/dev/input/event*"
        Driver "libinput"
```
Reboot the Raspberry Pi and check that the screen has been rotated 90 degrees.  
Check that the touchscreen recognizes touches correctly.  

### 6.Software Keyboard Installation
Software keyboard is used for Metamask password input.  
```
$ sudo apt-get install matchbox-keyboard
Y
$ sudo apt-get install ttf-kochi-gothic xfonts-intl-japanese xfonts-intl-japanese-big xfonts-kaname
Y
$ sudo reboot
```
Replace /usr/share/matchbox-keyboard/keyboard.xml with keyboard.xml from this repository.  


キーボードの下にmetamaskが行く問題は？
Add the Software keyboard to the top panel.
ここにkeyboardの写真入れよう。



### 7.Chromium Installation
```
$ sudo apt install chromium
Y
```

### 8.Metamask
Add Metamask to Chromium and create a wallet.  






### 9.Bunzz official ERC721 Minting Boilerplate　　

https://github.com/lastrust/erc721-minting-boilerplate　
Choose a blockchain to mint NFTs when installing this boilerplate.  
I chose Astar Network.  
Keep some blockchain tokens of your choice in your wallet for the GAS fee.

### 10.NFT Camera Software



上部パネルの編集



## HARDWARE
### MATERIALS
Micro USB / USB Type-A Flat Cable 150mm PG-MUC01M07 (1)  
USB Female Type-A Connector (1)  
Anker Power Core 10000 PD Redux (1)  

Lauwan Board 600x230mm 5.5mm thick (1)  
Vinyl Sheet 600x230mm 0.1mm thick (2)
Machine Screw M2x4 (4)  
Machine Screw M2x6 (2)  
Machine Screw M2.6x6 (4)  
Self-tapping screw M3x6 (10)   

Adafruit Soft Tactile Button (2)  
TACT Switch SKHHLPA010 (1)  
Pin Socket 2x5 2.54mm Pitch (1)  
Universal Prototype Board 65x14mm 1.6mm thick  (1)
Universal Prototype Board 23.5x11mm 1.6mm thick  (1)
1mm 2Pin Flat Capper Cable 550mm  
0.3mm Polyurethane Copper Wire 100mm  

3D Printer ABS Filament  

熱収縮チューブ 
カプトンテープ　無くても良い 
マジックテープ

### TOOLS
3D Printer  
Laser cutter  
PCB Cutter  
Soldering Iron  
Plier  
Screwdriver  
Tweezer  
Hand Tap M2
Hand Tap M2.6
Glue or Double-sided tape
Black Fineliner Pen
### BUILD NFT CAMERA

## TEAM
This is my first work using blockchain.
I am a maker.
https://www.youtube.com/channel/UCnVPipXRWcSeEOvjLuMXxLA