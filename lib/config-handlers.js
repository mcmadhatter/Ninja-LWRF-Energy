var exports = module.exports
 ,  configMessages = require('./config-messages');

/**
 * Called from the driver's config method when a
 * user wants to see a menu to configure the driver
 * @param  {Function} cb Callback to send a response back to the user
 */
exports.menu = function(cb) {
  cb(null,configMessages.menu);
};


/**
 * Called when a user clicks the 'Echo back to me'
 * button we sent in the menu request
 * @param  {Object}   params Parameter object
 * @param  {Function} cb     Callback to send back to the user
 */
exports.registerWithWifiLink = function(params,cb) {
	this.registerWithWifiLink.call();
	cb(null, configMessages.finish);
};

exports.getExistingConfig= function(params,cb) {
	this.getExistingConfig.call(this, params.email_address, params.pin_number);
	cb(null, configMessages.finish);
};