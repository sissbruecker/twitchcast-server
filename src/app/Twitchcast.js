const util = require('util');
const castv2Client = require('castv2-client');
const Application = castv2Client.Application;
const MediaController = castv2Client.MediaController;
const TwitchcastController = require('./TwitchcastController');

function Twitchcast(client, session) {
    Application.apply(this, arguments);

    this.media = this.createController(MediaController);
    this.twitchcast = this.createController(TwitchcastController);

    this.media.on('status', onstatus);

    const self = this;

    function onstatus(status) {
        self.emit('status', status);
    }
}

Twitchcast.APP_ID = 'DAC1CD8C';

util.inherits(Twitchcast, Application);

Twitchcast.prototype.getStatus = function(callback) {
    this.media.getStatus.apply(this.media, arguments);
};

Twitchcast.prototype.load = function(media, options, callback) {
    this.twitchcast.load.apply(this.twitchcast, arguments);
};

Twitchcast.prototype.play = function(callback) {
    this.media.play.apply(this.media, arguments);
};

Twitchcast.prototype.pause = function(callback) {
    this.media.pause.apply(this.media, arguments);
};

Twitchcast.prototype.stop = function(callback) {
    this.media.stop.apply(this.media, arguments);
};

Twitchcast.prototype.seek = function(currentTime, callback) {
    this.media.seek.apply(this.media, arguments);
};

module.exports = Twitchcast;
