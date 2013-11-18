exports.menu = {
  "contents":[
    { "type": "paragraph", "text": "Press the button below to register your ninja with the Lightwave RF Wifi Box"},
     { "type": "submit", "name": "Register", "rpc_method": "registerWithWifiLink" },
     { "type": "paragraph", "text": "Enter your email and pin number for the lightwave rf website to download your existing config."},
     { "type": "input_field_text", "field_name": "email_address", "value": "somebody@email.com", "label": "Email address", "placeholder": "somebody@email.com", "required": true},
     { "type": "input_field_text", "field_name": "pin_number", "value": "1234", "label": "Pin Number", "placeholder": "1234", "required": true},
     { "type": "submit", "name": "Get existing config", "rpc_method": "getExistingConfig" },
  ]
};

exports.registerWithWifiLink = {
  "contents":[
  { "type": "paragraph", "text": "Thanks"},
   { "type": "close", "text": "Close" }
  ]
};

exports.getExistingConfig = {
  "contents":[
  { "type": "paragraph", "text": "Thanks"},
   { "type": "close", "text": "Close" }
  ]
};

exports.finish = {
  "finish": true
};
