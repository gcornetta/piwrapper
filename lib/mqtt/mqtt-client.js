var mqtt    = require('mqtt');
//var client  = mqtt.connect(process.env.MQTTBROKER);

module.exports.mqttSend(broker, topic, msg, callback){
  var client  = mqtt.connect(broker);

  client.on('connect', function(){
    //outcoming status messages
    //var topic = 'fabrication/' + getMachineId() + '/status';
    client.publish(topic, msg);
    callback(null, 'Message sent to broker', true);
  });

  client.on('error', function(){
    callback(null, 'Connection error', false);
  });
}

module.exports.mqttReceive(topic, callback){
  var client  = mqtt.connect(broker);

  client.on('message', function(topic, msg){
    callback(null, 'Message received', msg.toString());
    client.end();
  });

  client.on('error', function(){
    callback(null, 'Connection error', null);
  });
}

