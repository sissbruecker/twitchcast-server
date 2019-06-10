const request = require('request-promise');
const _ = require('lodash');

const TWITCH_BASE_URL = 'https://api.twitch.tv/helix';

function User(userData) {
    return {
        userId: userData.id,
        channelId: userData.login.toLowerCase(),
        displayName: userData.display_name,
        description: userData.description,
        logoUrl: userData.profile_image_url,
        viewCount: userData.view_count
    };
}

function Video(videoData) {
    return {
        videoId: videoData.id,
        userId: videoData.user_id,
        title: videoData.title,
        duration: videoData.duration,
    };
}

async function getUser(login) {

    const clientId = process.env.TWITCH_CLIENT_ID;
    const url = TWITCH_BASE_URL + `/users?login=${login}`;
    const options = {
        url,
        headers: {
            'Client-ID': clientId
        },
        json: true
    };

    const response = await request(options);

    return response.data.length > 0
        ? User(_.first(response.data))
        : null;
}

async function getLatestVideo(user) {

    const clientId = process.env.TWITCH_CLIENT_ID;
    const url = TWITCH_BASE_URL + `/videos?user_id=${user.userId}`;
    const options = {
        url,
        headers: {
            'Client-ID': clientId
        },
        json: true
    };

    const response = await request(options);

    return response.data.length > 0
        ? Video(_.first(response.data))
        : null;
}

module.exports = {
    getUser,
    getLatestVideo
};
