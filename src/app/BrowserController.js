const util = require('util');
const castv2Client = require('castv2-client');
const RequestResponseController = castv2Client.RequestResponseController;

function BrowserController(client, sourceId, destinationId) {
    RequestResponseController.call(this, client, sourceId, destinationId, 'urn:x-cast:com.google.cast.twitchcast.browser');
    this.once('close', onclose);
    const self = this;

    function onclose() {
        self.stop();
    }
}

util.inherits(BrowserController, RequestResponseController);

BrowserController.prototype.load = function (browserData, options, callback) {

    this.request(browserData, function (err) {
        if (err) return callback(err);
        callback(null);
    });
};

module.exports = BrowserController;
