const util = require('util');
const castv2Client = require('castv2-client');
const Application = castv2Client.Application;
const Controller = require('./TwitchEmbedController');

function TwitchEmbed(client, session) {
    Application.apply(this, arguments);

    this.controller = this.createController(Controller);

    this.controller.on('status', onstatus);

    const self = this;

    function onstatus(status) {
        self.emit('status', status);
    }
}

TwitchEmbed.APP_ID = '58A6790E';

util.inherits(TwitchEmbed, Application);

TwitchEmbed.prototype.sendCommand = function (command, options, callback) {
    this.controller.sendCommand.apply(this.controller, arguments);
};

module.exports = TwitchEmbed;
