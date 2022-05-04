const CONST_STRING_DIV_LIKES_CONTAINER = 'user-likes-container';
const CONST_STRING_DIV_DISLIKES_CONTAINER = 'user-dislikes-container';
const CONST_STRING_DIV_PLAYLISTS_CONTAINER = 'user-playlists-container';
const CONST_STRING_DIV_FOLLOWERS_CONTAINER = 'user-followers-container';
const CONST_STRING_DIV_FOLLOWEES_CONTAINER = 'user-followees-container';
const CONST_STRING_DIV_PROFILE_HEADER = 'profile-input-header';

const CONST_STRING_BTN_SELECT_LIKES = 'profile-section-likes';
const CONST_STRING_BTN_SELECT_DISLIKES = 'profile-section-dislikes';
const CONST_STRING_BTN_SELECT_PLAYLISTS = 'profile-section-playlists';
const CONST_STRING_BTN_SELECT_FOLLOWERS = 'profile-section-followers';
const CONST_STRING_BTN_SELECT_FOLLOWEES = 'profile-section-followees';
const CONST_STRING_BTN_FOLLOW_USER = 'btn-profile-follow';

let selectedDiv = null;

$(function () {
    $(`#${CONST_STRING_BTN_FOLLOW_USER}`).on('click', function (event) {
        $.ajax({
            url: '/api/follow_user/',
            type: 'POST',
            data: {
                'followee_id': djangoProfileUserData.id,
            },
            success: function (json, status, xhr) {
                console.log(xhr.status);
                if (xhr.status === 200) {
                    $(`#${CONST_STRING_BTN_FOLLOW_USER}`).html('Unfollow');
                } else {
                    $(`#${CONST_STRING_BTN_FOLLOW_USER}`).html('Follow');
                }
            },
            error: function (xhr, errmsg, err, json) {
                console.log(xhr.status + ": " + xhr.responseText);
            }
        });
    });

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

                }
                selectedDiv.removeClass('hidden');
                break;
            case CONST_STRING_BTN_SELECT_FOLLOWERS:
                selectedDiv = $(`#${CONST_STRING_DIV_FOLLOWERS_CONTAINER}`);
                
                if (!selectedDiv.length) {
                    buildFollowerContainer();
                    return;
                }
                selectedDiv.removeClass('hidden');
                break;
            case CONST_STRING_BTN_SELECT_FOLLOWEES:
                selectedDiv = $(`#${CONST_STRING_DIV_FOLLOWEES_CONTAINER}`);
                
                if (!selectedDiv.length) {
                    buildFolloweeContainer();
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

function buildFollowerContainer() {
    $(`#${CONST_STRING_DIV_SEARCH_RESULTS_PLACEHOLDER}`).append(`
        <div id="${CONST_STRING_DIV_FOLLOWERS_CONTAINER}"
            class="grid grid-cols-1 gap-4 rounded w-full bg-neutral p-5">
        </div>`);
    
    selectedDiv = $(`#${CONST_STRING_DIV_FOLLOWERS_CONTAINER}`);

    getUserFollowers();
}

function buildFolloweeContainer() {
    $(`#${CONST_STRING_DIV_SEARCH_RESULTS_PLACEHOLDER}`).append(`
        <div id="${CONST_STRING_DIV_FOLLOWEES_CONTAINER}"
            class="grid grid-cols-1 gap-4 rounded w-full bg-neutral p-5">
        </div>`);
    
    selectedDiv = $(`#${CONST_STRING_DIV_FOLLOWEES_CONTAINER}`);

    getUserFollowees();
}

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

function buildFollowers(json, statusCode) {
    if (statusCode == 200) {
        console.log("Successful request");

        for (follower in json['followers']) {
            follower = json['followers'][follower]
            let link = '<a class="nav-link" href="/u/' + follower['username'] + '">View Profile</a>'
            
            $(`#${CONST_STRING_DIV_FOLLOWERS_CONTAINER}`).append(`
                <span class="font-semibold text-xl md:text-3xl mb-4">${follower['username']} ${follower['first_name']} ${follower['last_name']}
                    <span class="btn bg-primary hover:bg-primary-focus justify-right text-white" style="float: right"> 
                        ${link}
                    </span>
                </span>`);
        }
    } else {
        $(`#${CONST_STRING_DIV_FOLLOWERS_CONTAINER}`).append(`
            <span class="font-semibold text-xl md:text-3xl mb-4">User has no followers</span>`);
    }
}

function buildFollowees(json, statusCode) {
    if (statusCode == 200) {
        console.log("Successful request");

        for (followee in json['followees']) {
            followee = json['followees'][followee]
            let link = '<a class="nav-link" href="/u/' + followee['username'] + '">View Profile</a>'

            $(`#${CONST_STRING_DIV_FOLLOWEES_CONTAINER}`).append(`
                <span class="font-semibold text-xl md:text-3xl mb-4">${followee['username']} ${followee['first_name']} ${followee['last_name']}
                    <span class="btn bg-primary hover:bg-primary-focus  text-white" style="float: right"> 
                        ${link}
                    </span>
                </span>`);
        }
    } else {
        $(`#${CONST_STRING_DIV_FOLLOWEES_CONTAINER}`).append(`
            <span class="font-semibold text-xl md:text-3xl mb-4">User does not follow anyone</span>`);
    }
}

function buildPlaylists(json, statusCode) {
    if (statusCode == 200) {
        console.log("Successful request");

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

function getUserFollowers() {
    $.ajax({
        url: '/api/get_user_followers/',
        type: 'POST',
        data: {
            'profile_id': djangoProfileUserData.id,
        },
        success: function (json, status, xhr) {
            buildFollowers(json, xhr.status);
        },
        error: function (xhr, errmsg, err, json) {
            console.log(xhr.status + ": " + xhr.responseText);
        }
    });
}

function getUserFollowees() {
    $.ajax({
        url: '/api/get_user_followees/',
        type: 'POST',
        data: {
            'profile_id': djangoProfileUserData.id,
        },
        success: function (json, status, xhr) {
            buildFollowees(json, xhr.status);
        },
        error: function (xhr, errmsg, err, json) {
            console.log(xhr.status + ": " + xhr.responseText);
        }
    });
}

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
    });
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
    });
}

function createUserLikes() {
    djangoUserLikes.forEach(x => {
        createTrackElement(CONST_STRING_DIV_LIKES_CONTAINER, x, 0);
    });
}