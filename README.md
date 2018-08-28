[![Build Status](https://travis-ci.com/gcornetta/piwrapper.svg?branch=master)](https://travis-ci.com/gcornetta/piwrapper)
[![Known Vulnerabilities](https://snyk.io/test/github/gcornetta/piwrapper/badge.svg)](https://snyk.io/test/github/gcornetta/piwrapper)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

![NEWTON BANNER](/docs/images/newton.png)

# Fab Lab Modules: Machine Wrapper

This software is part of a larger suite of microservices designed to remotely manage digital fabrication equipment in a loosely coupled and distributed environment. More specifically, the software in this repo provides a software abstraction layer for 3D printers, laser cutters, vinyl cutters and desktop milling machines and exposes them over the internet as web services that can be consumed through REST APIs.

# About
This software has been developed by _Gianluca Cornetta_ and _Javier Mateos_ within **NEWTON** project. **NEWTON** is a large scale Integrated Action started in March 2016 and funded by the European Commission under the Horizon 2020 Researh and Innovation Programme with grant agreement n. 688503.

# Hardware Prerequisites
This software has been tested on a Raspberry Pi III Model B (amrv7 32-bit architecture) with a 8-GByte SD card. We strongly recommend using this Raspberry Pi model to avoid possible compilation errors of the GPIO module. You need at least 150 MBytes of free disk space to install the software.
You also need to connect to your Raspberry Pi a current sensor to monitor the connected machine. You can find sensor specifications [here](#specs).

# Software prerequisites
The Machine wrapper software requires that you previously install on your system the following software packages:

1. Mongo DB v3.x
2. Cups

We have not tested the software with Mongo DB latest version; however it should work without any problem if you update **mongoose** to the last version in the `package.json` file with the project dependencies.

# Installation
To install the Machine Wrapper module go through the following steps:

1. download or clone this repo,
2. run `npm install` in the installation folder,
3. run `npm run start` to start the server.

The server listen to **port 8888** of your Raspberry Pi. You have first to create the superuser for that machine and then log in to your system. At the first login a Wizard will guide you through the configuration process following three easy steps.

# Index

1. [Machine administration](#heading)
   * [The configuration menu](#sub-heading)
   * [The control panel menu](#sub-heading)
   * [The jobs menu](#sub-heading)
   * [The tools menu](#sub-heading)
2. [Documentation and developer support](#heading-1)
   * [Machine APIs](#sub-heading-1)
     + [On-line documentation](#sub-sub-heading-1)
3. [System architecture](#heading-2)
   * [Software architecture](#sub-heading-2)
   * [Hardware architecture](#sub-heading-2)
    
# specs
# Websites

# Contribution guidelines

# License
