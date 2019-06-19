const util = require('util');
const castv2Client = require('castv2-client');
const RequestResponseController = castv2Client.RequestResponseController;

function TwitchEmbedController(client, sourceId, destinationId) {
    RequestResponseController.call(this, client, sourceId, destinationId, 'urn:x-cast:com.google.cast.twitch-embed');
    this.once('close', onclose);
    const self = this;

    function onclose() {
        self.stop();
    }
}

util.inherits(TwitchEmbedController, RequestResponseController);

TwitchEmbedController.prototype.sendCommand = function (command, options, callback) {

    this.request(command, function (err) {
        if (err) return callback(err);
        callback(null);
    });
};

module.exports = TwitchEmbedController;
