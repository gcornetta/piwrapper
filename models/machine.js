var mongoose = require('mongoose')
mongoose.Promise = require('bluebird')
var printer = require('../lib/fablab/printer-config')

var AdcSchema = new mongoose.Schema({
  vendor: {
    type: String,
    required: true
  },
  device: {
    type: String,
    required: true
  }
})

var MachineSchema = new mongoose.Schema({
  vendor: {
    type: String,
    required: true
  },
  type: {  // laser cutter, vynil cutter, 3D printer, milling machine
    type: String,
    required: true
  },
  name: { // logical name to assign to a machine
    type: String,
    required: true
  },
  threshCurr: { // threshold current in mA to switch from idle to busy
    type: Number,
    required: true
  },
  hysteresis: { // hysteresis in mA to switch from idle to busy
    type: Number,
    required: true
  },
  sampleTime: { // driver current sample time
    type: Number,
    required: true
  },
  dutyCycle: { // sampling duty cycle
    type: Number,
    min: 1,
    max: 99,
    required: true
  },
  deviceUri: { // uri of the device
    type: String
  },
  baudRate: { // baudRate of the device
    type: Number
  },
  defaultValues: mongoose.Schema.Types.Mixed,
  isConfigured: Boolean,
  adcDevice: [AdcSchema],
  queuedJobs: []
}, {usePushEach: true})

var Machine = module.exports = mongoose.model('Machine', MachineSchema)

module.exports.createMachine = function (newMachine, callback) {
  printer.addPrinter({Name: newMachine.name, DeviceURI: newMachine.deviceUri}, function (err, stdout) {
    if (!err) {
      newMachine.defaultValues = defaultValues[newMachine.type][newMachine.vendor]
      newMachine.save(callback)
    } else {
      callback(err, null)
    }
  })
}

module.exports.checkIfMachineConfigured = function (callback) {
  var query = {'isConfigured': true}
  Machine.findOne(query, callback)
}

module.exports.updateMachine = function (newConfiguration, callback) {
  var query = {'isConfigured': true}
  printer.addPrinter({Name: newConfiguration.name, DeviceURI: newConfiguration.deviceUri}, function (err, stdout) {
    if (!err) {
      Machine.findOne({}, function (err, machine) {
        if (err) throw (err)
        if ((!machine) || (machine.type !== newConfiguration.type) || (machine.vendor !== newConfiguration.vendor)) {
          if (defaultValues[newConfiguration.type]) {
            newConfiguration.defaultValues = defaultValues[newConfiguration.type][newConfiguration.vendor]
          }
        }
        Machine.findOneAndUpdate(query, newConfiguration, {new: true}, callback)
      })
    } else {
      callback(err, null)
    }
  })
}

module.exports.addMachineJob = function (newJob, callback) {
  Machine.findOne({}, function (err, machine) {
    if (err) throw (err)
    var insert = true
    for (var i in machine.queuedJobs) {
      if (machine.queuedJobs[i].jobId === newJob.jobId) {
        insert = false
        machine.queuedJobs[i] = newJob
        break
      }
    }
    if (insert) {
      machine.queuedJobs.push(newJob)
    }
    machine.save(callback)
  })
}

module.exports.getMachineByName = function (machineName, callback) {
  var query = {name: machineName}
  Machine.findOne(query, callback)
}

module.exports.getMachineById = function (id, callback) {
  Machine.findById(id, callback)
}

module.exports.getJobs = function (callback) {
  Machine.findOne({}, function (err, machine) {
    if ((machine) && (machine.queuedJobs)) {
      callback(err, machine.queuedJobs)
    } else {
      callback(err, [])
    }
  })
}

module.exports.removeJobById = function (id, callback) {
  Machine.update({}, { $pull: { queuedJobs: { jobId: id } } }, callback)
}

module.exports.updateJob = function (job, callback) {
  Machine.findOne({}, function (err, machine) {
    if (err) throw (err)
    for (var i in machine.queuedJobs) {
      if (machine.queuedJobs[i].jobId === job.jobId) {
        machine.queuedJobs[i] = job
        machine.save(callback)
        break
      }
    }
  })
}

module.exports.changeJobStatusById = function (id, newStatus, callback) {
  Machine.queuedJobs.findById(id, function (err, job) {
    if (err) throw (err)
    if (!job) {
      callback(null, false)
    } else {
      job.status = newStatus
      job.save(callback(null, true))
    }
  })
}

module.exports.changeJobStatusByOwner = function (owner, newStatus, callback) {
  var query = {owner: owner}
  Machine.queuedJobs.findOne(query, function (err, job) {
    if (err) throw (err)
    if (!job) {
      callback(null, false)
    } else {
      job.status = newStatus
      job.save(callback(null, true))
    }
  })
}

module.exports.getJobStatusById = function (id, callback) {
  Machine.queuedJobs.findById(id, callback)
}

module.exports.getJobStatusByOwner = function (owner, callback) {
  var query = {owner: owner}
  Machine.queuedJobs.findOne(query, callback)
}

