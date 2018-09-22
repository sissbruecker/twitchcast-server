const { promisify } = require('util');
const TwitchEmbed = require('./app/TwitchEmbed');
const device = require('./device');

async function load(channel) {
    const embedApp = await device.getApp(TwitchEmbed);
    const embedLoad = promisify(embedApp.load.bind(embedApp));
    const embedData = {
        channel
    };

    await embedLoad(embedData, {});
}

module.exports = {
    load
};
