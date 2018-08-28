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
  This software has been developed by <em>Gianluca Cornetta</em> and <em>Javier Mateos</em> within <b>NEWTON</b> project. <b>NEWTON</b> is a large scale Integrated Action started in March 2016 and scheduled to end in summer 2019, funded by the European Commission under the Horizon 2020 Researh and Innovation Programme with grant agreement n. 688503.
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
You also need to connect to your Raspberry Pi a current sensor to monitor the connected machine. You can find sensor specifications <a href="#hardware-architecture">here</a>.
</p>

<a name="software-prerequisites"></a>
## Software prerequisites
<p align="justify">
The Machine wrapper software requires that you previously install on your system the following software packages:
</p>

1. Mongo DB v3.x
2. Cups

<p align="justify">
We have not tested the software with Mongo DB latest version; however it should work without any problem if you update <b>mongoose</b> to the last version in the `package.json` file with the project dependencies.
</p>

<a name="installation"></a>
## Installation
To install the Machine Wrapper module go through the following steps:

1. download or clone this repo,
2. run `npm install` in the installation folder,
3. run `npm run start` to start the server.

<p align="justify">
  The server listen to <b>port 8888</b> of your Raspberry Pi. You have first to create the superuser for that machine and then log in to your system. At the first login a Wizard will guide you through the configuration process following three easy steps.
</p>

<a name="system-architecture"></a>
# System architecture
<p align="justify">
The <b>NEWTON</b> Fab Lab software aims at empowering the traditional Fab Lab infrastructure by providing a software abstraction layer that enables inter- and intra-Fab Lab communication and state synchronization through a centralized cloud hub. This, in turn allows:
</p>

1. exposing remote digital fabrication machines (3D printers, laser cutters,...) as REST web services
2. controlling and monitoring remote machine trough web interfaces or programmatically through APIs
3. automatic service discovery and fabrication batch routing based on geographic proximity 

<p align="justify">
A <b>NEWTON</b> Fab Lab (see Fig. 1) is implemented as a two-level architecture that can be accessed through a Fab Lab Gateway (that we also call the Pi-Gateway). The Gateway task is forwarding the incoming fabrication requests to one the networked digital fabrication machines. Each networked machine can be accessed through a hardware/software <b>machine wrapper</b> (that we also call the Pi-Wrapper).
</p>

<figure>
  <p align="center">
    <img src="/docs/images/fablab-architecture.png" alt="NEWTON FAB LAB ARCHITECTURE"/>
    <figcaption>Fig. 1 - Newton Fab Lab Simplified Architecture.</figcaption>
  </p>
</figure>

<p align="justify">
The following subsections are dedicated to describe in detail the hardware and software architecture of a <b>NEWTON</b> Fab Lab that has been developed during the development, staging and production phases of the project.
</p>

<a name="software-architecture"></a>
## Software architecture
The software architecture is modular and distributed over five layers as depicted in Fig. 2.

<figure>
  <p align="center">
    <img src="/docs/images/machine-wrapper.png" alt="MACHINE WRAPPER SOFTWARE ARCHITECTURE"/>
    <figcaption>Fig. 2 - Machine Wrapper Software Architecture.</figcaption>
  </p>
</figure>

<p align="justify">
The <b>Communication Layer</b> implements the HTTP server and the APIs interface to manage and schedule fabrication batches. The <b>Presentation Layer</b> implements the user interfaces to set up and manage a connected fabrication machine. An MVC (Model View Controller) programming paradigm is used at this stage; namely, a route in the browser triggers a controller function that dynamically generates and renders an HTML view using the data stored in the persistence layer (i.e. data base). The <b>Application Layer</b> implements the business logic. The business logic and the user interface rely on the middleware functions implemented in the <b>Middleware Layer</b>. More specifically, the middleware includes custom and third-party methods to manage security and authentication, machine to machine communications and interfacing, HTML views rendering, system logging, data base connection and access and ADC (Analog to Digital Converter) drivers. Open API 2.0 (formerly known as Swagger) support is integrated in the application middleware, this makes the Machine Wrapper a very developer-friendly software since APIs and data models documentation is embedded into the application, in addition a developer can test the API using the Swagger User Interface that is also embedded in the Machine Wrapper.  Swagger Machine Wrapper API specifications (written in YAML) are available in the software root directory. Finally, the <b>Data Layer</b> is used to store session information as well as <em>User</em> and <em>Machine</em> data models. We use a NoSQL model and MongoDB as the data store.
</p>