var defaultValues = {
  'Laser cutter': {
    'Epilog': {
      'cardboard': {
        switchAutofocus: 'on',
        switchSort: 'on',
        switchFill: 'on',
        diameter: 0.25,
        offsets: 1,
        overlap: 50,
        error: 1.5,
        threshold: 0.5,
        merge: 1.1,
        order: -1,
        sequence: -1,
        spotSize: 2,
        minSpotsize: 25,
        horSpotspace: 25,
        verSpotspace: 25,
        pointSpot: 4,
        power: 25,
        speed: 75,
        rate: 500,
        xCoord: 50,
        yCoord: 50,
        origin: 'top left'
      },
      'acrylic': {
        switchAutofocus: 'on',
        switchSort: 'on',
        switchFill: 'on',
        diameter: 0.25,
        offsets: 1,
        overlap: 50,
        error: 1.5,
        threshold: 0.5,
        merge: 1.1,
        order: -1,
        sequence: -1,
        spotSize: 2,
        minSpotsize: 25,
        horSpotspace: 25,
        verSpotspace: 25,
        pointSpot: 4,
        power: 75,
        speed: 75,
        rate: 500,
        xCoord: 50,
        yCoord: 50,
        origin: 'top left'
      },
      'wood': {
        switchAutofocus: 'on',
        switchSort: 'on',
        switchFill: 'on',
        diameter: 0.25,
        offsets: 1,
        overlap: 50,
        error: 1.5,
        threshold: 0.5,
        merge: 1.1,
        order: -1,
        sequence: -1,
        spotSize: 2,
        minSpotsize: 25,
        horSpotspace: 25,
        verSpotspace: 25,
        pointSpot: 4,
        power: 50,
        speed: 75,
        rate: 500,
        xCoord: 50,
        yCoord: 50,
        origin: 'top left'
      },
      'mylar': {
        switchAutofocus: 'on',
        switchSort: 'on',
        switchFill: 'on',
        diameter: 0.25,
        offsets: 1,
        overlap: 50,
        error: 1.5,
        threshold: 0.5,
        merge: 1.1,
        order: -1,
        sequence: -1,
        spotSize: 2,
        minSpotsize: 25,
        horSpotspace: 25,
        verSpotspace: 25,
        pointSpot: 4,
        power: 10,
        speed: 75,
        rate: 500,
        xCoord: 50,
        yCoord: 50,
        origin: 'top left'
      }
    }
  },
  'Vinyl cutter': {
    'Roland': {
      'vinyl': {
        switchSort: 'on',
        origin: 'bottom left',
        diameter: 0.25,
        offsets: 1,
        overlap: 50,
        error: 1.5,
        threshold: 0.5,
        merge: 1.1,
        order: -1,
        sequence: -1,
        power: 45,
        speed: 2,
        xCoord: 50,
        yCoord: 50
      },
      'epoxy': {
        switchSort: 'on',
        origin: 'bottom left',
        diameter: 0.25,
        offsets: 1,
        overlap: 50,
        error: 1.5,
        threshold: 0.5,
        merge: 1.1,
        order: -1,
        sequence: -1,
        power: 75,
        speed: 2,
        xCoord: 50,
        yCoord: 50
      },
      'copper': {
        switchSort: 'on',
        origin: 'bottom left',
        diameter: 0.25,
        offsets: 1,
        overlap: 50,
        error: 1.5,
        threshold: 0.5,
        merge: 1.1,
        order: -1,
        sequence: -1,
        power: 60,
        speed: 2,
        xCoord: 50,
        yCoord: 50
      }
    }
  },
  'Milling machine': {
    'Roland': {
      'outline_1_32': {
        machines: 'srm_20',
        x: 10,
        y: 10,
        z: 10,
        zjog: 12,
        xhome: 0,
        yhome: 152.4,
        zhome: 60.5,
        speed: 4,
        diameter: 0.4,
        error: 1.1,
        overlap: 50,
        thickness: 1.7,
        switchSort: 'on',
        direction: 'climb',
        cutDepth: 0.6,
        offsets: 4,
        threshold: 0.5,
        merge: 1.5,
        order: -1,
        sequence: -1,
        bottomZ: -10,
        bottomIntensity: 0,
        topZ: 0,
        topIntensity: 1,
        xz: 'on',
        yz: 'on',
        type: 'flat'
      },
      'traces_0_010': {
        machines: 'srm_20',
        x: 10,
        y: 10,
        z: 10,
        zjog: 12,
        xhome: 0,
        yhome: 152.4,
        zhome: 60.5,
        speed: 4,
        diameter: 0.254,
        error: 1.1,
        overlap: 50,
        thickness: 1.7,
        switchSort: 'on',
        direction: 'climb',
        cutDepth: 0.1,
        offsets: 1,
        threshold: 0.5,
        merge: 1.5,
        order: -1,
        sequence: -1,
        bottomZ: -10,
        bottomIntensity: 0,
        topZ: 0,
        topIntensity: 1,
        xz: 'on',
        yz: 'on',
        type: 'flat'
      },
      'traces_1_64': {
        machines: 'srm_20',
        x: 10,
        y: 10,
        z: 10,
        zjog: 12,
        xhome: 0,
        yhome: 152.4,
        zhome: 60.5,
        speed: 4,
        diameter: 0.4,
        error: 1.1,
        overlap: 50,
        thickness: 1.7,
        switchSort: 'on',
        direction: 'climb',
        cutDepth: 0.1,
        offsets: 4,
        threshold: 0.5,
        merge: 1.5,
        order: -1,
        sequence: -1,
        bottomZ: -10,
        bottomIntensity: 0,
        topZ: 0,
        topIntensity: 1,
        xz: 'on',
        yz: 'on',
        type: 'flat'
      },
      'rough_cut': {
        machines: 'srm_20',
        x: 10,
        y: 10,
        z: 10,
        zjog: 12,
        xhome: 0,
        yhome: 152.4,
        zhome: 60.5,
        speed: 20,
        diameter: 0.4,
        error: 1.1,
        overlap: 50,
        thickness: 1.7,
        switchSort: 'on',
        direction: 'climb',
        cutDepth: 0.1,
        offsets: 4,
        threshold: 0.5,
        merge: 1.5,
        order: -1,
        sequence: -1,
        bottomZ: -10,
        bottomIntensity: 0,
        topZ: 0,
        topIntensity: 1,
        xz: 'on',
        yz: 'on',
        type: 'flat'
      },
      'finish_cut': {
        machines: 'srm_20',
        x: 10,
        y: 10,
        z: 10,
        zjog: 12,
        xhome: 0,
        yhome: 152.4,
        zhome: 60.5,
        speed: 20,
        diameter: 0.4,
        error: 1.1,
        overlap: 50,
        thickness: 1.7,
        switchSort: 'on',
        direction: 'climb',
        cutDepth: 0.1,
        offsets: 4,
        threshold: 0.5,
        merge: 1.5,
        order: -1,
        sequence: -1,
        bottomZ: -10,
        bottomIntensity: 0,
        topZ: 0,
        topIntensity: 1,
        xz: 'on',
        yz: 'on',
        type: 'flat'
      }
     },
      'Shopbot': {
      '7_16_plywood': {
        x: 10,
        y: 10,
        z: 10,
        zjog: 12,
        xhome: 0,
        yhome: 152.4,
        zhome: 60.5,
        speed: 4,
        diameter: 0.4,
        error: 1.1,
        overlap: 50,
        thickness: 1.7,
        switchSort: 'on',
        direction: 'climb',
        cutDepth: 0.6,
        offsets: 4,
        threshold: 0.5,
        merge: 1.5,
        order: -1,
        sequence: -1,
        bottomZ: -10,
        bottomIntensity: 0,
        topZ: 0,
        topIntensity: 1,
        xz: 'on',
        yz: 'on',
        type: 'flat'
      },
      '1_2_HDPE': {
        x: 10,
        y: 10,
        z: 10,
        zjog: 12,
        xhome: 0,
        yhome: 152.4,
        zhome: 60.5,
        speed: 4,
        diameter: 0.4,
        error: 1.1,
        overlap: 50,
        thickness: 1.7,
        switchSort: 'on',
        direction: 'climb',
        cutDepth: 0.6,
        offsets: 4,
        threshold: 0.5,
        merge: 1.5,
        order: -1,
        sequence: -1,
        bottomZ: -10,
        bottomIntensity: 0,
        topZ: 0,
        topIntensity: 1,
        xz: 'on',
        yz: 'on',
        type: 'flat'
      },
      'rough_cut': {
        machines: 'srm_20',
        x: 10,
        y: 10,
        z: 10,
        zjog: 12,
        xhome: 0,
        yhome: 152.4,
        zhome: 60.5,
        speed: 20,
        diameter: 0.4,
        error: 1.1,
        overlap: 50,
        thickness: 1.7,
        switchSort: 'on',
        direction: 'climb',
        cutDepth: 0.1,
        offsets: 4,
        threshold: 0.5,
        merge: 1.5,
        order: -1,
        sequence: -1,
        bottomZ: -10,
        bottomIntensity: 0,
        topZ: 0,
        topIntensity: 1,
        xz: 'on',
        yz: 'on',
        type: 'flat'
      },
      'finish_cut': {
        machines: 'srm_20',
        x: 10,
        y: 10,
        z: 10,
        zjog: 12,
        xhome: 0,
        yhome: 152.4,
        zhome: 60.5,
        speed: 20,
        diameter: 0.4,
        error: 1.1,
        overlap: 50,
        thickness: 1.7,
        switchSort: 'on',
        direction: 'climb',
        cutDepth: 0.1,
        offsets: 4,
        threshold: 0.5,
        merge: 1.5,
        order: -1,
        sequence: -1,
        bottomZ: -10,
        bottomIntensity: 0,
        topZ: 0,
        topIntensity: 1,
        xz: 'on',
        yz: 'on',
        type: 'flat'
      },
    }
  },
  '3D printer': {
    'Prusa': {
      machine: 'i3 Berlin'
    }
  }
}

module.exports.defaultValues = defaultValues
