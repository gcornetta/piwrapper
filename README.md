[![Build Status](https://travis-ci.com/gcornetta/piwrapper.svg?branch=master)](https://travis-ci.com/gcornetta/piwrapper)
[![Known Vulnerabilities](https://snyk.io/test/github/gcornetta/piwrapper/badge.svg)](https://snyk.io/test/github/gcornetta/piwrapper)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

![NEWTON BANNER](/docs/images/newton.png)

# Fab Lab Modules: Machine Wrapper
<p align="justify">
This software is part of a larger suite of microservices designed to remotely manage digital fabrication equipment in a loosely coupled and distributed environment. More specifically, the software in this repo provides a software abstraction layer for 3D printers, laser cutters, vinyl cutters and desktop milling machines and exposes them over the internet as web services that can be consumed through REST APIs.
</p>

# About
<p align="justify">
This software has been developed by _Gianluca Cornetta_ and _Javier Mateos_ within **NEWTON** project. **NEWTON** is a large scale Integrated Action started in March 2016 and funded by the European Commission under the Horizon 2020 Researh and Innovation Programme with grant agreement n. 688503.
</p>

# Table of contents

1. [Preliminary steps](#preliminary-steps)
   * [Hardware prerequisites](#hardware-prerequisites)
   * [Software prerequisites](#software-prerequisites)
   * [Installation](#installation)
2. [System architecture](#system-architecture)
   * [Software architecture](#software-architecture)
   * [Hardware architecture](#hardware-architecture)
3. [Machine administration](#machine-administration)
   * [The configuration menu](#the-configuration-menu)
   * [The control panel menu](#the-control-panel)
   * [The jobs menu](#the-jobs-menu)
   * [The tools menu](#the-tools-menu)
4. [Documentation and developer support](#documentation-and-developer-support)
   * [Machine APIs](#machine-apis)
     + [On-line documentation](#on-line-documentation)

<a name="preliminary-steps"></a>
# Preliminary steps
<p align="justify">
Before installing the software you have to make sure that you comply with the hardware and software requirements specified in the next two sections.
</p>

<a name="hardware-prerequisites"></a>
## Hardware prerequisites
<p align="justify">
This software has been tested on a Raspberry Pi III Model B (amrv7 32-bit architecture) with a 8-GByte SD card. We strongly recommend using this Raspberry Pi model to avoid possible compilation errors of the GPIO module. You need at least 150 MBytes of free disk space to install the software.
You also need to connect to your Raspberry Pi a current sensor to monitor the connected machine. You can find sensor specifications [here](#specs).
</p>

<a name="software-prerequisites"></a>
## Software prerequisites
<p align="justify">
The Machine wrapper software requires that you previously install on your system the following software packages:
</p>

1. Mongo DB v3.x
2. Cups

<p align="justify">
We have not tested the software with Mongo DB latest version; however it should work without any problem if you update **mongoose** to the last version in the `package.json` file with the project dependencies.
</p>

<a name="installation"></a>
## Installation
To install the Machine Wrapper module go through the following steps:

1. download or clone this repo,
2. run `npm install` in the installation folder,
3. run `npm run start` to start the server.

<p align="justify">
The server listen to **port 8888** of your Raspberry Pi. You have first to create the superuser for that machine and then log in to your system. At the first login a Wizard will guide you through the configuration process following three easy steps.
</p>

<a name="system-architecture"></a>
# System architecture
<p align="justify">
The **NEWTON** Fab Lab software aims at empowering the traditional Fab Lab infrastructure by providing a software abstraction layer that enables inter- and intra-Fab Lab communication and state synchronization through a centralized cloud hub. This, in turn allows:
</p>

1. exposing remote digital fabrication machines (3D printers, laser cutters,...) as REST web services
2. controlling and monitoring remote machine trough web interfaces or programmatically through APIs
3. automatic service discovery and fabrication batch routing based on geographic proximity 

<p align="justify">
A **NEWTON** Fab Lab (see Fig. 1) is implemented as a two-level architecture that can be accessed through a Fab Lab Gateway (that we also call the Pi-Gateway). The Gateway task is forwarding the incoming fabrication requests to one the networked digital fabrication machines. Each networked machine can be accessed through a hardware/software **machine wrapper** (that we also call the Pi-Wrapper).
</p>

<figure>
  <p align="center">
    <img src="/docs/images/fablab-architecture.png" alt="NEWTON FAB LAB ARCHITECTURE"/>
    <figcaption>Fig. 1 - Newton Fab Lab Simplified Architecture.</figcaption>
  </p>
</figure>

<p align="justify">
The following subsections are dedicated to describe in detail the hardware and software architecture of a **NEWTON** Fab Lab that has been developed during the development, staging and production phases of the project.
</p>

<a name="software-architecture"></a>
## Software architecture

<a name="hardware-architecture"></a>
## Harware architecture

<a name="machine-administration"></a>
# Machine administration

<a name="the-configuration-menu"></a>
## The configuration menu

<a name="the-control-panel-menu"></a>
## The control panel menu

<a name="the-jobs-menu"></a>
## The jobs menu

<a name="the-tools-menu"></a>
## The tools menu

<a name="documentation-and-developer-support"></a>
# Documentation and developer support

<a name="machine-apis"></a>
## Machine APIs

<a name="on-line-documentation"></a>
### On-line documentation

# specs
# Websites

# Contribution guidelines

# License
