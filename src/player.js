const { promisify } = require('util');
const TwitchcastApp = require('./app/Twitchcast');
const device = require('./device');

async function play(streamInfo, layout) {

    const player = await device.getApp(TwitchcastApp);
    const playerLoad = promisify(player.load.bind(player));

    const media = {
        contentId: streamInfo.media.url,
        contentType: 'video/mp4',
        streamType: 'LIVE'
    };

    const options = {
        autoplay: true,
        currentTime: 0,
        customData: {
            layout,
            channel: streamInfo.channel
        }
    };

    console.log(`app "${player.session.displayName}" launched, loading media ${media.contentId} ...`);

    const status = await playerLoad(media, options);

    console.log(`media loaded playerState=${status.playerState}`);
}

async function stop() {

    const client = await device.connect();
    const clientStop = promisify(client.stop.bind(client));

    if (!await device.findSession(client, TwitchcastApp)) return;

    const player = await device.getApp(TwitchcastApp);
    await clientStop(player);
    console.log(`stopped application`);
}

module.exports = {
    play,
    stop
};
