var formidable = require('formidable')
var fs = require('fs')
var path = require('path')
var os = require('../lib/os/os')
var User = require('../models/user')
var Machine = require('../models/machine')
var dashboard = require('./lib/dashboard')
var logger = require('../config/winston')
var url = require('url')
var printerConfig = require('../lib/fablab/printer-config')
var siren = require('../lib/siren/siren')
var formCheck = require('../common/form-check')
var mkdirp = require('mkdirp')

var dashboardPage = dashboard.dashboardPage
var welcomeMsg = dashboard.welcomeMsg
var validationMsg = dashboard.validationMsg
var panelNames = dashboard.panelNames
var userRoles = dashboard.userRoles
var infoText = dashboard.infoText

var _validateFields = function (req, res) {
  var vendor = req.body.machineVendor
  var type = req.body.machineType
  var name = req.body.machineName
  var threshCurr = req.body.currentThreshold
  var hysteresis = req.body.hysteresis
  var sampleTime = req.body.samplingTime
  var dutyCycle = req.body.dutyCycle
  var adcVendor = req.body.adcVendor
  var adcDevice = req.body.adcDevice
  var deviceUri = req.body.deviceUri
  var baudRate = req.body.baudRate

  // Validation
  req.checkBody('machineVendor', validationMsg.vendor).notEmpty()
  req.checkBody('machineType', validationMsg.type).notEmpty()
  req.checkBody('machineName', validationMsg.name).notEmpty()
  req.checkBody('currentThreshold', validationMsg.threshCurr).notEmpty().isInt()
  req.checkBody('hysteresis', validationMsg.hysteresis).notEmpty().isInt()
  req.checkBody('samplingTime', validationMsg.sampleTime).notEmpty().isInt()
  req.checkBody('dutyCycle', validationMsg.dutyCycle).notEmpty().isInt({ min: 0, max: 99 })
  req.checkBody('adcVendor', validationMsg.adcVendor).notEmpty()
  req.checkBody('adcDevice', validationMsg.adcDevice).notEmpty()
  req.checkBody('deviceUri', validationMsg.deviceURI).notEmpty()
  req.checkBody('baudRate', validationMsg.baudRate).notEmpty()

  var errors = req.validationErrors()

  for (var i = 0; i < dashboardPage.wizardPage.machines.length; i++) {
    if (dashboardPage.wizardPage.machines[i].type === type) {
      if ((dashboardPage.wizardPage.machines[i].vendors).indexOf(vendor) === -1) {
        if (!errors) {
          errors = [{param: 'vendor', msg: 'No available machines for that vendor'}]
        } else {
          errors.push({param: 'vendor', msg: 'No available machines for that vendor'})
        }
      }
      break
    }
  }

  for (var j = 0; j < dashboardPage.wizardPage.samplingDevices.length; j++) {
    if (dashboardPage.wizardPage.samplingDevices[j].vendor === adcVendor) {
      if (dashboardPage.wizardPage.samplingDevices[j].deviceList.indexOf(adcDevice) === -1) {
        if (!errors) {
          errors = [{param: 'adcVendor', msg: 'No available sampling device for that vendor'}]
        } else {
          errors.push({param: 'adcVendor', msg: 'No available sampling device for that vendor'})
        }
      }
      break
    }
  }

  return {errors: errors, vendor: vendor, type: type, name: name, threshCurr: threshCurr, hysteresis: hysteresis, sampleTime: sampleTime, dutyCycle: dutyCycle, adcVendor: adcVendor, adcDevice: adcDevice, deviceUri: deviceUri, baudRate: baudRate}
}

