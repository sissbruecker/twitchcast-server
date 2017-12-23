const request = require('request-promise');

const TOKEN_URL = 'https://nightdev.com/twitchcast/token.php';
const PLAYLIST_URL = 'https://hls-us-east.nightdev.com/get/playlist';

module.exports = async function getStreamInfo(channelId, quality) {

    const tokenRequest = {
        uri: TOKEN_URL + `?channel=${channelId}`,
        json: true
    };

    console.log(`Token URL: ${tokenRequest.uri}`);

    const tokenResponse = await request(tokenRequest);
    const token = JSON.parse(tokenResponse.token);
    const sig = tokenResponse.sig;

    console.log('Token:');
    console.dir(token);

    const channelPlaylistUrl = [
        PLAYLIST_URL,
        `?channel=${channelId}`,
        `&token=${encodeURIComponent(JSON.stringify(token))}`,
        `&sig=${sig}`,
        `&callback=callback`,
        `&_=${new Date().getTime()}`,
    ].join('');

    console.log(`Playlist URL: ${channelPlaylistUrl}`);

    const playlistResponse = await request(channelPlaylistUrl);

    const playlistJson = removeCallbackWrapper(playlistResponse);

    const playlist = JSON.parse(playlistJson);

    console.log('Playlist:');
    console.dir(playlist);

    return {
        channel: channelId,
        token,
        media: playlist.playlist[quality]
    };
};

const RESPONSE_DATA_REGEX = /^callback\((.*)\);$/;

function removeCallbackWrapper(response) {
    const matches = RESPONSE_DATA_REGEX.exec(response);
    return matches[1];
}
