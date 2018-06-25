var Siren = require('siren-client')

module.exports.connect = function (url, cb) {
  var client = new Siren()

  client.on('error', function (err) {
    var conn = {err: err, client: client, entity: null}
    cb(conn)
  })

  client.on('entity', function (entity) {
    var conn = {err: null, client: client, entity: entity}
    cb(conn)
  })

  client.get(url)
}