var _getSystemInfo = function () {
  os.getSystemInfo(function (info) {
    for (var i = 0; i < (dashboardPage.sysInfoTable.rows).length; i++) {
      switch (dashboardPage.sysInfoTable.rows[i].label) {
        case 'Architecture': dashboardPage.sysInfoTable.rows[i].value = info.arch
          break
        case 'Number of cores': dashboardPage.sysInfoTable.rows[i].value = os.getCoresNum()
          break
        case 'Clock frequency': var coreClk = []
          for (var j = 0; j < os.getCoresNum(); j++) {
            coreClk[j] = {label: infoText.coreLabel + (j).toString(), value: (os.getCoresClk())[j]}
            // (dashboardPage.sysInfoTable.rows[i].value)[j].value = (os.getCoresClk())[j];
          }
          (dashboardPage.sysInfoTable.rows[i].value) = coreClk
          break
        case 'Average clock frequency': dashboardPage.sysInfoTable.rows[i].value = os.getAvgClk()
          break
        case 'OS Type': dashboardPage.sysInfoTable.rows[i].value = info.type
          break
        case 'Release': dashboardPage.sysInfoTable.rows[i].value = info.release
          break
        case 'Total memory': dashboardPage.sysInfoTable.rows[i].value = (info.totalmem / Math.pow(10, 6)).toFixed(2)
          break
        case 'Free memory': dashboardPage.sysInfoTable.rows[i].value = (info.freemem / Math.pow(10, 6)).toFixed(2)
          break
        case 'Average load': for (var k = 0; k < info.loadavg.length; k++) {
          (dashboardPage.sysInfoTable.rows[i].value)[k].value = ((info.loadavg)[k] * 100).toFixed(2)
        }
          break
        default : logger.error('@dashboard._getSystemInfo: no match in processor system info.')
      }
    }
  })
}

module.exports.dashboard = function (req, res) {
  Machine.checkIfMachineConfigured(function (err, machine) {
    if (err) throw (err)
    if (!machine) {
      var welcomeMessage = welcomeMsg.hello + req.user.firstname + '!' + welcomeMsg.wizard
      if (dashboardPage.displayWelcome) {
        req.flash('success_msg', welcomeMessage)
        var flashWelcome = req.flash('success_msg')[0]
        dashboardPage.flashWelcome = flashWelcome
        req.session.flash = []
      }
      dashboardPage.errors = null
      dashboardPage.userName = req.user.firstname + ' ' + req.user.lastname
      if (req.user.pathtophoto) {
        dashboardPage.pathToPhoto = req.user.pathtophoto
      }
      dashboardPage.displaySettings = false
      dashboardPage.displayLogs = false
      dashboardPage.displayControl = false
      dashboardPage.displayProfile = false
      dashboardPage.displayTerminal = false
      dashboardPage.displaySidebarMenu = false
      dashboardPage.displayProcessCut = false
      dashboardPage.displayJobsTable = false
      dashboardPage.displayProcessHalftone = false
      dashboardPage.displayMonitor = false
      dashboardPage.currentPanelName = panelNames.dashboard
      dashboardPage.currentPanelRoute = '/dashboard'
      res.render('dashboard', dashboardPage)
      // dashboardPage.displayWelcome = false;
    } else {
      _getSystemInfo()
      welcomeMessage = welcomeMsg.welcome + req.user.firstname + '!'
      if (req.user.lastlogged) {
        welcomeMessage += welcomeMsg.lastLog + req.user.lastlogged + '.'
        dashboardPage.lastLoggedOn = req.user.lastlogged.getDate()
      }
      if (dashboardPage.displayWelcome) {
        req.flash('success_msg', welcomeMessage)
        flashWelcome = req.flash('success_msg')[0]
        dashboardPage.flashWelcome = flashWelcome
        req.session.flash = []
      }
      if (req.user.pathtophoto) {
        dashboardPage.pathToPhoto = req.user.pathtophoto
      }
      if (!dashboardPage.displayTerminal) {
        dashboardPage.displayTerminal = true
      }
      dashboardPage.errors = null
      dashboardPage.userName = req.user.firstname + ' ' + req.user.lastname
      dashboardPage.machineConfigured = true
      dashboardPage.displaySidebarMenu = true
      dashboardPage.displaySettings = false
      dashboardPage.displayProfile = false
      dashboardPage.displayLogs = false
      dashboardPage.displayControl = false
      dashboardPage.displayProcessCut = false
      dashboardPage.displayJobsTable = false
      dashboardPage.displayMonitor = false
      dashboardPage.displayProcessHalftone = false
      dashboardPage.currentPanelName = panelNames.dashboard
      dashboardPage.currentPanelRoute = '/dashboard'

      switch (machine.type) {
        case 'Laser cutter' : switch (machine.vendor) {
          case 'Epilog' : dashboardPage.machinePanelRoute = '/dashboard/control/laser/epilog'
            break
          case 'GCC' : dashboardPage.machinePanelRoute = '/dashboard/control/laser/gcc'
            break
          case 'Trotec' : dashboardPage.machinePanelRoute = '/dashboard/control/laser/trotec'
            break
          default : break
        }
          break
        case 'Vinyl cutter' : switch (machine.vendor) {
          case 'GCC' : dashboardPage.machinePanelRoute = '/dashboard/control/vinyl/gcc'
            break
          case 'Roland' : dashboardPage.machinePanelRoute = '/dashboard/control/vinyl/roland'
            break
          default : break
        }

          break
        case 'Milling machine' : switch (machine.vendor) {
          case 'Roland' : dashboardPage.machinePanelRoute = '/dashboard/control/milling/roland'
            break
          default : break
        }
          break
        case '3D printer' : switch (machine.vendor) {
          case 'Prusa' : dashboardPage.machinePanelRoute = '/dashboard/control/3dprint/prusa'
            break
          default : break
        }
          break
      }

      res.render('dashboard', dashboardPage)
      dashboardPage.displayWelcome = false
      dashboardPage.errors = null // used to clear the current sensor error
      // may be in the future the check can be periodic
    }
  })
}

