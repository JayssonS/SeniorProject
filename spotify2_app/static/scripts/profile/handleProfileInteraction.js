const CONST_STRING_DIV_LIKES_CONTAINER = 'user-likes-container';
const CONST_STRING_DIV_DISLIKES_CONTAINER = 'user-dislikes-container';
const CONST_STRING_DIV_PROFILE_HEADER = 'profile-input-header';

const CONST_STRING_BTN_SELECT_LIKES = 'profile-section-likes';
const CONST_STRING_BTN_SELECT_DISLIKES = 'profile-section-dislikes';
const CONST_STRING_BTN_SELECT_PLAYLISTS = 'profile-section-playlists';

const CONST_STRING_DIV_USER_LIKES = 'user-likes-container';
const CONST_STRING_DIV_USER_DISLIKES = 'user-dislikes-container';
const CONST_STRING_DIV_USER_PLAYLISTS = 'user-playlists-container';

let selectedDiv = null;

$(function () {
    $(`.${CONST_STRING_DIV_PROFILE_HEADER}`).on('change', function (event) {
        selectedDiv.addClass('hidden');

        switch (event.target.id) {
            case CONST_STRING_BTN_SELECT_LIKES:
                selectedDiv = $(`#${CONST_STRING_DIV_USER_LIKES}`);
                
                selectedDiv.removeClass('hidden');
                break;
            case CONST_STRING_BTN_SELECT_DISLIKES:
                selectedDiv = $(`#${CONST_STRING_DIV_USER_DISLIKES}`);
                
                if (!selectedDiv.length) {
                    buildDislikesContainer();
                    return;
                }
                selectedDiv.removeClass('hidden');
                break;
            case CONST_STRING_BTN_SELECT_PLAYLISTS:
                selectedDiv = $(`#${CONST_STRING_DIV_USER_PLAYLISTS}`);
                
                if (!selectedDiv.length) {
                }
                break;
            default:
                console.log("Unknown case");
                break;
        }
    });

    selectedDiv = $(`#${CONST_STRING_DIV_USER_LIKES}`);

    createUserLikes();
});

function buildDislikesContainer() {
    $(`#${CONST_STRING_DIV_SEARCH_RESULTS_PLACEHOLDER}`).append(`
        <div id="${CONST_STRING_DIV_DISLIKES_CONTAINER}"
            class="grid grid-cols-1 gap-4 rounded w-full bg-neutral p-5">
        </div>`);

    selectedDiv = $(`#${CONST_STRING_DIV_USER_DISLIKES}`);

    getUserDislikes();
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

function getUserDislikes() {
    $.ajax({
        url: '/api/get_user_track_dislikes/',
        type: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        },
        data: {
            'userId': djangoUserData.id,
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