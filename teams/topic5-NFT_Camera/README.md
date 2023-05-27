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
### 2.Increase swap space
Change CONF_SWAPSIZE in /etc/dphys-swapfile from 100 to 2024.
```
CONF_SWAPSIZE=2024
```
Check that the SWAP space has increased.
```
sudo /etc/init.d/dphys-swapfile restart
swapon -s
```
### 3.Touch Screen
Save /boot/config.txt.

```
cd /boot
sudo cp -p config.txt config.txt.bak

```
Download and unzip LCD_show_35hdmi.tar.gz.  
http://osoyoo.com/driver/LCD_show_35hdmi.tar.gz
```
cd $HOME
tar -xzvf LCD_show_35hdmi.tar.gz

```
Change screen resolution to 810x540.

```
cd LCD_show_35hdmi
sudo ./LCD35_810*540

```
Return /boot/config.txt to the original file and add the following at the end.
If you don't do this, the camera will not be recognized.

```
hdmi_force_hotplug=1
hdmi_drive=2
hdmi_group=2
hdmi_mode=87
hdmi_cvt 810 540 60 6 0 0 0 
dtoverlay=ads7846,cs=0,penirq=25,penirq_pull=2,speed=10000,keep_vref_on=0,swapxy=0,pmax=255,xohms=150,xmin=199,xmax=3999,ymin=199,ymax=3999 

```
Add the following to the end of /boot/config.txt to rotate the display 90 degrees.
```
display_hdmi_rotate=1

```
Add Option "TransformationMatrix" "0 1 0 -1 0 1 0 0 1" to /usr/share/X11/xorg.conf.d/40-libinput.conf as follows to rotate touch recognition by 90 degrees To do.
```
Section "InputClass"
        Identifier "libinput touchscreen catchall"
        MatchIsTouchscreen "on"
        Option "TransformationMatrix" "0 1 0 -1 0 1 0 0 1"
        MatchDevicePath "/dev/input/event*"
        Driver "libinput"
EndSection

```
Reboot the Raspberry Pi and check that the screen has been rotated 90 degrees.
Check that the touchscreen recognizes touches correctly.

### 5.Chromium

sudo apt install chromium

### 6.Metamask

### 7.ERC721 Minting Boilerplate

### 8.Software keyboard

###









## TEAM
This is my first time programming with blockchain.
I always want to make things that entertain people all over the world.






