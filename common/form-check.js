var validationMsg = require('../controllers/lib/messages').validationMsg

module.exports.checkJSON = function (req, machine) {
  var json = req.body
  var processes, materials, machines
  switch (machine.type) {
    case 'Laser cutter':
      switch (machine.vendor) {
        case 'Epilog':
          processes = ['cut', 'halftone']
          materials = ['cardboard', 'acrylic', 'wood', 'mylar']
          req.checkBody('process', validationMsg.process).isInArray(processes)
          req.checkBody('material', validationMsg.material).isInArray(materials)

          if (json.process === 'cut') {
            req.checkBody('diameter', validationMsg.diameter).notEmpty().isFloat()
            req.checkBody('offsets', validationMsg.offsets).notEmpty().isInt()
            req.checkBody('overlap', validationMsg.overlap).notEmpty().isFloat({ min: 1, max: 100 })
            req.checkBody('error', validationMsg.error).notEmpty().isFloat()
            req.checkBody('threshold', validationMsg.threshold).notEmpty().isFloat({ min: 0, max: 1 })
            req.checkBody('merge', validationMsg.merge).notEmpty().isFloat()
            req.checkBody('order', validationMsg.order).notEmpty().isInt()
            req.checkBody('sequence', validationMsg.sequence).notEmpty().isInt()
          }

          if (json.process === 'halftone') {
            req.checkBody('diameter', validationMsg.diameter).notEmpty().isFloat()
            req.checkBody('spotSize', validationMsg.spotSize).notEmpty().isFloat()
            req.checkBody('minSpotsize', validationMsg.minSpotsize).notEmpty().isInt({ min: 1, max: 100 })
            req.checkBody('horSpotspace', validationMsg.horSpotspace).notEmpty().isInt({ min: 1, max: 100 })
            req.checkBody('verSpotspace', validationMsg.verSpotspace).notEmpty().isInt({ min: 1, max: 100 })
            req.checkBody('pointSpot', validationMsg.pointSpot).notEmpty().isInt()
          }

          req.checkBody('power', validationMsg.power).notEmpty().isInt({ min: 1, max: 100 })
          req.checkBody('speed', validationMsg.speed).notEmpty().isInt({ min: 1, max: 100 })
          req.checkBody('rate', validationMsg.rate).notEmpty().isInt()
          req.checkBody('xCoord', validationMsg.xCoord).notEmpty().isInt({ min: 0, max: 50 })
          req.checkBody('yCoord', validationMsg.yCoord).notEmpty().isInt({ min: 0, max: 50 })
          break

        case 'GCC':
          processes = ['cut', 'halftone']
          materials = ['cardboard', 'acrylic', 'wood', 'mylar']
          req.checkBody('process', validationMsg.process).isInArray(processes)
          req.checkBody('material', validationMsg.material).isInArray(materials)

          if (json.process === 'cut') {
            req.checkBody('diameter', validationMsg.diameter).notEmpty().isFloat()
            req.checkBody('offsets', validationMsg.offsets).notEmpty().isInt()
            req.checkBody('overlap', validationMsg.overlap).notEmpty().isInt({ min: 1, max: 100 })
            req.checkBody('error', validationMsg.error).notEmpty().isFloat()
            req.checkBody('threshold', validationMsg.threshold).notEmpty().isFloat({ min: 0, max: 1 })
            req.checkBody('merge', validationMsg.merge).notEmpty().isFloat()
            req.checkBody('order', validationMsg.order).notEmpty().isInt()
            req.checkBody('sequence', validationMsg.sequence).notEmpty().isInt()
          }

          if (json.process === 'halftone') {
            req.checkBody('diameter', validationMsg.diameter).notEmpty().isFloat()
            req.checkBody('spotSize', validationMsg.spotSize).notEmpty().isFloat()
            req.checkBody('minSpotsize', validationMsg.minSpotsize).notEmpty().isInt({ min: 1, max: 100 })
            req.checkBody('horSpotspace', validationMsg.horSpotspace).notEmpty().isInt({ min: 1, max: 100 })
            req.checkBody('verSpotspace', validationMsg.verSpotspace).notEmpty().isInt({ min: 1, max: 100 })
            req.checkBody('pointSpot', validationMsg.pointSpot).notEmpty().isInt()
          }

          req.checkBody('power', validationMsg.power).notEmpty().isInt({ min: 1, max: 100 })
          req.checkBody('speed', validationMsg.speed).notEmpty().isInt({ min: 1, max: 100 })
          req.checkBody('rate', validationMsg.rate).notEmpty().isInt()
          req.checkBody('xCoord', validationMsg.xCoord).notEmpty().isInt({ min: 0, max: 50 })
          req.checkBody('yCoord', validationMsg.yCoord).notEmpty().isInt({ min: 0, max: 50 })
          break

        case 'Trotec':
          processes = ['cut', 'halftone']
          materials = ['cardboard', 'acrylic', 'wood', 'mylar']
          machines = ['speedy100', 'speedy100FlexxCO2', 'speedy100FlexxFiber', 'speedy400']
          req.checkBody('process', validationMsg.process).isInArray(processes)
          req.checkBody('material', validationMsg.material).isInArray(materials)
          req.checkBody('machine', validationMsg.machine).isInArray(machines)

          if (json.process === 'cut') {
            req.checkBody('diameter', validationMsg.diameter).notEmpty().isFloat()
            req.checkBody('offsets', validationMsg.offsets).notEmpty().isInt()
            req.checkBody('overlap', validationMsg.overlap).notEmpty().isInt({ min: 1, max: 100 })
            req.checkBody('error', validationMsg.error).notEmpty().isFloat()
            req.checkBody('threshold', validationMsg.threshold).notEmpty().isFloat({ min: 0, max: 1 })
            req.checkBody('merge', validationMsg.merge).notEmpty().isFloat()
            req.checkBody('order', validationMsg.order).notEmpty().isInt()
            req.checkBody('sequence', validationMsg.sequence).notEmpty().isInt()
          }

          if (json.process === 'halftone') {
            req.checkBody('diameter', validationMsg.diameter).notEmpty().isFloat()
            req.checkBody('spotSize', validationMsg.spotSize).notEmpty().isFloat()
            req.checkBody('minSpotsize', validationMsg.minSpotsize).notEmpty().isInt({ min: 1, max: 100 })
            req.checkBody('horSpotspace', validationMsg.horSpotspace).notEmpty().isInt({ min: 1, max: 100 })
            req.checkBody('verSpotspace', validationMsg.verSpotspace).notEmpty().isInt({ min: 1, max: 100 })
            req.checkBody('pointSpot', validationMsg.pointSpot).notEmpty().isInt()
          }

          req.checkBody('power', validationMsg.power).notEmpty().isInt({ min: 1, max: 100 })
          req.checkBody('speed', validationMsg.speed).notEmpty().isInt({ min: 1, max: 100 })
          req.checkBody('rate', validationMsg.rate).notEmpty().isInt()
          req.checkBody('xCoord', validationMsg.xCoord).notEmpty().isInt({ min: 0, max: 50 })
          req.checkBody('yCoord', validationMsg.yCoord).notEmpty().isInt({ min: 0, max: 50 })
          break
      }
      break

    case 'Vinyl cutter':
      switch (machine.vendor) {
        case 'GCC':
              // TODO: Implement this machine (don't work in http://fabmodules.org/)
          break

        case 'Roland':
          materials = ['vinyl', 'epoxy', 'copper']
          req.checkBody('switchSort', validationMsg.switchSort).notEmpty()
          req.checkBody('origin', validationMsg.origin).notEmpty()
          req.checkBody('material', validationMsg.material).isInArray(materials)
          req.checkBody('diameter', validationMsg.diameter).notEmpty().isFloat()
          req.checkBody('offsets', validationMsg.offsets).notEmpty().isInt()
          req.checkBody('overlap', validationMsg.overlap).notEmpty().isInt({ min: 1, max: 100 })
          req.checkBody('error', validationMsg.error).notEmpty().isFloat()
          req.checkBody('threshold', validationMsg.threshold).notEmpty().isFloat({ min: 0, max: 1 })
          req.checkBody('merge', validationMsg.merge).notEmpty().isFloat()
          req.checkBody('order', validationMsg.order).notEmpty().isInt()
          req.checkBody('sequence', validationMsg.sequence).notEmpty().isInt()
          req.checkBody('power', validationMsg.power).notEmpty().isInt({ min: 1, max: 100 })
          req.checkBody('speed', validationMsg.speed).notEmpty().isInt({ min: 1, max: 100 })
          req.checkBody('xCoord', validationMsg.xCoord).notEmpty().isInt({ min: 0, max: 50 })
          req.checkBody('yCoord', validationMsg.yCoord).notEmpty().isInt({ min: 0, max: 50 })
          break
      }
      break

    case 'Milling machine':
      switch (machine.vendor) {
        case 'Roland':
          processes = ['pcb', 'wax']
          machines = ['mdx_15', 'mdx_20', 'mdx_40', 'srm_20']
          req.checkBody('process', validationMsg.material).isInArray(processes)
          req.checkBody('machines', validationMsg.machines).isInArray(machines)

          req.checkBody('x', validationMsg.x).notEmpty().isFloat()
          req.checkBody('y', validationMsg.y).notEmpty().isFloat()
          req.checkBody('z', validationMsg.z).notEmpty().isFloat()
          req.checkBody('zjog', validationMsg.zjog).notEmpty().isFloat()
          req.checkBody('xhome', validationMsg.x).notEmpty().isFloat()
          req.checkBody('yhome', validationMsg.y).notEmpty().isFloat()
          req.checkBody('zhome', validationMsg.z).notEmpty().isFloat()
          // req.checkBody('power', validationMsg.power).notEmpty().isInt({ min: 1, max: 100 });
          req.checkBody('speed', validationMsg.speed).notEmpty().isInt({ min: 1, max: 100 })
          // req.checkBody('rate', validationMsg.rate).notEmpty().isFloat();
          req.checkBody('diameter', validationMsg.diameter).notEmpty().isFloat({min: 0})
          req.checkBody('error', validationMsg.error).notEmpty().isFloat({min: 0})
          req.checkBody('overlap', validationMsg.overlap).notEmpty().isInt({min: 1, max: 100})

              // Process
          switch (json.process) {
            case 'pcb':
              var pcbFinishing = ['outline_1_32', 'traces_0_010', 'traces_1_64']
              req.checkBody('pcbFinishing', validationMsg.pcbFinishing).isInArray(pcbFinishing)
              switch (json.pcbFinishing) {
                case 'outline_1_32':
                  req.checkBody('thickness', validationMsg.thickness).notEmpty().isFloat({min: 0})
                  break
                case 'traces_0_010':
                case 'traces_1_64':
                  req.checkBody('switchSort', validationMsg.switchSort).notEmpty()
                  req.checkBody('direction', validationMsg.direction).notEmpty()
                  req.checkBody('cutDepth', validationMsg.cutDepth).notEmpty().isFloat({min: 0})
                  req.checkBody('offsets', validationMsg.offsets).notEmpty().isFloat({min: -1})
                  req.checkBody('threshold', validationMsg.threshold).notEmpty().isFloat({min: 0, max: 1})
                  req.checkBody('merge', validationMsg.merge).notEmpty().isFloat({min: 0})
                  req.checkBody('order', validationMsg.order).notEmpty().isInt()
                  req.checkBody('sequence', validationMsg.sequence).notEmpty().isInt()
                  break
              }
              break

            case 'wax':
              var waxFinishing = ['rough_cut', 'finish_cut']
              req.checkBody('waxFinishing', validationMsg.waxFinishing).isInArray(waxFinishing)
              req.checkBody('bottomZ', validationMsg.bottomZ).notEmpty().isFloat()
              req.checkBody('bottomIntensity', validationMsg.bottomIntensity).notEmpty().isFloat({min: 0, max: 1})
              req.checkBody('topZ', validationMsg.topZ).notEmpty().isFloat()
              req.checkBody('topIntensity', validationMsg.topIntensity).notEmpty().isFloat({min: 0, max: 1})
              switch (json.waxFinishing) {
                case 'rough_cut':
                  req.checkBody('switchSort', validationMsg.switchSort).notEmpty()
                  req.checkBody('direction', validationMsg.direction).notEmpty()
                  req.checkBody('cutDepth', validationMsg.cutDepth).notEmpty().isFloat()
                  req.checkBody('offsets', validationMsg.offsets).notEmpty().isFloat({min: -1})
                  req.checkBody('merge', validationMsg.merge).notEmpty().isFloat({min: 0})
                  req.checkBody('order', validationMsg.order).notEmpty().isInt()
                  req.checkBody('sequence', validationMsg.sequence).notEmpty().isInt()
                  break

                case 'finish_cut':
                  var types = ['flat', 'ball']
                  req.checkBody('type', validationMsg.type).isInArray(types)
                  req.checkBody('xz', validationMsg.xz).notEmpty()
                  req.checkBody('yz', validationMsg.yz).notEmpty()
                  break
              }
              break
          }
        break
        case 'Shopbot':
          console.log(req.body)
          req.checkBody('cut_speed', validationMsg.speed).notEmpty().isInt({ min: 1})
          req.checkBody('plunge_speed', validationMsg.speed).notEmpty().isInt({ min: 1})
          req.checkBody('jog_speed', validationMsg.speed).notEmpty().isInt({ min: 1})
          req.checkBody('jog_height', validationMsg.speed).notEmpty().isInt({ min: 0})
          req.checkBody('spindle_speed', validationMsg.speed).notEmpty().isInt({ min: 1 })
          req.checkBody('diameter', validationMsg.diameter).notEmpty().isFloat({min: 0})
          req.checkBody('error', validationMsg.error).notEmpty().isFloat({min: 0})
          req.checkBody('overlap', validationMsg.overlap).notEmpty().isInt({min: 1, max: 100})
          var waxFinishing = ['7_16_plywood', '1_2_HDPE','rough_cut', 'finish_cut']
          req.checkBody('waxFinishing', validationMsg.waxFinishing).isInArray(waxFinishing)
          req.checkBody('bottomZ', validationMsg.bottomZ).notEmpty().isFloat()
          req.checkBody('bottomIntensity', validationMsg.bottomIntensity).notEmpty().isFloat({min: 0, max: 1})
          req.checkBody('topZ', validationMsg.topZ).notEmpty().isFloat()
          req.checkBody('topIntensity', validationMsg.topIntensity).notEmpty().isFloat({min: 0, max: 1})
          switch (json.waxFinishing) {
            case '7_16_plywood':
            case '1_2_HDPE':
              req.checkBody('thickness', validationMsg.thickness).notEmpty().isFloat({min: 0})
            case 'rough_cut':
              //req.checkBody('switchSort', validationMsg.switchSort).notEmpty()
              req.checkBody('direction', validationMsg.direction).notEmpty()
              req.checkBody('cutDepth', validationMsg.cutDepth).notEmpty().isFloat()
              req.checkBody('offsets', validationMsg.offsets).notEmpty().isFloat({min: -1})
              req.checkBody('merge', validationMsg.merge).notEmpty().isFloat({min: 0})
              req.checkBody('order', validationMsg.order).notEmpty().isInt()
              req.checkBody('sequence', validationMsg.sequence).notEmpty().isInt()
              break
            case 'finish_cut':
              var types = ['flat', 'ball']
              req.checkBody('type', validationMsg.type).isInArray(types)
              //req.checkBody('xz', validationMsg.xz).notEmpty()
              //req.checkBody('yz', validationMsg.yz).notEmpty()
              break
          }
        break
      }
      break

    case '3D printer':
      switch (machine.vendor) {
        case 'Prusa':
          machines = ['i3 Berlin']
          req.checkBody('machine', validationMsg.machine).isInArray(machines)
          break
      }
      break
  }
  return req.validationErrors()
}

