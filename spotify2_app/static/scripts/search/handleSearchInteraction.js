const CONST_STRING_DIV_SEARCH_RESULTS_PLACEHOLDER = 'search-results-placeholder';
const CONST_STRING_DIV_SEARCH_RESULTS_CONTAINER = 'search-results-container';
const CONST_STRING_ID_TRACK_LIKE_SELECTION = 'track-like-selection';
const CONST_STRING_ID_SEARCH_RESULT = 'search-result-obj';
const CONST_STRING_ID_ELLIPSES_MODAL = 'playlist-ellipses-modal';
const CONST_STRING_ID_ELLIPSES_MODAL_BTN = 'btn-playlist-ellipses-modal';
const CONST_STRING_ID_ELLIPSES_MODAL_BTN_NEW = 'btn-playlist-ellipses-modal-new';
const CONST_STRING_ID_RESULT_ELLIPSES = 'btn-result-ellipses';
const CONST_STRING_ID_PLAYLIST_RESULT = 'playlist-result-obj';

let ellipsesModal = null;
let nodeTrackId = '';

$(function() {
    $(`#${CONST_STRING_DIV_SEARCH_RESULTS_PLACEHOLDER}`).on('click', `.${CONST_STRING_ID_SEARCH_RESULT}`, function (event) {

    });

    $(`#${CONST_STRING_DIV_SEARCH_RESULTS_PLACEHOLDER}`).on('click', `.${CONST_STRING_ID_PLAYLIST_RESULT}`, function (event) {
        window.location.href = `/playlist/${event.currentTarget.id}`
    });
    
    $(`#${CONST_STRING_DIV_SEARCH_RESULTS_PLACEHOLDER}`).on('click', `.${CONST_STRING_ID_RESULT_ELLIPSES}`, function (event) {
        const x = event.pageX;
        const y = event.pageY;
        let nodeY = y - ellipsesModal.height();
        nodeTrackId = event.currentTarget.parentNode.parentNode.id;
        
        ellipsesModal.removeClass('hidden');
        ellipsesModal.css('left', x);

        if (nodeY < 0) {
            nodeY = y;
        }
        ellipsesModal.css('top', nodeY);
    });
    
    $(`#${CONST_STRING_DIV_SEARCH_RESULTS_PLACEHOLDER}`).on('change', `.${CONST_STRING_ID_TRACK_LIKE_SELECTION}`, function (event) {
        const splitId = event.target.id.split('-')
        const buttonClickType = splitId[0];
        const trackId = splitId[1];

        $(`#dislike-${trackId}`).prop('checked', false);
        $(`#like-${trackId}`).prop('checked', false);

        if (buttonClickType === 'like') {
            interactTrack(trackId, 0);
        } else {
            interactTrack(trackId, 1);
        }
    });

    $('body').on('click', `.${CONST_STRING_ID_ELLIPSES_MODAL_BTN}`, function(event) {
        $.ajax({
            url: '/api/add_to_playlist/',
            type: 'POST',
            xhrFields: { withCredentials: true },
            data: {
                'playlist_id': event.currentTarget.id,
                'track_id': nodeTrackId,
            }
        });
    });

    $('body').on('click', `#${CONST_STRING_ID_ELLIPSES_MODAL_BTN_NEW}`, function(event) {
        $.ajax({
            url: '/api/add_to_new_playlist/',
            type: 'POST',
            xhrFields: { withCredentials: true },
            data: {
                'track_id': nodeTrackId,
            },
            success: function (json, status, xhr) {
                createModalButton(json['playlist'])
            }});
    });

    $('body').on('click', function(event) {
        if (!$(event.target).hasClass(CONST_STRING_ID_RESULT_ELLIPSES)) {
            ellipsesModal.addClass('hidden');
        }
    });

    createEllipsesModal();
});

function interactTrack(trackId, flag) {
    $.ajax({
        url: '/api/interact_track/',
        type: 'POST',
        xhrFields: { withCredentials: true },
        data: {
            'track_id': trackId,
            'interact_flag': flag,
        },
        success: function (json, status, xhr) {
            if (xhr.status === 200) {
                if (flag === 0) {
                    $(`#like-${trackId}`).prop('checked', true);
                } else {
                    $(`#dislike-${trackId}`).prop('checked', true);
                }
            }
        }});
}

function modalBtnCallback(node) {
    console.log(node);
}

function createEllipsesModal() {
    $('body').append(`
        <div id="${CONST_STRING_ID_ELLIPSES_MODAL}"
            class="hidden absolute flex flex-col bg-base-200 rounded max-w-[200px] p-2">
            <button 
                id="${CONST_STRING_ID_ELLIPSES_MODAL_BTN_NEW}" 
                class="text-ellipsis overflow-hidden whitespace-nowrap 
                    p-1 text-left rounded
                    hover:bg-primary-focus">
                Add to New Playlist</button>
            <div class="divider p-0 m-0"></div>
        </div>
    `);
    for (i = 0; i < djangoUserPlaylists.length; i++) {
        createModalButton(djangoUserPlaylists[i])
    }
    ellipsesModal = $(`#${CONST_STRING_ID_ELLIPSES_MODAL}`);
}

