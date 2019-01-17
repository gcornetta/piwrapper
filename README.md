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
  This software has been developed by <em>Gianluca Cornetta</em> and <em>Javier Mateos</em> within <b>NEWTON</b> project. <b>NEWTON</b> is a large scale Integrated Action, started in March 2016 and scheduled to end in summer 2019, funded by the European Commission under the Horizon 2020 Researh and Innovation Programme with grant agreement n. 688503.
</p>

# Table of contents

1. [Preliminary steps](#preliminary-steps)
   * [Hardware prerequisites](#hardware-prerequisites)
   * [Software prerequisites](#software-prerequisites)
   * [Installation](#installation)
   * [Testing](#testing)
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
     + [Versioning](#versioning)
     + [Supported formats](#supported-formats)
     + [Error management](#error-management)
     + [On-line documentation](#on-line-documentation)
     + [APIs responses](#api-responses)
5. [Websites](#websites)
6. [Contribution guidelines](#contribution-guidelines)
7. [License](#license)

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

1. Node.js v6.x
2. npm v3.10.x
3. Mongo DB v3.x
4. Cups

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

<a name="testing"></a>
## Testing
<p align="justify">
To run the unit test type <code>npm run test</code> in the project root folder. To run end-to-end tests (with selenium) type <code>npm run test-selenium</code>. Please, recall that in order to run tests with selenium you need to install on your test server a browser driver. We recommend using Google Chrome with <a href="https://sites.google.com/a/chromium.org/chromedriver/">Chromedriver</a>
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
## Hardware architecture
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
  <caption>Table 1: Component Values</caption>
  <tr>
    <th>Component</th>
    <th>Value</th>
  </tr>
  <tr>
    <td>R_BURDEN</td>
    <td>120&Omega;</td>
  </tr>
  <tr>
    <td>R<sub>1</sub></td>
    <td>10K&Omega;</td>
  </tr>
  <tr>
    <td>R<sub>2</sub></td>
    <td>10K&Omega;</td>
  </tr>
  <tr>
    <td>C<sub>1</sub></td>
    <td>47&mu;F</td>
  </tr>
</table>

<a name="machine-administration"></a>
# Machine administration
<p align="justify">
Each machine in a Fab Lab is wrapped by hardware/software interface that we have called Pi-Wrapper. The Pi-Wrapper is formed by two major software components:

1.	A specialized machine-to-machine (M2M) communication middleware that allows seamless interaction with the Fab Lab gateway.
2.	An administration interface that allows setting up and configuring a machine as well as monitoring its status.

This interface runs as a service on the <b>port 8888</b> of each Raspberry Pi connected to a digital fabrication machine of the Fab Lab. For security reasons the user interface can be accessed only from inside the Fab Lab or the other sites where the Fab Lab network is propagated. By default each Raspberry Pi runs a simple DNS service (<em>Bonjour</em>) configured to resolve the <b>.local</b> domain; thus, each interface can be accessed through a URL like:
</p>

<p align="center">
  <code>
    http://wrapper_name.local:8888
  </code>
</p>

The wrapper name must be configured in the `/etc/hosts` file as follows:

```
127.0.0.1       localhost
::1             localhost ip6-localhost ip6-loopback
ff02::1         ip6-allnodes
ff02::2         ip6-allrouters

127.0.1.1       piwrapper
```

<p align="justify">
In the configuration above, we have called the wrapper machine <em>piwrapper</em>. Once the Fab Lab network has been configured, the machine web interface can be accessed through the URL assigned to the Pi-Wrapper.
</p>

When a user connects to a given machine, he/she is redirected to the interface landing page shown in Fig. 5.

<figure>
  <p align="center">
    <img src="/docs/images/landing-page.png" alt="LANDING PAGE"/>
    <figcaption>Fig. 5 - The Fab Lab Administration Interface Landing Page.</figcaption>
  </p>
</figure>

<p align="justify">
The user can use the form of the landing page to create an administration account for the Pi-Wrapper software. Only one administrator is allowed; thus, if one tries to create another account a warning message will be generated by the System. The machine administrator can go to the login page using the button at the top right of the screen. Fig. 6 depict the interface login page.
</p>

<figure>
  <p align="center">
    <img src="/docs/images/login-page.png" alt="LOGIN PAGE"/>
    <figcaption>Fig. 6 - The Fab Lab Administration Login Page.</figcaption>
  </p>
</figure>

Once the user has been logged in he/she is redirected to the dashboard panel (see Fig. 7).

<figure>
  <p align="center">
    <img src="/docs/images/dashboard-panel.png" alt="DASHBOARD PAGE"/>
    <figcaption>Fig. 7 - The Fab Lab Administration Dashboard Page.</figcaption>
  </p>
</figure>

The dashboard is formed by:

- A fully featured VT100 terminal that supports all the BASH commands. The VT100 terminal allows full control of the underlying hardware and the possibility to interact with the machine and the operating system from the web interface.
- A graphic CPU monitor that reports in real-time the load of all the cores of the CPU.
- A panel with system information.

<p align="justify">
The user can use the sidebar menu on the left side of the dashboard to navigate among the different features of the user interface. The interface allows the user to:
</p>

- Configure the machine and the user profile using the Configuration Menu located just below the Fab Lab administrator profile photo.
- Control a machine and submit a fabrication batch using the Control Panel Menu.
-	Control the jobs queued in the machine using the Jobs Menu.
-	Monitor machine using the Tools Menu.

<a name="the-configuration-menu"></a>
## The configuration menu

<p align="justify">
The configuration menu can be accessed using the dropdown located just below the administrator profile photo. Using this menu, one can either configure the administrator profile or configure low-level features of the machine hardware wrapper.

Fig. 8 shows the configuration panel to edit the administrator profile. One can set the administrator’s contact details, upload a new profile photo or change the login password.
</p>

<figure>
  <p align="center">
    <img src="/docs/images/configuration-panel.png" alt="CONFIGURATION PANEL"/>
    <figcaption>Fig. 8 - The Configuration Panel.</figcaption>
  </p>
</figure>

Fig. 9 depicts the configuration panel to edit the machine settings.

<figure>
  <p align="center">
    <img src="/docs/images/configuration-panel-settings.png" alt="CONFIGURATION PANEL SETTINGS"/>
    <figcaption>Fig. 9 - Machine Settings Configuration.</figcaption>
  </p>
</figure>

<p align="justify">
This configuration panel offers the Fab Lab administrator the possibility to assign a logical name to a machine, define machine type and vendor in order to configure the correct drivers, and set up the Analog to Digital Converter (ADC) used to sample and convert in digital format the current drawn by the machine to infer its status. 
  Observe that the administrator must define a <b>Threshold current</b> used by the software to decide whether a machine is idle or not. Also observe that the current measured by CT sensor is oversampled by the ADC. The oversampling ratio is defined through two parameters: the <b>Sample time</b> and the <b>Duty cycle</b>  (expressed as a percentage of the period of mains supply current). The number of samples is automatically matched to the closest sample rate supported by the ADC device and then averaged. In other words, we have implemented a simple software-defined sliding window digital low-pass filter that rejects high-frequency noise in the AC supply current and improves the measured current accuracy.
Also, note that digital fabrication machine connected to the Pi-Wrapper interface is treated as a standard USB printer. Thus the supported formats (<b>.png</b> images for CNC milling machines, vinyl cutters and laser cutters; <b>.gcode</b> for 3D printers) are sent to the machine as raw data  over a serial port emulator on USB. The connected device is autodiscovered by the software that displays the device URI in the interface. The user has the possibility to restart the discovery process using the <b>refresh</b> button or to set up a custom baud rate for the interface.
The Pi-Wrapper software has a hybrid interface that allows connecting to a digital fabrication machine either through the web interface or through APIs. APIs default parameters can be configured through the machine settings configuration interface as depicted in Fig. 10.
</p>

<figure>
  <p align="center">
    <img src="/docs/images/api-parameters-configuration.png" alt="API CONFIGURATION"/>
    <figcaption>Fig. 10 - Machine APIs Configuration.</figcaption>
  </p>
</figure>

<p align="justify">
The API parameters dropdown window is machine-dependent and is automatically generated by the software interface once the machine has been specified and set-up by the administrator.
</p>

Finally, Fig. 11 depicts the Pi-Wrapper output log relative to the machine discovery process. 

<figure>
  <p align="center">
    <img src="/docs/images/service-discovery.png" alt="SERVICE DISCOVERY"/>
    <figcaption>Fig. 11 - Pi-Wrapper Machine Discovery Process.</figcaption>
  </p>
</figure>

<p align="justify">
First, the MongoDB database instance is deployed, and the connection is carried out, after that the Pi-Wrapper starts the peer discovery process, namely, it looks for an active Fab Lab Gateway. When the gateway is discovered a websocket channel with the peer is established. Finally, the device discovery process starts. In this phase, the Pi-Wrapper looks for a machine connected to it. In the case of Fig. 11, a vinyl cutter is discovered, and a unique connection id code is assigned to the machine.
</p>

<a name="the-control-panel-menu"></a>
## The control panel menu
<p align="justify">
The Control panel allows configuring a machine and dispatching a fabrication job to it. Fig. 12 depicts a possible configuration of the machine control panel.
</p>

<figure>
  <p align="center">
    <img src="/docs/images/machine-control-panel.png" alt="MACHINE CONTROL PANEL"/>
    <figcaption>Fig. 12 - The Machine Control Panel.</figcaption>
  </p>
</figure>

<p align="justify">
The control panel allows configuring the basic machine parameters, set up the head position, selecting the material for fabrication, the machine model type etc. The structure of the control panel depends on the machine type and the interface is dynamically built after the software has been configured to work with a given machine.
</p>

<a name="the-jobs-menu"></a>
## The jobs menu

<p align="justify">
Once a fabrication batch has been submitted to a Fab Lab and routed by the Fab Lab Gateway to an available machine, the job is stored in the Pi-Wrapper queue system described. This design choice is fundamentally motivated by two reasons:
</p>

1.	Implement a job scheduling system that allows a fair sharing of the underlying fabrication resources.
2.	Implement a basic security policy to protect the machine from potentially harmful designs that could damage it.

<p align="justify">
Once a fabrication batch has been queued, it must be verified and approved by the Fab Lab administrator before being sent to the machine for fabrication. The queued job can be monitored and controlled using the <b>Jobs Menu</b> depicted in Fig. 13.

When a job is submitted, it is assigned a <em>pending</em> status and no priority until it is approved by the Fab Lab administrator.
</p>

<figure>
  <p align="center">
    <img src="/docs/images/jobs-control-panel.png" alt="JOBS CONTROL PANEL"/>
    <figcaption>Fig. 13 - The Jobs Control Panel.</figcaption>
  </p>
</figure>

<a name="the-tools-menu"></a>
## The tools menu

<p align="justify">
The Pi-Wrapper user interface also allows the possibility to monitor in real time the machine status as well as system operation. These options are available in the <b>Tools Menu</b>. In this menu, one can select to display on the web interface the system logs (provided the system logger has been configured in debug mode) or to monitor the current drawn by the machine and the device status.
</p>

<figure>
  <p align="center">
    <img src="/docs/images/machine-status-panel.png" alt="MACHINE STATUS PANEL"/>
    <figcaption>Fig. 14 - The Machine Status Panel.</figcaption>
  </p>
</figure>

<p align="justify">
  As mentioned before, the status (either <em>off</em>, <em>idle</em>, or <em>busy</em>) is inferred by the current drawn by the machine. Fig. 14 shows the Machine Status Panel. In the panel, a real-time plot of the measured current as well as the machine status are displayed. The machine APIs are also checked performing a GET request at the URL reserved to the device connected to the Pi-Wrapper as shown in Fig. 15.
</p>

<figure>
  <p align="center">
    <img src="/docs/images/apis-monitoring.png" alt="APIS MONITORING"/>
    <figcaption>Fig. 15 - The API Monitoring Panel.</figcaption>
  </p>
</figure>

<a name="documentation-and-developer-support"></a>
# Documentation and developer support

<p align="justify">
The Fab Lab software infrastructure has been designed with the developer in mind. For this reason, Swagger has been integrated into the Pi-Gateway and the Pi-Wrapper middleware. This allow the developer to have on-line access to the API documentation and to test the native APIs through the Swagger User interface (Swagger UI).  In addition, the API-first approach used to the develop the Fab Lab software allows to easily expand the software, the protocol stack and add new features adding new layers on top of the native APIs without the need of modifying the core software architecture.
</p>

<a name="machine-apis"></a>
## Machine APIs
<p align="justify">
Machine wrapper APIs expose methods to add, remove and modify jobs in a machine. These methods can be only accessed from the Fab Lab Gateway (i.e. the Pi-Gateway).
  
Table 2 displays the resource URI and the implemented HTTP verbs for the Machine Wrapper (i.e. the Pi-Wrapper) APIs. 
</p>

<table>
  <caption>Table 2: MAchine Wrapper APIs</caption>
  <tr>
    <th>Resource</th>
    <th>GET</th>
    <th>POST</th>
    <th>PUT</th>
    <th>DELETE</th>
  </tr>
  <tr>
    <td>/api/login</td>
    <td>Error 400 <br>(<span style="font-weight:bold">Bad Request</span>)</td>
    <td>Returns a JWT <br>if login is correct; <br>otherwise displays<br>an error<br>(<span style="font-weight:bold">401 Unauthorized</span>)</td>
    <td>Error 400 <br>(<span style="font-weight:bold">Bad Request</span>)</td>
    <td>Error 400<br>(<span style="font-weight:bold">Bad Request</span>)</td>
  </tr>
  <tr>
    <td>/api/jobs</td>
    <td>Returns an array <br>with all the jobs</td>
    <td>Submit a job <br>for fabrication</td>
    <td>Error 400 <br>(<span style="font-weight:bold">Bad Request</span>)</td>
    <td>Error 400<br>(<span style="font-weight:bold">Bad Request</span>)</td>
  </tr>
  <tr>
    <td>/api/jobs/1234</td>
    <td>Show the status <br>of the job with <br>id=1234</td>
    <td>Error 400<br>(<span style="font-weight:bold">Bad Request</span>)</td>
    <td>Updates the status <br>of the job with <br>id=1234</td>
    <td>Deletes a job if it exists; <br>otherwise displays <br>an error <br>(<span style="font-weight:bold">404 Not found</span>)</td>
  </tr>
  <tr>
    <td>/api/jobs?user=123&amp;machine=laser%20cutter<br>&amp;process=cut&amp;material=wood</td>
    <td>Error 400 <br>(<span style="font-weight:bold">Bad Request</span>)</td>
    <td>Submit a job <br>to the Machine</td>
    <td>Error 400 <br>(<span style="font-weight:bold">Bad Request</span>)</td>
    <td>Error 400<br>(<span style="font-weight:bold">Bad Request</span>)</td>
  </tr>
</table>

<a name="versioning"></a>
### Versioning

API versioning is not mandatory for machine wrapper APIs.

<a name="supported-formats"></a>
### Supported formats
Machine wrapper APIs exclusively support JSON format.

<a name="error-management"></a>
### Error management

The API error codes will match HTTP codes. The following cases are managed:

1.	Everything worked (success): **200–OK**.
2.	The application did something wrong (client error): **400–Bad Request**. 
3.	The API did something wrong (server error): **500–Internal Server Error**.

<p align="justifyr">
In the case of client and server error, the server will return in the response a JSON object with error details and hints to correct it. The message has the following format:
</p>

<p align="center">
  <code>
    {code: the error code, message: the error message, details: the error details}
  </code>
</p>

Table 3 reports error codes and details.

<table>
  <caption>Table 3: Machine Wrapper Error Codes</caption>
  <tr>
    <th>Error Code</th>
    <th>Error Details</th>
  </tr>
  <tr>
    <td>20</td>
    <td>Machine not found</td>
  </tr>
  <tr>
    <td>21</td>
    <td>Bad request</td>
  </tr>
  <tr>
    <td>22</td>
    <td>Unsupported file format</td>
  </tr>
  <tr>
    <td>23</td>
    <td>mkdir -p error</td>
  </tr>
  <tr>
    <td>24</td>
    <td>FIFO error</td>
  </tr>
  <tr>
    <td>25</td>
    <td>Missing attachment</td>
  </tr>
  <tr>
    <td>26</td>
    <td>Machine update error</td>
  </tr>
</table>

<a name="on-line-documentation"></a>
### On-line documentation

The Machine Wrapper API documentation can be accessed from the Fab Lab network at the following URL:

<p align="center">
  <code>
    http://wrapper_name.local:8888/docs
    </code>
    </p>

<p align="justify">
This URL leads to the Pi-Wrapper API documentation landing page depicted in Fig. 16. The lock indicates that these API are secured. API access is guaranteed with a JWT token that is issued by the system to Fab Lab authorized users. <b>Please note that Swagger UI HTML code is linked to external stylesheets and javascript code; thus you must ensure your network has external connectivity in order to use this feature</b>.
</p>

<figure>
  <p align="center">
    <img src="/docs/images/api-landing.png" alt="API DOCUMENTATION LANDING PAGE"/>
    <figcaption>Fig. 16 - The API Documentation Landing Page.</figcaption>
  </p>
</figure>

<p align="justify">
In order to use the Swagger User Interface and test the API, a user must get an authorization token first. This can be accomplished with the <code>/login</code> API that accepts a form with username and password (see Fig. 17).
</p>

<figure>
  <p align="center">
    <img src="/docs/images/api-authentication.png" alt="API AUTHENTICATION"/>
    <figcaption>Fig. 17 - API Authentication.</figcaption>
  </p>
</figure>

<p align="justify">
If the authentication is successful, the API returns a response with a 200 status code and the JWT authorization token as depicted in Fig.18.
</p>

<figure>
  <p align="center">
    <img src="/docs/images/api-jwt-response.png" alt="API JWT AUTHORIZATION TOKEN"/>
    <figcaption>Fig. 18 - API Response with the JWT Authentication Token.</figcaption>
  </p>
</figure>

<a name="api-responses"></a>
### APIs responses

#### Login

```
POST /api/login

Body:
{
   "name": "the user password",
   "password": "the user password"

}
```

_Response_:

```
200 OK

{
   "message": "ok",
   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU5ZDIxYzUzODk5NTYxMzBlM2JmZjhkYyIsImV4cERhdGUiOjE1MTY3MDI2NjEyNjgsImlhdCI6MTUxNjYxNjI2MX0.b1QKle3wh2LZsbdb8CsMJQLR0a5sopBBUDzlvX0hfVw"
}
```
#### Submit a job

```
POST
/api/jobs?user=1234&machine=laser%20cutter&process=cut&material =wood
```

_Response_:

```
200 OK

{
   "jobId": "3a88b824-7268-4468-947a-054f39c86169"
}
```

<p align="justify">
Recall, that with this method a design file in PNG format is uploaded on the server. Our API specifications correspond to the HTTP request depicted below.
</p>

```
POST /api/jobs
Host: piwrapper.local/public/uploads
Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryqzByvokjOTfF9UwD
Content-Length: 204
------WebKitFormBoundaryqzByvokjOTfF9UwD
Content-Disposition: form-data; name="design"; filename="design.png"
Content-Type: image/png
File contents go here.
------WebKitFormBoundaryqzByvokjOTfF9UwD—
```

#### Tell me about the status of all the jobs:

```
GET /api/jobs
```

_Response_:

```
200 OK
{
   "jobs": [
      {
         "id": "b5136915-cc09-47b4-b97f-8f2e5026af45",
         "status": "cancelled",
         "queue": "global"
      },
      {
       "id": "5c28a9b3-2eb6-4058-be11-a0682d94090d",
       "status": "cancelled",
       "queue": "global"
      }
    ]
}
```

#### Tell me about the status of a particular job

```
GET /api/jobs/b5136915-cc09-47b4-b97f-8f2e5026af45
```

_Response_:

```
200 OK

{
   "job": {
      "material": "vinyl",
      "switchSort": "on",
      "origin": "bottom left",
      "diameter": 0.25,
      "offsets": 1,
      "overlap": 50,
      "error": 1.5,
      "threshold": 0.5,
      "merge": 1.1,
      "order": -1,
      "sequence": -1,
      "power": 45,
      "speed": 2,
      "xCoord": 50,
      "yCoord": 50,
      "userId": "the user id",
      "jobId": "b5136915-cc09-47b4-b97f-8f2e5026af45",
      "status": "cancelled",
      "jobPath": "the path to the design file",
      "caller": "api",
      "createdOn": 1516112089.866
    }
}

```

#### Delete a job

```
DELETE /api/jobs/b5136915-cc09-47b4-b97f-8f2e5026af45
```

_Response_:

```
200 OK

{
   "message": "OK",
   "details": "Job deleted successfully"
}
```

<a name="websites"></a>
# Websites

1. [Newton Fab Labs on Github](https://gcornetta.github.io/piwrapper/)
2. [Newton Project Page](http://www.newtonproject.eu) 

<a name="contribution-guidelines"></a>
# Contribution guidelines

Please see [CONTRIBUTING](CONTRIBUTING.md) and [CONDUCT](CONDUCT.md) for details.

<a name="license"></a>
# License

This software is licensed under MIT license unless otherwise specified in the third-party modules included in this package.   
