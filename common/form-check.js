var validationMsg = require('../controllers/lib/messages').validationMsg;

module.exports.checkJSON = function (req, machine){
    var json = req.body;
    switch (machine.type) {
            case 'Laser cutter':
            switch (machine.vendor) {
              case 'Epilog':
              var processes = ["cut", "halftone"];
              var materials = ["cardboard", "acrylic", "wood", "mylar"];
              req.checkBody('process', validationMsg.process).isInArray(processes);
              req.checkBody('material', validationMsg.material).isInArray(materials);

              if (json.process ==  'cut') {
                req.checkBody('diameter', validationMsg.diameter).notEmpty().isFloat();
                req.checkBody('offsets', validationMsg.offsets).notEmpty().isInt();
                req.checkBody('overlap', validationMsg.overlap).notEmpty().isFloat({ min: 1, max: 100 });
                req.checkBody('error', validationMsg.error).notEmpty().isFloat();
                req.checkBody('threshold', validationMsg.threshold).notEmpty().isFloat({ min: 0, max: 1 });
                req.checkBody('merge', validationMsg.merge).notEmpty().isFloat();
                req.checkBody('order', validationMsg.order).notEmpty().isInt();
                req.checkBody('sequence', validationMsg.sequence).notEmpty().isInt();
              }

              if (json.process ==  'halftone') {
                req.checkBody('diameter', validationMsg.diameter).notEmpty().isFloat();
                req.checkBody('spotSize', validationMsg.spotSize).notEmpty().isFloat();
                req.checkBody('minSpotsize', validationMsg.minSpotsize).notEmpty().isInt({ min: 1, max: 100 });
                req.checkBody('horSpotspace', validationMsg.horSpotspace).notEmpty().isInt({ min: 1, max: 100 });
                req.checkBody('verSpotspace', validationMsg.verSpotspace).notEmpty().isInt({ min: 1, max: 100 });
                req.checkBody('pointSpot', validationMsg.pointSpot).notEmpty().isInt();
              }

              req.checkBody('power', validationMsg.power).notEmpty().isInt({ min: 1, max: 100 });
              req.checkBody('speed', validationMsg.speed).notEmpty().isInt({ min: 1, max: 100 });
              req.checkBody('rate', validationMsg.rate).notEmpty().isInt();
              req.checkBody('xCoord', validationMsg.xCoord).notEmpty().isInt({ min: 0, max: 50 });
              req.checkBody('yCoord', validationMsg.yCoord).notEmpty().isInt({ min: 0, max: 50 });
              break;
              case 'GCC':
              var processes = ["cut", "halftone"];
              var materials = ["cardboard", "acrylic", "wood", "mylar"];
              req.checkBody('process', validationMsg.process).isInArray(processes);
              req.checkBody('material', validationMsg.material).isInArray(materials);

              if (json.process ==  'cut') {
                req.checkBody('diameter', validationMsg.diameter).notEmpty().isFloat();
                req.checkBody('offsets', validationMsg.offsets).notEmpty().isInt();
                req.checkBody('overlap', validationMsg.overlap).notEmpty().isInt({ min: 1, max: 100 });
                req.checkBody('error', validationMsg.error).notEmpty().isFloat();
                req.checkBody('threshold', validationMsg.threshold).notEmpty().isFloat({ min: 0, max: 1 });
                req.checkBody('merge', validationMsg.merge).notEmpty().isFloat();
                req.checkBody('order', validationMsg.order).notEmpty().isInt();
                req.checkBody('sequence', validationMsg.sequence).notEmpty().isInt();
              }

              if (json.process ==  'halftone') {
                req.checkBody('diameter', validationMsg.diameter).notEmpty().isFloat();
                req.checkBody('spotSize', validationMsg.spotSize).notEmpty().isFloat();
                req.checkBody('minSpotsize', validationMsg.minSpotsize).notEmpty().isInt({ min: 1, max: 100 });
                req.checkBody('horSpotspace', validationMsg.horSpotspace).notEmpty().isInt({ min: 1, max: 100 });
                req.checkBody('verSpotspace', validationMsg.verSpotspace).notEmpty().isInt({ min: 1, max: 100 });
                req.checkBody('pointSpot', validationMsg.pointSpot).notEmpty().isInt();
              }

              req.checkBody('power', validationMsg.power).notEmpty().isInt({ min: 1, max: 100 });
              req.checkBody('speed', validationMsg.speed).notEmpty().isInt({ min: 1, max: 100 });
              req.checkBody('rate', validationMsg.rate).notEmpty().isInt();
              req.checkBody('xCoord', validationMsg.xCoord).notEmpty().isInt({ min: 0, max: 50 });
              req.checkBody('yCoord', validationMsg.yCoord).notEmpty().isInt({ min: 0, max: 50 });
              break;
              case 'Trotec':
              var processes = ["cut", "halftone"];
              var materials = ["cardboard", "acrylic", "wood", "mylar"];
              var machines = ["speedy100", "speedy100FlexxCO2", "speedy100FlexxFiber", "speedy400"];
              req.checkBody('process', validationMsg.process).isInArray(processes);
              req.checkBody('material', validationMsg.material).isInArray(materials);
              req.checkBody('machine', validationMsg.machine).isInArray(machines);

              if (json.process ==  'cut') {
                req.checkBody('diameter', validationMsg.diameter).notEmpty().isFloat();
                req.checkBody('offsets', validationMsg.offsets).notEmpty().isInt();
                req.checkBody('overlap', validationMsg.overlap).notEmpty().isInt({ min: 1, max: 100 });
                req.checkBody('error', validationMsg.error).notEmpty().isFloat();
                req.checkBody('threshold', validationMsg.threshold).notEmpty().isFloat({ min: 0, max: 1 });
                req.checkBody('merge', validationMsg.merge).notEmpty().isFloat();
                req.checkBody('order', validationMsg.order).notEmpty().isInt();
                req.checkBody('sequence', validationMsg.sequence).notEmpty().isInt();
              }

              if (json.process ==  'halftone') {
                req.checkBody('diameter', validationMsg.diameter).notEmpty().isFloat();
                req.checkBody('spotSize', validationMsg.spotSize).notEmpty().isFloat();
                req.checkBody('minSpotsize', validationMsg.minSpotsize).notEmpty().isInt({ min: 1, max: 100 });
                req.checkBody('horSpotspace', validationMsg.horSpotspace).notEmpty().isInt({ min: 1, max: 100 });
                req.checkBody('verSpotspace', validationMsg.verSpotspace).notEmpty().isInt({ min: 1, max: 100 });
                req.checkBody('pointSpot', validationMsg.pointSpot).notEmpty().isInt();
              }

              req.checkBody('power', validationMsg.power).notEmpty().isInt({ min: 1, max: 100 });
              req.checkBody('speed', validationMsg.speed).notEmpty().isInt({ min: 1, max: 100 });
              req.checkBody('rate', validationMsg.rate).notEmpty().isInt();
              req.checkBody('xCoord', validationMsg.xCoord).notEmpty().isInt({ min: 0, max: 50 });
              req.checkBody('yCoord', validationMsg.yCoord).notEmpty().isInt({ min: 0, max: 50 });
              break;
            }
            break;
            case 'Vinyl cutter':
            switch (machine.vendor) {
              case 'GCC':
              //TODO: Implement this machine (don't work in http://fabmodules.org/)
              break;
              case 'Roland':
              var materials = ["vinyl", "epoxy", "copper"];
              req.checkBody('switchSort', validationMsg.switchSort).notEmpty();
              req.checkBody('origin', validationMsg.origin).notEmpty();
              req.checkBody('material', validationMsg.material).isInArray(materials);
              req.checkBody('diameter', validationMsg.diameter).notEmpty().isFloat();
              req.checkBody('offsets', validationMsg.offsets).notEmpty().isInt();
              req.checkBody('overlap', validationMsg.overlap).notEmpty().isInt({ min: 1, max: 100 });
              req.checkBody('error', validationMsg.error).notEmpty().isFloat();
              req.checkBody('threshold', validationMsg.threshold).notEmpty().isFloat({ min: 0, max: 1 });
              req.checkBody('merge', validationMsg.merge).notEmpty().isFloat();
              req.checkBody('order', validationMsg.order).notEmpty().isInt();
              req.checkBody('sequence', validationMsg.sequence).notEmpty().isInt();
              req.checkBody('power', validationMsg.power).notEmpty().isInt({ min: 1, max: 100 });
              req.checkBody('speed', validationMsg.speed).notEmpty().isInt({ min: 1, max: 100 });
              req.checkBody('xCoord', validationMsg.xCoord).notEmpty().isInt({ min: 0, max: 50 });
              req.checkBody('yCoord', validationMsg.yCoord).notEmpty().isInt({ min: 0, max: 50 });
              break;
            }
            break;
            case 'Milling machine':
            switch (machine.vendor) {
              case 'Roland':
              var processes = ["pcb", "wax"];
              var machines = ["mdx_15", "mdx_20", "mdx_40", "srm_20"];
              req.checkBody('process', validationMsg.material).isInArray(processes);
              req.checkBody('machines', validationMsg.machines).isInArray(machines);

              req.checkBody('x', validationMsg.x).notEmpty().isFloat();
              req.checkBody('y', validationMsg.y).notEmpty().isFloat();
              req.checkBody('z', validationMsg.z).notEmpty().isFloat();
              req.checkBody('zjog', validationMsg.zjog).notEmpty().isFloat();
              req.checkBody('origin', validationMsg.origin).notEmpty();
              req.checkBody('power', validationMsg.power).notEmpty().isInt({ min: 1, max: 100 });
              req.checkBody('speed', validationMsg.speed).notEmpty().isInt({ min: 1, max: 100 });
              req.checkBody('rate', validationMsg.rate).notEmpty().isFloat();

              req.checkBody('diameter', validationMsg.diameter).notEmpty().isFloat({ min: 0});
              req.checkBody('error', validationMsg.error).notEmpty().isFloat({ min: 0});
              req.checkBody('overlap', validationMsg.overlap).notEmpty().isInt({ min: 1, max: 100 });


              //Process
              switch (json.process){
                case 'pcb':
                pcbFinishing = ['outline_1_32', 'traces_0_010', 'traces_1_64'];
                req.checkBody('pcbFinishing', validationMsg.pcbFinishing).isInArray(pcbFinishing);
                switch (json.pcbFinishing){
                  case 'outline_1_32':
                  req.checkBody('thickness', validationMsg.thickness).notEmpty().isFloat({ min: 0});
                  case 'traces_0_010':
                  case 'traces_1_64':
                  req.checkBody('switchSort', validationMsg.switchSort).notEmpty();
                  req.checkBody('direction', validationMsg.direction).notEmpty();
                  req.checkBody('cutDepth', validationMsg.cutDepth).notEmpty().isFloat({ min: 0});
                  req.checkBody('offsets', validationMsg.offsets).notEmpty().isFloat({ min: -1});
                  req.checkBody('threshold', validationMsg.threshold).notEmpty().isFloat({ min: 0, max: 1 });
                  req.checkBody('merge', validationMsg.merge).notEmpty().isFloat({ min: 0});
                  req.checkBody('order', validationMsg.order).notEmpty().isInt();
                  req.checkBody('sequence', validationMsg.sequence).notEmpty().isInt();
                  break;
                }
                break;
                case 'wax':
                waxFinishing = ['rough_cut', 'finish_cut'];
                req.checkBody('waxFinishing', validationMsg.waxFinishing).isInArray(waxFinishing);
                req.checkBody('bottomZ', validationMsg.bottomZ).notEmpty().isFloat();
                req.checkBody('bottomIntensity', validationMsg.bottomIntensity).notEmpty().isFloat({ min: 0, max: 1 });
                req.checkBody('topZ', validationMsg.topZ).notEmpty().isFloat();
                req.checkBody('topIntensity', validationMsg.topIntensity).notEmpty().isFloat({ min: 0, max: 1 });
                switch (json.waxFinishing){
                  case 'rough_cut':
                  req.checkBody('switchSort', validationMsg.switchSort).notEmpty();
                  req.checkBody('direction', validationMsg.direction).notEmpty();
                  req.checkBody('cutDepth', validationMsg.cutDepth).notEmpty().isFloat();
                  req.checkBody('offsets', validationMsg.offsets).notEmpty().isFloat({ min: -1});
                  req.checkBody('merge', validationMsg.merge).notEmpty().isFloat({ min: 0});
                  req.checkBody('order', validationMsg.order).notEmpty().isInt();
                  req.checkBody('sequence', validationMsg.sequence).notEmpty().isInt();
                  break;
                  case 'finish_cut':
                  types = ['flat', 'ball'];
                  req.checkBody('type', validationMsg.type).isInArray(types);
                  req.checkBody('xz', validationMsg.xz).notEmpty();
                  req.checkBody('yz', validationMsg.yz).notEmpty();
                  break;
                }
                break;
              }
              break;
              case 'Othermill':
              //TODO: Implement this machine
              break;
            }
            break;
            case 'Laser micromachining':
            //TODO: Implement this machine
            break;
          }
          return req.validationErrors();
}