function createModalButton(playlist) {
    $(`#${CONST_STRING_ID_ELLIPSES_MODAL}`).append(`
        <button
            id="${playlist['id']}"
            class="${CONST_STRING_ID_ELLIPSES_MODAL_BTN}
                text-ellipsis overflow-hidden whitespace-nowrap 
                p-1 text-left rounded
                hover:bg-primary-focus">
            ${playlist['name']}
        </button>
    `);
}

function createTrackElement(parentId, trackId, flag) {
    $(`#${parentId}`).append(`
    <div 
        id="${trackId}"
        class="flex w-full max-h-[80px] ${CONST_STRING_ID_SEARCH_RESULT}">
        <iframe class="rounded-l-xl"
            src="https://open.spotify.com/embed/track/${trackId}?utm_source=generator"
            allowfullscreen=""
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            width="100%"
            height="80px"
            frameborder="0">
        </iframe>
        <div class="flex bg-base-200 rounded-r-xl">
            <div class="flex flex-col">
                <div class="h-[40px] w-20 m-0">
                    <input type="checkbox" name="song" value="like" id="like-${trackId}"
                        class="sr-only peer ${CONST_STRING_ID_TRACK_LIKE_SELECTION}">
                    <label for="like-${trackId}" class="select-none text-center cursor-pointer
                        m-0 p-2 w-full h-full block font-semibold
                        hover:bg-base-100
                        peer-checked:border-b-4 peer-checked:border-[#15803D] peer-checked:text-[#15803D]">
                        <span>Like</span></label>
                </div>
                <div class="h-[40px] w-20 m-0">
                    <input type="checkbox" name="song" value="dislike" id="dislike-${trackId}"
                        class="sr-only peer ${CONST_STRING_ID_TRACK_LIKE_SELECTION}">
                    <label for="dislike-${trackId}" class="select-none text-center cursor-pointer
                        m-0 p-2 w-full h-full block font-semibold
                        hover:bg-base-100
                        peer-checked:border-t-4 peer-checked:border-[#B91C1C] peer-checked:text-[#B91C1C]">
                        <span>Dislike</span></label>
                </div>
            </div>
            <button class="btn-result-ellipses
                p-2 rounded-r-xl font-semibold
                hover:bg-base-100">
                ...<button>
        </div>
    </div>
    `);
    setLikedOrDisliked(trackId, flag);
}

function createPlaylistElement(parentId, playListData) {
    console.log("CREATING PLAYIST");
    $(`#${parentId}`).append(`
        <div
            id=${playListData['id']}
            class="
                ${CONST_STRING_ID_PLAYLIST_RESULT}
                flex flex-col bg-base-200 rounded-xl p-[10px] w-[260px] h-[300px] select-none cursor-pointer
                hover:bg-base-100">
            <div
                class="flex flex-row flex-wrap w-[240px] h-[240px] mb-[10px] pointer-events-none">
                <img 
                    src="https://i.scdn.co/image/ab67616d0000b273c4111b6c5f08abb1c18c6e60"
                    class="rounded-tl-xl w-[120px] h-[120px] p-0 m-0">
                </img>
                <img 
                    src="https://i.scdn.co/image/ab67616d0000b2733a909f2d301e192142c9d897"
                    class="rounded-tr-xl w-[120px] h-[120px] p-0 m-0">
                </img>
                <img 
                    src="https://i.scdn.co/image/ab67616d0000b273701a60c5e6620792cd382004"
                    class="rounded-bl-xl w-[120px] h-[120px] p-0 m-0">
                </img>
                <img 
                    src="https://i.scdn.co/image/ab67616d0000b2737a951a332897aea8e61eda1e"
                    class="rounded-br-xl w-[120px] h-[120px] p-0 m-0">
                </img>
            </div>
            <span class="font-semibold text-ellipsis overflow-hidden whitespace-nowrap">${playListData['name']}</div>
        </div>
    `);
}

function setLikedOrDisliked(trackId, flag) {
    if (djangoUserData.id == 'None') {
        console.log("No user logged in!");
        return;
    }
    getLikedOrDisliked(trackId);
}

function getLikedOrDisliked(trackId) {
    $.ajax({
        url: '/api/get_track_interaction/',
        type: 'POST',
        xhrFields: { withCredentials: true },
        data: {
            'track_id': trackId,
        },
        success: function (json, status, xhr) {
            if (xhr.status === 200) {
                $(`#like-${trackId}`).prop('checked', true);
            } else if (xhr.status === 204) {
                $(`#dislike-${trackId}`).prop('checked', true);
            }
        }});
}

function handleTrackResults(json) {
    const arrTracks = json['songs'];

    $(`#${CONST_STRING_DIV_SEARCH_RESULTS_CONTAINER}`).remove();

    if (arrTracks.length === 0) {
        console.log("No tracks found!");
        return;
    }
    $(`#${CONST_STRING_DIV_SEARCH_RESULTS_PLACEHOLDER}`).append(`
            <div
                id=${CONST_STRING_DIV_SEARCH_RESULTS_CONTAINER}
                class="grid grid-cols-1 md:grid-cols-2 gap-4 place-items-center">
            </div>
    `);
    
    for (i = 0; i < arrTracks.length; i++) {
        trackId = arrTracks[i]['id'];

        createTrackElement(CONST_STRING_DIV_SEARCH_RESULTS_CONTAINER, trackId);
    }
}