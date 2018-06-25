var webdriver = require('selenium-webdriver')
var test = require('tape')
var request = require('supertest')

// const imageAbsolutePath = "C:/Users/mejis/IdeaProjects/piwrapper/tests/app/test.png";
const imageAbsolutePath = '/home/meji/Imágenes/isosceles.png'
const url = 'http://localhost:8888'
var token = ''

var driver = new webdriver
.Builder()
.usingServer()
.withCapabilities({
  // 'browserName': 'phantomjs'
  'browserName': 'chrome'
})
.build()

/* driver.get(url + '/login');

driver.findElements(webdriver.By.css('[href^="/wiki/"]')).then(function(links){
console.log('Found', links.length, 'Wiki links.' )
});
driver.getTitle().then(function(title) {
console.log('Page title is: ' + title);
});
driver.findElements(webdriver.By.className("navbar-navv"))
.then(cheeses => console.log(cheeses.length)); */

login(function () {
  /* driver.findElements(webdriver.By.className("terminal")).then(function(term) {
  test('There are terminal?', function (t) {
  t.notEqual(term[0], undefined);
  t.end();
})
}); */
/* driver.findElements(webdriver.By.id('submitDesign')).then(function(submitBtn) {
submitBtn[0].click();
}); */

  test('API /login', function (t) {
    request(url)
  .post('/api/login')
  .send({ 'name': 'gcornetta',
    'password': '1234'})
  .end(function (err, res) {
    t.error(err, 'No error')
    t.notEqual(res.body.token, undefined)
    token = 'JWT ' + res.body.token
    t.end()
  })
  })

  setMachine('Laser cutter', 'Epilog')
  test('Laser Epilog cut', function (t) {
    driver.get(url + '/dashboard/control/laser/epilog')

    checkIfElementExists('diameter', "showSwitchEpilog('cut');loadEpilogContent('cut')", function () {
      driver.findElement(webdriver.By.name('designfile')).sendKeys(imageAbsolutePath)
      driver.executeScript("document.getElementsByName('xCoord')[0].value = 1")
      driver.executeScript("document.getElementsByName('yCoord')[0].value = 1")
      driver.executeScript("document.getElementsByName('process')[0].value = 'cut'")
      driver.executeScript("document.getElementsByName('material')[0].value = 'cardboard'")

      driver.executeScript("document.getElementsByName('power')[0].value = 1")
      driver.executeScript("document.getElementsByName('speed')[0].value = 1")
      driver.executeScript("document.getElementsByName('rate')[0].value = 1")

      driver.executeScript("document.getElementsByName('diameter')[0].value = 1")
      driver.executeScript("document.getElementsByName('offsets')[0].value = 1")
      driver.executeScript("document.getElementsByName('overlap')[0].value = 1")
      driver.executeScript("document.getElementsByName('error')[0].value = 1")
      driver.executeScript("document.getElementsByName('threshold')[0].value = 1")
      driver.executeScript("document.getElementsByName('merge')[0].value = 1")
      driver.executeScript("document.getElementsByName('order')[0].value = 1")
      driver.executeScript("document.getElementsByName('sequence')[0].value = 1")

      driver.findElements(webdriver.By.id('submitDesign')).then(function (submitBtn) {
        submitBtn[0].click()
      })
      driver.findElements(webdriver.By.className('alert-success'))
    .then(function (alertSuccess) {
      t.equal(alertSuccess.length, 1)
      t.end()
    })
    }, 10)
  })
  test('Laser Epilog cut Error', function (t) {
    driver.get(url + '/dashboard/control/laser/epilog')

    checkIfElementExists('diameter', "showSwitchEpilog('cut');loadEpilogContent('cut')", function () {
      driver.findElement(webdriver.By.name('designfile')).sendKeys(imageAbsolutePath)
      driver.executeScript("document.getElementsByName('xCoord')[0].value = 1")
      driver.executeScript("document.getElementsByName('yCoord')[0].value = 1")
      driver.executeScript("document.getElementsByName('process')[0].value = 'cut'")
      driver.executeScript("document.getElementsByName('material')[0].value = 'lkjh'")

      driver.executeScript("document.getElementsByName('power')[0].value = -100")
      driver.executeScript("document.getElementsByName('speed')[0].value = 101")
      driver.executeScript("document.getElementsByName('rate')[0].value = 1000")

      driver.executeScript("document.getElementsByName('diameter')[0].value = 'aa'")
      driver.executeScript("document.getElementsByName('offsets')[0].value = 1.2")
      driver.executeScript("document.getElementsByName('overlap')[0].value = -50")
      driver.executeScript("document.getElementsByName('error')[0].value = 'aa'")
      driver.executeScript("document.getElementsByName('threshold')[0].value = 1.2")
      driver.executeScript("document.getElementsByName('merge')[0].value = 'aa'")
      driver.executeScript("document.getElementsByName('order')[0].value = 1.2")
      driver.executeScript("document.getElementsByName('sequence')[0].value = 1.3")

      driver.findElements(webdriver.By.id('submitDesign')).then(function (submitBtn) {
        submitBtn[0].click()
      })
      driver.findElements(webdriver.By.className('alert-danger'))
    .then(function (alertDanger) {
      t.equal(alertDanger.length, 14)
      t.end()
    })
    }, 10)
  })
  test('Laser Epilog halftone', function (t) {
    driver.get(url + '/dashboard/control/laser/epilog')

    checkIfElementExists('diameter', "showSwitchEpilog('halftone');loadEpilogContent('halftone')", function () {
      driver.findElement(webdriver.By.name('designfile')).sendKeys(imageAbsolutePath)
      driver.executeScript("document.getElementsByName('xCoord')[0].value = 1")
      driver.executeScript("document.getElementsByName('yCoord')[0].value = 1")
      driver.executeScript("document.getElementsByName('process')[0].value = 'halftone'")
      driver.executeScript("document.getElementsByName('material')[0].value = 'cardboard'")

      driver.executeScript("document.getElementsByName('power')[0].value = 1")
      driver.executeScript("document.getElementsByName('speed')[0].value = 1")
      driver.executeScript("document.getElementsByName('rate')[0].value = 1")

      driver.executeScript("document.getElementsByName('diameter')[0].value = 1")
      driver.executeScript("document.getElementsByName('spotSize')[0].value = 1")
      driver.executeScript("document.getElementsByName('minSpotsize')[0].value = 1")
      driver.executeScript("document.getElementsByName('horSpotspace')[0].value = 1")
      driver.executeScript("document.getElementsByName('verSpotspace')[0].value = 1")
      driver.executeScript("document.getElementsByName('pointSpot')[0].value = 1")

      driver.findElements(webdriver.By.id('submitDesign')).then(function (submitBtn) {
        submitBtn[0].click()
      })
      driver.findElements(webdriver.By.className('alert-success'))
    .then(function (alertSuccess) {
      t.equal(alertSuccess.length, 1)
      t.end()
    })
    }, 10)
  })
  test('Laser Epilog halftone Error', function (t) {
    driver.get(url + '/dashboard/control/laser/epilog')

    checkIfElementExists('diameter', "showSwitchEpilog('halftone');loadEpilogContent('halftone')", function () {
      driver.findElement(webdriver.By.name('designfile')).sendKeys(imageAbsolutePath)
      driver.executeScript("document.getElementsByName('xCoord')[0].value = 1")
      driver.executeScript("document.getElementsByName('yCoord')[0].value = 1")
      driver.executeScript("document.getElementsByName('process')[0].value = 'halftone'")
      driver.executeScript("document.getElementsByName('material')[0].value = 'lkjh'")

      driver.executeScript("document.getElementsByName('power')[0].value = -100")
      driver.executeScript("document.getElementsByName('speed')[0].value = 500")
      driver.executeScript("document.getElementsByName('rate')[0].value = 1000")

      driver.executeScript("document.getElementsByName('diameter')[0].value = -1")
      driver.executeScript("document.getElementsByName('spotSize')[0].value = -1")
      driver.executeScript("document.getElementsByName('minSpotsize')[0].value = -1")
      driver.executeScript("document.getElementsByName('horSpotspace')[0].value = 101")
      driver.executeScript("document.getElementsByName('verSpotspace')[0].value = 1000")
      driver.executeScript("document.getElementsByName('pointSpot')[0].value = 1.1")

      driver.findElements(webdriver.By.id('submitDesign')).then(function (submitBtn) {
        submitBtn[0].click()
      })
      driver.findElements(webdriver.By.className('alert-danger'))
    .then(function (alertDanger) {
      t.equal(alertDanger.length, 7)
      t.end()
    })
    }, 10)
  })

  setMachine('Laser cutter', 'Trotec')
  test('Laser Trotec cut', function (t) {
    driver.get(url + '/dashboard/control/laser/trotec')

    checkIfElementExists('diameter', "showSwitchTrotec('cut');loadTrotecContent('cut')", function () {
      driver.findElement(webdriver.By.name('designfile')).sendKeys(imageAbsolutePath)
      driver.executeScript("document.getElementsByName('xCoord')[0].value = 1")
      driver.executeScript("document.getElementsByName('yCoord')[0].value = 1")
      driver.executeScript("document.getElementsByName('process')[0].value = 'cut'")
      driver.executeScript("document.getElementsByName('material')[0].value = 'cardboard'")
      driver.executeScript("document.getElementsByName('machine')[0].value = 'speedy100'")

      driver.executeScript("document.getElementsByName('power')[0].value = 1")
      driver.executeScript("document.getElementsByName('speed')[0].value = 1")
      driver.executeScript("document.getElementsByName('rate')[0].value = 1")

      driver.executeScript("document.getElementsByName('diameter')[0].value = 1")
      driver.executeScript("document.getElementsByName('offsets')[0].value = 1")
      driver.executeScript("document.getElementsByName('overlap')[0].value = 1")
      driver.executeScript("document.getElementsByName('error')[0].value = 1")
      driver.executeScript("document.getElementsByName('threshold')[0].value = 1")
      driver.executeScript("document.getElementsByName('merge')[0].value = 1")
      driver.executeScript("document.getElementsByName('order')[0].value = 1")
      driver.executeScript("document.getElementsByName('sequence')[0].value = 1")

      driver.findElements(webdriver.By.id('submitDesign')).then(function (submitBtn) {
        submitBtn[0].click()
      })
      driver.findElements(webdriver.By.className('alert-success'))
    .then(function (alertSuccess) {
      t.equal(alertSuccess.length, 1)
      t.end()
    })
    }, 10)
  })
  test('Laser Trotec cut Error', function (t) {
    driver.get(url + '/dashboard/control/laser/trotec')

    checkIfElementExists('diameter', "showSwitchTrotec('cut');loadTrotecContent('cut')", function () {
      driver.findElement(webdriver.By.name('designfile')).sendKeys(imageAbsolutePath)
      driver.executeScript("document.getElementsByName('xCoord')[0].value = 1")
      driver.executeScript("document.getElementsByName('yCoord')[0].value = 1")
      driver.executeScript("document.getElementsByName('process')[0].value = 'cut'")
      driver.executeScript("document.getElementsByName('material')[0].value = 'lkjh'")
      driver.executeScript("document.getElementsByName('machine')[0].value = 'speedy10088'")

      driver.executeScript("document.getElementsByName('power')[0].value = -100")
      driver.executeScript("document.getElementsByName('speed')[0].value = 101")
      driver.executeScript("document.getElementsByName('rate')[0].value = 1000")

      driver.executeScript("document.getElementsByName('diameter')[0].value = 'aa'")
      driver.executeScript("document.getElementsByName('offsets')[0].value = 1.2")
      driver.executeScript("document.getElementsByName('overlap')[0].value = -50")
    // driver.executeScript("document.getElementsByName('error')[0].value = 'aa'");
      driver.executeScript("document.getElementsByName('threshold')[0].value = 1.2")
    // driver.executeScript("document.getElementsByName('merge')[0].value = 'aa'");
      driver.executeScript("document.getElementsByName('order')[0].value = 1.2")
      driver.executeScript("document.getElementsByName('sequence')[0].value = 1.3")

      driver.findElements(webdriver.By.id('submitDesign')).then(function (submitBtn) {
        submitBtn[0].click()
      })
      driver.findElements(webdriver.By.className('alert-danger'))
    .then(function (alertDanger) {
      t.equal(alertDanger.length, 11)
      t.end()
    })
    }, 10)
  })
  test('Laser Trotec halftone', function (t) {
    driver.get(url + '/dashboard/control/laser/trotec')

    checkIfElementExists('diameter', "showSwitchTrotec('halftone');loadTrotecContent('halftone')", function () {
      driver.findElement(webdriver.By.name('designfile')).sendKeys(imageAbsolutePath)
      driver.executeScript("document.getElementsByName('xCoord')[0].value = 1")
      driver.executeScript("document.getElementsByName('yCoord')[0].value = 1")
      driver.executeScript("document.getElementsByName('process')[0].value = 'halftone'")
      driver.executeScript("document.getElementsByName('material')[0].value = 'cardboard'")
      driver.executeScript("document.getElementsByName('machine')[0].value = 'speedy100'")

      driver.executeScript("document.getElementsByName('power')[0].value = 1")
      driver.executeScript("document.getElementsByName('speed')[0].value = 1")
      driver.executeScript("document.getElementsByName('rate')[0].value = 1")

      driver.executeScript("document.getElementsByName('diameter')[0].value = 1")
      driver.executeScript("document.getElementsByName('spotSize')[0].value = 1")
      driver.executeScript("document.getElementsByName('minSpotsize')[0].value = 1")
      driver.executeScript("document.getElementsByName('horSpotspace')[0].value = 1")
      driver.executeScript("document.getElementsByName('verSpotspace')[0].value = 1")
      driver.executeScript("document.getElementsByName('pointSpot')[0].value = 1")

      driver.findElements(webdriver.By.id('submitDesign')).then(function (submitBtn) {
        submitBtn[0].click()
      })
      driver.findElements(webdriver.By.className('alert-success'))
    .then(function (alertSuccess) {
      t.equal(alertSuccess.length, 1)
      t.end()
    })
    }, 10)
  })
  test('Laser Trotec halftone Error', function (t) {
    driver.get(url + '/dashboard/control/laser/trotec')

    checkIfElementExists('diameter', "showSwitchTrotec('halftone');loadTrotecContent('halftone')", function () {
      driver.findElement(webdriver.By.name('designfile')).sendKeys(imageAbsolutePath)
      driver.executeScript("document.getElementsByName('xCoord')[0].value = 1")
      driver.executeScript("document.getElementsByName('yCoord')[0].value = 1")
      driver.executeScript("document.getElementsByName('process')[0].value = 'halftone'")
      driver.executeScript("document.getElementsByName('material')[0].value = 'lkjh'")
      driver.executeScript("document.getElementsByName('machine')[0].value = 'speedy10088'")

      driver.executeScript("document.getElementsByName('power')[0].value = -100")
      driver.executeScript("document.getElementsByName('speed')[0].value = 500")
      driver.executeScript("document.getElementsByName('rate')[0].value = 0")

      driver.executeScript("document.getElementsByName('diameter')[0].value = 'w'")
      driver.executeScript("document.getElementsByName('spotSize')[0].value = 'w'")
      driver.executeScript("document.getElementsByName('minSpotsize')[0].value = -1")
      driver.executeScript("document.getElementsByName('horSpotspace')[0].value = 101")
      driver.executeScript("document.getElementsByName('verSpotspace')[0].value = 1000")
      driver.executeScript("document.getElementsByName('pointSpot')[0].value = 1.1")

      driver.findElements(webdriver.By.id('submitDesign')).then(function (submitBtn) {
        submitBtn[0].click()
      })
      driver.findElements(webdriver.By.className('alert-danger'))
    .then(function (alertDanger) {
      t.equal(alertDanger.length, 12)
      t.end()
    })
    }, 10)
  })

  setMachine('Laser cutter', 'GCC')
  test('Laser GCC cut', function (t) {
    driver.get(url + '/dashboard/control/laser/gcc')

    checkIfElementExists('diameter', "showSwitchGcc('cut');loadGccContent('cut')", function () {
      driver.findElement(webdriver.By.name('designfile')).sendKeys(imageAbsolutePath)
      driver.executeScript("document.getElementsByName('xCoord')[0].value = 1")
      driver.executeScript("document.getElementsByName('yCoord')[0].value = 1")
      driver.executeScript("document.getElementsByName('process')[0].value = 'cut'")
      driver.executeScript("document.getElementsByName('material')[0].value = 'cardboard'")

      driver.executeScript("document.getElementsByName('power')[0].value = 1")
      driver.executeScript("document.getElementsByName('speed')[0].value = 1")
      driver.executeScript("document.getElementsByName('rate')[0].value = 1")

      driver.executeScript("document.getElementsByName('diameter')[0].value = 1")
      driver.executeScript("document.getElementsByName('offsets')[0].value = 1")
      driver.executeScript("document.getElementsByName('overlap')[0].value = 1")
      driver.executeScript("document.getElementsByName('error')[0].value = 1")
      driver.executeScript("document.getElementsByName('threshold')[0].value = 1")
      driver.executeScript("document.getElementsByName('merge')[0].value = 1")
      driver.executeScript("document.getElementsByName('order')[0].value = 1")
      driver.executeScript("document.getElementsByName('sequence')[0].value = 1")

      driver.findElements(webdriver.By.id('submitDesign')).then(function (submitBtn) {
        submitBtn[0].click()
      })
      driver.findElements(webdriver.By.className('alert-success'))
    .then(function (alertSuccess) {
      t.equal(alertSuccess.length, 1)
      t.end()
    })
    }, 10)
  })
  test('Laser GCC cut Error', function (t) {
    driver.get(url + '/dashboard/control/laser/gcc')

    checkIfElementExists('diameter', "showSwitchGcc('cut');loadGccContent('cut')", function () {
      driver.findElement(webdriver.By.name('designfile')).sendKeys(imageAbsolutePath)
      driver.executeScript("document.getElementsByName('xCoord')[0].value = 1")
      driver.executeScript("document.getElementsByName('yCoord')[0].value = 1")
      driver.executeScript("document.getElementsByName('process')[0].value = 'cut'")
      driver.executeScript("document.getElementsByName('material')[0].value = 'lkjh'")

      driver.executeScript("document.getElementsByName('power')[0].value = -100")
      driver.executeScript("document.getElementsByName('speed')[0].value = 101")
      driver.executeScript("document.getElementsByName('rate')[0].value = 1000")

      driver.executeScript("document.getElementsByName('diameter')[0].value = 'aa'")
      driver.executeScript("document.getElementsByName('offsets')[0].value = 1.2")
      driver.executeScript("document.getElementsByName('overlap')[0].value = -50")
      driver.executeScript("document.getElementsByName('error')[0].value = 'aa'")
      driver.executeScript("document.getElementsByName('threshold')[0].value = 1.2")
      driver.executeScript("document.getElementsByName('merge')[0].value = 'aa'")
      driver.executeScript("document.getElementsByName('order')[0].value = 1.2")
      driver.executeScript("document.getElementsByName('sequence')[0].value = 1.3")

      driver.findElements(webdriver.By.id('submitDesign')).then(function (submitBtn) {
        submitBtn[0].click()
      })
      driver.findElements(webdriver.By.className('alert-danger'))
    .then(function (alertDanger) {
      t.equal(alertDanger.length, 14)
      t.end()
    })
    }, 10)
  })

// deleteJobs();
  test('Laser GCC halftone', function (t) {
    driver.get(url + '/dashboard/control/laser/gcc')

    checkIfElementExists('diameter', "showSwitchGcc('halftone');loadGccContent('halftone')", function () {
      driver.findElement(webdriver.By.name('designfile')).sendKeys(imageAbsolutePath)
      driver.executeScript("document.getElementsByName('xCoord')[0].value = 1")
      driver.executeScript("document.getElementsByName('yCoord')[0].value = 1")
      driver.executeScript("document.getElementsByName('process')[0].value = 'halftone'")
      driver.executeScript("document.getElementsByName('material')[0].value = 'cardboard'")

      driver.executeScript("document.getElementsByName('power')[0].value = 1")
      driver.executeScript("document.getElementsByName('speed')[0].value = 1")
      driver.executeScript("document.getElementsByName('rate')[0].value = 1")

      driver.executeScript("document.getElementsByName('diameter')[0].value = 1")
      driver.executeScript("document.getElementsByName('spotSize')[0].value = 1")
      driver.executeScript("document.getElementsByName('minSpotsize')[0].value = 1")
      driver.executeScript("document.getElementsByName('horSpotspace')[0].value = 1")
      driver.executeScript("document.getElementsByName('verSpotspace')[0].value = 1")
      driver.executeScript("document.getElementsByName('pointSpot')[0].value = 1")

      driver.findElements(webdriver.By.id('submitDesign')).then(function (submitBtn) {
        submitBtn[0].click()
      })
      driver.findElements(webdriver.By.className('alert-success'))
    .then(function (alertSuccess) {
      t.equal(alertSuccess.length, 1)
      t.end()
    })
    }, 10)
  })
  test('Laser GCC halftone Error', function (t) {
    driver.get(url + '/dashboard/control/laser/gcc')

    checkIfElementExists('diameter', "showSwitchGcc('halftone');loadGccContent('halftone')", function () {
      driver.findElement(webdriver.By.name('designfile')).sendKeys(imageAbsolutePath)
      driver.executeScript("document.getElementsByName('xCoord')[0].value = 1")
      driver.executeScript("document.getElementsByName('yCoord')[0].value = 1")
      driver.executeScript("document.getElementsByName('process')[0].value = 'halftone'")
      driver.executeScript("document.getElementsByName('material')[0].value = 'lkjh'")

      driver.executeScript("document.getElementsByName('power')[0].value = -100")
      driver.executeScript("document.getElementsByName('speed')[0].value = 500")
      driver.executeScript("document.getElementsByName('rate')[0].value = 1000")

      driver.executeScript("document.getElementsByName('diameter')[0].value = 'w'")
      driver.executeScript("document.getElementsByName('spotSize')[0].value = 'w'")
      driver.executeScript("document.getElementsByName('minSpotsize')[0].value = -1")
      driver.executeScript("document.getElementsByName('horSpotspace')[0].value = 101")
      driver.executeScript("document.getElementsByName('verSpotspace')[0].value = 1000")
      driver.executeScript("document.getElementsByName('pointSpot')[0].value = 1.1")

      driver.findElements(webdriver.By.id('submitDesign')).then(function (submitBtn) {
        submitBtn[0].click()
      })
      driver.findElements(webdriver.By.className('alert-danger'))
    .then(function (alertDanger) {
      t.equal(alertDanger.length, 11)
      t.end()
    })
    }, 10)
  })

  setMachine('Vinyl cutter', 'Roland')
  test('Vinyl Roland', function (t) {
    driver.get(url + '/dashboard/control/vinyl/roland')

    checkIfElementExists('power', "loadEngine('copper')", function () {
      driver.findElement(webdriver.By.name('designfile')).sendKeys(imageAbsolutePath)
      driver.executeScript("document.getElementsByName('material')[0].value = 'copper'")
      driver.executeScript("document.getElementsByName('xCoord')[0].value = 1")
      driver.executeScript("document.getElementsByName('yCoord')[0].value = 1")
      driver.executeScript("document.getElementsByName('diameter')[0].value = 1")
      driver.executeScript("document.getElementsByName('offsets')[0].value = 1")
      driver.executeScript("document.getElementsByName('overlap')[0].value = 1")
      driver.executeScript("document.getElementsByName('error')[0].value = 1")
      driver.executeScript("document.getElementsByName('threshold')[0].value = 1")
      driver.executeScript("document.getElementsByName('merge')[0].value = 1")
      driver.executeScript("document.getElementsByName('order')[0].value = 1")
      driver.executeScript("document.getElementsByName('sequence')[0].value = 1")

      driver.executeScript("document.getElementsByName('power')[0].value = 1")
      driver.executeScript("document.getElementsByName('speed')[0].value = 1")

      driver.findElements(webdriver.By.id('submitDesign')).then(function (submitBtn) {
        submitBtn[0].click()
      })
      driver.findElements(webdriver.By.className('alert-success'))
    .then(function (alertSuccess) {
      t.equal(alertSuccess.length, 1)
      t.end()
    })
    }, 10)
  })
  test('Vinyl Roland Error', function (t) {
    driver.get(url + '/dashboard/control/vinyl/roland')

    checkIfElementExists('power', "loadEngine('copper')", function () {
      driver.findElement(webdriver.By.name('designfile')).sendKeys(imageAbsolutePath)
      driver.executeScript("document.getElementsByName('material')[0].value = 'copper'")
      driver.executeScript("document.getElementsByName('xCoord')[0].value = 1")
      driver.executeScript("document.getElementsByName('yCoord')[0].value = 1")
      driver.executeScript("document.getElementsByName('diameter')[0].value = 'aa'")
      driver.executeScript("document.getElementsByName('offsets')[0].value = 1.2")
      driver.executeScript("document.getElementsByName('overlap')[0].value = -50")
      driver.executeScript("document.getElementsByName('error')[0].value = 'aa'")
      driver.executeScript("document.getElementsByName('threshold')[0].value = 1.2")
      driver.executeScript("document.getElementsByName('merge')[0].value = 'aa'")
      driver.executeScript("document.getElementsByName('order')[0].value = 1.2")
      driver.executeScript("document.getElementsByName('sequence')[0].value = 1.3")

      driver.executeScript("document.getElementsByName('power')[0].value = -100")
      driver.executeScript("document.getElementsByName('speed')[0].value = 101")

      driver.findElements(webdriver.By.id('submitDesign')).then(function (submitBtn) {
        submitBtn[0].click()
      })
      driver.findElements(webdriver.By.className('alert-danger'))
    .then(function (alertDanger) {
      t.equal(alertDanger.length, 13)
      t.end()
    })
    }, 10)
  })

  setMachine('Milling machine', 'Roland')
  test('Milling Roland pcb', function (t) {
    driver.get(url + '/dashboard/control/milling/roland')

    checkIfElementExists('pcbFinishing', "selectFinishing('pcb')", function () {
      checkIfElementExists('cutDepth', "selectFinishing('pcb');loadRolandContent('pcb');setPcbDiv('outline_1_32')", function () {
        driver.findElement(webdriver.By.name('designfile')).sendKeys(imageAbsolutePath)
        driver.executeScript("document.getElementsByName('process')[0].value = 'pcb'")

        driver.executeScript("document.getElementsByName('pcbFinishing')[0].value = 'outline_1_32'")
        driver.executeScript("setPcbDiv('outline_1_32')")
        driver.executeScript("document.getElementsByName('x')[0].value = 1")
        driver.executeScript("document.getElementsByName('y')[0].value = 1")
        driver.executeScript("document.getElementsByName('z')[0].value = 1")
        driver.executeScript("document.getElementsByName('zjog')[0].value = 1")
        driver.executeScript("document.getElementsByName('machines')[0].value = 'mdx_15'")

        driver.executeScript("document.getElementsByName('speed')[0].value = 1")

        driver.executeScript("document.getElementsByName('cutDepth')[1].value = 1")
        driver.executeScript("document.getElementsByName('thickness')[0].value = 1")
        driver.executeScript("document.getElementsByName('diameter')[1].value = 1")
        driver.executeScript("document.getElementsByName('offsets')[1].value = 1")
        driver.executeScript("document.getElementsByName('overlap')[1].value = 1")
        driver.executeScript("document.getElementsByName('error')[1].value = 1")
        driver.executeScript("document.getElementsByName('threshold')[1].value = 1")
        driver.executeScript("document.getElementsByName('merge')[1].value = 1")
        driver.executeScript("document.getElementsByName('order')[1].value = 1")
        driver.executeScript("document.getElementsByName('sequence')[1].value = 1")

        driver.findElements(webdriver.By.id('submitDesign')).then(function (submitBtn) {
          submitBtn[0].click()
        })
        driver.findElements(webdriver.By.className('alert-success'))
      .then(function (alertSuccess) {
        t.equal(alertSuccess.length, 1)
        t.end()
      })
      }, 10)
    }, 10)
  })
  test('Milling Roland pcb Error', function (t) {
    driver.get(url + '/dashboard/control/milling/roland')

    checkIfElementExists('pcbFinishing', "selectFinishing('pcb')", function () {
      checkIfElementExists('cutDepth', "selectFinishing('pcb');loadRolandContent('pcb');setPcbDiv('outline_1_32')", function () {
        driver.findElement(webdriver.By.name('designfile')).sendKeys(imageAbsolutePath)
        driver.executeScript("document.getElementsByName('process')[0].value = 'pcb'")
        driver.executeScript("document.getElementsByName('pcbFinishing')[0].value = 'outline_1_32'")
        driver.executeScript("setPcbDiv('outline_1_32')")
        driver.executeScript("document.getElementsByName('x')[0].value = 'aa'")
        driver.executeScript("document.getElementsByName('y')[0].value = 'aa'")
        driver.executeScript("document.getElementsByName('z')[0].value = 'aa'")
        driver.executeScript("document.getElementsByName('zjog')[0].value = 'aa'")
        driver.executeScript("document.getElementsByName('machines')[0].value = 'lklñpou'")

        driver.executeScript("document.getElementsByName('speed')[0].value = -1")

        driver.executeScript("document.getElementsByName('cutDepth')[1].value = -1")
        driver.executeScript("document.getElementsByName('thickness')[0].value = -1")
        driver.executeScript("document.getElementsByName('diameter')[1].value = -1")
        driver.executeScript("document.getElementsByName('offsets')[1].value = -2")
        driver.executeScript("document.getElementsByName('overlap')[1].value = 0")
        driver.executeScript("document.getElementsByName('error')[1].value = -1")
        driver.executeScript("document.getElementsByName('threshold')[1].value = 2")
        driver.executeScript("document.getElementsByName('merge')[1].value = -0.1")
        driver.executeScript("document.getElementsByName('order')[1].value = 1.1")
        driver.executeScript("document.getElementsByName('sequence')[1].value = 1")

        driver.findElements(webdriver.By.id('submitDesign')).then(function (submitBtn) {
          submitBtn[0].click()
        })
        driver.findElements(webdriver.By.className('alert-danger'))
      .then(function (alertDanger) {
        t.equal(alertDanger.length, 14)
        driver.quit()
        t.end()
      })
      }, 10)
    }, 10)
  })

// driver.quit();
})

