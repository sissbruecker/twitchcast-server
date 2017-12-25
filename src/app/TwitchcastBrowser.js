const util = require('util');
const castv2Client = require('castv2-client');
const Application = castv2Client.Application;
const BrowserController = require('./BrowserController');

function TwitchcastBrowser(client, session) {
    Application.apply(this, arguments);

    this.browser = this.createController(BrowserController);

    this.browser.on('status', onstatus);

    const self = this;

    function onstatus(status) {
        self.emit('status', status);
    }
}

TwitchcastBrowser.APP_ID = 'E2EB091C';

util.inherits(TwitchcastBrowser, Application);

TwitchcastBrowser.prototype.load = function (browserData, options, callback) {
    this.browser.load.apply(this.browser, arguments);
};

module.exports = TwitchcastBrowser;
