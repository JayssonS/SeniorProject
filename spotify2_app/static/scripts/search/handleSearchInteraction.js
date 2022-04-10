const CONST_STRING_DIV_SEARCH_RESULTS_PLACEHOLDER = 'search-results-placeholder';
const CONST_STRING_DIV_SEARCH_RESULTS_CONTAINER = 'search-results-container';
const CONST_STRING_ID_SEARCH_RESULT = 'search-result-obj';
const CONST_STRING_ID_ELLIPSES_MODAL = 'playlist-ellipses-modal';
const CONST_STRING_ID_ELLIPSES_MODAL_BTN = 'btn-playlist-ellipses-modal';
const CONST_STRING_ID_RESULT_ELLIPSES = 'btn-result-ellipses';

let ellipsesModal = null;
let nodeTrackId = '';

$(function() {
    $(`#${CONST_STRING_DIV_SEARCH_RESULTS_PLACEHOLDER}`).on('click', `.${CONST_STRING_ID_SEARCH_RESULT}`, function (event) {

    });
    
    $(`#${CONST_STRING_DIV_SEARCH_RESULTS_PLACEHOLDER}`).on('click', `.${CONST_STRING_ID_RESULT_ELLIPSES}`, function (event) {
        const x = event.clientX;
        const y = event.clientY;
        nodeTrackId = event.currentTarget.parentNode.id;
        
        ellipsesModal.removeClass('hidden');
        ellipsesModal.css('left', x);
        ellipsesModal.css('top', (y - ellipsesModal.height()));
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

    $('body').on('click', function(event) {
        if (!$(event.target).hasClass(CONST_STRING_ID_RESULT_ELLIPSES)) {
            ellipsesModal.addClass('hidden');
        }
    });

    createEllipsesModal();
});

function modalBtnCallback(node) {
    console.log(node);
}

function createEllipsesModal() {
    $('body').append(`
        <div id="${CONST_STRING_ID_ELLIPSES_MODAL}"
            class="hidden absolute flex flex-col bg-neutral border border-neutral-400">
            <span>Add to Playlist</span>
            <div class="divider p-0 m-0"></div>
        </div>
    `);
    for (i = 0; i < djangoUserPlaylists.length; i++) {
        $(`#${CONST_STRING_ID_ELLIPSES_MODAL}`).append(`
            <button
                id="${djangoUserPlaylists[i]['id']}"
                class="${CONST_STRING_ID_ELLIPSES_MODAL_BTN} pt-1 pb-1 hover:bg-primary-focus">
                ${djangoUserPlaylists[i]['name']}
            </button>
        `);
    }
    ellipsesModal = $(`#${CONST_STRING_ID_ELLIPSES_MODAL}`);
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

    console.log(djangoUserPlaylists);
    
    for (i = 0; i < arrTracks.length; i++) {
        trackId = arrTracks[i]['id'];

        $(`#${CONST_STRING_DIV_SEARCH_RESULTS_CONTAINER}`).append(`
            <div 
                id="${trackId}"
                class="flex bg-neutral ${CONST_STRING_ID_SEARCH_RESULT}">
                <iframe style="border-radius:12px"
                    src="https://open.spotify.com/embed/track/${trackId}?utm_source=generator"
                    allowfullscreen=""
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    width="100%"
                    height="80px"
                    frameborder="0">
                </iframe>
                <button
                    onClick="(function() {
                        $.ajax({
                            url: '/api/interact_track/',
                            type: 'POST',
                            xhrFields: { withCredentials: true },
                            data: {
                                'track_id': parentNode.id,
                                'interact_flag': 0,
                            }});
                    })(); return true;">
                    Like
                </button>
                <button
                    onClick="(function() {
                        $.ajax({
                            url: '/api/interact_track/',
                            type: 'POST',
                            xhrFields: { withCredentials: true },
                            data: {
                                'track_id': parentNode.id,
                                'interact_flag': 1,
                            }});
                    })(); return true;">
                    Dislike
                </button>
                <button
                    onClick="(function() {
                        $.ajax({
                            url: '/api/create_playlist/',
                            type: 'POST',
                            xhrFields: { withCredentials: true },
                        });
                    })(); return true;">
                    Create Playlist
                </button>
                <button
                    class="${CONST_STRING_ID_RESULT_ELLIPSES}">
                    ...
                </button>
            </div>
        `);
    }
}