module.exports.profile = function (req, res) {
  dashboardPage.displaySettings = false
  dashboardPage.displayTerminal = false
  dashboardPage.displayWelcome = false
  dashboardPage.displayLogs = false
  dashboardPage.displayControl = false
  dashboardPage.displayProcessCut = false
  dashboardPage.displayProcessHalftone = false
  dashboardPage.displayJobsTable = false
  dashboardPage.displayMonitor = false
  dashboardPage.displayProfile = true
  dashboardPage.currentPanelName = panelNames.profile
  dashboardPage.currentPanelRoute = '/dashboard/profile'

  if (!dashboardPage.userName) {
    res.redirect('/dashboard')
  } else {
    dashboardPage.errors = null
    dashboardPage.profile = { firstname: req.user.firstname,
      lastname: req.user.lastname,
      role: req.user.issuperuser ? userRoles.superAdmin : userRoles.admin,
      email: req.user.email,
      username: req.user.username
    }
    res.render('dashboard', dashboardPage)
    dashboardPage.flashSuccess = false
  }
}

module.exports.upload = function (req, res) {
  // create an incoming form object
  var form = new formidable.IncomingForm()
  var newFileName

// specify that we want to allow the user to upload only one file in a single request
  form.multiples = false

  // store all uploads in the upload directory
  form.uploadDir = path.join(__dirname, '/../public/uploads/img')
  if (fs.existsSync(form.uploadDir) === false) {
    mkdirp.sync(form.uploadDir)
  }
  // every time a file has been uploaded successfully,
  // rename it to it's orignal name
  form.on('file', function (field, file) {
    var fileExt = (file.name).split('.').pop()
    newFileName = req.user._id + '.' + fileExt
    fs.rename(file.path, path.join(form.uploadDir, newFileName))
    User.updatePhotoPathByUsername(req.user.username, '/uploads/img/' + newFileName, function (err, result) {
      if (err) throw (err)
      if (result) {
        logger.info('@dashboard.upload: path of user successfully saved in DB')
      }
    })
    dashboardPage.pathToPhoto = '/uploads/img/' + newFileName
    res.redirect('/dashboard/profile')
  })
  // log any errors that occur
  form.on('error', function (err) {
    logger.log('error', '@dashboard.upload: an error has occured: %s', err)
  })

  // once all the files have been uploaded, send a response to the client
  form.on('end', function () {
    // res.end('success');
  })

  // parse the incoming request containing the form data
  form.parse(req)
}

module.exports.wizard = function (req, res) {
  dashboardPage.displayWelcome = false
  dashboardPage.displayLogs = false
  dashboardPage.displayControl = false
  dashboardPage.displayProcessCut = false
  dashboardPage.displayProcessHalftone = false
  dashboardPage.displayJobsTable = false
  dashboardPage.displayMonitor = false
  dashboardPage.displayWizard = true
  dashboardPage.currentPanelName = panelNames.wizard
  dashboardPage.currentPanelRoute = '/dashboard/wizard'
  res.render('dashboard', dashboardPage)
  // dashboardPage.displayWelcome = false;
}

