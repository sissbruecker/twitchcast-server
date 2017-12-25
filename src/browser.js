const { promisify } = require('util');
const TwitchcastBrowser = require('./app/TwitchcastBrowser');
const device = require('./device');

async function browse(browserData) {
    const browserApp = await device.getApp(TwitchcastBrowser);
    const browserLoad = promisify(browserApp.load.bind(browserApp));

    await browserLoad(browserData, {});
}

module.exports = {
    browse
};
