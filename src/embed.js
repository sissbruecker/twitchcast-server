const { promisify } = require('util');
const TwitchEmbed = require('./app/TwitchEmbed');
const device = require('./device');
const twitch = require('./api/twitch');

async function playChannel(channel) {
    const embedApp = await device.getApp(TwitchEmbed);
    const sendCommand = promisify(embedApp.sendCommand.bind(embedApp));
    const command = {
        type: 'playChannel',
        channel
    };

    await sendCommand(command, {});
}

async function playLatestVideo(channel) {
    const user = await twitch.getUser(channel);

    if (!user) return;

    const video = await twitch.getLatestVideo(user);

    if (!video) return;

    const embedApp = await device.getApp(TwitchEmbed);
    const sendCommand = promisify(embedApp.sendCommand.bind(embedApp));
    const command = {
        type: 'playVideo',
        video: video.videoId
    };

    await sendCommand(command, {});
}

async function seekTo(minutes) {
    const seconds = minutes * 60;
    const embedApp = await device.getApp(TwitchEmbed);
    const sendCommand = promisify(embedApp.sendCommand.bind(embedApp));
    const command = {
        type: 'seek',
        timestamp: seconds
    };

    await sendCommand(command, {});
}

async function stop() {

    const client = await device.connect();
    const clientStop = promisify(client.stop.bind(client));

    if (!await device.findSession(client, TwitchEmbed)) return;

    const player = await device.getApp(TwitchEmbed);
    await clientStop(player);
    console.log(`stopped playback`);
}

module.exports = {
    playChannel,
    playLatestVideo,
    seekTo,
    stop
};
