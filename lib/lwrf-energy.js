var stream = require('stream')
  , util = require('util')
  , dgram = require('dgram');

var server = dgram.createSocket("udp4");

var msgCount = 000;
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
function Device(driver , lwrfType, lWRFId, lShortName) {

  var self = this;
  this.lwrfType = lwrfType;
  this.lWRFId = lWRFId;

  // This device will emit data
  this.readable = true;
  // This device can be actuated
  this.writeable = true;

  this.G = lWRFId; // G is a string a represents the channel
  this.V = 0; // 0 is Ninja Blocks' device list
  this.name= lShortName;


  if(lwrfType == "Energy")
  {
    this.D = 242; // 243 is a generic Ninja Blocks energy monitor device

    process.nextTick(function()
    {

    setInterval(function()
    {
      sendRawUDPCommand(",@?\0");

    }, 30000);

    server.on("message", function (msg, rinfo)
    {
     // console.log("LWRF Rx: " + msg + " from " + rinfo.address + ":" + rinfo.port);
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
    else if (lwrfType == "Switch")
  {
     this.D = 207;
     console.log('LWRF Registered a switch: ' + lWRFId);
  }
  else
  {
    /* do nothing */
  }

  this.driver = driver;
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
      sendRawUDPCommand(",!" + self.lWRFId + "F1\0" );
    }
    else
    {
      sendRawUDPCommand(",!" + self.lWRFId + "F0\0");
    }
  }
  else if (self.lWRFId == "Socket")
  {
    if(parsed.on == true)
    {
      sendRawUDPCommand(",!" + self.lWRFId + "F1\0");
    }
    else
    {
      sendRawUDPCommand(",!" + self.lWRFId + "F0\0");
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
 var stopProcessing = false;
 var idx = 0;

  var client = dgram.createSocket("udp4");
  client.bind(9761);
  client.setBroadcast(true);


  while((idx < 4 ) && (stopProcessing == false))
  {
    var messageRepeat = new Buffer(msgCount.toString() + cmd);

    msgCount++;
    if(msgCount > 999)
    {
      msgCount = 000;
    }
    client.send(messageRepeat, 0, messageRepeat.length, 9760, broadcastAddress, function(err, bytes)
    { 
      if(err) 
      {
        console.log('LWRF err ', err);
        stopProcessing = true;
      }
    }); 
    idx++;
  }
    
    client.close();

  
};