module.exports.setDefaultValuesIfNull = function (req, machine) {
  var json = req.body
  switch (machine.type) {
    case 'Laser cutter':
      switch (machine.vendor) {
        case 'Epilog':
          if (machine.defaultValues[json.material]) {
            json.diameter = json.diameter || machine.defaultValues[json.material].diameter
            json.offsets = json.offsets || machine.defaultValues[json.material].offsets
            json.overlap = json.overlap || machine.defaultValues[json.material].overlap
            json.error = json.error || machine.defaultValues[json.material].error
            json.threshold = json.threshold || machine.defaultValues[json.material].threshold
            json.merge = json.merge || machine.defaultValues[json.material].merge
            json.order = json.order || machine.defaultValues[json.material].order
            json.sequence = json.sequence || machine.defaultValues[json.material].sequence
            json.spotSize = json.spotSize || machine.defaultValues[json.material].spotSize
            json.minSpotsize = json.minSpotsize || machine.defaultValues[json.material].minSpotsize
            json.horSpotspace = json.horSpotspace || machine.defaultValues[json.material].horSpotspace
            json.verSpotspace = json.verSpotspace || machine.defaultValues[json.material].verSpotspace
            json.pointSpot = json.pointSpot || machine.defaultValues[json.material].pointSpot
            json.power = json.power || machine.defaultValues[json.material].power
            json.speed = json.speed || machine.defaultValues[json.material].speed
            json.rate = json.rate || machine.defaultValues[json.material].rate
            json.xCoord = json.xCoord || machine.defaultValues[json.material].xCoord
            json.yCoord = json.yCoord || machine.defaultValues[json.material].yCoord
          }
          break
      }
      break

    case 'Vinyl cutter':
      switch (machine.vendor) {
        case 'Roland':
          if (machine.defaultValues[json.material]) {
            json.switchSort = json.switchSort || machine.defaultValues[json.material].switchSort
            json.origin = json.origin || machine.defaultValues[json.material].origin
            json.diameter = json.diameter || machine.defaultValues[json.material].diameter
            json.offsets = json.offsets || machine.defaultValues[json.material].offsets
            json.overlap = json.overlap || machine.defaultValues[json.material].overlap
            json.error = json.error || machine.defaultValues[json.material].error
            json.threshold = json.threshold || machine.defaultValues[json.material].threshold
            json.merge = json.merge || machine.defaultValues[json.material].merge
            json.order = json.order || machine.defaultValues[json.material].order
            json.sequence = json.sequence || machine.defaultValues[json.material].sequence
            json.power = json.power || machine.defaultValues[json.material].power
            json.speed = json.speed || machine.defaultValues[json.material].speed
            json.xCoord = json.xCoord || machine.defaultValues[json.material].xCoord
            json.yCoord = json.yCoord || machine.defaultValues[json.material].yCoord
          }
          break
      }
      break

    case 'Milling machine':
      switch (machine.vendor) {
        case 'Roland':
          var finishing = json.pcbFinishing || json.waxFinishing
          if (machine.defaultValues[finishing]) {
            json.machines = json.machines || machine.defaultValues[finishing].machines
            json.x = json.x || machine.defaultValues[finishing].x
            json.y = json.y || machine.defaultValues[finishing].y
            json.z = json.z || machine.defaultValues[finishing].z
            json.zjog = json.zjog || machine.defaultValues[finishing].zjog
            json.xhome = json.xhome || machine.defaultValues[finishing].xhome
            json.yhome = json.yhome || machine.defaultValues[finishing].yhome
            json.zhome = json.zhome || machine.defaultValues[finishing].zhome
            json.speed = json.speed || machine.defaultValues[finishing].speed
            json.diameter = json.diameter || machine.defaultValues[finishing].diameter
            json.error = json.error || machine.defaultValues[finishing].error
            json.overlap = json.overlap || machine.defaultValues[finishing].overlap
            json.thickness = json.thickness || machine.defaultValues[finishing].thickness
            json.switchSort = json.switchSort || machine.defaultValues[finishing].switchSort
            json.direction = json.direction || machine.defaultValues[finishing].direction
            json.cutDepth = json.cutDepth || machine.defaultValues[finishing].cutDepth
            json.offsets = json.offsets || machine.defaultValues[finishing].offsets
            json.threshold = json.threshold || machine.defaultValues[finishing].threshold
            json.merge = json.merge || machine.defaultValues[finishing].merge
            json.order = json.order || machine.defaultValues[finishing].order
            json.sequence = json.sequence || machine.defaultValues[finishing].sequence
            json.bottomZ = json.bottomZ || machine.defaultValues[finishing].bottomZ
            json.bottomIntensity = json.bottomIntensity || machine.defaultValues[finishing].bottomIntensity
            json.topZ = json.topZ || machine.defaultValues[finishing].topZ
            json.topIntensity = json.topIntensity || machine.defaultValues[finishing].topIntensity
            json.xz = json.xz || machine.defaultValues[finishing].xz
            json.yz = json.yz || machine.defaultValues[finishing].yz
            json.type = json.type || machine.defaultValues[finishing].type
          }
      }
      break

    case '3D printer':
      switch (machine.vendor) {
                  // TODO: Change parameter name
        case 'Prusa':
          json.machine = machine.defaultValues.machine
          break
      }
      break
  }
}
