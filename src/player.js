const { promisify } = require('util');
const Client = require('castv2-client').Client;
const mdns = require('mdns');
const TwitchcastApp = require('./app/Twitchcast');

const DEVICE_DETECTION_TIMEOUT = 10000;
const CLIENT_CONNECTION_TIMEOUT = 10000;

let currentDevice;
let activeClient;

async function detectDevice() {

    if (currentDevice) return currentDevice;

    return new Promise((resolve, reject) => {

        // Using a custom resolver sequence should fix error on debian systems
        // https://stackoverflow.com/questions/29589543/raspberry-pi-mdns-getaddrinfo-3008-error
        const sequence = [
            mdns.rst.DNSServiceResolve(),
            'DNSServiceGetAddrInfo' in mdns.dns_sd ? mdns.rst.DNSServiceGetAddrInfo() : mdns.rst.getaddrinfo({ families: [4] }),
            mdns.rst.makeAddressesUnique()
        ];

        const browser = mdns.createBrowser(mdns.tcp('googlecast'), {resolverSequence: sequence});

        browser.on('serviceUp', function (service) {
            console.log(`found device "${service.name}" at ${service.addresses[0]}:${service.port}`);
            currentDevice = service.addresses[0];
            resolve(currentDevice);
            browser.stop();
        });
        browser.start();

        setTimeout(() => {
            browser.stop();
            reject(`Device detection timed out after ${DEVICE_DETECTION_TIMEOUT} ms`)
        }, DEVICE_DETECTION_TIMEOUT);
    });
}

async function connect() {

    if (activeClient) return activeClient;

    const device = await detectDevice();

    return new Promise((resolve, reject) => {

        const client = new Client();

        client.connect(device, (err) => {

            if (err) return reject(err);

            activeClient = client;

            client.once('error', disposeClient);

            resolve(client);
        });

        setTimeout(() => {
            reject(`Client connection timed out after ${CLIENT_CONNECTION_TIMEOUT} ms`)
        }, CLIENT_CONNECTION_TIMEOUT);
    });
}

async function getPlayer() {

    const client = await connect();
    const clientLaunch = promisify(client.launch.bind(client));
    const clientJoin = promisify(client.join.bind(client));

    const session = await findSession(client);

    if (session) {
        return await clientJoin(session, TwitchcastApp);
    } else {
        return await clientLaunch(TwitchcastApp);
    }
}

async function findSession(client) {

    const clientGetSessions = promisify(client.getSessions.bind(client));

    const sessions = await clientGetSessions();

    if (!sessions) return false;

    const matches = sessions.filter(session => session.appId === TwitchcastApp.APP_ID);

    return matches.length > 0
        ? matches[0]
        : null;
}

function disposeClient() {
    if (!activeClient) return;

    try {
        activeClient.close();
    } catch (e) {
        // ignore
    }
    activeClient = null;
    console.log(`client disconnected`);
}

async function play(streamInfo, layout) {

    const player = await getPlayer();
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

    const client = await connect();
    const clientStop = promisify(client.stop.bind(client));

    if (!await findSession(client)) return;

    const player = await getPlayer();
    await clientStop(player);
    console.log(`stopped application`);
}

module.exports = {
    play,
    stop
};
