var Device = require('./lib/lwrf-energy')
  , configLWRF = require('./lib/lwrf-config')
  , util = require('util')
  , stream = require('stream')
  , dgram = require('dgram')
  , sleep = require('sleep')
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


/* for a lightswicth gist try https://gist.github.com/mcmadhatter/73a95b9ebe2b8f5f5b34 */
/* for a switch gist try https://gist.github.com/mcmadhatter/23f29dc81e2c3d029212 */

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
  this._log = app.log;
  this._opts = opts;

  if ( !this._opts.deviceList ) {
    this._opts.deviceList = [];
  }
 

  if ( !this._opts.gotConfig ) {
    this._opts.gotConfig = false;
 
  }

    if ( !this._opts.test ) {
    this._opts.test = true;
 
  }
   this.registeredDevices = {};

 
  app.on('client::up',function(){

    // The client is now connected to the Ninja Platform
    // Register a device
   
    if(opts.gotConfig == true)
    {
  
      for ( var i = 0; i < opts.deviceList.length; i++ )
      {
        self.emit('register', new Device(this, opts.deviceList[i].type, opts.deviceList[i].id, opts.deviceList[i].name));
      }

      self.emit('register', new Device(this,"Energy","0000", "Energy Monitor"));
    }

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

  if (!rpc) {
    return configHandlers.menu.call(this,cb);
  }

  switch (rpc.method) {
    /* configuring the hub */
    case 'registerWithWifiLink':
      return configHandlers.registerWithWifiLink.call(this,rpc.params,cb);
      break;
    case 'getExistingConfig':
      return configHandlers.getExistingConfig.call(this,rpc.params,cb);
      break;
    

    
    /* */
    default: return cb(true); break;
  }
   
};

myDriver.prototype.registerWithWifiLink = function()
{
  console.log('Registering NinjaBlock with WiFi Link');
  var broadcastAddress = "255.255.255.255";
  var message = new Buffer("693,!R1Fa");

  var client = dgram.createSocket("udp4");
  client.on("listening",function () {
    client.setBroadcast(true);
    client.send(message, 0, message.length, 9760, broadcastAddress, function(err, bytes)
    {
      if(err) 
      {
        console.log('Registering NinjaBlock with WiFi Link Failed:', err);
      }
      else
      {
         console.log('Registering NinjaBlock with WiFi Link Complete');
      }
      client.close();
    });  
  });

  client.bind();

  
};


myDriver.prototype.getExistingConfig = function(email_address, pin_number)
{
 var self = this;

  configLWRF.fetchConfigurationFromLightwave(email_address, pin_number, function(err, devices)
  {
    if(err) 
    {
      console.log('LWRF err ', err);
    }
    else
    {
      
       console.log('LWRF devices: ', devices);


      self._opts.deviceList = [];
       self._opts.gotConfig = true;

      for ( var i = 0; i < devices.length; i++ ) {
        self._opts.deviceList.push(devices[i]);
      }
      self.save();

       for ( var i = 0; i < self._opts.deviceList.length; i++ )
      {
        sleep.sleep(1);
        self.emit('register', new Device(self, self._opts.deviceList[i].type, self._opts.deviceList[i].id, self._opts.deviceList[i].name));
      }
     
    }

  });

}




// Export it
module.exports = myDriver;


