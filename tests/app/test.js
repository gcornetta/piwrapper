var test = require('tape')
var request = require('supertest')

var app = require('../../app.js').app
const imagePath = 'tests/app/test.png'
var token = ''
var libFifo = require('../../lib/fifo/job-fifo.js')

test('GET /', function (t) {
  request(app)
  .get('/')
  .expect(200)
  .end(function (err, res) {
    t.error(err, 'No error')
    t.end()
  })
})

test('GET /dashboard', function (t) {
  request(app)
  .get('/dashboard')
  .expect(302)
  .end(function (err, res) {
    t.error(err, 'No error')
    t.end()
  })
})

test('/login', function (t) {
  request(app)
  .post('/login')
  .field('username', 'gcornetta')
  .field('password', '1234')
  .end(function (err, res) {
    t.error(err, 'No error')
    t.end()
  })
})

test('API /login', function (t) {
  request(app)
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

test('POST /api/jobs Epilog cut Good', function (t) {
  request(app)
  .post('/api/jobs')
  .set('Authorization', token)
  .query({
    'process': 'cut',
    'material': 'cardboard',
    'diameter': 1.1,
    'offsets': 1,
    'overlap': 1,
    'threshold': 0.1,
    'merge': 1000,
    'order': 5,
    'sequence': 99,
    'power': 1,
    'speed': 100,
    'rate': 999,
    'xCoord': 50,
    'yCoord': 0,
    'error': 0
  })
  .attach('file', imagePath)
  .end(function (err, res) {
    t.error(err, 'No error')
    t.notEqual(res.body.jobId, undefined)
    t.end()
  })
})

test('POST /api/jobs Epilog cut Bad', function (t) {
  request(app)
  .post('/api/jobs')
  .set('Authorization', token)
  .query({
    'process': 'cut',
    'material': 'aeoeo',
    'offsets': 1.1,
    'overlap': 0,
    'threshold': 1.1,
    'order': 5.1,
    'sequence': 99.1,
    'power': 10.1,
    'speed': 0,
    'rate': 999.1,
    'xCoord': 51,
    'yCoord': -1
  })
      .attach('file', imagePath)
  .end(function (err, res) {
    t.error(err, 'No error')
    t.equal(JSON.stringify(res.body.details), JSON.stringify([ { param: 'material', msg: 'Invalid material', value: 'aeoeo' }, { param: 'offsets', msg: 'Invalid number of offsets', value: '1.1' }, { param: 'overlap', msg: 'Invalid offset overlap', value: '0' }, { param: 'threshold', msg: 'Invalid threshold', value: '1.1' }, { param: 'order', msg: 'Invalid sort order weight', value: '5.1' }, { param: 'sequence', msg: 'Invalid sort sequence weight', value: '99.1' }, { param: 'power', msg: 'Invalid engine power', value: '10.1' }, { param: 'speed', msg: 'Invalid engine speed', value: '0' }, { param: 'rate', msg: 'Invalid engine rate', value: '999.1' }, { param: 'xCoord', msg: 'Invalid X coordinate', value: '51' }, { param: 'yCoord', msg: 'Invalid Y coordinate', value: '-1' } ]))
    t.end()
  })
})

test('POST /api/jobs Epilog halftone Good', function (t) {
  request(app)
  .post('/api/jobs')
  .set('Authorization', token)
  .query({
    'process': 'halftone',
    'material': 'acrylic',
    'diameter': 1.1,
    'spotSize': 1,
    'minSpotsize': 1,
    'horSpotspace': 100,
    'verSpotspace': 50,
    'pointSpot': 5,
    'power': 1,
    'speed': 100,
    'rate': 999,
    'xCoord': 50,
    'yCoord': 0,
    'error': 0
  })
      .attach('file', imagePath)
  .end(function (err, res) {
    t.error(err, 'No error')
    t.notEqual(res.body.jobId, undefined)
    t.end()
  })
})

test('POST /api/jobs Epilog halftone Bad', function (t) {
  request(app)
  .post('/api/jobs')
  .set('Authorization', token)
  .query({
    'process': 'halftone',
    'material': 'ñkj',
    'minSpotsize': 0,
    'horSpotspace': 101,
    'verSpotspace': 555,
    'pointSpot': 5.1,
    'power': 10.1,
    'speed': 0,
    'rate': 999.1,
    'xCoord': 51,
    'yCoord': -1
  })
      .attach('file', imagePath)
  .end(function (err, res) {
    t.error(err, 'No error')
    t.equal(JSON.stringify(res.body.details), JSON.stringify([ { param: 'material', msg: 'Invalid material', value: 'ñkj' }, { param: 'minSpotsize', msg: 'Invalid minimum spot size', value: '0' }, { param: 'horSpotspace', msg: 'Invalid horizontal spot spacing', value: '101' }, { param: 'verSpotspace', msg: 'Invalid vertical spot spacing', value: '555' }, { param: 'pointSpot', msg: 'Invalid points per spot', value: '5.1' }, { param: 'power', msg: 'Invalid engine power', value: '10.1' }, { param: 'speed', msg: 'Invalid engine speed', value: '0' }, { param: 'rate', msg: 'Invalid engine rate', value: '999.1' }, { param: 'xCoord', msg: 'Invalid X coordinate', value: '51' }, { param: 'yCoord', msg: 'Invalid Y coordinate', value: '-1' } ]))
    t.end()
  })
})

setMachine('Laser cutter', 'GCC')

test('POST /api/jobs GCC cut Good', function (t) {
  request(app)
  .post('/api/jobs')
  .set('Authorization', token)
  .query({
    'process': 'cut',
    'material': 'cardboard',
    'diameter': 1.1,
    'offsets': 1,
    'overlap': 1,
    'threshold': 0.1,
    'merge': 1000,
    'order': 5,
    'sequence': 99,
    'power': 1,
    'speed': 100,
    'rate': 999,
    'xCoord': 50,
    'yCoord': 0,
    'error': 0
  })
      .attach('file', imagePath)
  .end(function (err, res) {
    t.error(err, 'No error')
    t.notEqual(res.body.jobId, undefined)
    t.end()
  })
})

test('POST /api/jobs GCC cut Bad', function (t) {
  request(app)
  .post('/api/jobs')
  .set('Authorization', token)
  .query({
    'process': 'cut',
    'material': 'aeoeo',
    'offsets': 1.1,
    'overlap': 0,
    'threshold': 1.1,
    'order': 5.1,
    'sequence': 99.1,
    'power': 10.1,
    'speed': 0,
    'rate': 999.1,
    'xCoord': 51,
    'yCoord': -1
  })
      .attach('file', imagePath)
  .end(function (err, res) {
    t.error(err, 'No error')
    t.equal(JSON.stringify(res.body.details), JSON.stringify([{'param': 'material', 'msg': 'Invalid material', 'value': 'aeoeo'}, {'param': 'diameter', 'msg': 'Invalid tool diameter'}, {'param': 'diameter', 'msg': 'Invalid tool diameter'}, {'param': 'offsets', 'msg': 'Invalid number of offsets', 'value': '1.1'}, {'param': 'overlap', 'msg': 'Invalid offset overlap', 'value': '0'}, {'param': 'error', 'msg': 'Invalid path error'}, {'param': 'error', 'msg': 'Invalid path error'}, {'param': 'threshold', 'msg': 'Invalid threshold', 'value': '1.1'}, {'param': 'merge', 'msg': 'Invalid sort merge diameter multiple'}, {'param': 'merge', 'msg': 'Invalid sort merge diameter multiple'}, {'param': 'order', 'msg': 'Invalid sort order weight', 'value': '5.1'}, {'param': 'sequence', 'msg': 'Invalid sort sequence weight', 'value': '99.1'}, {'param': 'power', 'msg': 'Invalid engine power', 'value': '10.1'}, {'param': 'speed', 'msg': 'Invalid engine speed', 'value': '0'}, {'param': 'rate', 'msg': 'Invalid engine rate', 'value': '999.1'}, {'param': 'xCoord', 'msg': 'Invalid X coordinate', 'value': '51'}, {'param': 'yCoord', 'msg': 'Invalid Y coordinate', 'value': '-1'}]))
    t.end()
  })
})

test('POST /api/jobs GCC halftone Good', function (t) {
  request(app)
  .post('/api/jobs')
  .set('Authorization', token)
  .query({
    'process': 'halftone',
    'material': 'acrylic',
    'diameter': 1.1,
    'spotSize': 1,
    'minSpotsize': 1,
    'horSpotspace': 100,
    'verSpotspace': 50,
    'pointSpot': 5,
    'power': 1,
    'speed': 100,
    'rate': 999,
    'xCoord': 50,
    'yCoord': 0,
    'error': 0
  })
      .attach('file', imagePath)
  .end(function (err, res) {
    t.error(err, 'No error')
    t.notEqual(res.body.jobId, undefined)
    t.end()
  })
})

test('POST /api/jobs GCC halftone Bad', function (t) {
  request(app)
  .post('/api/jobs')
  .set('Authorization', token)
  .query({
    'process': 'halftone',
    'material': 'ñkj',
    'minSpotsize': 0,
    'horSpotspace': 101,
    'verSpotspace': 555,
    'pointSpot': 5.1,
    'power': 10.1,
    'speed': 0,
    'rate': 999.1,
    'xCoord': 51,
    'yCoord': -1
  })
      .attach('file', imagePath)
  .end(function (err, res) {
    t.error(err, 'No error')
    t.equal(JSON.stringify(res.body.details), JSON.stringify([{'param': 'material', 'msg': 'Invalid material', 'value': 'ñkj'}, {'param': 'diameter', 'msg': 'Invalid tool diameter'}, {'param': 'diameter', 'msg': 'Invalid tool diameter'}, {'param': 'spotSize', 'msg': 'Invalid spot size'}, {'param': 'spotSize', 'msg': 'Invalid spot size'}, {'param': 'minSpotsize', 'msg': 'Invalid minimum spot size', 'value': '0'}, {'param': 'horSpotspace', 'msg': 'Invalid horizontal spot spacing', 'value': '101'}, {'param': 'verSpotspace', 'msg': 'Invalid vertical spot spacing', 'value': '555'}, {'param': 'pointSpot', 'msg': 'Invalid points per spot', 'value': '5.1'}, {'param': 'power', 'msg': 'Invalid engine power', 'value': '10.1'}, {'param': 'speed', 'msg': 'Invalid engine speed', 'value': '0'}, {'param': 'rate', 'msg': 'Invalid engine rate', 'value': '999.1'}, {'param': 'xCoord', 'msg': 'Invalid X coordinate', 'value': '51'}, {'param': 'yCoord', 'msg': 'Invalid Y coordinate', 'value': '-1'}]))
    t.end()
  })
})

setMachine('Laser cutter', 'Trotec')

test('POST /api/jobs Trotec cut Good', function (t) {
  request(app)
  .post('/api/jobs')
  .set('Authorization', token)
  .query({
    'process': 'cut',
    'material': 'cardboard',
    'machine': 'speedy100',
    'diameter': 1.1,
    'offsets': 1,
    'overlap': 1,
    'threshold': 0.1,
    'merge': 1000,
    'order': 5,
    'sequence': 99,
    'power': 1,
    'speed': 100,
    'rate': 999,
    'xCoord': 50,
    'yCoord': 0,
    'error': 0
  })
      .attach('file', imagePath)
  .end(function (err, res) {
    t.error(err, 'No error')
    t.notEqual(res.body.jobId, undefined)
    t.end()
  })
})

test('POST /api/jobs Trotec cut Bad', function (t) {
  request(app)
  .post('/api/jobs')
  .set('Authorization', token)
  .query({
    'process': 'cut',
    'material': 'aeoeo',
    'machine': 'aeoeo',
    'offsets': 1.1,
    'overlap': 0,
    'threshold': 1.1,
    'order': 5.1,
    'sequence': 99.1,
    'power': 10.1,
    'speed': 0,
    'rate': 999.1,
    'xCoord': 51,
    'yCoord': -1
  })
      .attach('file', imagePath)
  .end(function (err, res) {
    t.error(err, 'No error')
    t.equal(JSON.stringify(res.body.details), JSON.stringify([{'param': 'material', 'msg': 'Invalid material', 'value': 'aeoeo'}, {'param': 'machine', 'msg': 'A machine is required', 'value': 'aeoeo'}, {'param': 'diameter', 'msg': 'Invalid tool diameter'}, {'param': 'diameter', 'msg': 'Invalid tool diameter'}, {'param': 'offsets', 'msg': 'Invalid number of offsets', 'value': '1.1'}, {'param': 'overlap', 'msg': 'Invalid offset overlap', 'value': '0'}, {'param': 'error', 'msg': 'Invalid path error'}, {'param': 'error', 'msg': 'Invalid path error'}, {'param': 'threshold', 'msg': 'Invalid threshold', 'value': '1.1'}, {'param': 'merge', 'msg': 'Invalid sort merge diameter multiple'}, {'param': 'merge', 'msg': 'Invalid sort merge diameter multiple'}, {'param': 'order', 'msg': 'Invalid sort order weight', 'value': '5.1'}, {'param': 'sequence', 'msg': 'Invalid sort sequence weight', 'value': '99.1'}, {'param': 'power', 'msg': 'Invalid engine power', 'value': '10.1'}, {'param': 'speed', 'msg': 'Invalid engine speed', 'value': '0'}, {'param': 'rate', 'msg': 'Invalid engine rate', 'value': '999.1'}, {'param': 'xCoord', 'msg': 'Invalid X coordinate', 'value': '51'}, {'param': 'yCoord', 'msg': 'Invalid Y coordinate', 'value': '-1'}]))
    t.end()
  })
})

test('POST /api/jobs Trotec halftone Good', function (t) {
  request(app)
  .post('/api/jobs')
  .set('Authorization', token)
  .query({
    'process': 'halftone',
    'material': 'acrylic',
    'machine': 'speedy100',
    'diameter': 1.1,
    'spotSize': 1,
    'minSpotsize': 1,
    'horSpotspace': 100,
    'verSpotspace': 50,
    'pointSpot': 5,
    'power': 1,
    'speed': 100,
    'rate': 999,
    'xCoord': 50,
    'yCoord': 0,
    'error': 0
  })
      .attach('file', imagePath)
  .end(function (err, res) {
    t.error(err, 'No error')
    t.notEqual(res.body.jobId, undefined)
    t.end()
  })
})

test('POST /api/jobs Trotec halftone Bad', function (t) {
  request(app)
  .post('/api/jobs')
  .set('Authorization', token)
  .query({
    'process': 'halftone',
    'material': 'aeoeo',
    'machine': 'aeoeo',
    'minSpotsize': 0,
    'horSpotspace': 101,
    'verSpotspace': 555,
    'pointSpot': 5.1,
    'power': 10.1,
    'speed': 0,
    'rate': 999.1,
    'xCoord': 51,
    'yCoord': -1
  })
      .attach('file', imagePath)
  .end(function (err, res) {
    t.error(err, 'No error')
    t.equal(JSON.stringify(res.body.details), JSON.stringify([{'param': 'material', 'msg': 'Invalid material', 'value': 'aeoeo'}, {'param': 'machine', 'msg': 'A machine is required', 'value': 'aeoeo'}, {'param': 'diameter', 'msg': 'Invalid tool diameter'}, {'param': 'diameter', 'msg': 'Invalid tool diameter'}, {'param': 'spotSize', 'msg': 'Invalid spot size'}, {'param': 'spotSize', 'msg': 'Invalid spot size'}, {'param': 'minSpotsize', 'msg': 'Invalid minimum spot size', 'value': '0'}, {'param': 'horSpotspace', 'msg': 'Invalid horizontal spot spacing', 'value': '101'}, {'param': 'verSpotspace', 'msg': 'Invalid vertical spot spacing', 'value': '555'}, {'param': 'pointSpot', 'msg': 'Invalid points per spot', 'value': '5.1'}, {'param': 'power', 'msg': 'Invalid engine power', 'value': '10.1'}, {'param': 'speed', 'msg': 'Invalid engine speed', 'value': '0'}, {'param': 'rate', 'msg': 'Invalid engine rate', 'value': '999.1'}, {'param': 'xCoord', 'msg': 'Invalid X coordinate', 'value': '51'}, {'param': 'yCoord', 'msg': 'Invalid Y coordinate', 'value': '-1'}]))
    t.end()
  })
})

setMachine('Vinyl cutter', 'Roland')

test('POST /api/jobs Roland Vinyl Good', function (t) {
  request(app)
  .post('/api/jobs')
  .set('Authorization', token)
  .query({
    'switchSort': true,
    'origin': 0,
    'material': 'epoxy',
    'diameter': 1.1,
    'offsets': 1,
    'overlap': 1,
    'error': 0,
    'threshold': 0.1,
    'merge': 1000,
    'order': 5,
    'sequence': 99,
    'power': 1,
    'speed': 100,
    'xCoord': 50,
    'yCoord': 0
  })
      .attach('file', imagePath)
  .end(function (err, res) {
    t.error(err, 'No error')
    t.notEqual(res.body.jobId, undefined)
    t.end()
  })
})

test('POST /api/jobs Roland Vinyl Bad', function (t) {
  request(app)
  .post('/api/jobs')
  .set('Authorization', token)
  .query({
    'switchSort': true,
    'origin': 0,
    'material': 'aeoeo',
    'offsets': 1.1,
    'overlap': 0,
    'threshold': 1.1,
    'order': 5.1,
    'sequence': 99.1,
    'xCoord': 51,
    'yCoord': -1
  })
      .attach('file', imagePath)
  .end(function (err, res) {
    t.error(err, 'No error')
    t.equal(JSON.stringify(res.body.details), JSON.stringify([{'param': 'material', 'msg': 'Invalid material', 'value': 'aeoeo'}, {'param': 'offsets', 'msg': 'Invalid number of offsets', 'value': '1.1'}, {'param': 'overlap', 'msg': 'Invalid offset overlap', 'value': '0'}, {'param': 'threshold', 'msg': 'Invalid threshold', 'value': '1.1'}, {'param': 'order', 'msg': 'Invalid sort order weight', 'value': '5.1'}, {'param': 'sequence', 'msg': 'Invalid sort sequence weight', 'value': '99.1'}, {'param': 'xCoord', 'msg': 'Invalid X coordinate', 'value': '51'}, {'param': 'yCoord', 'msg': 'Invalid Y coordinate', 'value': '-1'}]))
    t.end()
  })
})

setMachine('Milling machine', 'Roland')

test('POST /api/jobs Milling Roland pcb Good', function (t) {
  request(app)
  .post('/api/jobs')
  .set('Authorization', token)
  .query({
    'process': 'pcb',
    'machines': 'mdx_15',
    'x': 1,
    'y': 1,
    'z': 1,
    'zjog': 0.1,
    'origin': 1000,
    'power': 5,
    'speed': 99,
    'rate': 99,
    'diameter': 99,
    'error': 99,
    'overlap': 1,
    'pcbFinishing': 'outline_1_32',
    'thickness': 1.1,
    'switchSort': 1.1,
    'direction': 1,
    'cutDepth': 0,
    'offsets': -1,
    'threshold': 1,
    'merge': 0,
    'order': 99,
    'sequence': 1
  })
      .attach('file', imagePath)
  .end(function (err, res) {
    t.error(err, 'No error')
    t.notEqual(res.body.jobId, undefined)
    t.end()
  })
})

test('POST /api/jobs Milling Roland pcb Bad', function (t) {
  request(app)
  .post('/api/jobs')
  .set('Authorization', token)
  .query({
    'process': 'pcb',
    'machines': 'mdx_157',
    'origin': '',
    'diameter': -1,
    'error': -2,
    'overlap': 101,
    'pcbFinishing': 'outline_1_32',
    'thickness': -0.1,
    'cutDepth': -0.3,
    'offsets': -1.1,
    'threshold': 1.1,
    'merge': -0.1,
    'order': 99.1,
    'sequence': 1.3
  })
      .attach('file', imagePath)
  .end(function (err, res) {
    t.error(err, 'No error')
    t.equal(JSON.stringify(res.body.details), JSON.stringify([{'param': 'machines', 'msg': 'Invalid machine', 'value': 'mdx_157'}, {'param': 'diameter', 'msg': 'Invalid tool diameter', 'value': '-1'}, {'param': 'error', 'msg': 'Invalid path error', 'value': '-2'}, {'param': 'overlap', 'msg': 'Invalid offset overlap', 'value': '101'}, {'param': 'thickness', 'msg': 'Invalid thickness', 'value': '-0.1'}]))
    t.end()
  })
})

test('POST /api/jobs Milling Roland wax rough_cut Good', function (t) {
  request(app)
  .post('/api/jobs')
  .set('Authorization', token)
  .query({
    'process': 'wax',
    'machines': 'mdx_15',
    'x': 1,
    'y': 1,
    'z': 1,
    'zjog': 0.1,
    'origin': 1000,
    'power': 5,
    'speed': 99,
    'rate': 99,
    'diameter': 99,
    'error': 99,
    'overlap': 1,
    'waxFinishing': 'rough_cut',
    'bottomZ': 1.1,
    'bottomIntensity': 1,
    'topZ': 1,
    'topIntensity': 0,

    'switchSort': -1,
    'direction': 1,
    'cutDepth': 0,
    'offsets': 99,
    'merge': 9.9,
    'order': 99,
    'sequence': 99
  })
      .attach('file', imagePath)
  .end(function (err, res) {
    t.error(err, 'No error')
    t.notEqual(res.body.jobId, undefined)
    t.end()
  })
})

test('POST /api/jobs Milling Roland wax rough_cut Bad', function (t) {
  request(app)
  .post('/api/jobs')
  .set('Authorization', token)
  .query({
    'process': 'wax',
    'machines': 'mdx_157',
    'origin': '',
    'diameter': -1,
    'error': -2,
    'overlap': 101,
    'waxFinishing': 'rough_cut',
    'bottomIntensity': -1,
    'topZ': '',
    'topIntensity': 20,

    'cutDepth': '',
    'offsets': -2,
    'merge': -9.9,
    'order': 9.9,
    'sequence': 99.9
  })
      .attach('file', imagePath)
  .end(function (err, res) {
    t.error(err, 'No error')
    t.equal(JSON.stringify(res.body.details), JSON.stringify([{'param': 'machines', 'msg': 'Invalid machine', 'value': 'mdx_157'}, {'param': 'diameter', 'msg': 'Invalid tool diameter', 'value': '-1'}, {'param': 'error', 'msg': 'Invalid path error', 'value': '-2'}, {'param': 'overlap', 'msg': 'Invalid offset overlap', 'value': '101'}, {'param': 'bottomIntensity', 'msg': 'Invalid bottom intensity', 'value': '-1'}, {'param': 'topIntensity', 'msg': 'Invalid top intensity', 'value': '20'}, {'param': 'offsets', 'msg': 'Invalid number of offsets', 'value': '-2'}, {'param': 'merge', 'msg': 'Invalid sort merge diameter multiple', 'value': '-9.9'}, {'param': 'order', 'msg': 'Invalid sort order weight', 'value': '9.9'}, {'param': 'sequence', 'msg': 'Invalid sort sequence weight', 'value': '99.9'}]))
    t.end()
  })
})

test('POST /api/jobs Milling Roland wax finish_cut Good', function (t) {
  request(app)
  .post('/api/jobs')
  .set('Authorization', token)
  .query({
    'process': 'wax',
    'machines': 'mdx_15',
    'x': 1,
    'y': 1,
    'z': 1,
    'zjog': 0.1,
    'origin': 1000,
    'power': 5,
    'speed': 99,
    'rate': 99,
    'diameter': 99,
    'error': 99,
    'overlap': 1,
    'waxFinishing': 'finish_cut',
    'bottomZ': 1.1,
    'bottomIntensity': 1,
    'topZ': 1,
    'topIntensity': 0,

    'type': 'flat',
    'xz': -2,
    'yz': -9.9
  })
      .attach('file', imagePath)
  .end(function (err, res) {
    t.error(err, 'No error')
    t.notEqual(res.body.jobId, undefined)
    t.end()
  })
})

test('POST /api/jobs Milling Roland wax finish_cut Bad', function (t) {
  request(app)
  .post('/api/jobs')
  .set('Authorization', token)
  .query({
    'process': 'wax',
    'machines': 'mdx_157',
    'origin': '',
    'diameter': -1,
    'error': -2,
    'overlap': 101,
    'waxFinishing': 'finish_cut',
    'bottomIntensity': -1,
    'topZ': '',
    'topIntensity': 20,
    'type': ''
  })
      .attach('file', imagePath)
  .end(function (err, res) {
    t.error(err, 'No error')
    t.equal(JSON.stringify(res.body.details), JSON.stringify([{'param': 'machines', 'msg': 'Invalid machine', 'value': 'mdx_157'}, {'param': 'diameter', 'msg': 'Invalid tool diameter', 'value': '-1'}, {'param': 'error', 'msg': 'Invalid path error', 'value': '-2'}, {'param': 'overlap', 'msg': 'Invalid offset overlap', 'value': '101'}, {'param': 'bottomIntensity', 'msg': 'Invalid bottom intensity', 'value': '-1'}, {'param': 'topIntensity', 'msg': 'Invalid top intensity', 'value': '20'}]))
    t.end()
  })
})

test('GET /api/jobs', function (t) {
  cleanJobsQueue(libFifo.getJobs(), 'global', function () {
    cleanJobsQueue(libFifo.getJobs(), 'api', function () {
      addJob(t, function () {
        addJob(t, function () {
          addJob(t, function () {
            request(app)
                .get('/api/jobs')
                .set('Authorization', token)
                .end(function (err, res) {
                  t.error(err, 'No error')
                  t.equal(res.body.jobs.length, 3)
                  t.end()
                })
          })
        })
      })
    })
  })
})

test('DELETE /api/jobs/:jobid', function (t) {
  addJob(t, function (jobId) {
    request(app)
    .get('/api/jobs')
    .set('Authorization', token)
    .end(function (err, res) {
      t.error(err, 'No error')
      t.equal(res.body.jobs.length, 4)

      request(app)
      .delete('/api/jobs/' + jobId)
      .set('Authorization', token)
      .end(function (err, res) {
        t.error(err, 'No error')

        request(app)
        .get('/api/jobs')
        .set('Authorization', token)
        .end(function (err, res) {
          t.error(err, 'No error')
          t.equal(res.body.jobs.length, 3)
          t.end()
        })
      })
    })
  })
})

test('GET /api/jobs/:jobid', function (t) {
  addJob(t, function (jobId) {
    request(app)
    .get('/api/jobs/' + jobId)
    .set('Authorization', token)
    .end(function (err, res) {
      t.error(err, 'No error')
      var addedJob = res.body.job
      t.equal(addedJob.jobId, jobId)
      t.end()
    })
  })
})

test('GET /api/jobs/:jobid Fail', function (t) {
  request(app)
  .get('/api/jobs/incorrectJobId')
  .set('Authorization', token)
  .end(function (err, res) {
    t.error(err, 'No error')
    t.equal(res.body.job, undefined)
    t.end()
  })
})

test('CLEAN jobFifo', function (t) {
  cleanJobsQueue(libFifo.getJobs(), 'global', function () {
    cleanJobsQueue(libFifo.getJobs(), 'local', function () {
      t.end()
    })
  })
})

test('PUT /api/jobs/:jobid', function (t) {
  addJob(t, function (jobId) {
    request(app)
    .put('/api/jobs/' + jobId)
    .set('Authorization', token)
    .query({
      'process': 'wax',
      'machines': 'mdx_15',
      'x': 1,
      'y': 1,
      'z': 1,
      'zjog': 1,
      'origin': 1,
      'power': 1,
      'speed': 1,
      'rate': 1,
      'diameter': 1,
      'error': 1,
      'overlap': 1,
      'waxFinishing': 'finish_cut',
      'bottomZ': 1,
      'bottomIntensity': 1,
      'topZ': 1,
      'topIntensity': 1,

      'type': 'flat',
      'xz': 1,
      'yz': 1
    })
    .end(function (err, res) {
      t.error(err, 'No error')
      var updatedJob = {}
      if (res.body.job) {
        updatedJob = res.body.job
      }
      t.equal(updatedJob.error, '1')
      t.equal(updatedJob.topZ, '1')
      t.equal(updatedJob.xz, '1')
      t.end()
    })
  })
})

function setMachine (type, vendor) {
  test('Set machine to ' + type + ' ' + vendor, function (t) {
    request(app)
        .post('/api/machine')
        .set('Authorization', token)
        .query({
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

function addJob (t, callback) {
  request(app)
  .post('/api/jobs')
  .set('Authorization', token)
  .query({
    'process': 'wax',
    'machines': 'mdx_15',
    'x': 1,
    'y': 1,
    'z': 1,
    'zjog': 0.1,
    'origin': 1000,
    'power': 5,
    'speed': 99,
    'rate': 99,
    'diameter': 99,
    'error': 99,
    'overlap': 1,
    'waxFinishing': 'finish_cut',
    'bottomZ': 1.1,
    'bottomIntensity': 1,
    'topZ': 1,
    'topIntensity': 0,

    'type': 'flat',
    'xz': -2,
    'yz': -9.9
  })
      .attach('file', imagePath)
  .end(function (err, res) {
    t.error(err, 'No error')
    t.notEqual(res.body.jobId, undefined)
    callback(res.body.jobId)
  })
}

test('CLEAN jobFifo', function (t) {
  cleanJobsQueue(libFifo.getJobs(), 'global', function () {
    cleanJobsQueue(libFifo.getJobs(), 'local', function () {
      t.end()
    })
  })
})

test('FIFO Push and gets', function (t) {
  var job1 = {'jobId': 'id1', 'userId': 'user1', 'status': 'queued', 'form': {}, 'jobPath': '/wololo'}
  libFifo.push(job1, 'local', function (err, job) {
    t.error(err, 'No error')
    t.equal(job, job1)

    var retJob = libFifo.getJobById(job1.jobId)
    t.equal(retJob, job1)

    libFifo.acceptJobTEST(job1.jobId, function () {
      var retJob = libFifo.getNextJob()
      t.equal(retJob, job1)
      t.end()
    })
  })
})

test('CLEAN jobFifo', function (t) {
  cleanJobsQueue(libFifo.getJobs(), 'global', function () {
    cleanJobsQueue(libFifo.getJobs(), 'local', function () {
      t.end()
    })
  })
})

test('FIFO Priority rotation test', function (t) {
  var job1 = {'jobId': 'id1', 'userId': 'user1', 'status': 'queued', 'form': {}, 'jobPath': '/wololo'}
  var job2 = {'jobId': 'id2', 'userId': 'user1', 'status': 'queued', 'form': {}, 'jobPath': '/wololo'}
  var job3 = {'jobId': 'id3', 'userId': 'user1', 'status': 'queued', 'form': {}, 'jobPath': '/wololo'}
  var job4 = {'jobId': 'id4', 'userId': 'user1', 'status': 'queued', 'form': {}, 'jobPath': '/wololo'}
  var job5 = {'jobId': 'id5', 'userId': 'user2', 'status': 'queued', 'form': {}, 'jobPath': '/wololo'}
  var job6 = {'jobId': 'id6', 'userId': 'user2', 'status': 'queued', 'form': {}, 'jobPath': '/wololo'}
  var job7 = {'jobId': 'id7', 'userId': 'user2', 'status': 'queued', 'form': {}, 'jobPath': '/wololo'}
  var job8 = {'jobId': 'id8', 'userId': 'user2', 'status': 'queued', 'form': {}, 'jobPath': '/wololo'}
  var job9 = {'jobId': 'id9', 'userId': 'user3', 'status': 'queued', 'form': {}, 'jobPath': '/wololo'}
  var job10 = {'jobId': 'id10', 'userId': 'user3', 'status': 'queued', 'form': {}, 'jobPath': '/wololo'}
  var job11 = {'jobId': 'id11', 'userId': 'user3', 'status': 'queued', 'form': {}, 'jobPath': '/wololo'}

  testAddJob(t, job1, function () {
    testAddJob(t, job2, function () {
      testAddJob(t, job3, function () {
        testAddJob(t, job4, function () {
          testAddJob(t, job5, function () {
            testAddJob(t, job6, function () {
              testAddJob(t, job7, function () {
                testAddJob(t, job8, function () {
                  testAddJob(t, job9, function () {
                    testAddJob(t, job10, function () {
                      testAddJob(t, job11, function () {
                        var retJob = libFifo.lastJobCompleted()
                        t.equal(retJob, job1)
                        retJob = libFifo.lastJobCompleted()
                        t.equal(retJob, job5)
                        retJob = libFifo.lastJobCompleted()
                        t.equal(retJob, job9)
                        retJob = libFifo.lastJobCompleted()
                        t.equal(retJob, job2)
                        retJob = libFifo.lastJobCompleted()
                        t.equal(retJob, job6)
                        retJob = libFifo.lastJobCompleted()
                        t.equal(retJob, job10)
                        retJob = libFifo.lastJobCompleted()
                        t.equal(retJob, job3)
                        retJob = libFifo.lastJobCompleted()
                        t.equal(retJob, job7)
                        retJob = libFifo.lastJobCompleted()
                        t.equal(retJob, job11)
                        retJob = libFifo.lastJobCompleted()
                        t.equal(retJob, job4)
                        retJob = libFifo.lastJobCompleted()
                        t.equal(retJob, job8)
                        t.end()
                      })
                    })
                  })
                })
              })
            })
          })
        })
      })
    })
  })
})

test('FIFO User push limit', function (t) {
  var job1 = {'jobId': 'id1', 'userId': 'user1', 'status': 'queued', 'form': {}, 'jobPath': '/wololo'}
  addJobAndAccept(job1, 'local', function (err, job) {
    t.error(err, 'No error')
    t.equal(job, job1)

    job1 = {'jobId': 'id2', 'userId': 'user2', 'status': 'queued', 'form': {}, 'jobPath': '/wololo'}
    addJobAndAccept(job1, 'local', function (err, job) {
      t.error(err, 'No error')
      t.equal(job, job1)

      job1 = {'jobId': 'id3', 'userId': 'user3', 'status': 'queued', 'form': {}, 'jobPath': '/wololo'}
      addJobAndAccept(job1, 'local', function (err, job) {
        t.error(err, 'No error')
        t.equal(job, job1)

        job1 = {'jobId': 'id4', 'userId': 'user4', 'status': 'queued', 'form': {}, 'jobPath': '/wololo'}
        addJobAndAccept(job1, 'local', function (err, job) {
          t.error(err, 'No error')
          t.equal(job, job1)

          job1 = {'jobId': 'id5', 'userId': 'user5', 'status': 'queued', 'form': {}, 'jobPath': '/wololo'}
          addJobAndAccept(job1, 'local', function (err, job) {
            t.error(err, 'No error')
            t.equal(job, job1)

            job1 = {'jobId': 'id6', 'userId': 'user6', 'status': 'queued', 'form': {}, 'jobPath': '/wololo'}
            addJobAndAccept(job1, 'local', function (err, job) {
              var error = ''
              if (err) {
                error = err.err
              }
              t.equal(error, 'Job not added. User limit exceeded')
              t.equal(job, undefined)
              t.end()
            })
          })
        })
      })
    })
  })
})

test('FIFO Jobs per user push limit', function (t) {
  var job1 = {'jobId': 'id6', 'userId': 'user5', 'status': 'queued', 'form': {}, 'jobPath': '/wololo'}
  addJobAndAccept(job1, 'local', function (err, job) {
    t.error(err, 'No error')
    t.equal(job, job1)

    job1 = {'jobId': 'id7', 'userId': 'user1', 'status': 'queued', 'form': {}, 'jobPath': '/wololo'}
    addJobAndAccept(job1, 'local', function (err, job) {
      t.error(err, 'No error')
      t.equal(job, job1)

      job1 = {'jobId': 'id8', 'userId': 'user1', 'status': 'queued', 'form': {}, 'jobPath': '/wololo'}
      addJobAndAccept(job1, 'local', function (err, job) {
        t.error(err, 'No error')
        t.equal(job, job1)

        job1 = {'jobId': 'id9', 'userId': 'user1', 'status': 'queued', 'form': {}, 'jobPath': '/wololo'}
        addJobAndAccept(job1, 'local', function (err, job) {
          t.error(err, 'No error')
          t.equal(job, job1)

          job1 = {'jobId': 'id10', 'userId': 'user1', 'status': 'queued', 'form': {}, 'jobPath': '/wololo'}
          addJobAndAccept(job1, 'local', function (err, job) {
            t.error(err, 'No error')
            t.equal(job, job1)

            job1 = {'jobId': 'id11', 'userId': 'user1', 'status': 'queued', 'form': {}, 'jobPath': '/wololo'}
            addJobAndAccept(job1, 'local', function (err, job) {
              var error = ''
              if (err) {
                error = err.err
              }
              t.equal(error, 'Job not added. Jobs per user limit exceeded')
              t.equal(job, undefined)
              t.end()
            })
          })
        })
      })
    })
  })
})

test('FIFO Job update', function (t) {
  var job1 = {'jobId': 'id6', 'userId': 'user5', 'status': 'queued', 'form': {}, 'jobPath': '/wololo'}
  var jobToUpdate = {'jobId': 'id6', 'userId': 'user1', 'status': 'queued', 'form': {}, 'jobPath': '/wololo'}
  libFifo.update(jobToUpdate, 'local', function (err, job) {
    t.error(err, 'No error')
    t.equal(JSON.stringify(job), JSON.stringify(job1))

    job1.status = 'Updated'
    libFifo.update(job1, 'local', function (err, job) {
      t.error(err, 'No error')
      t.equal(JSON.stringify(job), JSON.stringify(job1))
      t.end()
    })
  })
})

test('CLEAN jobFifo', function (t) {
  cleanJobsQueue(libFifo.getJobs(), 'global', function () {
    cleanJobsQueue(libFifo.getJobs(), 'local', function () {
      t.end()
    })
  })
})

test('FIFO local and api change test', function (t) {
  var job1 = {'jobId': 'id1', 'userId': 'user1', 'status': 'queued', 'form': {}, 'jobPath': '/wololo'}
  var job2 = {'jobId': 'id2', 'userId': 'user1', 'status': 'queued', 'form': {}, 'jobPath': '/wololo'}
  var job3 = {'jobId': 'id3', 'userId': 'user1', 'status': 'queued', 'form': {}, 'jobPath': '/wololo'}
  var job4 = {'jobId': 'id4', 'userId': 'user1', 'status': 'queued', 'form': {}, 'jobPath': '/wololo'}
  var job5 = {'jobId': 'id5', 'userId': 'user2', 'status': 'queued', 'form': {}, 'jobPath': '/wololo'}
  var job6 = {'jobId': 'id6', 'userId': 'user2', 'status': 'queued', 'form': {}, 'jobPath': '/wololo'}
  var job7 = {'jobId': 'id7', 'userId': 'user2', 'status': 'queued', 'form': {}, 'jobPath': '/wololo'}
  var job8 = {'jobId': 'id8', 'userId': 'user2', 'status': 'queued', 'form': {}, 'jobPath': '/wololo'}
  var job9 = {'jobId': 'id9', 'userId': 'user3', 'status': 'queued', 'form': {}, 'jobPath': '/wololo'}
  var job10 = {'jobId': 'id10', 'userId': 'user3', 'status': 'queued', 'form': {}, 'jobPath': '/wololo'}
  var job11 = {'jobId': 'id11', 'userId': 'user3', 'status': 'queued', 'form': {}, 'jobPath': '/wololo'}

  addJobAndAccept(job1, 'global', function (err, job) {
    t.error(err, 'No error')
    t.equal(job, job1)
    addJobAndAccept(job2, 'global', function (err, job) {
      t.error(err, 'No error')
      t.equal(job, job2)
      addJobAndAccept(job3, 'global', function (err, job) {
        t.error(err, 'No error')
        t.equal(job, job3)
        addJobAndAccept(job4, 'local', function (err, job) {
          t.error(err, 'No error')
          t.equal(job, job4)
          addJobAndAccept(job5, 'local', function (err, job) {
            t.error(err, 'No error')
            t.equal(job, job5)
            addJobAndAccept(job6, 'local', function (err, job) {
              t.error(err, 'No error')
              t.equal(job, job6)
              addJobAndAccept(job7, 'local', function (err, job) {
                t.error(err, 'No error')
                t.equal(job, job7)
                addJobAndAccept(job8, 'global', function (err, job) {
                  t.error(err, 'No error')
                  t.equal(job, job8)
                  addJobAndAccept(job9, 'global', function (err, job) {
                    t.error(err, 'No error')
                    t.equal(job, job9)
                    addJobAndAccept(job10, 'global', function (err, job) {
                      t.error(err, 'No error')
                      t.equal(job, job10)
                      addJobAndAccept(job11, 'global', function (err, job) {
                        t.error(err, 'No error')
                        t.equal(job, job11)

                        var retJob = libFifo.lastJobCompleted()
                        t.equal(retJob, job4)
                        retJob = libFifo.lastJobCompleted()
                        t.equal(retJob, job1)
                        retJob = libFifo.lastJobCompleted()
                        t.equal(retJob, job5)
                        retJob = libFifo.lastJobCompleted()
                        t.equal(retJob, job8)
                        retJob = libFifo.lastJobCompleted()
                        t.equal(retJob, job6)
                        retJob = libFifo.lastJobCompleted()
                        t.equal(retJob, job9)
                        retJob = libFifo.lastJobCompleted()
                        t.equal(retJob, job7)
                        retJob = libFifo.lastJobCompleted()
                        t.equal(retJob, job2)
                        retJob = libFifo.lastJobCompleted()
                        t.equal(retJob, job10)
                        retJob = libFifo.lastJobCompleted()
                        t.equal(retJob, job3)
                        retJob = libFifo.lastJobCompleted()
                        t.equal(retJob, job11)
                        t.end()
                        process.exit()
                      })
                    })
                  })
                })
              })
            })
          })
        })
      })
    })
  })
})

function cleanJobsQueue (jobs, caller, callback) {
  if (jobs.length > 0) {
    console.log("removeJOb")
    libFifo.removeJob(jobs.pop().jobId, caller, function () {
      console.log("----")
      cleanJobsQueue(jobs, caller, callback)
    })
  } else {
    callback()
  }
}

function addJobAndAccept (j, caller, callback) {
  libFifo.push(j, caller, function (err, job) {
    if (err) {
      callback(err, job)
    } else {
      libFifo.acceptJobTEST(j.jobId, callback)
    }
  })
}

function testAddJob (t, job, callback) {
  libFifo.push(job, 'global', function (err, retJob) {
    t.error(err, 'No error')
    t.equal(retJob, job)
    libFifo.acceptJobTEST(job.jobId, callback)
  })
}
