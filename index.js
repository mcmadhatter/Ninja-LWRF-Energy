var Device = require('./lib/lwrf-energy')
  , util = require('util')
  , stream = require('stream')
  , dgram = require('dgram')
  , configHandlers = require('./lib/config-handlers');

// Give our driver a stream interface
util.inherits(myDriver,stream);

// Our greeting to the user.
var HELLO_WORLD_ANNOUNCEMENT = {
  "contents": [
 { "type": "heading",      "text": "Lightwave RF Energy Monitor driver loaded" },
    { "type": "paragraph",    "text": "The hello world driver has been loaded. You should not see this message again." }
  ]
};

/**
 * Called when our client starts up
 * @constructor
 *
 * @param  {Object} opts Saved/default driver configuration
 * @param  {Object} app  The app event emitter
 * @param  {String} app.id The client serial number
 *
 * @property  {Function} save When called will save the contents of `opts`
 * @property  {Function} config Will be called when config data is received from the Ninja Platform
 *
 * @fires register - Emit this when you wish to register a device (see Device)
 * @fires config - Emit this when you wish to send config data back to the Ninja Platform
 */
function myDriver(opts,app) {

  var self = this;

  app.on('client::up',function(){

    // The client is now connected to the Ninja Platform

    // Check if we have sent an announcement before.
    // If not, send one and save the fact that we have.
    if (!opts.hasSentAnnouncement) {
      self.emit('announcement',HELLO_WORLD_ANNOUNCEMENT);
      opts.hasSentAnnouncement = true;
      self.save();
    }

    // Register a device
    /* Todo - this needs changing to use the drive config, or auto get data from LWRF website.
      Below is an exmaple to set up the energy monitor, and a couple of Lights/sockets (if they are un commented )
      To add more, just cut and paste the   //  self.emit('register', new Device("Light", "R3D5")); and change the 
      r and d numbers to match your room and device.*/
    self.emit('register', new Device("Energy","0000"));
    //self.emit('register', new Device("Light", "R3D5"));
   // self.emit('register', new Device("Light", "R1D1"));
  });
};

/**
 * Called when a user prompts a configuration.
 * If `rpc` is null, the user is asking for a menu of actions
 * This menu should have rpc_methods attached to them
 *
 * @param  {Object}   rpc     RPC Object
 * @param  {String}   rpc.method The method from the last payload
 * @param  {Object}   rpc.params Any input data the user provided
 * @param  {Function} cb      Used to match up requests.
 */
myDriver.prototype.config = function(rpc,cb) {

  var self = this;
  // If rpc is null, we should send the user a menu of what he/she
  // can do.
  // Otherwise, we will try action the rpc method
  if (!rpc) {
    return configHandlers.menu.call(this,cb);
  }
  else if (typeof configHandlers[rpc.method] === "function") {
    return configHandlers[rpc.method].call(this,rpc.params,cb);
  }
  else {
    return cb(true);
  }
};

myDriver.prototype.registerWithWifiLink = function()
{
  console.log('Registering NinjaBlock with WiFi Link');
  var broadcastAddress = "255.255.255.255";
  var message = new Buffer("693,!R1Fa");

  var client = dgram.createSocket("udp4");
  client.bind(9761);
  client.setBroadcast(true);

  client.send(message, 0, message.length, 9760, broadcastAddress, function(err, bytes)
  {
    if(err) 
    {
      console.log('LWRF err ', err);
    }
    else
    {
       console.log('Registering NinjaBlock with WiFi Link Complete');
    }
    client.close();

  });
};





// Export it
module.exports = myDriver;