module.exports.configure = function (req, res) {
  var validationResponse = _validateFields(req, res)

  var errors = validationResponse.errors
  var vendor = validationResponse.vendor
  var type = validationResponse.type
  var name = validationResponse.name
  var threshCurr = validationResponse.threshCurr
  var hysteresis = validationResponse.hysteresis
  var sampleTime = validationResponse.sampleTime
  var dutyCycle = validationResponse.dutyCycle
  var adcVendor = validationResponse.adcVendor
  var adcDevice = validationResponse.adcDevice
  var deviceUri = req.body.deviceUri
  var baudRate = req.body.baudRate

  if (errors) {
    dashboardPage.errors = errors
    res.render('dashboard', dashboardPage)
  } else {
    var newMachine = new Machine({vendor: vendor,
      type: type,
      name: name.replace(' ', '_'),
      threshCurr: threshCurr,
      hysteresis: hysteresis,
      sampleTime: sampleTime,
      dutyCycle: dutyCycle,
      isConfigured: true,
      adcDevice: [{vendor: adcVendor, device: adcDevice}],
      deviceUri: deviceUri,
      baudRate: baudRate
    })

    // create a new machine
    Machine.createMachine(newMachine, function (err, machine) {
      if (err) throw err
      logger.info('@dashboard.cofigure: a new machine has been successfully configured') // machine also contains ._id
    })

    // add to the machine the information about the adc device
    // newMachine.adcDevice.push({vendor : adcVendor, device : adcDevice});

    // check if sensor connected

    dashboardPage.displayWizard = false
    dashboardPage.machineConfigured = true
    res.redirect('/dashboard')
  }
}

module.exports.settings = function (req, res) {
  dashboardPage.displayControl = false
  dashboardPage.displayLogs = false
  dashboardPage.displayProfile = false
  dashboardPage.displayWizard = false
  dashboardPage.displayTerminal = false
  dashboardPage.displayProcessCut = false
  dashboardPage.displayProcessHalftone = false
  dashboardPage.displayJobsTable = false
  dashboardPage.displayMonitor = false
  dashboardPage.displaySettings = true
  dashboardPage.currentPanelName = panelNames.settings
  dashboardPage.currentPanelRoute = '/dashboard/settings'

// load object from db
  Machine.checkIfMachineConfigured(function (err, machine) {
    if (err) throw (err)
    if (machine) {
      dashboardPage.machine = {
        name: machine.name,
        type: machine.type,
        vendor: machine.vendor,
        threshCurr: machine.threshCurr,
        hysteresis: machine.hysteresis,
        sampleTime: machine.sampleTime,
        dutyCycle: machine.dutyCycle,
        adcVendor: machine.adcDevice[0].vendor,
        adcDevice: machine.adcDevice[0].device,
        deviceUri: machine.deviceUri,
        baudRate: machine.baudRate,
        defaultValues: machine.defaultValues
      }
    }
    if ((!dashboardPage.userName) || (!machine)) {
      res.redirect('/dashboard')
    } else {
      dashboardPage.errors = null
      res.render('dashboard', dashboardPage)
      dashboardPage.flashSuccess = false
    }
  })
}

