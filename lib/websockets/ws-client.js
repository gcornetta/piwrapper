var W3CWebSocket = require('websocket').w3cwebsocket
var connMessages = require('./lib/messages')

var connMsg = connMessages.websocketMsg

module.exports.wsSendMsg = function (server, protocol, msg, callback) {
  var client = new W3CWebSocket(server, protocol)

  client.onerror = function () {
    callback(null, connMsg.connError, false)
  }

  client.onopen = function () {
    if (client.readyState === client.OPEN) {
      client.send(msg)
      callback(null, connMsg.connSuccess, true)
    }
  }

  /* client.onclose = function() {
   callback (null, 'Request forwarded.', true);
   }; */
}
