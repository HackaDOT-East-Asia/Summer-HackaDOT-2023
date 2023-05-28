# NFT CAMERA
This is a camera for creating NFT art collections.  

## DEMO

## WARNING
I didn't add a preview feature to NFT Camera.  
So shoot carefully.  
When you press the Mint button, a photo will be shot and the photo will be stored in IPFS at the same time.  
Next, when you touch Confirm on Metamask displayed on the touch panel, the NFT will be minted.  

## SOFTWARE
### 1.Raspberry Pi OS
Install Raspberry Pi OS (32-bit) using Raspberry Pi Imager.  
### 2.Raspberry Pi Camera V2
Make sure the Raspberry Pi recognizes the camera.  
```
vcgencmd get_camera  
```
### 2.Increase Swap Space
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

```
cd $HOME
curl -OL http://osoyoo.com/driver/LCD_show_35hdmi.tar.gz
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
### 5.Software Keyboard
Software keyboard is used for Metamask password input.  
```
sudo apt-get install matchbox-keyboard
sudo apt-get install ttf-kochi-gothic xfonts-intl-japanese xfonts-intl-japanese-big xfonts-kaname

```
Replace /usr/share/matchbox-keyboard/keyboard.xml with keyboard.xml from this repository.  
Add the Software keyboard to the top panel.
### 6.Chromium
```
sudo apt install chromium
```
### 7.Metamask
Add Metamask to Chromium and create a wallet.  
### 8.Bunzz official ERC721 Minting Boilerplate　　
https://github.com/lastrust/erc721-minting-boilerplate　
Choose a blockchain to mint NFTs when installing this boilerplate.  
I chose Astar Network.  
Keep some blockchain tokens of your choice in your wallet for the GAS fee.
### 9.NFT Camera Software



## HARDWARE
### MATERIALS
Raspberry Pi 3 Model B (1)  
Raspberry Pi Camera V2 (1)  
16GB Class 10 UHS-I Micro SDHC Memory Card  
Micro USB / USB Type-A Flat Cable 150mm PG-MUC01M07  
USB Female Type-A Connector (1)  
Anker Power Core 10000 PD Redux (1)  
OSOYOO Raspberry Pi Touch Screen 3.5" (1)  

Lauwan Board 600x230mm 5.5mm thick (1)  
Vinyl Sheet 600x230mm 0.1mm thick (2)  

Adafruit Soft Tactile Button (2)  
TACT Switch SKHHLPA010 (1)  
Pin Socket 2x5 2.54mm Pitch (1)  

1mm 2Pin Flat Capper Cable 550mm  
0.3mm Polyurethane Copper Wire 100mm  

Universal Prototype Board 65x14mm 1.6mm thick  (1)
Universal Prototype Board 23.5x11mm 1.6mm thick  (1)


Machine Screw M2x4 (4)  
Machine Screw M2x6 (2)  
Machine Screw M2.6x6 (4)  
Self-tapping screw M3x6 (10) 
 
3D Printer ABS Filament  

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
### BUILD NFT CAMERA
1.  










## TEAM
This is my first work using blockchain.
I am a maker.
https://www.youtube.com/channel/UCnVPipXRWcSeEOvjLuMXxLA