module.exports.machineUpdate = function (req, res) {
  var validationResponse = _validateFields(req, res)

  var errors = validationResponse.errors
  var vendor = validationResponse.vendor
  var type = validationResponse.type
  var name = validationResponse.name
  var threshCurr = validationResponse.threshCurr
  var hysteresis = validationResponse.hysteresis
  var sampleTime = validationResponse.sampleTime
  var dutyCycle = validationResponse.dutyCycle
  var adcVendor = validationResponse.adcVendor
  var adcDevice = validationResponse.adcDevice
  var deviceUri = validationResponse.deviceUri
  var baudRate = validationResponse.baudRate

  if (errors) {
    dashboardPage.errors = errors
    res.render('dashboard', dashboardPage)
    dashboardPage.errors = null
  } else {
    var newConfiguration = {
      vendor: vendor,
      type: type,
      name: name.replace(' ', '_'),
      threshCurr: threshCurr,
      hysteresis: hysteresis,
      sampleTime: sampleTime,
      dutyCycle: dutyCycle,
      isConfigured: true,
      adcDevice: [{vendor: adcVendor, device: adcDevice}],
      deviceUri: deviceUri,
      baudRate: baudRate,
      defaultValues: JSON.parse(JSON.stringify(Machine.defaultValues[type][vendor]))
    }
    var index = 1;
    for (var i in newConfiguration.defaultValues){
      for (var j in newConfiguration.defaultValues[i]){
        if (req.body[j]) {
          newConfiguration.defaultValues[i][j] = req.body[j][req.body[j].length - index] || newConfiguration.defaultValues[i][j]
        }
      }
      index++
    }
    switch (type) {
      case 'Laser cutter':
        switch (vendor) {
          case 'Epilog':
            for (var i in newConfiguration.defaultValues){
              req.body = newConfiguration.defaultValues[i]
              req.body.process = 'cut'
              req.body.material = 'cardboard'
              errors = formCheck.checkJSON(req, newConfiguration)
              if (!errors) {
                req.body.process = 'halftone'
                errors = formCheck.checkJSON(req, newConfiguration)
              }
              delete req.body.process
              delete req.body.material
              if (errors){
                break;
              }
            }
            break
        }
        break
      case 'Vinyl cutter':
        switch (vendor) {
          case 'Roland':
            for (var i in newConfiguration.defaultValues){
              req.body = newConfiguration.defaultValues[i]
              req.body.material = 'vinyl'
              errors = formCheck.checkJSON(req, newConfiguration)
              delete req.body.material
              if (errors){
                break;
              }
            }
            break
        }
        break
      case 'Milling machine':
        switch (vendor) {
          case 'Roland':
            for (var i in newConfiguration.defaultValues){
              req.body = newConfiguration.defaultValues[i]
              req.body.process = 'pcb'
              req.body.pcbFinishing = 'outline_1_32'
              errors = formCheck.checkJSON(req, newConfiguration)
              if (!errors) {
                req.body.process = 'wax'
                req.body.waxFinishing = 'rough_cut'
                errors = formCheck.checkJSON(req, newConfiguration)
                if (!errors) {
                  req.body.waxFinishing = 'finish_cut'
                  errors = formCheck.checkJSON(req, newConfiguration)
                }
              }
              delete req.body.process
              delete req.body.pcbFinishing
              delete req.body.waxFinishing
              if (errors){
                break;
              }
            }
            break
        }
        break
      case '3D printer':
        switch (vendor) {
          case 'Prusa':
            break
        }
        break
    }
    if (errors) {
      dashboardPage.errors = errors
      res.render('dashboard', dashboardPage)
      dashboardPage.errors = null
    } else {
      Machine.updateMachine(newConfiguration, function (err, machine) {
        if (err) throw err
        dashboardPage.machine = {
          name: machine.name,
          type: machine.type,
          vendor: machine.vendor,
          threshCurr: machine.threshCurr,
          hysteresis: machine.hysteresis,
          sampleTime: machine.sampleTime,
          dutyCycle: machine.dutyCycle,
          adcVendor: machine.adcDevice[0].vendor,
          adcDevice: machine.adcDevice[0].device,
          deviceUri: machine.deviceUri,
          baudRate: machine.baudRate,
          defaultValues: machine.defaultValues
        }
        var successDbUpdate = 'DB succsessfully updated'
        req.flash('success_msg', successDbUpdate)
        var flashSuccess = req.flash('success_msg')[0]
        dashboardPage.flashSuccess = flashSuccess
        req.session.flash = []
        process.emit('machineUpdated')

        res.redirect('/dashboard/settings')
      })
    }
  }
}

module.exports.discoveredPrinters = function (req, res) {
  printerConfig.discoverPrinters(function (err, printers, unhandledPrinters) {
    if (err) throw err
    dashboardPage.printers = printers
    dashboardPage.currentPanelRoute = '/dashboard/control'
    res.render('partials/printer-select', dashboardPage)
  })
}

module.exports.profileUpdate = function (req, res) {
  var firstname = req.body.firstName
  var lastname = req.body.lastName
  var email = req.body.email
  var userrole = req.body.userType

  // Validation
  req.checkBody('firstName', validationMsg.firstname).notEmpty()
  req.checkBody('lastName', validationMsg.lastname).notEmpty()
  req.checkBody('email', validationMsg.emailRequired).notEmpty()
  if (req.user.issuperuser) {
    req.checkBody('userType', validationMsg.userRoleRequired).notEmpty()
  }

  var errors = req.validationErrors()

  if (errors) {
    dashboardPage.errors = errors
    res.render('dashboard', dashboardPage)
    dashboardPage.errors = null
  } else {
    var newProfile = {firstname: firstname,
      lastname: lastname,
      email: email,
      issuperuser: (userrole === 'Superadministrator')
    }
    // read user id from session
    var id = req.user._id

    User.updateUserById(id, newProfile, function (updateOK, user) {
      if (updateOK) {
        logger.info('@dashboard.profileUpdate: user profile successfully updated')
      } else {
        logger.error('@dashboard.profileUpdate: error updating user profile')
      }
    })
    var successDbUpdate = 'DB succsessfully updated'
    req.flash('success_msg', successDbUpdate)
    var flashSuccess = req.flash('success_msg')[0]
    dashboardPage.flashSuccess = flashSuccess
    req.session.flash = []

    res.redirect('/dashboard/profile')
  }
}

