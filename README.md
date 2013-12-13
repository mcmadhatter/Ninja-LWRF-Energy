Ninja-LWRF-Energy
=================

A Ninjablock driver to interface with the Lightwave RF Energy Monitor, via UDP packets to the JSJS Designs WiFi link.

The driver can be configured via the ninjablock drivers menu, the first time you use your ninja block with the wifi link, it will be necessary to register the ninja on the wifilink box. See installation and configurations instructions below.


Currently only the following features are supported,
* Power sockets
* On/Off light switches
* The energy monitor



# Installation

First you need to ssh into your NinjaBlock. From the same network do:

```
ssh ubuntu@ninjablock.local
```
The default password is `temppwd`

Once logged in enter the following commands:
```
cd /opt/ninja/drivers
git clone https://github.com/mcmadhatter/Ninja-LWRF-Energy.git
cd Ninja-LWRF-Energy
npm install
sudo service ninjablock restart
```
If you want to look for errors you might want to check out the log file:

```
tail -f /var/log/ninjablock.log
```
## Configure

Now that the NinjaBlock driver is installed you will need to configure your NinjaBlock to talk to your Lightwave RF Wifi Link.

1. Browse to:  https://a.ninja.is/home
2. Click drivers
3. Click the configure button next to Ninja-LWRF-Energy item.
4. Click `Register` in the window that opens.
5. On your Lightwave RF WiFi box click yes to add the device.



## Setup Devices

There are two ways to make your Lightwave RF devices visible in the NinjaBlock dashboard.

###1. Import from LightwaveRF Website

This will only work if you have setup your devices using LightwaveRF and have saved your settings to the LightwaveRF server.

  1. Browse to: https://a.ninja.is/home
  2. Click drivers
  3. Click the configure button next to Ninja-LWRF-Energy item.
  4. Enter your email address and PIN.
  5. Click `get existing config`.

###2. Edit the index.js file

Alternatively to register light switches/sockets currently requires editing index.js, to add another device cut and paste this

self.emit('register', new Device("Light", "R3D5"));

and change the R and D numbers to match the room and device on the LWRF Wifi Link box.


Todo
=======


* Add support for 433Mhz Lightwave RF devices without needing to use udp via the wifi box.
* Tidy up the code.
