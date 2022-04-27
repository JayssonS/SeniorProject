const CONST_STRING_DIV_PLAYLIST_HEADER = 'playlist-header-container';
const CONST_STRING_ID_PLAYLIST_LIKE_SELECTION = 'playlist-like-selection';
const CONST_STRING_ID_PLAYLIST_LIKE_BUTTON = 'like-playlist';
const CONST_STRING_ID_PLAYLIST_DISLIKE_BUTTON = 'dislike-playlist';

$(function () {
    $(`#${CONST_STRING_DIV_PLAYLIST_HEADER}`).on('change', `.${CONST_STRING_ID_PLAYLIST_LIKE_SELECTION}`, function (event) {
        const buttonClickType = event.target.id.split('-')[0];

        $(`#${CONST_STRING_ID_PLAYLIST_LIKE_BUTTON}`).prop('checked', false);
        $(`#${CONST_STRING_ID_PLAYLIST_DISLIKE_BUTTON}`).prop('checked', false);

        if (buttonClickType === 'like') {
            interactPlaylist(playlistId, 0);
        } else {
            interactPlaylist(playlistId, 1);
        }
    });

    getPlaylistInteraction();
    createPlaylistSongs();
});

function createPlaylistSongs() {
    djangoPlaylistTracks.forEach(x => {
        createTrackElement(CONST_STRING_DIV_SEARCH_RESULTS_PLACEHOLDER, x);
    });
}

function getPlaylistInteraction() {
    $.ajax({
        url: '/api/get_playlist_interaction/',
        type: 'POST',
        xhrFields: { withCredentials: true },
        data: {
            'playlist_id': playlistId,
        },
        success: function (json, status, xhr) {
            if (xhr.status === 200) {
                $(`#${CONST_STRING_ID_PLAYLIST_LIKE_BUTTON}`).prop('checked', true);
            } else if (xhr.status === 204) {
                $(`#${CONST_STRING_ID_PLAYLIST_DISLIKE_BUTTON}`).prop('checked', true);
            }
        }});
}

function interactPlaylist(playlistId, flag) {
    $.ajax({
        url: '/api/interact_playlist/',
        type: 'POST',
        xhrFields: { withCredentials: true },
        data: {
            'playlist_id': playlistId,
            'interact_flag': flag,
        },
        success: function (json, status, xhr) {
            if (xhr.status === 200) {
                if (flag === 0) {
                    $(`#${CONST_STRING_ID_PLAYLIST_LIKE_BUTTON}`).prop('checked', true);
                } else {
                    $(`#${CONST_STRING_ID_PLAYLIST_DISLIKE_BUTTON}`).prop('checked', true);
                }
            }
        }});
}