module.exports.changePassword = function (req, res) {
  var password = req.body.newPassword

  req.checkBody('newPassword', validationMsg.password).notEmpty()
  req.checkBody('confirmPassword', validationMsg.passwordConfirm).notEmpty()
  req.checkBody('confirmPassword', validationMsg.passwordMatch).equals(req.body.newPassword)

  var errors = req.validationErrors()

  if (errors) {
    dashboardPage.errors = errors
    res.render('dashboard', dashboardPage)
    dashboardPage.errors = null
  } else {
    // read username from session
    var username = req.user.username
    User.updatePassword(username, password, function (err, status) {
      if (err) throw err
      if (status) {
        logger.info('@dashboard.changePassword: password update successful')
      } else {
        logger.error('@dashboard.changePassword: error updating the user password')
      }
    })
    var successDbUpdate = 'DB succsessfully updated'
    req.flash('success_msg', successDbUpdate)
    var flashSuccess = req.flash('success_msg')[0]
    dashboardPage.flashSuccess = flashSuccess
    req.session.flash = []

    res.redirect('/dashboard/profile')
  }
}

module.exports.logs = function (req, res) {
  dashboardPage.displayProfile = false
  dashboardPage.displayWizard = false
  dashboardPage.displayTerminal = false
  dashboardPage.displaySettings = false
  dashboardPage.displayControl = false
  dashboardPage.displayProcessCut = false
  dashboardPage.displayProcessHalftone = false
  dashboardPage.displayJobsTable = false
  dashboardPage.displayLogs = true
  dashboardPage.displayMonitor = false
  dashboardPage.currentPanelName = panelNames.logs
  dashboardPage.currentPanelRoute = '/dashboard/logs'

  if (!dashboardPage.userName) {
    res.redirect('/dashboard')
  } else {
    res.render('dashboard', dashboardPage)
  }
}

module.exports.siren = function (req, res) {
  dashboardPage.displayProfile = false
  dashboardPage.displayWizard = false
  dashboardPage.displayTerminal = false
  dashboardPage.displaySettings = false
  dashboardPage.displayControl = false
  dashboardPage.displayProcessCut = false
  dashboardPage.displayProcessHalftone = false
  dashboardPage.displayJobsTable = false
  dashboardPage.displayLogs = false
  dashboardPage.displayMonitor = true
  dashboardPage.currentPanelName = panelNames.monitor
  dashboardPage.currentPanelRoute = '/dashboard/monitor'

  if (!dashboardPage.userName) {
    res.redirect('/dashboard')
  } else {
    siren.connect('http://' + process.env.HOSTNAME + ':1337/', conn => {
      if (conn.err == null) {
        conn.entity.data.links
            .filter(link => link.title !== undefined && link.title.includes('machine-wrapper'))
            .map(link => link.href)
            .forEach(href => siren.connect(href, conn => {
              dashboardPage.siren.deviceHref = href
              dashboardPage.siren.deviceProps = conn.entity.data.entities[0].properties
              var apiURL = conn.entity.data.entities[0].links[0].href
              var path = url.parse(apiURL, true)
              dashboardPage.siren.host = (path.host).split(':', 1)
              dashboardPage.siren.query = {method: 'GET', url: path.pathname}
              siren.connect(conn.entity.data.entities[0].links[0].href, conn => {
                dashboardPage.siren.response = JSON.stringify(conn.entity.data, null, 4)
                dashboardPage.siren.deviceActions = conn.entity.data.actions
                dashboardPage.siren.deviceMonitor = {current: conn.entity.data.links[3].title,
                  state: conn.entity.data.links[4].title }
                res.render('dashboard', dashboardPage)
              })
            }))
      }
    })
  }
}
