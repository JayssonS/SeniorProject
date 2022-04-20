const CONST_STRING_DIV_LIKES_CONTAINER = 'user-likes-container';
const CONST_STRING_DIV_DISLIKES_CONTAINER = 'user-dislikes-container';
const CONST_STRING_DIV_PLAYLISTS_CONTAINER = 'user-playlists-container';
const CONST_STRING_DIV_PROFILE_HEADER = 'profile-input-header';

const CONST_STRING_BTN_SELECT_LIKES = 'profile-section-likes';
const CONST_STRING_BTN_SELECT_DISLIKES = 'profile-section-dislikes';
const CONST_STRING_BTN_SELECT_PLAYLISTS = 'profile-section-playlists';

let selectedDiv = null;

$(function () {
    $(`.${CONST_STRING_DIV_PROFILE_HEADER}`).on('change', function (event) {
        selectedDiv.addClass('hidden');

        switch (event.target.id) {
            case CONST_STRING_BTN_SELECT_LIKES:
                selectedDiv = $(`#${CONST_STRING_DIV_LIKES_CONTAINER}`);
                
                selectedDiv.removeClass('hidden');
                break;
            case CONST_STRING_BTN_SELECT_DISLIKES:
                selectedDiv = $(`#${CONST_STRING_DIV_DISLIKES_CONTAINER}`);
                
                if (!selectedDiv.length) {
                    buildDislikesContainer();
                    return;
                }
                selectedDiv.removeClass('hidden');
                break;
            case CONST_STRING_BTN_SELECT_PLAYLISTS:
                selectedDiv = $(`#${CONST_STRING_DIV_PLAYLISTS_CONTAINER}`);
                
                if (!selectedDiv.length) {
                    buildPlaylistsContainer();
                    return;
                }
                selectedDiv.removeClass('hidden');
                break;
            default:
                console.log("Unknown case");
                break;
        }
    });

    selectedDiv = $(`#${CONST_STRING_DIV_LIKES_CONTAINER}`);

    createUserLikes();
});

function buildPlaylistsContainer() {
    $(`#${CONST_STRING_DIV_SEARCH_RESULTS_PLACEHOLDER}`).append(`
        <div id="${CONST_STRING_DIV_PLAYLISTS_CONTAINER}"
            class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 rounded w-full bg-neutral p-5">
        </div>`);
    
    selectedDiv = $(`#${CONST_STRING_DIV_PLAYLISTS_CONTAINER}`);

    getUserPlaylists();
}

function buildDislikesContainer() {
    $(`#${CONST_STRING_DIV_SEARCH_RESULTS_PLACEHOLDER}`).append(`
        <div id="${CONST_STRING_DIV_DISLIKES_CONTAINER}"
            class="grid grid-cols-1 gap-4 rounded w-full bg-neutral p-5">
        </div>`);

    selectedDiv = $(`#${CONST_STRING_DIV_DISLIKES_CONTAINER}`);

    getUserDislikes();
}

function buildPlaylists(json, statusCode) {
    if (statusCode == 200) {
        console.log("Successful request");
        
        console.log(json);
        console.log(json['playlists']);

        for (playlist in json['playlists']) {
            playlist = json['playlists'][playlist]

            createPlaylistElement(CONST_STRING_DIV_PLAYLISTS_CONTAINER, playlist);
        }
    } else {
        $(`#${CONST_STRING_DIV_PLAYLISTS_CONTAINER}`).append(`
            <span class="font-semibold text-xl md:text-3xl mb-4">User has no playlists</span>`);
    }
}

function buildDislikes(json, statusCode) {
    if (statusCode == 200) {
        for (track in json['dislikes']) {
            trackId = json['dislikes'][track]['track'];

            createTrackElement(CONST_STRING_DIV_DISLIKES_CONTAINER, trackId, 1);
        }
    } else {
        $(`#${CONST_STRING_DIV_DISLIKES_CONTAINER}`).append(`
            <span class="font-semibold text-xl md:text-3xl mb-4">User has no disliked tracks</span>`);
    }
}

function setLikedOrDisliked(trackId, flag) {
    if (djangoUserData.id == 'None') {
        console.log("No user logged in!");
        return;
    }
    if (djangoUserData.id === djangoProfileUserData.id) {
        if (flag === 0) {
            $(`#like-${trackId}`).prop('checked', true);
        } else {
            $(`#dislike-${trackId}`).prop('checked', true);
        }
        return;
    }
    getLikedOrDisliked(trackId);
}

/* function interactTrack(trackId, flag) {
    console.log("Does this work?");
} */

function getUserPlaylists() {
    $.ajax({
        url: '/api/get_user_playlists/',
        type: 'POST',
        data: {
            'userId': djangoProfileUserData.id,
        },
        success: function (json, status, xhr) {
            buildPlaylists(json, xhr.status);
        },
        error: function (xhr, errmsg, err, json) {
            console.log(xhr.status + ": " + xhr.responseText);
        }
    })
}

function getUserDislikes() {
    $.ajax({
        url: '/api/get_user_track_dislikes/',
        type: 'POST',
        data: {
            'userId': djangoProfileUserData.id,
        },
        success: function (json, status, xhr) {
            buildDislikes(json, xhr.status);
        },
        error: function (xhr, errmsg, err, json) {
            console.log(xhr.status + ": " + xhr.responseText);
        }
    })
}

function createUserLikes() {
    djangoUserLikes.forEach(x => {
        createTrackElement(CONST_STRING_DIV_LIKES_CONTAINER, x, 0);
    });
}