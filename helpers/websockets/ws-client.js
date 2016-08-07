var W3CWebSocket = require('websocket').w3cwebsocket;

module.exports.wsSendMsg = function (server, protocol, msg, callback) { 
   var client = new W3CWebSocket(server, protocol);
 
   client.onerror = function() {
      callback (null, 'Connection error: server unreachable.', false);
   };
 
   client.onopen = function() { 
      if (client.readyState === client.OPEN) {
            client.send(msg);
            callback (null, 'Request forwarded to server.', true );
      }
   };
     
   /*client.onclose = function() {
      callback (null, 'Request forwarded.', true);
   };*/
}