<a name="hardware-architecture"></a>
## Harware architecture
<p align="justify">
The lack of network connectivity of a digital fabrication machine requires a hardware/software wrapper to overcome this limitation. The wrapper can be implemented using an inexpensive Raspberry Pi embedded computer connected to a machine through its USB port. Digital fabrication machines must operate in a networked real-time environment that must promptly react to any change of machine status. This, in turn, implies that we need somehow to retrieve status information from the machine (i.e., off, busy, idle). Unfortunately, most of the available fabrication machines have proprietary hardware specifications which impede the development of this functionality. However, it is possible to infer the machine status using a very simple workaround that requires the use of a CT (continuous Transformer) sensor and an ADC connected to the Raspberry Pi GPIO that samples the CT sensor at regular time intervals in order to infer the machine status from current drawn by the power supply. 
</p>

<p align="justify">
Fig. 3 depicts the fabrication machine set-up and interfacing with both Pi-Wrapper and sensing and signal-conditioning circuits.
</p>

<figure>
  <p align="center">
    <img src="/docs/images/machine-interfacing.png" alt="MACHINE INTERFACING"/>
    <figcaption>Fig. 3 - Fabrication Machine Interfacing.</figcaption>
  </p>
</figure>

The proposed configuration is formed by the following components:

1.	A Raspberry Pi III embedded computer (i.e., the Pi-Wrapper);
2.	A split core current transformer sensor (ECS 1030-L72);
3.	A conditioning circuit to convert the measured current into an input voltage for the Analog to Digital Converter (ADC);
4.	A Ti ADS 1x15 Analog to Digital Converter.

<p align="justify">
  The ADS 1x15 has an embedded Programmable Gain Amplifier (PGA) and an I<sup>2</sup>C (Inter Integrated Circuit) bus that can be connected to the GPIO (General Purpose Input/Output) port of the Raspberry Pi. Software support is provided by the Pi-Wrapper middleware layer in which software drivers for the Raspberry Pi I2C pins and the Ti ADS 1x15 are implemented. Supported devices are ADS 1015 and ADS 1115 that are respectively a 12-bit and a 16-bit analog to digital converters; however, the I<sup>2</sup>C compliance allow seamless operation with converters from other vendors provided a new device driver is added to the Pi-Wrapper drivers’ library. 
</p>

<figure>
  <p align="center">
    <img src="/docs/images/sensor-interfacing.png" alt="SENSOR INTERFACING"/>
    <figcaption>Fig. 4 - Machine Wrapper-Sensor Interfacing.</figcaption>
  </p>
</figure>

<p align="justify">
Fig. 4 depicts ADC interfacing with Raspberry Pi GPIO and sensor with signal conditioning circuit. The resistance and capacity values are reported in Table 1. Resistance R_BURDEN converts the sensor output current into a voltage, whereas resistors R<sub>1</sub> and R<sub>2</sub> add a DC offset to the output signal. Finally, capacitor C<sub>1</sub> is used to stabilize the DC offset added to the signal. 
</p>

<table>
  <tr>
    <th>Component</th>
    <th>Value</th>
  </tr>
  <tr>
    <td>R_BURDEN</td>
    <td>120</td>
  </tr>
  <tr>
    <td>R1</td>
    <td>10</td>
  </tr>
  <tr>
    <td>R2</td>
    <td>10</td>
  </tr>
  <tr>
    <td>C1</td>
    <td>47</td>
  </tr>
</table>


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

# Websites

# Contribution guidelines

# License