function login (callback) {
  driver.get(url + '/login')

  driver.executeScript("document.getElementById('username').setAttribute('value', 'gcornetta')")
  driver.executeScript("document.getElementById('password').setAttribute('value', '1234')")

  driver.findElement(webdriver.By.className('btn-fill')).click().then(callback)
}

function setMachine (type, vendor) {
  test('Set machine to ' + type + ' ' + vendor, function (t) {
    request(url + '')
    .post('/api/machine')
    .set('Authorization', token)
    .send({
      'type': type,
      'vendor': vendor,
      'name': 'testMachine',
      'adcDevice': [{vendor: 'Texas Instruments', device: 'ADS 1115'}],
      'deviceUri': 'serial:/dev/ttyS0?baud=115200',
      'hysteresis': 100,
      'dutyCycle': 10,
      'baudRate': 115200,
      'sampleTime': 100,
      'threshCurr': 1000
    })
    .end(function (err, res) {
      t.error(err, 'No error')
      t.end()
    })
  })
}

/*function deleteJobs () {
  test('DELETE /api/jobs/clear', function (t) {
    request(url)
        .get('/api/jobs/clear')
        .set('Authorization', token)
        .end(function (err, res) {
          t.error(err, 'No error')
          t.equal(res.body.message, 'Jobs clearedd successfully')
          t.end()
        })
  })
}*/

function checkIfElementExists (elementName, functionToExecute, callback, d) {
  var delay = d | 0
  driver.executeScript(functionToExecute).then(function () {
    setTimeout(function () {
      driver.executeScript("return (document.getElementsByName('" + elementName + "').length !== 0)").then(function (result) {
        if (!result) {
          console.log('Refreshing page and retrying')
          driver.navigate().refresh()
          checkIfElementExists(elementName, functionToExecute, callback, delay + 10)
        } else {
          callback()
        }
      })
    }, delay)
  })
}
