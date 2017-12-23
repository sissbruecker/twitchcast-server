const util = require('util');
const castv2Client = require('castv2-client');
const RequestResponseController = castv2Client.RequestResponseController;

function TwitchcastController(client, sourceId, destinationId) {
    RequestResponseController.call(this, client, sourceId, destinationId, 'urn:x-cast:com.google.cast.media');
    this.once('close', onclose);
    const self = this;

    function onclose() {
        self.stop();
    }
}

util.inherits(TwitchcastController, RequestResponseController);

/**
 * Basically a copy of the default media controller except that it adds custom request data for TwitchCast
 * @param media
 * @param options
 * @param callback
 */
TwitchcastController.prototype.load = function (media, options, callback) {

    if(typeof options === 'function' || typeof options === 'undefined') {
        callback = options;
        options = {};
    }

    const data = { type: 'LOAD' };

    data.autoplay = (typeof options.autoplay !== 'undefined')
        ? options.autoplay
        : false;

    data.currentTime = (typeof options.currentTime !== 'undefined')
        ? options.currentTime
        : 0;

    data.activeTrackIds = (typeof options.activeTrackIds !== 'undefined')
        ? options.activeTrackIds
        : [];

    data.repeatMode = (typeof options.repeatMode === "string" &&
        typeof options.repeatMode !== 'undefined')
        ? options.repeatMode
        : "REPEAT_OFF";

    // Add custom Twitchcast data to request
    data.customData = options.customData;

    data.media = media;

    this.request(data, function(err, response) {
        if(err) return callback(err);
        if(response.type === 'LOAD_FAILED') {
            return callback(new Error('Load failed'));
        }
        if(response.type === 'LOAD_CANCELLED') {
            return callback(new Error('Load cancelled'));
        }
        const status = response.status[0];
        callback(null, status);
    });
};

module.exports = TwitchcastController;
