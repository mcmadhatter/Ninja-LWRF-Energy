var stream = require('stream')
  , util = require('util')
  , dgram = require('dgram');

var server = dgram.createSocket("udp4");


// Give our device a stream interface
util.inherits(Device,stream);

// Export it
module.exports=Device;

/**
 * Creates a new Device Object
 *
 * @property {Boolean} readable Whether the device emits data
 * @property {Boolean} writable Whether the data can be actuated
 *
 * @property {Number} G - the channel of this device
 * @property {Number} V - the vendor ID of this device
 * @property {Number} D - the device ID of this device
 *
 * @property {Function} write Called when data is received from the Ninja Platform
 *
 * @fires data - Emit this when you wish to send data to the Ninja Platform
 */
function Device(lwrfType, lWRFId) {

  var self = this;
  this.lwrfType = lwrfType;
  this.lWRFId = lWRFId;

  // This device will emit data
  this.readable = true;
  // This device can be actuated
  this.writeable = true;

  this.G = lWRFId; // G is a string a represents the channel
  this.V = 0; // 0 is Ninja Blocks' device list

  if(lwrfType == "Energy")
  {
    this.D = 242; // 243 is a generic Ninja Blocks energy monitor device

    process.nextTick(function()
    {

    setInterval(function()
    {
      sendRawUDPCommand("000,@?\0");

    }, 30000);

    server.on("message", function (msg, rinfo)
    {
      console.log("LWRF Rx: " + msg + " from " + rinfo.address + ":" + rinfo.port);
      var arr = msg.toString('ascii', 0, rinfo.size).split(',');
      var energy  = arr[1].toString().substr(3);


      // The ninja should return a string in the for, 0,?W=AAA,BBBB,CCCC,DDDD
      // where A is instantaneous consumption, B is ? C is today's consumption and D is yesterday's consumption
      self.emit('data', energy);
      self.emit('today',arr[3].toString());
      self.emit('yesterday',arr[4].toString());
    });

    server.on("listening", function ()
    {
      var address = server.address();
      console.log("server listening " +
      address.address + ":" + address.port);
    });

    server.bind(9761);

    
    });
  }
  else if (lwrfType == "Light")
  {
     this.D = 224;
     console.log('LWRF Registered a light: ' + lWRFId);
  }
    else if (lwrfType == "Socket")
  {
     this.D = 243;
     console.log('LWRF Registered a socket: ' + lWRFId);
  }
  else
  {
    /* do nothing */
  }
};

/**
 * Called whenever there is data from the Ninja Platform
 * This is required if Device.writable = true
 *
 * @param  {String} data The data received
 */
Device.prototype.write = function(data)
{
   var parsed = JSON.parse( data );
   var self = this;

  if(self.lwrfType == "Light") 
  {
    //todo - add support for dimming, and colour
    if(parsed.on == true)
    {
      sendRawUDPCommand("000!" + self.lWRFId + "F1");
    }
    else
    {
      sendRawUDPCommand("000!" + self.lWRFId + "F0");
    }
  }
  else if (self.lWRFId == "Socket")
  {
    if(parsed.on == true)
    {
      sendRawUDPCommand("000!" + self.lWRFId + "F1");
    }
    else
    {
      sendRawUDPCommand("000!" + self.lWRFId + "F0");
    }
  }
  else
  {
    // do nothing
  }
};



function  sendRawUDPCommand(cmd)
{

  var broadcastAddress = "255.255.255.255";
  var message = new Buffer(cmd);


  var client = dgram.createSocket("udp4");
  client.bind(9761);
  client.setBroadcast(true);

  client.send(message, 0, message.length, 9760, broadcastAddress, function(err, bytes)
  {
    if(err) 
    {
      console.log('LWRF err ', err);
    }
    client.close();

  });
  
};
