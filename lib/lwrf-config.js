var request = require('request');
exports.fetchConfigurationFromLightwave = function(email, pin,cb)
{
  console.log("Updating configure using " + email + ":" + pin);

  request.post(
    'https://lightwaverfhost.co.uk/manager/',
    { form: { email: email, pin: pin } },
    function (error, response, body) {
    	var err = null;
    	var devices = [];
    	if (!error && response.statusCode == 200) {
            //console.log(body)
            var varRegexp = /var ([a-zA-Z]*) = (\[.*?\]);/g;
            var results;
            var config = {};
            while((results=varRegexp.exec(body)) !== null)
            {
              try{
                config[results[1]] = JSON.parse(results[2]);
              } catch(err)
              {
                /* the javascript from lightwaverf is actually invalid json, single quotes are used instead of double. 
                But the important lines are formatted correctly.
                */
              }
            }
            //console.log(config);
            var roomStatus = config.gRoomStatus;
            var roomNames = config.gRoomNames;
            var deviceStatus = config.gDeviceStatus;
            var deviceNames = config.gDeviceNames;
            var itemsPerRoom = 10;
            //console.log(roomStatus);
            
            for(var i = 0; i < roomStatus.length; i++)
            {
              if (roomStatus[i] == 'A')
              {
                 //console.log("Found Room " + roomNames[i]);
                 var startIndex = itemsPerRoom*i;
                 for(var j=startIndex; j < startIndex + itemsPerRoom && j < deviceStatus.length; j++)
                 {
                   var type = null;
                   if (deviceNames[j] == "All Off") {
                      continue;
                   }
                   else if (deviceStatus[j].toUpperCase() == 'D')
                   {
                      type = "Light";               
                   }
                   else if (deviceStatus[j].toUpperCase() == 'O')
                   {
                      type = "Switch";
                   }

                   if (type != null)
                   {
                     device = {};
                     device.id = "R" + (i+1) + "D" + (j+1 - startIndex);
                     device.name = deviceNames[j];
                     device.room = roomNames[i];
                     device.type = type;
                     
                     devices.push(device);
                     //console.log(device);
                   }

                 }
              }

            }
        }else
        {
          err = "Failed to contact LightWaveRF server " + error;
        }

        if (cb)
        {
        	cb(err, devices);
        }
        else
        {
        	console.log("LightWaveRF: No callback specified");
        }
    }
);
};